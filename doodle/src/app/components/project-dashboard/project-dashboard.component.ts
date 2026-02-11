import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { ProjectCreateComponent } from '../project-create/project-create.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProjectCardComponent,
    ProjectCreateComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    ButtonComponent
  ],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>My Projects</h1>
        <app-button (click)="openCreateModal()">
          + New Project
        </app-button>
      </header>

      <div class="dashboard-toolbar">
        <div class="search-box">
          <input
            type="text"
            placeholder="Search projects..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()">
        </div>
        <select [(ngModel)]="sortBy" (ngModelChange)="onSortChange()">
          <option value="recent">Recent</option>
          <option value="name">Name</option>
          <option value="dateCreated">Date Created</option>
          <option value="dateModified">Date Modified</option>
        </select>
      </div>

      <div class="dashboard-content">
        <section *ngIf="recentProjects().length > 0 && !searchQuery()" class="recent-section">
          <h2>Recent Projects</h2>
          <div class="projects-grid">
            <app-project-card
              *ngFor="let project of recentProjects()"
              [project]="project"
              (open)="openProject($event)"
              (delete)="deleteProject($event)"
              (duplicate)="duplicateProject($event)">
            </app-project-card>
          </div>
        </section>

        <section class="all-projects-section">
          <h2>{{ searchQuery() ? 'Search Results' : 'All Projects' }}</h2>
          
          <app-empty-state
            *ngIf="filteredProjects().length === 0"
            [icon]="searchQuery() ? '🔍' : '📁'"
            [title]="searchQuery() ? 'No projects found' : 'No projects yet'"
            [message]="searchQuery() ? 'Try adjusting your search' : 'Create your first animation project'"
            [hasAction]="!searchQuery()">
            <app-button *ngIf="!searchQuery()" (click)="openCreateModal()">
              Create Project
            </app-button>
          </app-empty-state>

          <div class="projects-grid" *ngIf="filteredProjects().length > 0">
            <app-project-card
              *ngFor="let project of filteredProjects()"
              [project]="project"
              (open)="openProject($event)"
              (delete)="deleteProject($event)"
              (duplicate)="duplicateProject($event)">
            </app-project-card>
          </div>
        </section>
      </div>

      <app-project-create
        [isOpen]="showCreateModal()"
        (closed)="closeCreateModal()"
        (created)="onProjectCreated($event)">
      </app-project-create>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .dashboard-toolbar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .search-box {
      flex: 1;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
    }

    .search-box input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    select {
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      background: white;
      cursor: pointer;
    }

    select:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .recent-section h2,
    .all-projects-section h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 1rem;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-toolbar {
        flex-direction: column;
      }
    }
  `]
})
export class ProjectDashboardComponent {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  showCreateModal = signal(false);
  searchQuery = signal('');
  sortBy = signal<'recent' | 'name' | 'dateCreated' | 'dateModified'>('recent');

  allProjects = this.projectService.projects;
  recentProjects = computed(() => this.projectService.getRecentProjects(5));

  filteredProjects = computed(() => {
    let projects = this.allProjects();
    const query = this.searchQuery().toLowerCase();

    // Filter by search query
    if (query) {
      projects = projects.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort projects
    const sorted = [...projects];
    switch (this.sortBy()) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'dateCreated':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'dateModified':
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'recent':
        const recentIds = this.projectService.getRecentProjects(100).map(p => p.id);
        sorted.sort((a, b) => {
          const aIndex = recentIds.indexOf(a.id);
          const bIndex = recentIds.indexOf(b.id);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
        break;
    }

    return sorted;
  });

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onProjectCreated(project: Project): void {
    this.closeCreateModal();
    this.router.navigate(['/project', project.id]);
  }

  openProject(project: Project): void {
    this.projectService.setActiveProject(project.id);
    this.router.navigate(['/project', project.id]);
  }

  deleteProject(project: Project): void {
    this.projectService.deleteProject(project.id);
  }

  duplicateProject(project: Project): void {
    this.projectService.duplicateProject(project.id);
  }

  onSearchChange(): void {
    // Search is reactive through computed signal
  }

  onSortChange(): void {
    // Sort is reactive through computed signal
  }
}
