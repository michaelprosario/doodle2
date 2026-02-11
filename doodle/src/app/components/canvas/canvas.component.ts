import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, effect, input, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Frame } from '../../models/frame.model';
import { OnionSkinService } from '../../services/onion-skin.service';
import { ToolService } from '../../services/tool.service';
import { DrawingEngineService } from '../../services/drawing-engine.service';
import { DrawingPropertiesService } from '../../services/drawing-properties.service';
import { SVGElementModel, Point } from '../../models/svg-element.model';
import { screenToCanvasCoordinates, svgElementToDOM } from '../../utils/svg-utils';
import { FrameService } from '../../services/frame.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-container" #container>
      <div class="canvas-viewport" 
           [style.transform]="'scale(' + zoom() + ') translate(' + panX() + 'px, ' + panY() + 'px)'"
           (wheel)="onWheel($event)"
           (mousedown)="onMouseDown($event)"
           (mouseleave)="onMouseLeave()"
           [style.cursor]="toolService.getCursor()">
        <svg #canvas
             [attr.width]="width()"
             [attr.height]="height()"
             [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
             [style.background]="backgroundColor()"
             class="main-canvas">
          
          <!-- Onion skin layers (previous frames) -->
          @if (onionSkinEnabled()) {
            @for (prevFrame of previousFrames(); track prevFrame.id) {
              <g [attr.opacity]="previousOpacity()" class="onion-skin-previous">
                @for (element of prevFrame.elements; track element) {
                  <!-- Element rendering -->
                }
              </g>
            }
          }

          <!-- Current frame -->
          @if (currentFrame()) {
            <g class="current-frame">
              @for (element of currentFrame()!.elements; track element) {
                <!-- Render SVG elements from frame -->
                @if (element.type === 'rect') {
                  <rect
                    [attr.x]="getAttr(element, 'x')"
                    [attr.y]="getAttr(element, 'y')"
                    [attr.width]="getAttr(element, 'width')"
                    [attr.height]="getAttr(element, 'height')"
                    [attr.fill]="getAttr(element, 'fill')"
                    [attr.stroke]="getAttr(element, 'stroke')"
                    [attr.stroke-width]="getAttr(element, 'strokeWidth')"
                  />
                }
                @if (element.type === 'circle') {
                  <circle
                    [attr.cx]="getAttr(element, 'cx')"
                    [attr.cy]="getAttr(element, 'cy')"
                    [attr.r]="getAttr(element, 'r')"
                    [attr.fill]="getAttr(element, 'fill')"
                    [attr.stroke]="getAttr(element, 'stroke')"
                    [attr.stroke-width]="getAttr(element, 'strokeWidth')"
                  />
                }
                @if (element.type === 'ellipse') {
                  <ellipse
                    [attr.cx]="getAttr(element, 'cx')"
                    [attr.cy]="getAttr(element, 'cy')"
                    [attr.rx]="getAttr(element, 'rx')"
                    [attr.ry]="getAttr(element, 'ry')"
                    [attr.fill]="getAttr(element, 'fill')"
                    [attr.stroke]="getAttr(element, 'stroke')"
                    [attr.stroke-width]="getAttr(element, 'strokeWidth')"
                  />
                }
                @if (element.type === 'line') {
                  <line
                    [attr.x1]="getAttr(element, 'x1')"
                    [attr.y1]="getAttr(element, 'y1')"
                    [attr.x2]="getAttr(element, 'x2')"
                    [attr.y2]="getAttr(element, 'y2')"
                    [attr.stroke]="getAttr(element, 'stroke')"
                    [attr.stroke-width]="getAttr(element, 'strokeWidth')"
                  />
                }
                @if (element.type === 'polygon') {
                  <polygon
                    [attr.points]="getAttr(element, 'points')"
                    [attr.fill]="getAttr(element, 'fill')"
                    [attr.stroke]="getAttr(element, 'stroke')"
                    [attr.stroke-width]="getAttr(element, 'strokeWidth')"
                  />
                }
                @if (element.type === 'path') {
                  <path
                    [attr.d]="getAttr(element, 'd')"
                    [attr.fill]="getAttr(element, 'fill')"
                    [attr.stroke]="getAttr(element, 'stroke')"
                    [attr.stroke-width]="getAttr(element, 'strokeWidth')"
                    [attr.stroke-opacity]="getAttr(element, 'strokeOpacity')"
                    [attr.stroke-linecap]="getAttr(element, 'strokeLinecap')"
                    [attr.stroke-linejoin]="getAttr(element, 'strokeLinejoin')"
                  />
                }
              }
            </g>
          }

          <!-- Preview element during drawing -->
          @if (previewElement(); as preview) {
            <g class="preview-element" opacity="0.7">
              @if (preview.type === 'rect') {
                <rect
                  [attr.x]="preview.attributes.x"
                  [attr.y]="preview.attributes.y"
                  [attr.width]="preview.attributes.width"
                  [attr.height]="preview.attributes.height"
                  [attr.fill]="preview.attributes.fill"
                  [attr.stroke]="preview.attributes.stroke || '#000'"
                  [attr.stroke-width]="preview.attributes.strokeWidth"
                  stroke-dasharray="4 2"
                />
              }
              @if (preview.type === 'circle') {
                <circle
                  [attr.cx]="preview.attributes.cx"
                  [attr.cy]="preview.attributes.cy"
                  [attr.r]="preview.attributes.r"
                  [attr.fill]="preview.attributes.fill"
                  [attr.stroke]="preview.attributes.stroke || '#000'"
                  [attr.stroke-width]="preview.attributes.strokeWidth"
                  stroke-dasharray="4 2"
                />
              }
              @if (preview.type === 'ellipse') {
                <ellipse
                  [attr.cx]="preview.attributes.cx"
                  [attr.cy]="preview.attributes.cy"
                  [attr.rx]="preview.attributes.rx"
                  [attr.ry]="preview.attributes.ry"
                  [attr.fill]="preview.attributes.fill"
                  [attr.stroke]="preview.attributes.stroke || '#000'"
                  [attr.stroke-width]="preview.attributes.strokeWidth"
                  stroke-dasharray="4 2"
                />
              }
              @if (preview.type === 'line') {
                <line
                  [attr.x1]="preview.attributes.x1"
                  [attr.y1]="preview.attributes.y1"
                  [attr.x2]="preview.attributes.x2"
                  [attr.y2]="preview.attributes.y2"
                  [attr.stroke]="preview.attributes.stroke || '#000'"
                  [attr.stroke-width]="preview.attributes.strokeWidth"
                  stroke-dasharray="4 2"
                />
              }
              @if (preview.type === 'polygon') {
                <polygon
                  [attr.points]="preview.attributes.points"
                  [attr.fill]="preview.attributes.fill"
                  [attr.stroke]="preview.attributes.stroke || '#000'"
                  [attr.stroke-width]="preview.attributes.strokeWidth"
                  stroke-dasharray="4 2"
                />
              }
              @if (preview.type === 'path') {
                <path
                  [attr.d]="preview.attributes.d"
                  [attr.fill]="preview.attributes.fill || 'none'"
                  [attr.stroke]="preview.attributes.stroke || '#000'"
                  [attr.stroke-width]="preview.attributes.strokeWidth"
                  [attr.stroke-linecap]="preview.attributes.strokeLinecap"
                  [attr.stroke-linejoin]="preview.attributes.strokeLinejoin"
                  stroke-dasharray="4 2"
                />
              }
            </g>
          }

          <!-- Onion skin layers (next frames) -->
          @if (onionSkinEnabled()) {
            @for (nextFrame of nextFrames(); track nextFrame.id) {
              <g [attr.opacity]="nextOpacity()" class="onion-skin-next">
                <!-- Element rendering will be implemented in Epic 3 -->
              </g>
            }
          }

          <!-- SVG Filters for onion skin tinting -->
          <defs>
            <filter id="redTint">
              <feColorMatrix type="matrix" 
                values="1 0 0 0 0.3
                        0 0.3 0 0 0
                        0 0 0.3 0 0
                        0 0 0 1 0"/>
            </filter>
            <filter id="blueTint">
              <feColorMatrix type="matrix" 
                values="0.3 0 0 0 0
                        0 0.3 0 0 0
                        0 0 1 0 0.3
                        0 0 0 1 0"/>
            </filter>
          </defs>
        </svg>
      </div>

      <!-- Canvas controls overlay -->
      <div class="canvas-controls">
        <div class="control-group">
          <button (click)="resetZoom()" class="control-btn" title="Reset Zoom (100%)">
            100%
          </button>
          <button (click)="fitToScreen()" class="control-btn" title="Fit to Screen">
            Fit
          </button>
        </div>
        <div class="canvas-info">
          {{ width() }} × {{ height() }}px | {{ Math.round(zoom() * 100) }}%
        </div>
      </div>
    </div>
  `,
  styles: [`
    .canvas-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas-viewport {
      transform-origin: center center;
      transition: transform 0.1s ease;
      cursor: grab;
    }

    .canvas-viewport:active {
      cursor: grabbing;
    }

    .main-canvas {
      display: block;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }

    .onion-skin-previous {
      pointer-events: none;
    }

    .onion-skin-next {
      pointer-events: none;
    }

    .canvas-controls {
      position: absolute;
      bottom: 16px;
      right: 16px;
      display: flex;
      gap: 16px;
      align-items: center;
      background: rgba(0, 0, 0, 0.7);
      padding: 8px 12px;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }

    .control-group {
      display: flex;
      gap: 4px;
    }

    .control-btn {
      background: #333;
      border: 1px solid #555;
      color: #fff;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 11px;
      border-radius: 3px;
    }

    .control-btn:hover {
      background: #444;
    }

    .canvas-info {
      color: #ccc;
      font-size: 11px;
      font-family: monospace;
      border-left: 1px solid #555;
      padding-left: 12px;
    }
  `]
})
export class CanvasComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<SVGSVGElement>;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private onionSkinService = inject(OnionSkinService);
  protected toolService = inject(ToolService);
  private drawingEngine = inject(DrawingEngineService);
  private drawingPropertiesService = inject(DrawingPropertiesService);
  private frameService = inject(FrameService);

  // Inputs
  currentFrame = input<Frame | null>(null);
  projectId = input<string>('');
  sceneId = input<string>('');
  width = input(1920);
  height = input(1080);
  backgroundColor = input('#ffffff');

  // Outputs
  frameUpdated = output<void>();

  // Signals
  protected zoom = signal(1.0);
  protected panX = signal(0);
  protected panY = signal(0);
  protected Math = Math;

  // Onion skin
  protected onionSkinEnabled = this.onionSkinService.enabled;
  protected previousFrames = signal<Frame[]>([]);
  protected nextFrames = signal<Frame[]>([]);
  protected previousOpacity = this.onionSkinService.previousOpacity;
  protected nextOpacity = this.onionSkinService.nextOpacity;

  // Pan state
  private isPanning = false;
  private lastPanX = 0;
  private lastPanY = 0;

  // Drawing state
  protected previewElement = signal<SVGElementModel | null>(null);
  protected activeTool = this.toolService.activeTool;

  constructor() {
    // React to current frame changes
    effect(() => {
      const frame = this.currentFrame();
      if (frame) {
        this.renderFrame(frame);
      }
    });
  }

  ngOnInit(): void {
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const delta = -event.deltaY / 1000;
    const newZoom = Math.max(0.1, Math.min(5, this.zoom() + delta));
    this.zoom.set(newZoom);
  }

  protected onMouseDown(event: MouseEvent): void {
    console.log('Mouse down - activeTool:', this.activeTool(), 'button:', event.button);
    
    // Pan tool or middle mouse button
    if (this.activeTool() === 'pan' || event.button === 1 || event.shiftKey) {
      event.preventDefault();
      this.isPanning = true;
      this.lastPanX = event.clientX;
      this.lastPanY = event.clientY;
      return;
    }

    // Drawing tools
    if (this.isDrawingTool() && event.button === 0) {
      console.log('Starting drawing with tool:', this.activeTool());
      event.preventDefault();
      this.startDrawing(event);
    }
  }

  private startDrawing(event: MouseEvent): void {
    const point = this.getCanvasPoint(event);
    this.toolService.startDrawing(point);

    // For freehand tools, initialize path points
    if (this.isFreehandTool()) {
      this.toolService.clearPathPoints();
      this.toolService.addPathPoint(point);
      return;
    }

    // Create initial preview element for shape tools
    const properties = this.drawingPropertiesService.properties();
    const options = {
      constrainProportions: event.shiftKey,
      drawFromCenter: event.altKey
    };

    const element = this.drawingEngine.drawShape(
      this.activeTool(),
      point,
      point,
      properties,
      options
    );

    if (element) {
      this.previewElement.set(element);
    }
  }

  protected resetZoom(): void {
    this.zoom.set(1.0);
    this.panX.set(0);
    this.panY.set(0);
  }

  protected fitToScreen(): void {
    const container = this.containerRef.nativeElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaleX = containerWidth / this.width() * 0.9; // 90% to leave margins
    const scaleY = containerHeight / this.height() * 0.9;
    const scale = Math.min(scaleX, scaleY);
    
    this.zoom.set(scale);
    this.panX.set(0);
    this.panY.set(0);
  }

  private setupEventListeners(): void {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  private removeEventListeners(): void {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (this.isPanning) {
      const deltaX = event.clientX - this.lastPanX;
      const deltaY = event.clientY - this.lastPanY;
      
      this.panX.update(x => x + deltaX);
      this.panY.update(y => y + deltaY);
      
      this.lastPanX = event.clientX;
      this.lastPanY = event.clientY;
      return;
    }

    // Drawing in progress
    if (this.toolService.isDrawing()) {
      const point = this.getCanvasPoint(event);
      this.toolService.continueDrawing(point);
      
      // Handle freehand drawing
      if (this.isFreehandTool()) {
        this.toolService.addPathPoint(point);
        this.updateFreehandPreview();
      } else {
        this.updatePreview(event);
      }
    }
  };

  private updatePreview(event: MouseEvent): void {
    const toolState = this.toolService.toolState();
    if (!toolState.startPoint || !toolState.currentPoint) return;

    const properties = this.drawingPropertiesService.properties();
    const options = {
      constrainProportions: event.shiftKey,
      drawFromCenter: event.altKey
    };

    const element = this.drawingEngine.drawShape(
      this.activeTool(),
      toolState.startPoint,
      toolState.currentPoint,
      properties,
      options
    );

    if (element) {
      this.previewElement.set(element);
    }
  }

  private updateFreehandPreview(): void {
    const pathPoints = this.toolService.getPathPoints();
    console.log('updateFreehandPreview - pathPoints:', pathPoints.length);
    if (pathPoints.length < 2) return;

    const properties = this.drawingPropertiesService.properties();
    console.log('updateFreehandPreview - properties:', properties);
    // Ensure freehand tools have a visible stroke
    const stroke = (properties.stroke === 'none' || !properties.stroke) ? '#000000' : properties.stroke;
    const attrs = {
      fill: 'none', // Freehand paths should not have fill
      stroke: stroke,
      strokeWidth: properties.strokeWidth,
      strokeOpacity: properties.strokeOpacity,
      strokeLinecap: properties.strokeLinecap,
      strokeLinejoin: properties.strokeLinejoin
    };
    console.log('updateFreehandPreview - attrs:', attrs);

    const element = this.drawingEngine.createPathFromPoints(pathPoints, attrs);
    console.log('updateFreehandPreview - element:', element);
    this.previewElement.set(element);
  }

  private onMouseUp = (event: MouseEvent): void => {
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }

    // Finalize drawing
    if (this.toolService.isDrawing()) {
      const point = this.getCanvasPoint(event);
      
      // Add final point for freehand tools
      if (this.isFreehandTool()) {
        this.toolService.addPathPoint(point);
      }
      
      this.toolService.endDrawing(point);
      this.finalizeDrawing();
    }
  };

  private finalizeDrawing(): void {
    let preview = this.previewElement();
    const frame = this.currentFrame();
    const projId = this.projectId();
    const scnId = this.sceneId();

    console.log('Finalizing drawing:', {
      hasPreview: !!preview,
      hasFrame: !!frame,
      frameId: frame?.id,
      projId,
      scnId,
      elementCount: frame?.elements?.length
    });

    // For freehand tools, ensure we have enough points and create final element
    if (this.isFreehandTool()) {
      const pathPoints = this.toolService.getPathPoints();
      console.log('Freehand tool - path points:', pathPoints.length);
      if (pathPoints.length < 2) {
        // Not enough points to create a path
        console.warn('Not enough points for freehand drawing');
        this.previewElement.set(null);
        this.toolService.cancelDrawing();
        this.toolService.clearPathPoints();
        return;
      }
      
      // Create or recreate the preview element from final path points
      const properties = this.drawingPropertiesService.properties();
      const stroke = (properties.stroke === 'none' || !properties.stroke) ? '#000000' : properties.stroke;
      const attrs = {
        fill: 'none',
        stroke: stroke,
        strokeWidth: properties.strokeWidth,
        strokeOpacity: properties.strokeOpacity,
        strokeLinecap: properties.strokeLinecap,
        strokeLinejoin: properties.strokeLinejoin
      };
      preview = this.drawingEngine.createPathFromPoints(pathPoints, attrs);
      console.log('Created final freehand element:', preview);
    }

    if (preview && frame && projId && scnId) {
      // Add the element to the frame
      const updatedElements = [...frame.elements, preview];
      console.log('Updating frame with new element:', preview.type, 'Total elements:', updatedElements.length);
      try {
        this.frameService.updateFrame(projId, scnId, frame.id, { 
          elements: updatedElements as any[]
        });
        console.log('Frame updated successfully, emitting event');
        // Emit event to parent to refresh frames
        this.frameUpdated.emit();
      } catch (error) {
        console.error('Failed to update frame:', error);
      }
    } else {
      console.warn('Cannot finalize drawing - missing required data:', {
        preview: !!preview,
        frame: !!frame,
        projId: !!projId,
        scnId: !!scnId
      });
    }

    // Clear preview and path points
    this.previewElement.set(null);
    this.toolService.cancelDrawing();
    this.toolService.clearPathPoints();
  }

  private renderFrame(frame: Frame): void {
    // Frame rendering will be implemented with drawing tools in Epic 3
    // For now, this is a placeholder
    console.log('Rendering frame:', frame.id, 'with', frame.elements?.length || 0, 'elements');
    if (frame.elements && frame.elements.length > 0) {
      console.log('Frame elements:', frame.elements.map((e: any) => ({
        type: e.type,
        id: e.id,
        hasAttributes: !!e.attributes,
        attributes: e.attributes
      })));
    }
  }

  /**
   * Update onion skin frames
   */
  updateOnionSkin(previous: Frame[], next: Frame[]): void {
    this.previousFrames.set(previous);
    this.nextFrames.set(next);
  }

  /**
   * Get canvas coordinates from mouse event
   */
  private getCanvasPoint(event: MouseEvent): Point {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;
    const containerRect = container.getBoundingClientRect();
    
    // Get mouse position relative to container center
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;
    
    let x = event.clientX - containerCenterX;
    let y = event.clientY - containerCenterY;
    
    // Reverse the transforms: scale(zoom) translate(panX, panY)
    // CSS applies right-to-left, so: first translate, then scale
    // To reverse: first divide by zoom, then subtract translate
    const currentZoom = this.zoom();
    const currentPanX = this.panX();
    const currentPanY = this.panY();
    
    // Reverse scale
    x = x / currentZoom;
    y = y / currentZoom;
    
    // Reverse translate (panX/panY are in pre-scaled units)
    x = x - currentPanX;
    y = y - currentPanY;
    
    // Convert from center-origin to top-left origin
    const canvasWidth = canvas.width.baseVal.value;
    const canvasHeight = canvas.height.baseVal.value;
    x = x + canvasWidth / 2;
    y = y + canvasHeight / 2;
    
    return { x, y };
  }

  /**
   * Check if current tool is a drawing tool
   */
  private isDrawingTool(): boolean {
    const tool = this.activeTool();
    return ['rectangle', 'circle', 'ellipse', 'line', 'polygon', 'star', 'triangle', 'pen', 'pencil'].includes(tool);
  }

  /**
   * Check if current tool is a freehand tool (pen/pencil)
   */
  private isFreehandTool(): boolean {
    const tool = this.activeTool();
    return ['pen', 'pencil'].includes(tool);
  }

  /**
   * Handle mouse leave (cancel drawing if in progress)
   */
  protected onMouseLeave(): void {
    if (this.toolService.isDrawing()) {
      this.toolService.cancelDrawing();
      this.toolService.clearPathPoints();
      this.previewElement.set(null);
    }
  }

  /**
   * Get attribute from element (handles both legacy and new format)
   */
  protected getAttr(element: any, key: string): any {
    // New SVGElementModel format
    if (element.attributes) {
      return element.attributes[key];
    }
    // Legacy SVGElement format
    if (element.properties) {
      return element.properties[key];
    }
    return undefined;
  }
}
