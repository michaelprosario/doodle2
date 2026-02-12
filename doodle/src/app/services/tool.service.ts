import { Injectable, signal } from '@angular/core';
import { DrawingTool, ToolType, ToolState, Point } from '../models/svg-element.model';

@Injectable({
  providedIn: 'root'
})
export class ToolService {
  // Tool state signals
  private activeToolSignal = signal<ToolType>('select');
  private toolStateSignal = signal<ToolState>({
    activeTool: 'select',
    isDrawing: false
  });

  // Public read-only signals
  activeTool = this.activeToolSignal.asReadonly();
  toolState = this.toolStateSignal.asReadonly();

  // Available drawing tools
  private readonly tools: DrawingTool[] = [
    {
      id: 'select',
      name: 'Select',
      type: 'select',
      icon: 'cursor',
      shortcut: 'V',
      cursor: 'default'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      type: 'rectangle',
      icon: 'square',
      shortcut: 'R',
      cursor: 'crosshair'
    },
    {
      id: 'circle',
      name: 'Circle',
      type: 'circle',
      icon: 'circle',
      shortcut: 'C',
      cursor: 'crosshair'
    },
    {
      id: 'ellipse',
      name: 'Ellipse',
      type: 'ellipse',
      icon: 'ellipse',
      shortcut: 'E',
      cursor: 'crosshair'
    },
    {
      id: 'line',
      name: 'Line',
      type: 'line',
      icon: 'minus',
      shortcut: 'L',
      cursor: 'crosshair'
    },
    {
      id: 'pen',
      name: 'Pen',
      type: 'pen',
      icon: 'pen-tool',
      shortcut: 'P',
      cursor: 'crosshair'
    },
    {
      id: 'pencil',
      name: 'Pencil',
      type: 'pencil',
      icon: 'pencil',
      shortcut: 'N',
      cursor: 'crosshair'
    },
    {
      id: 'brush',
      name: 'Brush',
      type: 'brush',
      icon: 'brush',
      shortcut: 'B',
      cursor: 'crosshair'
    },
    {
      id: 'eraser',
      name: 'Eraser',
      type: 'eraser',
      icon: 'eraser',
      shortcut: 'E',
      cursor: 'crosshair'
    },
    {
      id: 'eyedropper',
      name: 'Eyedropper',
      type: 'eyedropper',
      icon: 'eyedropper',
      shortcut: 'I',
      cursor: 'crosshair'
    },
    {
      id: 'pan',
      name: 'Pan',
      type: 'pan',
      icon: 'hand',
      shortcut: 'H',
      cursor: 'grab'
    }
  ];

  /**
   * Get all available tools
   */
  getTools(): DrawingTool[] {
    return [...this.tools];
  }

  /**
   * Get tool by type
   */
  getTool(type: ToolType): DrawingTool | undefined {
    return this.tools.find(tool => tool.type === type);
  }

  /**
   * Get tool by keyboard shortcut
   */
  getToolByShortcut(key: string): DrawingTool | null {
    const upperKey = key.toUpperCase();
    return this.tools.find(tool => tool.shortcut === upperKey) || null;
  }

  /**
   * Set the active tool
   */
  setActiveTool(tool: ToolType): void {
    // Clean up current tool state if changing tools
    if (this.activeToolSignal() !== tool) {
      this.cancelDrawing();
    }

    this.activeToolSignal.set(tool);
    this.toolStateSignal.update(state => ({
      ...state,
      activeTool: tool
    }));
  }

  /**
   * Update tool state
   */
  updateToolState(state: Partial<ToolState>): void {
    this.toolStateSignal.update(current => ({
      ...current,
      ...state
    }));
  }

  /**
   * Start drawing operation
   */
  startDrawing(point: Point): void {
    this.toolStateSignal.update(state => ({
      ...state,
      isDrawing: true,
      startPoint: point,
      currentPoint: point
    }));
  }

  /**
   * Continue drawing operation
   */
  continueDrawing(point: Point): void {
    this.toolStateSignal.update(state => ({
      ...state,
      currentPoint: point
    }));
  }

  /**
   * End drawing operation
   */
  endDrawing(point: Point): void {
    this.toolStateSignal.update(state => ({
      ...state,
      isDrawing: false,
      currentPoint: point
    }));
  }

  /**
   * Cancel drawing operation
   */
  cancelDrawing(): void {
    this.toolStateSignal.update(state => ({
      activeTool: state.activeTool,
      isDrawing: false,
      startPoint: undefined,
      currentPoint: undefined,
      previewElement: undefined,
      pathPoints: undefined
    }));
  }

  /**
   * Check if currently drawing
   */
  isDrawing(): boolean {
    return this.toolStateSignal().isDrawing;
  }

  /**
   * Get cursor style for active tool
   */
  getCursor(): string {
    const tool = this.getTool(this.activeToolSignal());
    return tool?.cursor || 'default';
  }

  /**
   * Add point to path (for multi-point tools like pen, polygon)
   */
  addPathPoint(point: Point): void {
    this.toolStateSignal.update(state => ({
      ...state,
      pathPoints: [...(state.pathPoints || []), point]
    }));
  }

  /**
   * Clear path points
   */
  clearPathPoints(): void {
    this.toolStateSignal.update(state => ({
      ...state,
      pathPoints: undefined
    }));
  }

  /**
   * Get path points
   */
  getPathPoints(): Point[] {
    return this.toolStateSignal().pathPoints || [];
  }

  /**
   * Set preview element
   */
  setPreviewElement(element: any): void {
    this.toolStateSignal.update(state => ({
      ...state,
      previewElement: element
    }));
  }

  /**
   * Clear preview element
   */
  clearPreviewElement(): void {
    this.toolStateSignal.update(state => ({
      ...state,
      previewElement: undefined
    }));
  }

  /**
   * Get start point
   */
  getStartPoint(): Point | undefined {
    return this.toolStateSignal().startPoint;
  }

  /**
   * Get current point
   */
  getCurrentPoint(): Point | undefined {
    return this.toolStateSignal().currentPoint;
  }
}
