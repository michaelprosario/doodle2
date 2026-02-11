import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Scene } from '../../models/scene.model';
import { ModalComponent } from '../shared/modal/modal.component';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-scene-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="mode === 'create' ? 'Create New Scene' : 'Edit Scene'"
      (closed)="onCancel()">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Scene Name *</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            placeholder="Scene 1">
          <div class="error" *ngIf="form.get('name')?.touched && form.get('name')?.errors?.['required']">
            Scene name is required
          </div>
        </div>

        <div class="form-group">
          <label for="duration">Duration (frames)</label>
          <input
            id="duration"
            type="number"
            formControlName="duration"
            [min]="1"
            placeholder="60">
          <div class="help-text">
            Estimated duration in frames. You can adjust this later.
          </div>
        </div>

        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea
            id="notes"
            formControlName="notes"
            rows="3"
            placeholder="Add notes about this scene..."></textarea>
        </div>

        <div footer class="modal-actions">
          <app-button variant="ghost" type="button" (click)="onCancel()">
            Cancel
          </app-button>
          <app-button type="submit" [disabled]="!form.valid">
            {{ mode === 'create' ? 'Create' : 'Save' }}
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    form {
      min-width: 400px;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    textarea {
      resize: vertical;
      font-family: inherit;
    }

    .help-text {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .error {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    @media (max-width: 640px) {
      form {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class SceneDialogComponent implements OnInit {
  @Input() isOpen = false;
  @Input() scene?: Scene;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() saved = new EventEmitter<Partial<Scene>>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.form && this.scene && this.mode === 'edit') {
      this.form.patchValue({
        name: this.scene.name,
        duration: this.scene.duration,
        notes: this.scene.notes || ''
      });
    } else if (this.form && this.mode === 'create') {
      this.form.reset({
        name: '',
        duration: 60,
        notes: ''
      });
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      duration: [60, [Validators.min(1)]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saved.emit(this.form.value);
      this.form.reset({
        name: '',
        duration: 60,
        notes: ''
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    this.form.reset({
      name: '',
      duration: 60,
      notes: ''
    });
  }
}
