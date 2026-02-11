import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scene } from '../../models/scene.model';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-scene-item',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent],
  template: `
    <div
      class="scene-item"
      [class.active]="isActive"
      (click)="onSelect()">
      
      <div class="scene-thumbnail">
        <img *ngIf="scene.thumbnail" [src]="scene.thumbnail" alt="">
        <div *ngIf="!scene.thumbnail" class="thumbnail-placeholder">
          {{ scene.order + 1 }}
        </div>
      </div>

      <div class="scene-info">
        <h4>{{ scene.name }}</h4>
        <div class="scene-meta">
          <span>{{ scene.frames.length }} frames</span>
          <span *ngIf="scene.duration">{{ scene.duration }}f</span>
        </div>
      </div>

      <div class="scene-actions" (click)="$event.stopPropagation()">
        <button class="action-btn" (click)="onEdit()" title="Edit">
          ✏️
        </button>
        <button class="action-btn" (click)="onDuplicate()" title="Duplicate">
          📋
        </button>
        <button class="action-btn" (click)="showDeleteConfirm()" title="Delete">
          🗑️
        </button>
      </div>
    </div>

    <app-confirmation-dialog
      [isOpen]="showDeleteDialog()"
      title="Delete Scene"
      [message]="'Are you sure you want to delete &quot;' + scene.name + '&quot;?'"
      confirmText="Delete"
      cancelText="Cancel"
      confirmVariant="danger"
      (confirmed)="onDelete()"
      (cancelled)="hideDeleteConfirm()">
    </app-confirmation-dialog>
  `,
  styles: [`
    .scene-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }

    .scene-item:hover {
      background: #f9fafb;
    }

    .scene-item.active {
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
    }

    .scene-thumbnail {
      width: 60px;
      height: 45px;
      background: #f3f4f6;
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .scene-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail-placeholder {
      font-size: 1.25rem;
      font-weight: 600;
      color: #9ca3af;
    }

    .scene-info {
      flex: 1;
      min-width: 0;
    }

    .scene-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .scene-meta {
      display: flex;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .scene-actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .scene-item:hover .scene-actions {
      opacity: 1;
    }

    .action-btn {
      width: 1.75rem;
      height: 1.75rem;
      border: none;
      background: white;
      border-radius: 0.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #e5e7eb;
      transform: scale(1.1);
    }
  `]
})
export class SceneItemComponent {
  @Input({ required: true }) scene!: Scene;
  @Input() isActive = false;
  @Output() select = new EventEmitter<Scene>();
  @Output() edit = new EventEmitter<Scene>();
  @Output() duplicate = new EventEmitter<Scene>();
  @Output() delete = new EventEmitter<Scene>();

  showDeleteDialog = signal(false);

  onSelect(): void {
    this.select.emit(this.scene);
  }

  onEdit(): void {
    this.edit.emit(this.scene);
  }

  onDuplicate(): void {
    this.duplicate.emit(this.scene);
  }

  showDeleteConfirm(): void {
    this.showDeleteDialog.set(true);
  }

  hideDeleteConfirm(): void {
    this.showDeleteDialog.set(false);
  }

  onDelete(): void {
    this.delete.emit(this.scene);
    this.hideDeleteConfirm();
  }
}
