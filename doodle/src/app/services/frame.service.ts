import { Injectable, signal } from '@angular/core';
import { Frame, FrameCreateDTO, FrameUpdateDTO } from '../models/frame.model';
import { SceneService } from './scene.service';
import { ProjectService } from './project.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class FrameService {
  constructor(
    private sceneService: SceneService,
    private projectService: ProjectService
  ) {}

  /**
   * Create a new frame in a scene
   */
  createFrame(projectId: string, sceneId: string, data?: Partial<FrameCreateDTO>): Frame {
    console.log('[FrameService] createFrame called:', { projectId, sceneId });
    const scene = this.sceneService.getScene(projectId, sceneId);
    if (!scene) {
      console.error('[FrameService] Scene not found!');
      throw new Error(`Scene with id ${sceneId} not found`);
    }

    console.log('[FrameService] Current scene frames:', scene.frames.length);
    const order = data?.order ?? scene.frames.length;
    const now = new Date();

    const newFrame: Frame = {
      id: uuidv4(),
      sceneId,
      order,
      duration: data?.duration ?? 1,
      elements: [],
      label: data?.label,
      notes: data?.notes,
      locked: false,
      visible: true,
      createdAt: now,
      updatedAt: now
    };

    console.log('[FrameService] Created new frame:', newFrame.id);
    scene.frames.push(newFrame);
    scene.frames.sort((a, b) => a.order - b.order);
    console.log('[FrameService] Updating scene with', scene.frames.length, 'frames');
    this.sceneService.updateScene(projectId, sceneId, { frames: scene.frames });
    console.log('[FrameService] Scene updated');

    return newFrame;
  }

  /**
   * Get a specific frame by ID
   */
  getFrame(projectId: string, sceneId: string, frameId: string): Frame | null {
    const scene = this.sceneService.getScene(projectId, sceneId);
    if (!scene) return null;

    return scene.frames.find(f => f.id === frameId) || null;
  }

  /**
   * Get all frames for a scene
   */
  getFramesByScene(projectId: string, sceneId: string): Frame[] {
    const scene = this.sceneService.getScene(projectId, sceneId);
    if (!scene) return [];

    return [...scene.frames].sort((a, b) => a.order - b.order);
  }

  /**
   * Update a frame
   */
  updateFrame(projectId: string, sceneId: string, frameId: string, data: Partial<FrameUpdateDTO>): void {
    const scene = this.sceneService.getScene(projectId, sceneId);
    if (!scene) {
      throw new Error(`Scene with id ${sceneId} not found`);
    }

    const frameIndex = scene.frames.findIndex(f => f.id === frameId);
    if (frameIndex === -1) {
      throw new Error(`Frame with id ${frameId} not found`);
    }

    const frame = scene.frames[frameIndex];
    scene.frames[frameIndex] = {
      ...frame,
      ...data,
      updatedAt: new Date()
    };

    this.sceneService.updateScene(projectId, sceneId, { frames: scene.frames });
  }

  /**
   * Delete a single frame
   */
  deleteFrame(projectId: string, sceneId: string, frameId: string): void {
    const scene = this.sceneService.getScene(projectId, sceneId);
    if (!scene) {
      throw new Error(`Scene with id ${sceneId} not found`);
    }

    // Prevent deleting the last frame
    if (scene.frames.length <= 1) {
      throw new Error('Cannot delete the last frame in a scene');
    }

    scene.frames = scene.frames.filter(f => f.id !== frameId);
    this.reorderFramesInternal(scene.frames);
    this.sceneService.updateScene(projectId, sceneId, { frames: scene.frames });
  }

  /**
   * Delete multiple frames
   */
  deleteFrames(projectId: string, sceneId: string, frameIds: string[]): void {
    const scene = this.sceneService.getScene(projectId, sceneId);
    if (!scene) {
      throw new Error(`Scene with id ${sceneId} not found`);
    }

    // Prevent deleting all frames
    if (scene.frames.length - frameIds.length < 1) {
      throw new Error('Cannot delete all frames. At least one frame must remain.');
    }

    scene.frames = scene.frames.filter(f => !frameIds.includes(f.id));
    this.reorderFramesInternal(scene.frames);
    this.sceneService.updateScene(projectId, sceneId, { frames: scene.frames });
  }

  /**
   * Duplicate a frame
   */
  duplicateFrame(projectId: string, sceneId: string, frameId: string, insertAfter: boolean = true): Frame {
    const scene = this.sceneService.getScene(projectId, sceneId);
    if (!scene) {
      throw new Error(`Scene with id ${sceneId} not found`);
    }

    const originalFrame = scene.frames.find(f => f.id === frameId);
    if (!originalFrame) {
      throw new Error(`Frame with id ${frameId} not found`);
    }

    const now = new Date();
    const newOrder = insertAfter ? originalFrame.order + 1 : originalFrame.order;

    // Increment order of frames after insertion point
    scene.frames.forEach(f => {
      if (f.order >= newOrder) {
        f.order++;
      }
    });

    const duplicatedFrame: Frame = {
      ...originalFrame,
      id: uuidv4(),
      order: newOrder,
      elements: JSON.parse(JSON.stringify(originalFrame.elements)), // Deep copy
      createdAt: now,
      updatedAt: now
    };

    scene.frames.push(duplicatedFrame);
    scene.frames.sort((a, b) => a.order - b.order);
    this.sceneService.updateScene(projectId, sceneId, { frames: scene.frames });

    return duplicatedFrame;
  }

  /**
   * Insert a new frame at a specific position
   */
  insertFrame(projectId: string, sceneId: string, position: number, data?: Partial<FrameCreateDTO>): Frame {
    const scene = this.sceneService.getScene(projectId, sceneId);
    if (!scene) {
      throw new Error(`Scene with id ${sceneId} not found`);
    }

    // Increment order of frames after insertion point
    scene.frames.forEach(f => {
      if (f.order >= position) {
        f.order++;
      }
    });

    const now = new Date();
    const newFrame: Frame = {
      id: uuidv4(),
      sceneId,
      order: position,
      duration: data?.duration ?? 1,
      elements: [],
      label: data?.label,
      notes: data?.notes,
      locked: false,
      visible: true,
      createdAt: now,
      updatedAt: now
    };

    scene.frames.push(newFrame);
    scene.frames.sort((a, b) => a.order - b.order);
    this.sceneService.updateScene(projectId, sceneId, { frames: scene.frames });

    return newFrame;
  }

  /**
   * Reorder frames by providing new order of frame IDs
   */
  reorderFrames(projectId: string, sceneId: string, frameIds: string[]): void {
    const scene = this.sceneService.getScene(projectId, sceneId);
    if (!scene) {
      throw new Error(`Scene with id ${sceneId} not found`);
    }

    // Validate all frame IDs exist
    const existingIds = new Set(scene.frames.map(f => f.id));
    if (!frameIds.every(id => existingIds.has(id))) {
      throw new Error('Invalid frame IDs provided');
    }

    // Update order based on new sequence
    const frameMap = new Map(scene.frames.map(f => [f.id, f]));
    const updatedFrames = frameIds.map((id, index) => {
      const frame = frameMap.get(id)!;
      return { ...frame, order: index, updatedAt: new Date() };
    });

    this.sceneService.updateScene(projectId, sceneId, { frames: updatedFrames });
  }

  /**
   * Get frame count for a scene
   */
  getFrameCount(projectId: string, sceneId: string): number {
    const scene = this.sceneService.getScene(projectId, sceneId);
    return scene?.frames.length || 0;
  }

  /**
   * Get frame by order index
   */
  getFrameByIndex(projectId: string, sceneId: string, index: number): Frame | null {
    const frames = this.getFramesByScene(projectId, sceneId);
    return frames[index] || null;
  }

  /**
   * Internal method to reorder frames sequentially
   */
  private reorderFramesInternal(frames: Frame[]): void {
    frames.sort((a, b) => a.order - b.order);
    frames.forEach((frame, index) => {
      frame.order = index;
    });
  }
}
