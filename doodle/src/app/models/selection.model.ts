export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TransformHandle =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw'
  | 'rotate';

export interface SelectionState {
  selectedIds: string[];
  selectionBounds?: Rect;
  activeHandle?: TransformHandle;
  activeMode: 'idle' | 'move' | 'scale' | 'rotate' | 'box-select';
  isDragging: boolean;
}
