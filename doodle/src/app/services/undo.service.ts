import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { FrameService } from './frame.service';
import { SVGElementModel } from '../models/svg-element.model';
import { NotificationService } from './notification.service';

interface UndoAction {
  type: 'add-element';
  projectId: string;
  sceneId: string;
  frameId: string;
  element: SVGElementModel;
  timestamp: Date;
}

interface UndoEvent {
  action: 'undo';
  projectId: string;
  sceneId: string;
  frameId: string;
}

@Injectable({
  providedIn: 'root'
})
export class UndoService {
  private frameService = inject(FrameService);
  private notificationService = inject(NotificationService);
  
  private undoStack: UndoAction[] = [];
  private maxStackSize = 50; // Limit undo history
  
  // Observable for undo events
  private undoEvent$ = new Subject<UndoEvent>();
  public onUndo$ = this.undoEvent$.asObservable();

  /**
   * Record an element addition for undo
   */
  recordElementAdded(
    projectId: string,
    sceneId: string,
    frameId: string,
    element: SVGElementModel
  ): void {
    const action: UndoAction = {
      type: 'add-element',
      projectId,
      sceneId,
      frameId,
      element,
      timestamp: new Date()
    };

    this.undoStack.push(action);

    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }

    console.log('[UndoService] Recorded action:', action.type, 'Stack size:', this.undoStack.length);
  }

  /**
   * Undo the last drawing action
   */
  undo(): boolean {
    if (this.undoStack.length === 0) {
      console.log('[UndoService] Nothing to undo');
      this.notificationService.info('Nothing to undo');
      return false;
    }

    const action = this.undoStack.pop()!;
    console.log('[UndoService] Undoing action:', action.type, 'Element:', action.element.type);

    try {
      // Get the current frame
      const frame = this.frameService.getFrame(
        action.projectId,
        action.sceneId,
        action.frameId
      );

      if (!frame) {
        console.error('[UndoService] Frame not found:', action.frameId);
        this.notificationService.error('Cannot undo: frame not found');
        return false;
      }

      // Find and remove the element from the frame
      const elementIndex = frame.elements.findIndex(
        (el: any) => el.id === action.element.id
      );

      if (elementIndex === -1) {
        console.warn('[UndoService] Element not found in frame:', action.element.id);
        // Element may have been deleted already, but we still removed it from the stack
        return false;
      }

      // Remove the element
      const updatedElements = frame.elements.filter(
        (el: any) => el.id !== action.element.id
      );

      console.log('[UndoService] Removing element from frame. Before:', frame.elements.length, 'After:', updatedElements.length);

      // Update the frame
      this.frameService.updateFrame(
        action.projectId,
        action.sceneId,
        action.frameId,
        { elements: updatedElements as any[] }
      );

      this.notificationService.success('Drawing action undone');
      
      // Emit undo event
      this.undoEvent$.next({
        action: 'undo',
        projectId: action.projectId,
        sceneId: action.sceneId,
        frameId: action.frameId
      });
      
      return true;
    } catch (error) {
      console.error('[UndoService] Error during undo:', error);
      this.notificationService.error('Failed to undo action');
      return false;
    }
  }

  /**
   * Check if there are actions to undo
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Get the size of the undo stack
   */
  getStackSize(): number {
    return this.undoStack.length;
  }

  /**
   * Clear the undo stack
   */
  clearStack(): void {
    this.undoStack = [];
    console.log('[UndoService] Undo stack cleared');
  }

  /**
   * Clear undo stack for a specific frame
   * (useful when switching frames or projects)
   */
  clearStackForFrame(projectId: string, sceneId: string, frameId: string): void {
    const originalSize = this.undoStack.length;
    this.undoStack = this.undoStack.filter(
      action =>
        action.projectId !== projectId ||
        action.sceneId !== sceneId ||
        action.frameId !== frameId
    );
    const removedCount = originalSize - this.undoStack.length;
    if (removedCount > 0) {
      console.log('[UndoService] Cleared', removedCount, 'actions for frame:', frameId);
    }
  }
}
