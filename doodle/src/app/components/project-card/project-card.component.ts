import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../models/project.model';
import { ButtonComponent } from '../shared/button/button.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ConfirmationDialogComponent],
  template: `
    <div class="project-card" (click)="onCardClick()">
      <div class="card-thumbnail">
        <div class="thumbnail-placeholder">
          {{ project.name.substring(0, 2).toUpperCase() }}
        </div>
      </div>
      
      <div class="card-content">
        <h3>{{ project.name }}</h3>
        <p class="description" *ngIf="project.description">
          {{ project.description }}
        </p>
        
        <div class="metadata">
          <span class="meta-item">
            📐 {{ project.dimensions.width }}×{{ project.dimensions.height }}
          </span>
          <span class="meta-item">
            🎬 {{ project.frameRate }}fps
          </span>
          <span class="meta-item">
            🎨 {{ project.scenes.length }} scene{{ project.scenes.length !== 1 ? 's' : '' }}
          </span>
        </div>
        
        <div class="card-footer">
          <span class="last-modified">
            Updated {{ formatDate(project.updatedAt) }}
          </span>
        </div>
      </div>

      <div class="card-actions" (click)="$event.stopPropagation()">
        <button class="action-btn" (click)="onOpen()" title="Open">
          📂
        </button>
        <button class="action-btn" (click)="onDuplicate()" title="Duplicate">
          📋
        </button>
        <button class="action-btn delete" (click)="showDeleteConfirm()" title="Delete">
          🗑️
        </button>
      </div>
    </div>

    <app-confirmation-dialog
      [isOpen]="showDeleteDialog()"
      title="Delete Project"
      [message]="'Are you sure you want to delete &quot;' + project.name + '&quot;? This action cannot be undone.'"
      confirmText="Delete"
      cancelText="Cancel"
      confirmVariant="danger"
      (confirmed)="onDelete()"
      (cancelled)="hideDeleteConfirm()">
    </app-confirmation-dialog>
  `,
  styles: [`
    .project-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .project-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .project-card:hover .card-actions {
      opacity: 1;
    }

    .card-thumbnail {
      aspect-ratio: 16 / 9;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .thumbnail-placeholder {
      font-size: 3rem;
      font-weight: 700;
      color: white;
      opacity: 0.8;
    }

    .card-content {
      padding: 1rem;
    }

    .card-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .description {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 0.75rem 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .metadata {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .meta-item {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      background: #f3f4f6;
      border-radius: 0.25rem;
      color: #374151;
    }

    .card-footer {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .card-actions {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .action-btn {
      width: 2rem;
      height: 2rem;
      border: none;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 0.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .action-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }

    .action-btn.delete:hover {
      background: #fee2e2;
    }
  `]
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;
  @Output() open = new EventEmitter<Project>();
  @Output() delete = new EventEmitter<Project>();
  @Output() duplicate = new EventEmitter<Project>();

  showDeleteDialog = signal(false);

  onCardClick(): void {
    this.onOpen();
  }

  onOpen(): void {
    this.open.emit(this.project);
  }

  showDeleteConfirm(): void {
    this.showDeleteDialog.set(true);
  }

  hideDeleteConfirm(): void {
    this.showDeleteDialog.set(false);
  }

  onDelete(): void {
    this.delete.emit(this.project);
    this.hideDeleteConfirm();
  }

  onDuplicate(): void {
    this.duplicate.emit(this.project);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  }
}
