import { Injectable } from '@angular/core';
import { Scene } from '../models/scene.model';
import { Frame } from '../models/frame.model';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  constructor(private projectService: ProjectService) {}

  /**
   * Create a new scene in a project
   */
  createScene(projectId: string, data: Partial<Scene>): Scene | null {
    const project = this.projectService.getProject(projectId);
    if (!project) {
      console.error(`Project with id "${projectId}" not found`);
      return null;
    }

    const now = new Date();
    const order = data.order !== undefined ? data.order : project.scenes.length;
    
    const scene: Scene = {
      id: this.generateUUID(),
      projectId,
      name: data.name || `Scene ${project.scenes.length + 1}`,
      duration: data.duration || 60, // Default 60 frames (2 seconds at 30fps)
      notes: data.notes || '',
      order,
      thumbnail: data.thumbnail,
      frames: [],
      createdAt: now,
      updatedAt: now
    };

    project.scenes.push(scene);
    project.updatedAt = now;
    this.projectService.saveProject(project);

    return scene;
  }

  /**
   * Get a scene by ID
   */
  getScene(projectId: string, sceneId: string): Scene | null {
    const project = this.projectService.getProject(projectId);
    if (!project) {
      return null;
    }
    return project.scenes.find(s => s.id === sceneId) || null;
  }

  /**
   * Get all scenes for a project
   */
  getScenesByProject(projectId: string): Scene[] {
    const project = this.projectService.getProject(projectId);
    if (!project) {
      return [];
    }
    return [...project.scenes].sort((a, b) => a.order - b.order);
  }

  /**
   * Update a scene
   */
  updateScene(projectId: string, sceneId: string, data: Partial<Scene>): void {
    const project = this.projectService.getProject(projectId);
    if (!project) {
      console.error(`Project with id "${projectId}" not found`);
      return;
    }

    const sceneIndex = project.scenes.findIndex(s => s.id === sceneId);
    if (sceneIndex === -1) {
      console.error(`Scene with id "${sceneId}" not found`);
      return;
    }

    const updatedScene: Scene = {
      ...project.scenes[sceneIndex],
      ...data,
      id: project.scenes[sceneIndex].id, // Ensure ID doesn't change
      projectId: project.scenes[sceneIndex].projectId, // Ensure projectId doesn't change
      updatedAt: new Date()
    };

    project.scenes[sceneIndex] = updatedScene;
    project.updatedAt = new Date();
    this.projectService.saveProject(project);
  }

  /**
   * Delete a scene
   */
  deleteScene(projectId: string, sceneId: string): void {
    const project = this.projectService.getProject(projectId);
    if (!project) {
      console.error(`Project with id "${projectId}" not found`);
      return;
    }

    const initialLength = project.scenes.length;
    project.scenes = project.scenes.filter(s => s.id !== sceneId);

    if (project.scenes.length < initialLength) {
      // Reorder remaining scenes
      project.scenes.forEach((scene, index) => {
        scene.order = index;
      });
      
      project.updatedAt = new Date();
      this.projectService.saveProject(project);
    }
  }

  /**
   * Duplicate a scene
   */
  duplicateScene(projectId: string, sceneId: string): Scene | null {
    const project = this.projectService.getProject(projectId);
    if (!project) {
      console.error(`Project with id "${projectId}" not found`);
      return null;
    }

    const original = project.scenes.find(s => s.id === sceneId);
    if (!original) {
      console.error(`Scene with id "${sceneId}" not found`);
      return null;
    }

    const now = new Date();
    const duplicate: Scene = {
      ...JSON.parse(JSON.stringify(original)), // Deep copy
      id: this.generateUUID(),
      name: `${original.name} (Copy)`,
      order: original.order + 1,
      createdAt: now,
      updatedAt: now,
      frames: original.frames.map(frame => ({
        ...frame,
        id: this.generateUUID(),
        sceneId: '' // Will be set below
      }))
    };

    // Update frame sceneIds
    duplicate.frames.forEach(frame => {
      frame.sceneId = duplicate.id;
    });

    // Insert after original scene
    project.scenes.splice(original.order + 1, 0, duplicate);

    // Reorder scenes after the duplicate
    project.scenes.forEach((scene, index) => {
      scene.order = index;
    });

    project.updatedAt = now;
    this.projectService.saveProject(project);

    return duplicate;
  }

  /**
   * Reorder scenes
   */
  reorderScenes(projectId: string, sceneIds: string[]): void {
    const project = this.projectService.getProject(projectId);
    if (!project) {
      console.error(`Project with id "${projectId}" not found`);
      return;
    }

    // Create a map for quick lookup
    const sceneMap = new Map(project.scenes.map(s => [s.id, s]));

    // Reorder based on provided IDs
    const reorderedScenes: Scene[] = [];
    sceneIds.forEach((id, index) => {
      const scene = sceneMap.get(id);
      if (scene) {
        scene.order = index;
        reorderedScenes.push(scene);
      }
    });

    // Add any scenes that weren't in the reorder list
    project.scenes.forEach(scene => {
      if (!sceneIds.includes(scene.id)) {
        scene.order = reorderedScenes.length;
        reorderedScenes.push(scene);
      }
    });

    project.scenes = reorderedScenes;
    project.updatedAt = new Date();
    this.projectService.saveProject(project);
  }

  /**
   * Generate thumbnail for a scene (placeholder implementation)
   */
  generateThumbnail(projectId: string, sceneId: string): string {
    // TODO: Implement actual thumbnail generation from scene frames
    // For now, return a placeholder data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TY2VuZTwvdGV4dD48L3N2Zz4=';
  }

  /**
   * Add a frame to a scene
   */
  addFrame(projectId: string, sceneId: string, frameData?: Partial<Frame>): Frame | null {
    const project = this.projectService.getProject(projectId);
    if (!project) {
      console.error(`Project with id "${projectId}" not found`);
      return null;
    }

    const scene = project.scenes.find(s => s.id === sceneId);
    if (!scene) {
      console.error(`Scene with id "${sceneId}" not found`);
      return null;
    }

    const now = new Date();
    const frame: Frame = {
      id: this.generateUUID(),
      sceneId,
      order: frameData?.order !== undefined ? frameData.order : scene.frames.length,
      duration: 1,
      elements: frameData?.elements || [],
      thumbnail: frameData?.thumbnail,
      locked: false,
      visible: true,
      createdAt: now,
      updatedAt: now
    };

    scene.frames.push(frame);
    scene.updatedAt = new Date();
    project.updatedAt = new Date();
    this.projectService.saveProject(project);

    return frame;
  }

  /**
   * Get frame count for a scene
   */
  getFrameCount(projectId: string, sceneId: string): number {
    const scene = this.getScene(projectId, sceneId);
    return scene?.frames.length || 0;
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
