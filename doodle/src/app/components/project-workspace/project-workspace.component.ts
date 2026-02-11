import { Component, inject, OnInit, OnDestroy, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { SceneService } from '../../services/scene.service';
import { AutoSaveService } from '../../services/auto-save.service';
import { FrameService } from '../../services/frame.service';
import { TimelineStateService } from '../../services/timeline-state.service';
import { PlaybackService } from '../../services/playback.service';
import { OnionSkinService } from '../../services/onion-skin.service';
import { KeyboardShortcutService } from '../../services/keyboard-shortcut.service';
import { DrawingShortcutsService } from '../../services/drawing-shortcuts.service';
import { SceneManagerComponent } from '../scene-manager/scene-manager.component';
import { TimelineContainerComponent } from '../timeline/timeline-container.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { ButtonComponent } from '../shared/button/button.component';
import { DrawingToolbarComponent } from '../shared/drawing-toolbar/drawing-toolbar.component';
import { ColorPickerComponent } from '../shared/color-picker/color-picker.component';
import { Frame } from '../../models/frame.model';
import { Scene } from '../../models/scene.model';

@Component({
  selector: 'app-project-workspace',
  standalone: true,
  imports: [
    CommonModule, 
    SceneManagerComponent, 
    TimelineContainerComponent, 
    CanvasComponent, 
    ButtonComponent,
    DrawingToolbarComponent,
    ColorPickerComponent
  ],
  template: `
    <div class="workspace" *ngIf="project()">
      <header class="workspace-header">
        <div class="header-left">
          <button class="back-button" (click)="goToDashboard()">
            ← Back to Dashboard
          </button>
          <h1>{{ project()?.name }}</h1>
          <span class="scene-name" *ngIf="activeScene()">• {{ activeScene()?.name }}</span>
        </div>
        <div class="header-center">
          <!-- Tools will be added in Epic 3 -->
        </div>
        <div class="header-right">
          <button 
            class="onion-skin-btn"
            [class.active]="onionSkinEnabled()"
            (click)="toggleOnionSkin()"
            title="Toggle Onion Skin (O)">
            👻 Onion Skin
          </button>
          <span class="save-status">{{ autoSaveService.getSaveStatusText() }}</span>
          <app-button size="small" (click)="manualSave()">
            Save
          </app-button>
        </div>
      </header>

      <div class="workspace-content">
        <!-- Drawing Tools Sidebar -->
        <aside class="tools-sidebar">
          <app-drawing-toolbar></app-drawing-toolbar>
        </aside>

        <!-- Scene Manager Sidebar -->
        <aside class="sidebar">
          <app-scene-manager 
            [projectId]="projectId()"
            (sceneSelect)="onSceneSelect($event)">
          </app-scene-manager>
        </aside>

        <main class="main-content">
          <div class="canvas-area">
            @if (activeScene() && frames().length > 0) {
              <app-canvas
                [currentFrame]="currentFrame()"
                [projectId]="projectId()"
                [sceneId]="activeScene()!.id"
                [width]="canvasWidth()"
                [height]="canvasHeight()"
                [backgroundColor]="backgroundColor()">
              </app-canvas>
            } @else {
              <div class="canvas-placeholder">
                <h2>No Frames</h2>
                <p>Create your first frame to start animating</p>
                <app-button (click)="createFirstFrame()">
                  Create First Frame
                </app-button>
              </div>
            }
          </div>

          <!-- Timeline Component -->
          <app-timeline-container
            [projectId]="projectId()"
            [sceneId]="activeScene()?.id || ''"
            [frames]="frames()"
            (framesChanged)="onFramesChanged()">
          </app-timeline-container>
        </main>

        <!-- Properties Sidebar -->
        <aside class="properties-sidebar">
          <app-color-picker></app-color-picker>
        </aside>
      </div>
    </div>

    <div class="error-state" *ngIf="!project()">
      <h2>Project not found</h2>
      <app-button (click)="goToDashboard()">
        Go to Dashboard
      </app-button>
    </div>
  `,
  styles: [`
    .workspace {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #1a1a1a;
      color: #fff;
    }

    .workspace-header {
      background: #2a2a2a;
      border-bottom: 1px solid #444;
      padding: 0.75rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .header-left, .header-center, .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-left {
      flex: 1;
    }

    .header-center {
      flex: 2;
      justify-content: center;
    }

    .header-right {
      flex: 1;
      justify-content: flex-end;
    }back-button {
      background: none;
      border: 1px solid #555;
      color: #fff;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      transition: all 0.2s;
    }

    .back-button:hover {
      background: #333;
    }

    .workspace-header h1 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .scene-name {
      color: #999;
      font-size: 0.875rem;
    }

    .onion-skin-btn {
      background: #333;
      border: 1px solid #555;
      color: #fff;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .onion-skin-btn:hover {
      background: #444;
    }

    .onion-skin-btn.active {
      background: #4a9eff;
      border-color: #4a9eff;
    }

    .save-status {
      font-size: 0.875rem;
      color: #999;
    }

    .workspace-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .tools-sidebar {
      width: 220px;
      background: #2a2a2a;
      border-right: 1px solid #444;
      overflow-y: auto;
    }

    .sidebar {
      width: 300px;
      background: #2a2a2a;
      border-right: 1px solid #444;
      overflow-y: auto;
    }

    .properties-sidebar {
      width: 280px;
      background: #2a2a2a;
      border-left: 1px solid #444;
      overflow-y: auto;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .canvas-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1a1a1a;
      overflow: hidden;
    }

    .canvas-placeholder {
      text-align: center;
      color: #999;
    }

    .canvas-placeholder h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #ccc;
    }

    .canvas-placeholder p {
      margin-bottom: 1rem;
    }

    .error-state {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      background: #1a1a1a;
      color: #fff;
    }

    @media (max-width: 768px) {
      .workspace-content {
        flex-direction: column;
      }

      .sidebar {
        width: 100%;
        max-height: 200px;
      }

      .header-left, .header-center, .header-right {
        flex: none;
      }
    }
  `]
})
export class ProjectWorkspaceComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private sceneService = inject(SceneService);
  private frameService = inject(FrameService);
  private timelineState = inject(TimelineStateService);
  private playbackService = inject(PlaybackService);
  private onionSkinService = inject(OnionSkinService);
  private keyboardShortcut = inject(KeyboardShortcutService);
  private drawingShortcuts = inject(DrawingShortcutsService);
  public autoSaveService = inject(AutoSaveService);

  // Signals for state
  activeScene = signal<Scene | null>(null);
  frames = signal<Frame[]>([]);

  projectId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id || '';
  });

  project = computed(() => {
    const id = this.projectId();
    return id ? this.projectService.getProject(id) : null;
  });

  currentFrameIndex = this.timelineState.currentFrameIndex;
  onionSkinEnabled = this.onionSkinService.enabled;

  currentFrame = computed(() => {
    const frames = this.frames();
    const index = this.currentFrameIndex();
    return frames[index] || null;
  });

  canvasWidth = computed(() => this.project()?.dimensions.width || 1920);
  canvasHeight = computed(() => this.project()?.dimensions.height || 1080);
  backgroundColor = computed(() => this.project()?.backgroundColor || '#ffffff');

  constructor() {
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  ngOnInit(): void {
    const id = this.projectId();
    if (id) {
      this.projectService.setActiveProject(id);
      this.autoSaveService.startAutoSave();
      this.autoSaveService.setupBeforeUnloadHandler();

      // Register drawing tool shortcuts
      this.drawingShortcuts.registerShortcuts();

      // Load first scene if available
      const proj = this.project();
      if (proj && proj.scenes && proj.scenes.length > 0) {
        this.selectScene(proj.scenes[0]);
      }
    }
  }

  ngOnDestroy(): void {
    this.autoSaveService.stopAutoSave();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  manualSave(): void {
    this.autoSaveService.save();
  }

  onSceneSelect(scene: Scene): void {
    this.selectScene(scene);
  }

  private selectScene(scene: Scene): void {
    this.activeScene.set(scene);
    const sceneFrames = scene.frames || [];
    this.frames.set(sceneFrames);
    this.timelineState.initialize(sceneFrames.length);
    this.timelineState.setTotalFrames(sceneFrames.length);
  }

  createFirstFrame(): void {
    const scene = this.activeScene();
    const proj = this.project();
    if (!scene || !proj) return;

    try {
      const newFrame = this.frameService.createFrame(proj.id, scene.id);
      this.frames.update(frames => [...frames, newFrame]);
      this.timelineState.setTotalFrames(this.frames().length);
    } catch (error) {
      console.error('Failed to create frame:', error);
    }
  }

  onFramesChanged(): void {
    // Reload frames from the scene
    const scene = this.activeScene();
    if (scene) {
      this.selectScene(scene);
    }
  }

  toggleOnionSkin(): void {
    this.onionSkinService.toggleOnionSkin();
  }

  private setupKeyboardShortcuts(): void {
    // Frame navigation
    this.keyboardShortcut.register({
      key: ',',
      callback: () => this.timelineState.previousFrame(),
      description: 'Previous frame'
    });

    this.keyboardShortcut.register({
      key: '.',
      callback: () => this.timelineState.nextFrame(),
      description: 'Next frame'
    });

    this.keyboardShortcut.register({
      key: 'Home',
      callback: () => this.timelineState.firstFrame(),
      description: 'First frame'
    });

    this.keyboardShortcut.register({
      key: 'End',
      callback: () => this.timelineState.lastFrame(),
      description: 'Last frame'
    });

    // Playback
    this.keyboardShortcut.register({
      key: ' ',
      callback: () => this.playbackService.togglePlayPause(),
      description: 'Play/Pause'
    });

    // Onion skin
    this.keyboardShortcut.register({
      key: 'o',
      callback: () => this.onionSkinService.toggleOnionSkin(),
      description: 'Toggle onion skin'
    });
  }
}
