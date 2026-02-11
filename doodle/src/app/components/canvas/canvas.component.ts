import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, effect, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Frame } from '../../models/frame.model';
import { OnionSkinService } from '../../services/onion-skin.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-container" #container>
      <div class="canvas-viewport" 
           [style.transform]="'scale(' + zoom() + ') translate(' + panX() + 'px, ' + panY() + 'px)'"
           (wheel)="onWheel($event)"
           (mousedown)="onMouseDown($event)">
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
                <!-- Element rendering will be implemented in Epic 3 -->
              </g>
            }
          }

          <!-- Current frame -->
          @if (currentFrame()) {
            <g class="current-frame">
              <!-- Element rendering will be implemented in Epic 3 -->
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

  // Inputs
  currentFrame = input<Frame | null>(null);
  width = input(1920);
  height = input(1080);
  backgroundColor = input('#ffffff');

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
    if (event.button === 1 || event.shiftKey) { // Middle mouse or Shift+Left
      event.preventDefault();
      this.isPanning = true;
      this.lastPanX = event.clientX;
      this.lastPanY = event.clientY;
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
    }
  };

  private onMouseUp = (): void => {
    this.isPanning = false;
  };

  private renderFrame(frame: Frame): void {
    // Frame rendering will be implemented with drawing tools in Epic 3
    // For now, this is a placeholder
    console.log('Rendering frame:', frame.id);
  }

  /**
   * Update onion skin frames
   */
  updateOnionSkin(previous: Frame[], next: Frame[]): void {
    this.previousFrames.set(previous);
    this.nextFrames.set(next);
  }
}
