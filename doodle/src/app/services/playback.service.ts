import { Injectable, signal, computed } from '@angular/core';
import { TimelineStateService } from './timeline-state.service';

@Injectable({
  providedIn: 'root'
})
export class PlaybackService {
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private frameRate = signal(30); // default 30 fps
  private isPlaying = signal(false);
  
  // Computed time per frame in milliseconds
  private frameInterval = computed(() => 1000 / this.frameRate());

  constructor(private timelineState: TimelineStateService) {}

  /**
   * Start playback
   */
  play(): void {
    if (this.isPlaying()) return;

    this.isPlaying.set(true);
    this.timelineState.setPlaybackState('playing');
    this.lastFrameTime = performance.now();
    this.startAnimationLoop();
  }

  /**
   * Pause playback (maintains current frame)
   */
  pause(): void {
    if (!this.isPlaying()) return;

    this.isPlaying.set(false);
    this.timelineState.setPlaybackState('paused');
    this.stopAnimationLoop();
  }

  /**
   * Stop playback (returns to first frame)
   */
  stop(): void {
    this.isPlaying.set(false);
    this.timelineState.setPlaybackState('stopped');
    this.stopAnimationLoop();
    this.timelineState.firstFrame();
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Play in reverse
   */
  playReverse(): void {
    this.timelineState.setPlaybackDirection('reverse');
    this.play();
  }

  /**
   * Set playback speed multiplier (0.25x to 4.0x)
   */
  setPlaybackSpeed(speed: number): void {
    this.timelineState.setPlaybackSpeed(speed);
  }

  /**
   * Set frame rate (1-60 fps)
   */
  setFrameRate(fps: number): void {
    const clampedFps = Math.max(1, Math.min(60, fps));
    this.frameRate.set(clampedFps);
  }

  /**
   * Get current frame rate
   */
  getFrameRate(): number {
    return this.frameRate();
  }

  /**
   * Toggle looping
   */
  toggleLoop(): void {
    this.timelineState.toggleLooping();
  }

  /**
   * Set looping state
   */
  setLoop(looping: boolean): void {
    this.timelineState.setLooping(looping);
  }

  /**
   * Check if currently playing
   */
  isPlayingNow(): boolean {
    return this.isPlaying();
  }

  /**
   * Main animation loop using requestAnimationFrame
   */
  private startAnimationLoop(): void {
    const loop = (currentTime: number) => {
      if (!this.isPlaying()) return;

      const elapsed = currentTime - this.lastFrameTime;
      const speed = this.timelineState.playbackSpeed();
      const adjustedInterval = this.frameInterval() / speed;

      if (elapsed >= adjustedInterval) {
        this.advanceFrame();
        this.lastFrameTime = currentTime;
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Stop the animation loop
   */
  private stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Advance to next frame based on direction
   */
  private advanceFrame(): void {
    const direction = this.timelineState.playbackDirection();
    
    if (direction === 'forward') {
      this.timelineState.nextFrame();
    } else {
      this.timelineState.previousFrame();
    }

    // Handle end of animation
    const state = this.timelineState.getState();
    const isAtEnd = direction === 'forward' 
      ? state.currentFrameIndex === 0 && !state.looping
      : state.currentFrameIndex === 0 && !state.looping;

    if (isAtEnd && !state.looping) {
      this.stop();
    }
  }

  /**
   * Clean up on service destruction
   */
  ngOnDestroy(): void {
    this.stopAnimationLoop();
  }
}
