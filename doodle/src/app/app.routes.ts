import { Routes } from '@angular/router';
import { ProjectDashboardComponent } from './components/project-dashboard/project-dashboard.component';
import { ProjectWorkspaceComponent } from './components/project-workspace/project-workspace.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ProjectDashboardComponent },
  { path: 'project/:id', component: ProjectWorkspaceComponent },
];
