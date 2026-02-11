import { Scene } from './scene.model';

export interface ProjectDimensions {
  width: number;
  height: number;
}

export interface ProjectMetadata {
  template?: string; // '1080p', '4K', 'social', etc.
}

export interface Project {
  id: string;              // UUID
  name: string;
  description: string;
  dimensions: ProjectDimensions;
  frameRate: number;       // fps (1-60)
  backgroundColor: string; // hex color
  createdAt: Date;
  updatedAt: Date;
  scenes: Scene[];
  metadata?: ProjectMetadata;
}
