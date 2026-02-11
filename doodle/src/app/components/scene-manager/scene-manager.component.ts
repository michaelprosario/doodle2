import { Component, Input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SceneService } from '../../services/scene.service';
import { Scene } from '../../models/scene.model';
import { SceneItemComponent } from '../scene-item/scene-item.component';
import { SceneDialogComponent } from '../scene-dialog/scene-dialog.component';
import { ButtonComponent } from '../shared/button/button.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-scene-manager',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    SceneItemComponent,
    SceneDialogComponent,
    ButtonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="scene-manager">
      <div class="manager-header">
        <h2>Scenes</h2>
        <app-button size="small" (click)="openCreateDialog()">
          + Add
        </app-button>
      </div>

      <div class="scene-list" *ngIf="scenes().length > 0">
        <div
          cdkDropList
          (cdkDropListDropped)="onDrop($event)"
          class="scene-drop-list">
          <app-scene-item
            *ngFor="let scene of scenes()"
            [scene]="scene"
            [isActive]="scene.id === activeSceneId()"
            cdkDrag
            (select)="onSelectScene($event)"
            (edit)="onEditScene($event)"
            (duplicate)="onDuplicateScene($event)"
            (delete)="onDeleteScene($event)">
          </app-scene-item>
        </div>
      </div>

      <app-empty-state
        *ngIf="scenes().length === 0"
        icon="🎬"
        title="No scenes yet"
        message="Add your first scene to start animating"
        [hasAction]="true">
        <app-button (click)="openCreateDialog()">
          Add Scene
        </app-button>
      </app-empty-state>

      <app-scene-dialog
        [isOpen]="showDialog()"
        [scene]="editingScene()"
        [mode]="dialogMode()"
        (saved)="onSceneSaved($event)"
        (cancelled)="closeDialog()">
      </app-scene-dialog>
    </div>
  `,
  styles: [`
    .scene-manager {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .manager-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .manager-header h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .scene-list {
      flex: 1;
      overflow-y: auto;
    }

    .scene-drop-list {
      min-height: 100px;
    }

    .cdk-drag-preview {
      opacity: 0.8;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class SceneManagerComponent {
  @Input({ required: true }) projectId!: string;

  private sceneService = inject(SceneService);
  private notificationService = inject(NotificationService);

  showDialog = signal(false);
  dialogMode = signal<'create' | 'edit'>('create');
  editingScene = signal<Scene | undefined>(undefined);
  activeSceneId = signal<string | null>(null);

  scenes = computed(() => {
    return this.sceneService.getScenesByProject(this.projectId);
  });

  openCreateDialog(): void {
    this.dialogMode.set('create');
    this.editingScene.set(undefined);
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingScene.set(undefined);
  }

  onSceneSaved(data: Partial<Scene>): void {
    if (this.dialogMode() === 'create') {
      const scene = this.sceneService.createScene(this.projectId, data);
      if (scene) {
        this.notificationService.success('Scene created successfully');
      }
    } else if (this.dialogMode() === 'edit' && this.editingScene()) {
      this.sceneService.updateScene(this.projectId, this.editingScene()!.id, data);
      this.notificationService.success('Scene updated successfully');
    }
    this.closeDialog();
  }

  onSelectScene(scene: Scene): void {
    this.activeSceneId.set(scene.id);
    // TODO: Load scene in canvas
  }

  onEditScene(scene: Scene): void {
    this.dialogMode.set('edit');
    this.editingScene.set(scene);
    this.showDialog.set(true);
  }

  onDuplicateScene(scene: Scene): void {
    const duplicated = this.sceneService.duplicateScene(this.projectId, scene.id);
    if (duplicated) {
      this.notificationService.success('Scene duplicated successfully');
    }
  }

  onDeleteScene(scene: Scene): void {
    this.sceneService.deleteScene(this.projectId, scene.id);
    this.notificationService.success('Scene deleted');
    
    // Clear active scene if it was deleted
    if (this.activeSceneId() === scene.id) {
      this.activeSceneId.set(null);
    }
  }

  onDrop(event: CdkDragDrop<Scene[]>): void {
    const scenes = this.scenes();
    const scenesCopy = [...scenes];
    moveItemInArray(scenesCopy, event.previousIndex, event.currentIndex);
    
    const sceneIds = scenesCopy.map(s => s.id);
    this.sceneService.reorderScenes(this.projectId, sceneIds);
  }
}
