import { Injectable, signal, computed } from '@angular/core';
import { Project } from '../models/project.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly PROJECTS_KEY = 'doodle2_projects';
  private readonly ACTIVE_PROJECT_KEY = 'doodle2_active_project';
  private readonly RECENT_PROJECTS_KEY = 'doodle2_recent_projects';

  // Signal-based state management
  private projectsSignal = signal<Project[]>([]);
  private activeProjectSignal = signal<Project | null>(null);

  // Computed signals
  projects = this.projectsSignal.asReadonly();
  activeProject = this.activeProjectSignal.asReadonly();
  
  hasProjects = computed(() => this.projectsSignal().length > 0);

  constructor(private storageService: StorageService) {
    this.loadProjects();
    this.loadActiveProject();
  }

  /**
   * Create a new project
   */
  createProject(data: Partial<Project>): Project {
    const now = new Date();
    const project: Project = {
      id: this.generateUUID(),
      name: data.name || 'Untitled Project',
      description: data.description || '',
      dimensions: data.dimensions || { width: 1920, height: 1080 },
      frameRate: data.frameRate || 30,
      backgroundColor: data.backgroundColor || '#FFFFFF',
      scenes: [],
      createdAt: now,
      updatedAt: now,
      metadata: data.metadata
    };

    const projects = this.projectsSignal();
    this.projectsSignal.set([...projects, project]);
    this.saveProjects();
    this.addToRecentProjects(project.id);
    
    return project;
  }

  /**
   * Get a project by ID
   */
  getProject(id: string): Project | null {
    const projects = this.projectsSignal();
    return projects.find(p => p.id === id) || null;
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return this.projectsSignal();
  }

  /**
   * Update a project
   */
  updateProject(id: string, data: Partial<Project>): void {
    const projects = this.projectsSignal();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      console.error(`Project with id "${id}" not found`);
      return;
    }

    const updatedProject: Project = {
      ...projects[index],
      ...data,
      id: projects[index].id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    const newProjects = [...projects];
    newProjects[index] = updatedProject;
    this.projectsSignal.set(newProjects);
    this.saveProjects();

    // Update active project if it's the one being updated
    if (this.activeProjectSignal()?.id === id) {
      this.activeProjectSignal.set(updatedProject);
    }
  }

  /**
   * Delete a project
   */
  deleteProject(id: string): void {
    const projects = this.projectsSignal();
    const filtered = projects.filter(p => p.id !== id);
    this.projectsSignal.set(filtered);
    this.saveProjects();

    // Clear active project if it's the one being deleted
    if (this.activeProjectSignal()?.id === id) {
      this.activeProjectSignal.set(null);
      this.storageService.delete(this.ACTIVE_PROJECT_KEY);
    }

    // Remove from recent projects
    this.removeFromRecentProjects(id);
  }

  /**
   * Duplicate a project
   */
  duplicateProject(id: string): Project | null {
    const original = this.getProject(id);
    if (!original) {
      console.error(`Project with id "${id}" not found`);
      return null;
    }

    const now = new Date();
    const duplicate: Project = {
      ...JSON.parse(JSON.stringify(original)), // Deep copy
      id: this.generateUUID(),
      name: `${original.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      scenes: original.scenes.map(scene => ({
        ...scene,
        id: this.generateUUID(),
        projectId: '', // Will be set after project is created
        frames: scene.frames.map(frame => ({
          ...frame,
          id: this.generateUUID(),
          sceneId: '' // Will be set after scene is created
        }))
      }))
    };

    // Update scene projectIds
    duplicate.scenes.forEach(scene => {
      scene.projectId = duplicate.id;
      scene.frames.forEach(frame => {
        frame.sceneId = scene.id;
      });
    });

    const projects = this.projectsSignal();
    this.projectsSignal.set([...projects, duplicate]);
    this.saveProjects();
    
    return duplicate;
  }

  /**
   * Save a project (update if exists, create if not)
   */
  saveProject(project: Project): void {
    const existing = this.getProject(project.id);
    if (existing) {
      this.updateProject(project.id, project);
    } else {
      const projects = this.projectsSignal();
      this.projectsSignal.set([...projects, project]);
      this.saveProjects();
    }
  }

  /**
   * Set the active project
   */
  setActiveProject(id: string): void {
    const project = this.getProject(id);
    if (project) {
      this.activeProjectSignal.set(project);
      this.storageService.save(this.ACTIVE_PROJECT_KEY, id);
      this.addToRecentProjects(id);
    }
  }

  /**
   * Clear the active project
   */
  clearActiveProject(): void {
    this.activeProjectSignal.set(null);
    this.storageService.delete(this.ACTIVE_PROJECT_KEY);
  }

  /**
   * Get recent projects (limited to specified count)
   */
  getRecentProjects(limit: number = 10): Project[] {
    const recentIds = this.storageService.load<string[]>(this.RECENT_PROJECTS_KEY) || [];
    const projects = this.projectsSignal();
    
    return recentIds
      .slice(0, limit)
      .map(id => projects.find(p => p.id === id))
      .filter((p): p is Project => p !== undefined);
  }

  /**
   * Export project as JSON
   */
  exportProject(id: string): string | null {
    const project = this.getProject(id);
    if (!project) {
      return null;
    }
    return JSON.stringify(project, null, 2);
  }

  /**
   * Import project from JSON
   */
  importProject(jsonString: string): Project | null {
    try {
      const project = JSON.parse(jsonString) as Project;
      
      // Validate required fields
      if (!project.id || !project.name || !project.dimensions) {
        console.error('Invalid project data');
        return null;
      }

      // Generate new ID to avoid conflicts
      const newId = this.generateUUID();
      const importedProject: Project = {
        ...project,
        id: newId,
        name: `${project.name} (Imported)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update scene and frame IDs
      importedProject.scenes = importedProject.scenes.map(scene => ({
        ...scene,
        id: this.generateUUID(),
        projectId: newId,
        frames: scene.frames.map(frame => ({
          ...frame,
          id: this.generateUUID(),
          sceneId: scene.id
        }))
      }));

      const projects = this.projectsSignal();
      this.projectsSignal.set([...projects, importedProject]);
      this.saveProjects();

      return importedProject;
    } catch (error) {
      console.error('Error importing project:', error);
      return null;
    }
  }

  /**
   * Load projects from storage
   */
  private loadProjects(): void {
    const projects = this.storageService.load<Project[]>(this.PROJECTS_KEY) || [];
    this.projectsSignal.set(projects);
  }

  /**
   * Save projects to storage
   */
  private saveProjects(): void {
    this.storageService.save(this.PROJECTS_KEY, this.projectsSignal());
  }

  /**
   * Load active project from storage
   */
  private loadActiveProject(): void {
    const activeProjectId = this.storageService.load<string>(this.ACTIVE_PROJECT_KEY);
    if (activeProjectId) {
      const project = this.getProject(activeProjectId);
      if (project) {
        this.activeProjectSignal.set(project);
      }
    }
  }

  /**
   * Add project to recent projects list
   */
  private addToRecentProjects(projectId: string): void {
    let recentIds = this.storageService.load<string[]>(this.RECENT_PROJECTS_KEY) || [];
    
    // Remove if already exists
    recentIds = recentIds.filter(id => id !== projectId);
    
    // Add to beginning
    recentIds.unshift(projectId);
    
    // Limit to 10 most recent
    recentIds = recentIds.slice(0, 10);
    
    this.storageService.save(this.RECENT_PROJECTS_KEY, recentIds);
  }

  /**
   * Remove project from recent projects list
   */
  private removeFromRecentProjects(projectId: string): void {
    let recentIds = this.storageService.load<string[]>(this.RECENT_PROJECTS_KEY) || [];
    recentIds = recentIds.filter(id => id !== projectId);
    this.storageService.save(this.RECENT_PROJECTS_KEY, recentIds);
  }

  /**
   * Generate a UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
