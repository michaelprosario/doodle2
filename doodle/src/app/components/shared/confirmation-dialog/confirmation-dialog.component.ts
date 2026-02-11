import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="title"
      (closed)="onCancel()">
      <p>{{ message }}</p>
      <div footer>
        <app-button variant="ghost" (click)="onCancel()">
          {{ cancelText }}
        </app-button>
        <app-button [variant]="confirmVariant" (click)="onConfirm()">
          {{ confirmText }}
        </app-button>
      </div>
    </app-modal>
  `
})
export class ConfirmationDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmVariant: 'primary' | 'danger' = 'primary';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
