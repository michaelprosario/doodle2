import { Injectable, signal } from '@angular/core';
import { Rect, SelectionState } from '../models/selection.model';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private selectionState = signal<SelectionState>({
    selectedIds: [],
    selectionBounds: undefined,
    activeHandle: undefined,
    activeMode: 'idle',
    isDragging: false
  });

  selection = this.selectionState.asReadonly();

  private activeFrameId: string | null = null;
  private selectionByFrame = new Map<string, string[]>();

  setActiveFrame(frameId: string | null): void {
    if (this.activeFrameId && this.activeFrameId !== frameId) {
      this.selectionByFrame.set(this.activeFrameId, this.selectionState().selectedIds);
    }

    this.activeFrameId = frameId;
    const restored = frameId ? this.selectionByFrame.get(frameId) || [] : [];
    this.selectionState.update(state => ({
      ...state,
      selectedIds: restored,
      selectionBounds: undefined,
      activeHandle: undefined,
      activeMode: 'idle',
      isDragging: false
    }));
  }

  getSelection(): SelectionState {
    return this.selectionState();
  }

  setSelection(ids: string[]): void {
    const uniqueIds = Array.from(new Set(ids));
    this.selectionState.update(state => ({
      ...state,
      selectedIds: uniqueIds
    }));

    if (this.activeFrameId) {
      this.selectionByFrame.set(this.activeFrameId, uniqueIds);
    }
  }

  toggleSelection(id: string): void {
    const current = this.selectionState().selectedIds;
    if (current.includes(id)) {
      this.setSelection(current.filter(existing => existing !== id));
    } else {
      this.setSelection([...current, id]);
    }
  }

  clearSelection(): void {
    this.setSelection([]);
    this.setSelectionBounds(undefined);
  }

  setActiveMode(mode: SelectionState['activeMode']): void {
    this.selectionState.update(state => ({
      ...state,
      activeMode: mode
    }));
  }

  setSelectionBounds(bounds?: Rect): void {
    const current = this.selectionState().selectionBounds;
    if (areRectsEqual(current, bounds)) {
      return;
    }

    this.selectionState.update(state => ({
      ...state,
      selectionBounds: bounds
    }));
  }

  setDragging(isDragging: boolean): void {
    if (this.selectionState().isDragging === isDragging) return;
    this.selectionState.update(state => ({
      ...state,
      isDragging
    }));
  }
}

function areRectsEqual(a?: Rect, b?: Rect): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
