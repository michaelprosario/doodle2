import { Injectable, NgZone } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
  context?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutService {
  private shortcuts = new Map<string, KeyboardShortcut>();
  private destroy$ = new Subject<void>();
  private enabled = true;

  constructor(private ngZone: NgZone) {
    this.initializeKeyboardListener();
  }

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(
      shortcut.key,
      shortcut.ctrl,
      shortcut.shift,
      shortcut.alt
    );
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean): void {
    const shortcutKey = this.getShortcutKey(key, ctrl, shift, alt);
    this.shortcuts.delete(shortcutKey);
  }

  /**
   * Clear all shortcuts
   */
  clearAll(): void {
    this.shortcuts.clear();
  }

  /**
   * Enable keyboard shortcuts
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable keyboard shortcuts
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Get all registered shortcuts
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Initialize keyboard event listener
   */
  private initializeKeyboardListener(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          if (!this.enabled) return;

          // Skip if user is typing in an input field
          const target = event.target as HTMLElement;
          if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
          ) {
            return;
          }

          const shortcutKey = this.getShortcutKey(
            event.key,
            event.ctrlKey || event.metaKey,
            event.shiftKey,
            event.altKey
          );

          const shortcut = this.shortcuts.get(shortcutKey);
          if (shortcut) {
            event.preventDefault();
            event.stopPropagation();
            
            this.ngZone.run(() => {
              shortcut.callback();
            });
          }
        });
    });
  }

  /**
   * Generate unique key for shortcut
   */
  private getShortcutKey(
    key: string,
    ctrl?: boolean,
    shift?: boolean,
    alt?: boolean
  ): string {
    const parts: string[] = [];
    if (ctrl) parts.push('ctrl');
    if (shift) parts.push('shift');
    if (alt) parts.push('alt');
    parts.push(key.toLowerCase());
    return parts.join('+');
  }

  /**
   * Clean up on service destruction
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
