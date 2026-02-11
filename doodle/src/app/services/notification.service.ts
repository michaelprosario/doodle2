import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSignal = signal<Toast[]>([]);
  toasts = this.toastsSignal.asReadonly();

  /**
   * Show a success notification
   */
  success(message: string, duration = 3000): void {
    this.show('success', message, duration);
  }

  /**
   * Show an error notification
   */
  error(message: string, duration = 5000): void {
    this.show('error', message, duration);
  }

  /**
   * Show a warning notification
   */
  warning(message: string, duration = 4000): void {
    this.show('warning', message, duration);
  }

  /**
   * Show an info notification
   */
  info(message: string, duration = 3000): void {
    this.show('info', message, duration);
  }

  /**
   * Show a notification
   */
  private show(type: ToastType, message: string, duration?: number): void {
    const toast: Toast = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    const toasts = this.toastsSignal();
    this.toastsSignal.set([...toasts, toast]);

    if (duration) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  /**
   * Remove a notification
   */
  remove(id: string): void {
    const toasts = this.toastsSignal();
    this.toastsSignal.set(toasts.filter(t => t.id !== id));
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.toastsSignal.set([]);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
