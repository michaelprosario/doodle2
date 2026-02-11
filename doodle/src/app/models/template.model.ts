import { ProjectDimensions } from './project.model';

export interface ProjectTemplate {
  id: string;
  name: string;
  dimensions: ProjectDimensions;
  frameRate: number;
  description?: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: '1080p',
    name: '1080p (Full HD)',
    dimensions: { width: 1920, height: 1080 },
    frameRate: 30,
    description: 'Standard Full HD video format'
  },
  {
    id: '4k',
    name: '4K (Ultra HD)',
    dimensions: { width: 3840, height: 2160 },
    frameRate: 30,
    description: 'Ultra high definition video format'
  },
  {
    id: '720p',
    name: '720p (HD)',
    dimensions: { width: 1280, height: 720 },
    frameRate: 24,
    description: 'Standard HD video format'
  },
  {
    id: 'instagram-square',
    name: 'Instagram Square',
    dimensions: { width: 1080, height: 1080 },
    frameRate: 30,
    description: 'Square format for Instagram posts'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    dimensions: { width: 1080, height: 1920 },
    frameRate: 30,
    description: 'Vertical format for Instagram Stories'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    dimensions: { width: 1080, height: 1920 },
    frameRate: 30,
    description: 'Vertical format for TikTok videos'
  },
  {
    id: 'custom',
    name: 'Custom',
    dimensions: { width: 1920, height: 1080 },
    frameRate: 30,
    description: 'Custom dimensions and settings'
  }
];
