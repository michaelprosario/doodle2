import { Injectable, signal, computed } from '@angular/core';
import { TimelineState } from '../models/frame.model';

@Injectable({
  providedIn: 'root'
})
export class TimelineStateService {
  // State signals
  private state = signal<TimelineState>({
    currentFrameIndex: 0,
    selectedFrameIndices: [],
    playbackState: 'stopped',
    playbackDirection: 'forward',
    playbackSpeed: 1.0,
    looping: false,
    zoomLevel: 1.0,
    scrollPosition: 0
  });

  // Computed signals for easy access
  currentFrameIndex = computed(() => this.state().currentFrameIndex);
  selectedFrameIndices = computed(() => this.state().selectedFrameIndices);
  playbackState = computed(() => this.state().playbackState);
  playbackDirection = computed(() => this.state().playbackDirection);
  playbackSpeed = computed(() => this.state().playbackSpeed);
  looping = computed(() => this.state().looping);
  zoomLevel = computed(() => this.state().zoomLevel);
  scrollPosition = computed(() => this.state().scrollPosition);

  private totalFrames = 0;

  /**
   * Initialize timeline with frame count
   */
  initialize(frameCount: number): void {
    this.totalFrames = frameCount;
    this.state.update(s => ({
      ...s,
      currentFrameIndex: 0,
      selectedFrameIndices: [0]
    }));
  }

  /**
   * Set total frame count
   */
  setTotalFrames(count: number): void {
    this.totalFrames = count;
    // Ensure current frame is within bounds
    if (this.state().currentFrameIndex >= count) {
      this.setCurrentFrame(Math.max(0, count - 1));
    }
  }

  /**
   * Set current frame
   */
  setCurrentFrame(index: number): void {
    if (index < 0 || index >= this.totalFrames) return;
    
    this.state.update(s => ({
      ...s,
      currentFrameIndex: index
    }));
  }

  /**
   * Navigate to next frame
   */
  nextFrame(): void {
    const current = this.state().currentFrameIndex;
    if (current < this.totalFrames - 1) {
      this.setCurrentFrame(current + 1);
    } else if (this.state().looping) {
      this.setCurrentFrame(0);
    }
  }

  /**
   * Navigate to previous frame
   */
  previousFrame(): void {
    const current = this.state().currentFrameIndex;
    if (current > 0) {
      this.setCurrentFrame(current - 1);
    } else if (this.state().looping) {
      this.setCurrentFrame(this.totalFrames - 1);
    }
  }

  /**
   * Jump to first frame
   */
  firstFrame(): void {
    this.setCurrentFrame(0);
  }

  /**
   * Jump to last frame
   */
  lastFrame(): void {
    this.setCurrentFrame(Math.max(0, this.totalFrames - 1));
  }

  /**
   * Jump to specific frame
   */
  jumpToFrame(index: number): void {
    this.setCurrentFrame(index);
  }

  /**
   * Select a frame (with optional multi-select)
   */
  selectFrame(index: number, multiSelect: boolean = false): void {
    if (index < 0 || index >= this.totalFrames) return;

    this.state.update(s => {
      if (multiSelect) {
        // Toggle selection
        const selected = [...s.selectedFrameIndices];
        const existingIndex = selected.indexOf(index);
        if (existingIndex >= 0) {
          selected.splice(existingIndex, 1);
        } else {
          selected.push(index);
        }
        return { ...s, selectedFrameIndices: selected.sort((a, b) => a - b) };
      } else {
        // Single select
        return { ...s, selectedFrameIndices: [index] };
      }
    });
  }

  /**
   * Select a range of frames
   */
  selectFrameRange(startIndex: number, endIndex: number): void {
    const start = Math.max(0, Math.min(startIndex, endIndex));
    const end = Math.min(this.totalFrames - 1, Math.max(startIndex, endIndex));
    
    const selected: number[] = [];
    for (let i = start; i <= end; i++) {
      selected.push(i);
    }

    this.state.update(s => ({
      ...s,
      selectedFrameIndices: selected
    }));
  }

  /**
   * Select all frames
   */
  selectAll(): void {
    const allIndices = Array.from({ length: this.totalFrames }, (_, i) => i);
    this.state.update(s => ({
      ...s,
      selectedFrameIndices: allIndices
    }));
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.state.update(s => ({
      ...s,
      selectedFrameIndices: []
    }));
  }

  /**
   * Set playback state
   */
  setPlaybackState(state: 'stopped' | 'playing' | 'paused'): void {
    this.state.update(s => ({
      ...s,
      playbackState: state
    }));
  }

  /**
   * Set playback direction
   */
  setPlaybackDirection(direction: 'forward' | 'reverse'): void {
    this.state.update(s => ({
      ...s,
      playbackDirection: direction
    }));
  }

  /**
   * Set playback speed (0.25 to 4.0)
   */
  setPlaybackSpeed(speed: number): void {
    const clampedSpeed = Math.max(0.25, Math.min(4.0, speed));
    this.state.update(s => ({
      ...s,
      playbackSpeed: clampedSpeed
    }));
  }

  /**
   * Toggle looping
   */
  toggleLooping(): void {
    this.state.update(s => ({
      ...s,
      looping: !s.looping
    }));
  }

  /**
   * Set looping
   */
  setLooping(looping: boolean): void {
    this.state.update(s => ({
      ...s,
      looping
    }));
  }

  /**
   * Set zoom level (0.5 to 3.0)
   */
  setZoomLevel(zoom: number): void {
    const clampedZoom = Math.max(0.5, Math.min(3.0, zoom));
    this.state.update(s => ({
      ...s,
      zoomLevel: clampedZoom
    }));
  }

  /**
   * Increase zoom
   */
  zoomIn(): void {
    const current = this.state().zoomLevel;
    this.setZoomLevel(Math.min(3.0, current + 0.25));
  }

  /**
   * Decrease zoom
   */
  zoomOut(): void {
    const current = this.state().zoomLevel;
    this.setZoomLevel(Math.max(0.5, current - 0.25));
  }

  /**
   * Set scroll position
   */
  setScrollPosition(position: number): void {
    this.state.update(s => ({
      ...s,
      scrollPosition: Math.max(0, position)
    }));
  }

  /**
   * Reset timeline state
   */
  reset(): void {
    this.state.set({
      currentFrameIndex: 0,
      selectedFrameIndices: [],
      playbackState: 'stopped',
      playbackDirection: 'forward',
      playbackSpeed: 1.0,
      looping: false,
      zoomLevel: 1.0,
      scrollPosition: 0
    });
  }

  /**
   * Get current state snapshot
   */
  getState(): TimelineState {
    return { ...this.state() };
  }
}
