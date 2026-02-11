import { Component, Output, EventEmitter, Input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { PROJECT_TEMPLATES, ProjectTemplate } from '../../models/template.model';
import { ModalComponent } from '../shared/modal/modal.component';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      title="Create New Project"
      (closed)="onCancel()">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="template">Template</label>
          <select
            id="template"
            formControlName="template"
            (change)="onTemplateChange()">
            <option *ngFor="let template of templates" [value]="template.id">
              {{ template.name }}
              <span *ngIf="template.description"> - {{ template.description }}</span>
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="name">Project Name *</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            placeholder="My Animation">
          <div class="error" *ngIf="form.get('name')?.touched && form.get('name')?.errors?.['required']">
            Project name is required
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            formControlName="description"
            rows="3"
            placeholder="Describe your project..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="width">Width *</label>
            <input
              id="width"
              type="number"
              formControlName="width"
              [min]="1"
              [max]="7680"
              [readonly]="!isCustomTemplate()">
            <div class="error" *ngIf="form.get('width')?.touched && form.get('width')?.errors?.['required']">
              Width is required
            </div>
            <div class="error" *ngIf="form.get('width')?.touched && (form.get('width')?.errors?.['min'] || form.get('width')?.errors?.['max'])">
              Width must be between 1 and 7680
            </div>
          </div>

          <div class="form-group">
            <label for="height">Height *</label>
            <input
              id="height"
              type="number"
              formControlName="height"
              [min]="1"
              [max]="4320"
              [readonly]="!isCustomTemplate()">
            <div class="error" *ngIf="form.get('height')?.touched && form.get('height')?.errors?.['required']">
              Height is required
            </div>
            <div class="error" *ngIf="form.get('height')?.touched && (form.get('height')?.errors?.['min'] || form.get('height')?.errors?.['max'])">
              Height must be between 1 and 4320
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="frameRate">Frame Rate (fps) *</label>
            <input
              id="frameRate"
              type="number"
              formControlName="frameRate"
              [min]="1"
              [max]="60">
            <div class="error" *ngIf="form.get('frameRate')?.touched && form.get('frameRate')?.errors?.['required']">
              Frame rate is required
            </div>
            <div class="error" *ngIf="form.get('frameRate')?.touched && (form.get('frameRate')?.errors?.['min'] || form.get('frameRate')?.errors?.['max'])">
              Frame rate must be between 1 and 60
            </div>
          </div>

          <div class="form-group">
            <label for="backgroundColor">Background Color</label>
            <div class="color-input">
              <input
                id="backgroundColor"
                type="color"
                formControlName="backgroundColor">
              <input
                type="text"
                [value]="form.get('backgroundColor')?.value"
                (input)="onColorTextChange($event)"
                placeholder="#FFFFFF">
            </div>
          </div>
        </div>

        <div footer class="modal-actions">
          <app-button variant="ghost" type="button" (click)="onCancel()">
            Cancel
          </app-button>
          <app-button type="submit" [disabled]="!form.valid">
            Create Project
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    form {
      min-width: 500px;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    input[readonly] {
      background-color: #f9fafb;
      cursor: not-allowed;
    }

    textarea {
      resize: vertical;
      font-family: inherit;
    }

    .color-input {
      display: flex;
      gap: 0.5rem;
    }

    input[type="color"] {
      width: 60px;
      height: 38px;
      padding: 0.25rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      cursor: pointer;
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

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProjectCreateComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<Project>();

  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);

  templates = PROJECT_TEMPLATES;
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const defaultTemplate = this.templates[0];
    this.form = this.fb.group({
      template: [defaultTemplate.id],
      name: ['', Validators.required],
      description: [''],
      width: [
        defaultTemplate.dimensions.width,
        [Validators.required, Validators.min(1), Validators.max(7680)]
      ],
      height: [
        defaultTemplate.dimensions.height,
        [Validators.required, Validators.min(1), Validators.max(4320)]
      ],
      frameRate: [
        defaultTemplate.frameRate,
        [Validators.required, Validators.min(1), Validators.max(60)]
      ],
      backgroundColor: ['#FFFFFF']
    });
  }

  onTemplateChange(): void {
    const templateId = this.form.get('template')?.value;
    const template = this.templates.find(t => t.id === templateId);
    
    if (template) {
      this.form.patchValue({
        width: template.dimensions.width,
        height: template.dimensions.height,
        frameRate: template.frameRate
      });
    }
  }

  isCustomTemplate(): boolean {
    return this.form.get('template')?.value === 'custom';
  }

  onColorTextChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Basic hex color validation
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      this.form.patchValue({ backgroundColor: value });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      
      const project = this.projectService.createProject({
        name: formValue.name,
        description: formValue.description,
        dimensions: {
          width: formValue.width,
          height: formValue.height
        },
        frameRate: formValue.frameRate,
        backgroundColor: formValue.backgroundColor,
        metadata: {
          template: formValue.template
        }
      });

      this.created.emit(project);
      this.resetForm();
    }
  }

  onCancel(): void {
    this.closed.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({
      template: this.templates[0].id,
      width: this.templates[0].dimensions.width,
      height: this.templates[0].dimensions.height,
      frameRate: this.templates[0].frameRate,
      backgroundColor: '#FFFFFF'
    });
  }
}
