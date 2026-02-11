import { Frame } from './frame.model';

export interface Scene {
  id: string;              // UUID
  projectId: string;
  name: string;
  duration: number;        // in frames
  notes?: string;
  order: number;           // for scene ordering
  thumbnail?: string;      // base64 or blob URL
  frames: Frame[];
  createdAt: Date;
  updatedAt: Date;
}
