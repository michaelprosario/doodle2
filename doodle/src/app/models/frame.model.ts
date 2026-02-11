export interface SVGElement {
  type: string;
  properties: Record<string, any>;
}

export interface Frame {
  id: string;
  sceneId: string;
  order: number;
  duration?: number;       // frame hold duration (default: 1)
  elements: SVGElement[];  // drawing elements (expanded in Epic 3)
  thumbnail?: string;      // base64 PNG thumbnail for timeline
  label?: string;          // optional frame label/marker
  notes?: string;          // frame-specific notes
  locked?: boolean;        // prevent editing
  visible?: boolean;       // hide from playback (default: true)
  createdAt: Date;
  updatedAt: Date;
}

export interface FrameCreateDTO {
  sceneId: string;
  order?: number;
  duration?: number;
  label?: string;
  notes?: string;
}

export interface FrameUpdateDTO {
  duration?: number;
  label?: string;
  notes?: string;
  locked?: boolean;
  visible?: boolean;
  elements?: SVGElement[];
  thumbnail?: string;
}

export interface TimelineState {
  currentFrameIndex: number;
  selectedFrameIndices: number[];
  playbackState: 'stopped' | 'playing' | 'paused';
  playbackDirection: 'forward' | 'reverse';
  playbackSpeed: number;    // multiplier (0.25 to 4.0)
  looping: boolean;
  zoomLevel: number;        // timeline zoom (0.5 to 3.0)
  scrollPosition: number;   // timeline scroll offset
}

export interface OnionSkinConfig {
  enabled: boolean;
  previousFrames: number;   // 0-5 frames before
  nextFrames: number;       // 0-5 frames after
  previousOpacity: number;  // 0.0-1.0
  nextOpacity: number;      // 0.0-1.0
  previousTint: string;     // hex color (default: '#ff0000')
  nextTint: string;         // hex color (default: '#0000ff')
  mode: 'overlay' | 'split'; // display mode
}
