import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="getButtonClasses()"
      (click)="handleClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Variants */
    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .btn-secondary {
      background-color: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #4b5563;
    }

    .btn-danger {
      background-color: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #dc2626;
    }

    .btn-ghost {
      background-color: transparent;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-ghost:hover:not(:disabled) {
      background-color: #f3f4f6;
    }

    /* Sizes */
    .btn-small {
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
    }

    .btn-medium {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }

    .btn-large {
      padding: 0.75rem 1.5rem;
      font-size: 1.125rem;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;

  getButtonClasses(): string {
    return `btn-${this.variant} btn-${this.size}`;
  }

  handleClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
