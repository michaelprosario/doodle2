import { Frame, SVGElement } from '../models/frame.model';
import { SVGElementModel } from '../models/svg-element.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Deep copy a frame with new ID
 */
export function cloneFrame(frame: Frame, newSceneId?: string): Frame {
  return {
    ...frame,
    id: uuidv4(),
    sceneId: newSceneId || frame.sceneId,
    elements: deepCopyElements(frame.elements),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Deep copy SVG elements
 */
export function deepCopyElements(elements: (SVGElement | SVGElementModel)[]): (SVGElement | SVGElementModel)[] {
  return JSON.parse(JSON.stringify(elements));
}

/**
 * Copy frame data for clipboard
 */
export function copyFrameData(frame: Frame): string {
  return JSON.stringify({
    elements: frame.elements,
    duration: frame.duration,
    label: frame.label,
    notes: frame.notes
  });
}

/**
 * Parse frame data from clipboard
 */
export function parseFrameData(data: string): Partial<Frame> | null {
  try {
    const parsed = JSON.parse(data);
    return {
      elements: parsed.elements || [],
      duration: parsed.duration,
      label: parsed.label,
      notes: parsed.notes
    };
  } catch (error) {
    console.error('Failed to parse frame data:', error);
    return null;
  }
}

/**
 * Compare two frames for equality
 */
export function framesAreEqual(frame1: Frame, frame2: Frame): boolean {
  // Compare IDs
  if (frame1.id !== frame2.id) return false;
  
  // Compare element count
  if (frame1.elements.length !== frame2.elements.length) return false;
  
  // Deep compare elements
  return JSON.stringify(frame1.elements) === JSON.stringify(frame2.elements);
}

/**
 * Check if frame is empty (no elements)
 */
export function isFrameEmpty(frame: Frame): boolean {
  return !frame.elements || frame.elements.length === 0;
}

/**
 * Get total frame duration (considering hold duration)
 */
export function getFrameDuration(frame: Frame): number {
  return frame.duration || 1;
}

/**
 * Calculate total frames considering hold durations
 */
export function calculateTotalFrames(frames: Frame[]): number {
  return frames.reduce((total, frame) => total + getFrameDuration(frame), 0);
}

/**
 * Validate frame data
 */
export function validateFrame(frame: Partial<Frame>): string[] {
  const errors: string[] = [];

  if (!frame.id) {
    errors.push('Frame must have an ID');
  }

  if (!frame.sceneId) {
    errors.push('Frame must have a scene ID');
  }

  if (frame.order !== undefined && frame.order < 0) {
    errors.push('Frame order must be non-negative');
  }

  if (frame.duration !== undefined && frame.duration < 1) {
    errors.push('Frame duration must be at least 1');
  }

  if (frame.elements && !Array.isArray(frame.elements)) {
    errors.push('Frame elements must be an array');
  }

  return errors;
}

/**
 * Sort frames by order
 */
export function sortFramesByOrder(frames: Frame[]): Frame[] {
  return [...frames].sort((a, b) => a.order - b.order);
}

/**
 * Get frame index by ID
 */
export function getFrameIndexById(frames: Frame[], frameId: string): number {
  return frames.findIndex(f => f.id === frameId);
}

/**
 * Get frame by order position
 */
export function getFrameByOrder(frames: Frame[], order: number): Frame | undefined {
  return frames.find(f => f.order === order);
}

/**
 * Insert frame at position and update orders
 */
export function insertFrameAtPosition(
  frames: Frame[],
  frame: Frame,
  position: number
): Frame[] {
  const updated = [...frames];
  
  // Update orders of existing frames
  updated.forEach(f => {
    if (f.order >= position) {
      f.order++;
    }
  });
  
  // Set new frame order
  frame.order = position;
  updated.push(frame);
  
  return sortFramesByOrder(updated);
}

/**
 * Remove frame and update orders
 */
export function removeFrameAtPosition(frames: Frame[], position: number): Frame[] {
  const updated = frames.filter(f => f.order !== position);
  
  // Update orders
  updated.forEach(f => {
    if (f.order > position) {
      f.order--;
    }
  });
  
  return sortFramesByOrder(updated);
}

/**
 * Reorder frames based on new ID sequence
 */
export function reorderFramesByIds(frames: Frame[], orderedIds: string[]): Frame[] {
  const frameMap = new Map(frames.map(f => [f.id, f]));
  const reordered: Frame[] = [];
  
  orderedIds.forEach((id, index) => {
    const frame = frameMap.get(id);
    if (frame) {
      reordered.push({
        ...frame,
        order: index,
        updatedAt: new Date()
      });
    }
  });
  
  return reordered;
}

/**
 * Get frame range
 */
export function getFrameRange(
  frames: Frame[],
  startIndex: number,
  endIndex: number
): Frame[] {
  const sorted = sortFramesByOrder(frames);
  return sorted.slice(startIndex, endIndex + 1);
}

/**
 * Create blank frame
 */
export function createBlankFrame(sceneId: string, order: number): Frame {
  const now = new Date();
  return {
    id: uuidv4(),
    sceneId,
    order,
    duration: 1,
    elements: [],
    locked: false,
    visible: true,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Merge frame elements (useful for pasting)
 */
export function mergeFrameElements(
  targetFrame: Frame,
  newElements: SVGElement[]
): Frame {
  return {
    ...targetFrame,
    elements: [...targetFrame.elements, ...deepCopyElements(newElements)],
    updatedAt: new Date()
  };
}
