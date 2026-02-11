import { Injectable, signal, computed } from '@angular/core';
import { OnionSkinConfig, Frame } from '../models/frame.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class OnionSkinService {
  private readonly STORAGE_KEY = 'onionSkinConfig';
  
  private config = signal<OnionSkinConfig>({
    enabled: false,
    previousFrames: 1,
    nextFrames: 1,
    previousOpacity: 0.3,
    nextOpacity: 0.3,
    previousTint: '#ff0000',
    nextTint: '#0000ff',
    mode: 'overlay'
  });

  // Computed signals for easy access
  enabled = computed(() => this.config().enabled);
  previousFrames = computed(() => this.config().previousFrames);
  nextFrames = computed(() => this.config().nextFrames);
  previousOpacity = computed(() => this.config().previousOpacity);
  nextOpacity = computed(() => this.config().nextOpacity);
  previousTint = computed(() => this.config().previousTint);
  nextTint = computed(() => this.config().nextTint);
  mode = computed(() => this.config().mode);

  constructor(private storage: StorageService) {
    this.loadConfig();
  }

  /**
   * Toggle onion skin on/off
   */
  toggleOnionSkin(): void {
    this.config.update(c => {
      const newConfig = { ...c, enabled: !c.enabled };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Enable onion skin
   */
  enable(): void {
    this.config.update(c => {
      const newConfig = { ...c, enabled: true };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Disable onion skin
   */
  disable(): void {
    this.config.update(c => {
      const newConfig = { ...c, enabled: false };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Set complete onion skin configuration
   */
  setOnionSkinConfig(partialConfig: Partial<OnionSkinConfig>): void {
    this.config.update(c => {
      const newConfig = { ...c, ...partialConfig };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Set number of previous frames to display (0-5)
   */
  setPreviousFrames(count: number): void {
    const clampedCount = Math.max(0, Math.min(5, count));
    this.config.update(c => {
      const newConfig = { ...c, previousFrames: clampedCount };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Set number of next frames to display (0-5)
   */
  setNextFrames(count: number): void {
    const clampedCount = Math.max(0, Math.min(5, count));
    this.config.update(c => {
      const newConfig = { ...c, nextFrames: clampedCount };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Set opacity for previous frames (0.0-1.0)
   */
  setPreviousOpacity(opacity: number): void {
    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    this.config.update(c => {
      const newConfig = { ...c, previousOpacity: clampedOpacity };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Set opacity for next frames (0.0-1.0)
   */
  setNextOpacity(opacity: number): void {
    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    this.config.update(c => {
      const newConfig = { ...c, nextOpacity: clampedOpacity };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Set tint color for previous frames
   */
  setPreviousTint(color: string): void {
    this.config.update(c => {
      const newConfig = { ...c, previousTint: color };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Set tint color for next frames
   */
  setNextTint(color: string): void {
    this.config.update(c => {
      const newConfig = { ...c, nextTint: color };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Set display mode
   */
  setMode(mode: 'overlay' | 'split'): void {
    this.config.update(c => {
      const newConfig = { ...c, mode };
      this.saveConfig(newConfig);
      return newConfig;
    });
  }

  /**
   * Get frames to display based on current frame index
   */
  getFramesToDisplay(currentIndex: number, allFrames: Frame[]): {
    previous: Frame[];
    next: Frame[];
  } {
    if (!this.config().enabled) {
      return { previous: [], next: [] };
    }

    const previousCount = this.config().previousFrames;
    const nextCount = this.config().nextFrames;

    const previous: Frame[] = [];
    const next: Frame[] = [];

    // Get previous frames
    for (let i = 1; i <= previousCount; i++) {
      const index = currentIndex - i;
      if (index >= 0 && index < allFrames.length) {
        const frame = allFrames[index];
        if (frame && frame.visible !== false) {
          previous.unshift(frame); // Add to beginning to maintain order
        }
      }
    }

    // Get next frames
    for (let i = 1; i <= nextCount; i++) {
      const index = currentIndex + i;
      if (index >= 0 && index < allFrames.length) {
        const frame = allFrames[index];
        if (frame && frame.visible !== false) {
          next.push(frame);
        }
      }
    }

    return { previous, next };
  }

  /**
   * Get current configuration
   */
  getConfig(): OnionSkinConfig {
    return { ...this.config() };
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults(): void {
    const defaultConfig: OnionSkinConfig = {
      enabled: false,
      previousFrames: 1,
      nextFrames: 1,
      previousOpacity: 0.3,
      nextOpacity: 0.3,
      previousTint: '#ff0000',
      nextTint: '#0000ff',
      mode: 'overlay'
    };
    this.config.set(defaultConfig);
    this.saveConfig(defaultConfig);
  }

  /**
   * Load configuration from storage
   */
  private loadConfig(): void {
    try {
      const saved = this.storage.load(this.STORAGE_KEY) as any;
      if (saved && typeof saved === 'object') {
        // Merge with defaults to ensure all properties exist
        const loadedConfig: OnionSkinConfig = {
          enabled: saved.enabled ?? false,
          previousFrames: saved.previousFrames ?? 1,
          nextFrames: saved.nextFrames ?? 1,
          previousOpacity: saved.previousOpacity ?? 0.3,
          nextOpacity: saved.nextOpacity ?? 0.3,
          previousTint: saved.previousTint ?? '#ff0000',
          nextTint: saved.nextTint ?? '#0000ff',
          mode: saved.mode ?? 'overlay'
        };
        this.config.set(loadedConfig);
      }
    } catch (error) {
      console.warn('Failed to load onion skin config:', error);
    }
  }

  /**
   * Save configuration to storage
   */
  private saveConfig(config: OnionSkinConfig): void {
    try {
      this.storage.save(this.STORAGE_KEY, config);
    } catch (error) {
      console.error('Failed to save onion skin config:', error);
    }
  }
}
