import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="icon" *ngIf="icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p *ngIf="message">{{ message }}</p>
      <div class="action" *ngIf="hasAction">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      color: #6b7280;
    }

    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }

    p {
      margin: 0 0 1.5rem 0;
      max-width: 400px;
    }

    .action {
      margin-top: 1rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '📋';
  @Input() title = 'No items found';
  @Input() message = '';
  @Input() hasAction = false;
}
