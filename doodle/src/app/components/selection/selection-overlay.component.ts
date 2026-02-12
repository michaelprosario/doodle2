import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rect } from '../../models/selection.model';

interface HandlePosition {
  x: number;
  y: number;
  type: string;
}

@Component({
  selector: 'app-selection-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      class="selection-overlay"
      [attr.width]="width()"
      [attr.height]="height()"
      [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
      aria-hidden="true">
      @if (selectionBounds(); as bounds) {
        <rect
          class="selection-bounds"
          [attr.x]="bounds.x"
          [attr.y]="bounds.y"
          [attr.width]="bounds.width"
          [attr.height]="bounds.height" />
        @for (handle of handles(); track handle.type) {
          <rect
            class="selection-handle"
            [attr.x]="handle.x"
            [attr.y]="handle.y"
            [attr.width]="handleSize"
            [attr.height]="handleSize" />
        }
        @if (rotateHandle(); as rotate) {
          <circle
            class="rotate-handle"
            [attr.cx]="rotate.x"
            [attr.cy]="rotate.y"
            [attr.r]="handleSize / 2" />
          <line
            class="rotate-connector"
            [attr.x1]="rotate.x"
            [attr.y1]="rotate.y + handleSize / 2"
            [attr.x2]="rotate.x"
            [attr.y2]="bounds.y" />
        }
      }
      @if (selectionBox(); as box) {
        <rect
          class="selection-box"
          [attr.x]="box.x"
          [attr.y]="box.y"
          [attr.width]="box.width"
          [attr.height]="box.height" />
      }
    </svg>
  `,
  styles: [`
    :host {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }

    .selection-overlay {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .selection-bounds {
      fill: none;
      stroke: #1e90ff;
      stroke-width: 1;
      stroke-dasharray: 4 2;
    }

    .selection-handle {
      fill: #ffffff;
      stroke: #1e90ff;
      stroke-width: 1;
    }

    .rotate-handle {
      fill: #1e90ff;
    }

    .rotate-connector {
      stroke: #1e90ff;
      stroke-width: 1;
    }

    .selection-box {
      fill: rgba(30, 144, 255, 0.12);
      stroke: #1e90ff;
      stroke-width: 1;
      stroke-dasharray: 4 2;
    }
  `]
})
export class SelectionOverlayComponent {
  width = input(0);
  height = input(0);
  selectionBounds = input<Rect | null>(null);
  selectionBox = input<Rect | null>(null);

  readonly handleSize = 8;

  handles = computed<HandlePosition[]>(() => {
    const bounds = this.selectionBounds();
    if (!bounds) return [];
    const half = this.handleSize / 2;
    const x = bounds.x;
    const y = bounds.y;
    const w = bounds.width;
    const h = bounds.height;

    return [
      { type: 'nw', x: x - half, y: y - half },
      { type: 'n', x: x + w / 2 - half, y: y - half },
      { type: 'ne', x: x + w - half, y: y - half },
      { type: 'e', x: x + w - half, y: y + h / 2 - half },
      { type: 'se', x: x + w - half, y: y + h - half },
      { type: 's', x: x + w / 2 - half, y: y + h - half },
      { type: 'sw', x: x - half, y: y + h - half },
      { type: 'w', x: x - half, y: y + h / 2 - half }
    ];
  });

  rotateHandle = computed(() => {
    const bounds = this.selectionBounds();
    if (!bounds) return null;
    const offset = 18;
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y - offset
    };
  });
}
