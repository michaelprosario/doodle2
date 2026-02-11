import { Component, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { SceneService } from '../../services/scene.service';
import { AutoSaveService } from '../../services/auto-save.service';
import { SceneManagerComponent } from '../scene-manager/scene-manager.component';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-project-workspace',
  standalone: true,
  imports: [CommonModule, SceneManagerComponent, ButtonComponent],
  template: `
    <div class="workspace" *ngIf="project()">
      <header class="workspace-header">
        <div class="header-left">
          <button class="back-button" (click)="goToDashboard()">
            ← Back to Dashboard
          </button>
          <h1>{{ project()?.name }}</h1>
        </div>
        <div class="header-right">
          <span class="save-status">{{ autoSaveService.getSaveStatusText() }}</span>
          <app-button size="small" (click)="manualSave()">
            Save
          </app-button>
        </div>
      </header>

      <div class="workspace-content">
        <aside class="sidebar">
          <app-scene-manager [projectId]="projectId()"></app-scene-manager>
        </aside>

        <main class="main-content">
          <div class="canvas-area">
            <div class="canvas-placeholder">
              <h2>Canvas Area</h2>
              <p>Frame editing will be implemented in Epic 2</p>
            </div>
          </div>
        </main>
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
      background: #f9fafb;
    }

    .workspace-header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .back-button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0.5rem;
      border-radius: 0.25rem;
      transition: background 0.2s;
    }

    .back-button:hover {
      background: #f3f4f6;
    }

    .workspace-header h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .save-status {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .workspace-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .sidebar {
      width: 300px;
      background: white;
      border-right: 1px solid #e5e7eb;
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
      padding: 2rem;
    }

    .canvas-placeholder {
      text-align: center;
      color: #6b7280;
    }

    .canvas-placeholder h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .error-state {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .workspace-content {
        flex-direction: column;
      }

      .sidebar {
        width: 100%;
        max-height: 200px;
      }
    }
  `]
})
export class ProjectWorkspaceComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  public autoSaveService = inject(AutoSaveService);

  projectId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id || '';
  });

  project = computed(() => {
    const id = this.projectId();
    return id ? this.projectService.getProject(id) : null;
  });

  ngOnInit(): void {
    const id = this.projectId();
    if (id) {
      this.projectService.setActiveProject(id);
      this.autoSaveService.startAutoSave();
      this.autoSaveService.setupBeforeUnloadHandler();
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
}
