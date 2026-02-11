import { Component, OnInit, OnDestroy, signal, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineStateService } from '../../services/timeline-state.service';
import { FrameService } from '../../services/frame.service';
import { Frame } from '../../models/frame.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-timeline-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container" [class.collapsed]="collapsed()">
      <div class="timeline-header">
        <h3>Timeline</h3>
        <button (click)="toggleCollapse()" class="collapse-btn">
          {{ collapsed() ? '▲' : '▼' }}
        </button>
      </div>

      @if (!collapsed()) {
        <div class="timeline-content">
          <!-- Timeline Toolbar -->
          <div class="timeline-toolbar">
            <div class="toolbar-group">
              <button (click)="addFrame()" title="Add Frame" class="toolbar-btn">
                <span class="icon">➕</span>
                Add Frame
              </button>
              <button 
                (click)="duplicateFrame()" 
                [disabled]="!hasSelectedFrame()"
                title="Duplicate Frame" 
                class="toolbar-btn">
                <span class="icon">📋</span>
                Duplicate
              </button>
              <button 
                (click)="deleteFrame()" 
                [disabled]="!hasSelectedFrame()"
                title="Delete Frame" 
                class="toolbar-btn">
                <span class="icon">🗑️</span>
                Delete
              </button>
            </div>

            <div class="toolbar-group playback-controls">
              <button (click)="firstFrame()" title="First Frame" class="toolbar-btn-icon">
                ⏮️
              </button>
              <button (click)="previousFrame()" title="Previous Frame" class="toolbar-btn-icon">
                ⏪
              </button>
              <button (click)="togglePlayback()" title="Play/Pause" class="toolbar-btn-icon">
                {{ isPlaying() ? '⏸️' : '▶️' }}
              </button>
              <button (click)="nextFrame()" title="Next Frame" class="toolbar-btn-icon">
                ⏩
              </button>
              <button (click)="lastFrame()" title="Last Frame" class="toolbar-btn-icon">
                ⏭️
              </button>
              <button (click)="stopPlayback()" title="Stop" class="toolbar-btn-icon">
                ⏹️
              </button>
            </div>

            <div class="toolbar-group">
              <span class="frame-counter">
                Frame {{ currentFrame() + 1 }} / {{ totalFrames() }}
              </span>
              <div class="zoom-controls">
                <button (click)="zoomOut()" title="Zoom Out" class="toolbar-btn-icon">-</button>
                <span class="zoom-level">{{ Math.round(zoomLevel() * 100) }}%</span>
                <button (click)="zoomIn()" title="Zoom In" class="toolbar-btn-icon">+</button>
              </div>
            </div>
          </div>

          <!-- Frame Strip -->
          <div class="frame-strip-container">
            <div class="frame-strip" [style.transform]="'scale(' + zoomLevel() + ')'">
              @for (frame of frames(); track frame.id; let i = $index) {
                <div 
                  class="frame-thumbnail"
                  [class.selected]="isSelected(i)"
                  [class.current]="i === currentFrame()"
                  (click)="selectFrame(i, $event)"
                  [attr.data-frame-index]="i">
                  <div class="thumbnail-content">
                    @if (frame.thumbnail) {
                      <img [src]="frame.thumbnail" alt="Frame {{ i + 1 }}">
                    } @else {
                      <div class="thumbnail-placeholder">{{ i + 1 }}</div>
                    }
                  </div>
                  <div class="frame-number">{{ i + 1 }}</div>
                  @if (frame.label) {
                    <div class="frame-label">{{ frame.label }}</div>
                  }
                  @if (frame.locked) {
                    <span class="frame-icon locked">🔒</span>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .timeline-container {
      background: #2a2a2a;
      height: 200px;
      display: flex;
      flex-direction: column;
      border-top: 1px solid #444;
      transition: height 0.3s ease;
    }

    .timeline-container.collapsed {
      height: 40px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: #1e1e1e;
      border-bottom: 1px solid #444;
    }

    .timeline-header h3 {
      margin: 0;
      font-size: 14px;
      color: #fff;
    }

    .collapse-btn {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 12px;
      padding: 4px 8px;
    }

    .collapse-btn:hover {
      background: #333;
    }

    .timeline-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .timeline-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background: #252525;
      border-bottom: 1px solid #444;
      gap: 16px;
    }

    .toolbar-group {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .toolbar-btn, .toolbar-btn-icon {
      background: #333;
      border: 1px solid #555;
      color: #fff;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 12px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .toolbar-btn-icon {
      padding: 6px 8px;
    }

    .toolbar-btn:hover:not(:disabled), .toolbar-btn-icon:hover:not(:disabled) {
      background: #444;
    }

    .toolbar-btn:disabled, .toolbar-btn-icon:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .icon {
      font-size: 14px;
    }

    .frame-counter {
      color: #ccc;
      font-size: 12px;
      padding: 0 8px;
    }

    .zoom-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
      border-left: 1px solid #444;
    }

    .zoom-level {
      color: #ccc;
      font-size: 12px;
      min-width: 40px;
      text-align: center;
    }

    .frame-strip-container {
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      background: #1a1a1a;
      padding: 8px;
    }

    .frame-strip {
      display: flex;
      gap: 8px;
      height: 100%;
      transform-origin: left center;
      transition: transform 0.2s ease;
    }

    .frame-thumbnail {
      position: relative;
      min-width: 120px;
      height: 90px;
      background: #333;
      border: 2px solid #555;
      border-radius: 4px;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .frame-thumbnail:hover {
      border-color: #777;
      transform: translateY(-2px);
    }

    .frame-thumbnail.selected {
      border-color: #4a9eff;
      box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.3);
    }

    .frame-thumbnail.current {
      border-color: #ff4444;
      box-shadow: 0 0 0 2px rgba(255, 68, 68, 0.3);
    }

    .thumbnail-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .thumbnail-content img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .thumbnail-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #666;
      background: linear-gradient(135deg, #2a2a2a 25%, transparent 25%, 
                                  transparent 75%, #2a2a2a 75%, #2a2a2a),
                  linear-gradient(135deg, #2a2a2a 25%, transparent 25%, 
                                  transparent 75%, #2a2a2a 75%, #2a2a2a);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
    }

    .frame-number {
      position: absolute;
      bottom: 4px;
      left: 4px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 2px 6px;
      font-size: 10px;
      border-radius: 2px;
    }

    .frame-label {
      position: absolute;
      top: 4px;
      left: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 2px 4px;
      font-size: 9px;
      border-radius: 2px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .frame-icon {
      position: absolute;
      top: 4px;
      right: 4px;
      font-size: 12px;
    }

    .playback-controls {
      padding: 0 16px;
      border-left: 1px solid #444;
      border-right: 1px solid #444;
    }
  `]
})
export class TimelineContainerComponent implements OnInit, OnDestroy {
  private timelineState = inject(TimelineStateService);
  private frameService = inject(FrameService);
  private notificationService = inject(NotificationService);

  // Inputs
  projectId = input.required<string>();
  sceneId = input.required<string>();
  frames = input<Frame[]>([]);
  
  // Output for when frames are modified
  framesChanged = output<void>();

  protected collapsed = signal(false);
  protected isPlaying = signal(false);
  protected Math = Math;

  protected currentFrame = this.timelineState.currentFrameIndex;
  protected zoomLevel = this.timelineState.zoomLevel;
  protected selectedFrames = this.timelineState.selectedFrameIndices;
  
  protected totalFrames = computed(() => this.frames().length);

  ngOnInit(): void {
    // Initialize with current scene frames
    // This will be connected to the actual scene in Phase 3
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  protected toggleCollapse(): void {
    this.collapsed.update(c => !c);
  }

  protected addFrame(): void {
    const projId = this.projectId();
    const scnId = this.sceneId();
    
    console.log('[Timeline] addFrame called:', { projId, scnId });
    
    if (!projId || !scnId) {
      this.notificationService.error('No scene selected');
      return;
    }

    try {
      console.log('[Timeline] Creating frame...');
      this.frameService.createFrame(projId, scnId);
      console.log('[Timeline] Frame created, emitting framesChanged event');
      this.notificationService.success('Frame added');
      this.framesChanged.emit();
      console.log('[Timeline] framesChanged event emitted');
    } catch (error) {
      console.error('[Timeline] Failed to add frame:', error);
      this.notificationService.error('Failed to add frame');
    }
  }

  protected duplicateFrame(): void {
    const projId = this.projectId();
    const scnId = this.sceneId();
    const currentFrames = this.frames();
    const currentIndex = this.currentFrame();
    
    if (!projId || !scnId) {
      this.notificationService.error('No scene selected');
      return;
    }

    if (currentIndex < 0 || currentIndex >= currentFrames.length) {
      this.notificationService.error('No frame selected');
      return;
    }

    try {
      const frameToDuplicate = currentFrames[currentIndex];
      this.frameService.duplicateFrame(projId, scnId, frameToDuplicate.id);
      this.notificationService.success('Frame duplicated');
      this.framesChanged.emit();
    } catch (error) {
      console.error('Failed to duplicate frame:', error);
      this.notificationService.error('Failed to duplicate frame');
    }
  }

  protected deleteFrame(): void {
    const projId = this.projectId();
    const scnId = this.sceneId();
    const currentFrames = this.frames();
    const currentIndex = this.currentFrame();
    
    if (!projId || !scnId) {
      this.notificationService.error('No scene selected');
      return;
    }

    if (currentIndex < 0 || currentIndex >= currentFrames.length) {
      this.notificationService.error('No frame selected');
      return;
    }

    if (currentFrames.length === 1) {
      this.notificationService.error('Cannot delete the last frame');
      return;
    }

    try {
      const frameToDelete = currentFrames[currentIndex];
      this.frameService.deleteFrame(projId, scnId, frameToDelete.id);
      this.notificationService.success('Frame deleted');
      
      // Adjust current frame index if needed
      if (currentIndex >= currentFrames.length - 1) {
        this.timelineState.setCurrentFrame(Math.max(0, currentIndex - 1));
      }
      
      this.framesChanged.emit();
    } catch (error) {
      console.error('Failed to delete frame:', error);
      this.notificationService.error('Failed to delete frame');
    }
  }

  protected selectFrame(index: number, event: MouseEvent): void {
    this.timelineState.selectFrame(index, event.ctrlKey || event.metaKey);
    this.timelineState.setCurrentFrame(index);
  }

  protected isSelected(index: number): boolean {
    return this.selectedFrames().includes(index);
  }

  protected hasSelectedFrame(): boolean {
    return this.selectedFrames().length > 0;
  }

  protected togglePlayback(): void {
    this.isPlaying.update(p => !p);
    // To be integrated with PlaybackService in Phase 7
  }

  protected stopPlayback(): void {
    this.isPlaying.set(false);
    this.timelineState.firstFrame();
  }

  protected firstFrame(): void {
    this.timelineState.firstFrame();
  }

  protected previousFrame(): void {
    this.timelineState.previousFrame();
  }

  protected nextFrame(): void {
    this.timelineState.nextFrame();
  }

  protected lastFrame(): void {
    this.timelineState.lastFrame();
  }

  protected zoomIn(): void {
    this.timelineState.zoomIn();
  }

  protected zoomOut(): void {
    this.timelineState.zoomOut();
  }
}
