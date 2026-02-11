import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { ProjectService } from './project.service';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Injectable({
  providedIn: 'root'
})
export class AutoSaveService implements OnDestroy {
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  private readonly DEBOUNCE_TIME = 2000; // 2 seconds
  
  private autoSaveTimer?: number;
  private debounceTimer?: number;
  private hasUnsavedChanges = false;

  // Signal-based state
  private saveStatusSignal = signal<SaveStatus>('idle');
  private lastSaveTimeSignal = signal<Date | null>(null);
  private errorMessageSignal = signal<string | null>(null);

  // Read-only signals
  saveStatus = this.saveStatusSignal.asReadonly();
  lastSaveTime = this.lastSaveTimeSignal.asReadonly();
  errorMessage = this.errorMessageSignal.asReadonly();

  // Computed signals
  hasUnsavedChangesSignal = computed(() => 
    this.hasUnsavedChanges && this.saveStatusSignal() !== 'saving'
  );

  constructor(private projectService: ProjectService) {}

  ngOnDestroy(): void {
    this.stopAutoSave();
  }

  /**
   * Start auto-save with interval
   */
  startAutoSave(): void {
    this.stopAutoSave(); // Clear existing timers
    
    this.autoSaveTimer = window.setInterval(() => {
      if (this.hasUnsavedChanges) {
        this.save();
      }
    }, this.AUTO_SAVE_INTERVAL);

    console.log('Auto-save started');
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      window.clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }
    console.log('Auto-save stopped');
  }

  /**
   * Mark that there are unsaved changes
   */
  markDirty(): void {
    this.hasUnsavedChanges = true;
    this.debouncedSave();
  }

  /**
   * Manually trigger save
   */
  async save(): Promise<boolean> {
    const activeProject = this.projectService.activeProject();
    if (!activeProject) {
      console.warn('No active project to save');
      return false;
    }

    this.saveStatusSignal.set('saving');
    this.errorMessageSignal.set(null);

    try {
      // Simulate async save operation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Save the active project
      this.projectService.saveProject(activeProject);

      this.hasUnsavedChanges = false;
      this.saveStatusSignal.set('saved');
      this.lastSaveTimeSignal.set(new Date());
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        if (this.saveStatusSignal() === 'saved') {
          this.saveStatusSignal.set('idle');
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error('Error saving project:', error);
      this.saveStatusSignal.set('error');
      this.errorMessageSignal.set(error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Debounced save - saves after a delay if no new changes
   */
  private debouncedSave(): void {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      if (this.hasUnsavedChanges) {
        this.save();
      }
    }, this.DEBOUNCE_TIME);
  }

  /**
   * Get save status as string for display
   */
  getSaveStatusText(): string {
    const status = this.saveStatusSignal();
    const lastSave = this.lastSaveTimeSignal();

    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'All changes saved';
      case 'error':
        return `Save failed: ${this.errorMessageSignal()}`;
      case 'idle':
        if (this.hasUnsavedChanges) {
          return 'Unsaved changes';
        }
        if (lastSave) {
          return `Last saved: ${this.formatSaveTime(lastSave)}`;
        }
        return 'No changes';
      default:
        return '';
    }
  }

  /**
   * Format the save time for display
   */
  private formatSaveTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Setup browser beforeunload handler to prevent data loss
   */
  setupBeforeUnloadHandler(): void {
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but setting returnValue is required
        e.returnValue = '';
      }
    });
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChangesValue(): boolean {
    return this.hasUnsavedChanges;
  }
}
