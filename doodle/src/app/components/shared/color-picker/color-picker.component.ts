import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorService } from '../../../services/color.service';
import { DrawingPropertiesService } from '../../../services/drawing-properties.service';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="color-picker">
      <div class="color-picker-header">
        <h4>Colors</h4>
      </div>

      <!-- Primary and Secondary Colors -->
      <div class="color-swatches">
        <div class="swatch-group">
          <label>Fill</label>
          <div class="color-swatch-container">
            <input
              type="color"
              [value]="fillColor()"
              (input)="onFillColorChange($event)"
              class="color-input"
            />
            <div 
              class="color-swatch"
              [style.background-color]="fillColor()"
              (click)="openColorPicker('fill')"
            ></div>
            <button 
              class="toggle-btn"
              (click)="toggleFill()"
              [title]="fillColor() === 'none' ? 'Enable fill' : 'Disable fill'">
              {{ fillColor() === 'none' ? '✗' : '✓' }}
            </button>
          </div>
        </div>

        <div class="swatch-group">
          <label>Stroke</label>
          <div class="color-swatch-container">
            <input
              type="color"
              [value]="strokeColor()"
              (input)="onStrokeColorChange($event)"
              class="color-input"
            />
            <div 
              class="color-swatch"
              [style.background-color]="strokeColor()"
              (click)="openColorPicker('stroke')"
            ></div>
            <button 
              class="toggle-btn"
              (click)="toggleStroke()"
              [title]="strokeColor() === 'none' ? 'Enable stroke' : 'Disable stroke'">
              {{ strokeColor() === 'none' ? '✗' : '✓' }}
            </button>
          </div>
        </div>

        <button class="swap-btn" (click)="swapColors()" title="Swap colors (X)">
          ⇄
        </button>
      </div>

      <!-- Stroke Width -->
      <div class="property-group">
        <label>Stroke Width: {{ strokeWidth() }}px</label>
        <input
          type="range"
          min="1"
          max="50"
          [value]="strokeWidth()"
          (input)="onStrokeWidthChange($event)"
          class="slider"
        />
      </div>

      <!-- Fill Opacity -->
      <div class="property-group">
        <label>Fill Opacity: {{ Math.round(fillOpacity() * 100) }}%</label>
        <input
          type="range"
          min="0"
          max="100"
          [value]="fillOpacity() * 100"
          (input)="onFillOpacityChange($event)"
          class="slider"
        />
      </div>

      <!-- Stroke Opacity -->
      <div class="property-group">
        <label>Stroke Opacity: {{ Math.round(strokeOpacity() * 100) }}%</label>
        <input
          type="range"
          min="0"
          max="100"
          [value]="strokeOpacity() * 100"
          (input)="onStrokeOpacityChange($event)"
          class="slider"
        />
      </div>

      <!-- Color Palettes -->
      <div class="palettes">
        <label>Palettes</label>
        <div class="palette-grid">
          @for (palette of palettes; track palette.id) {
            <div class="palette-section">
              <div class="palette-name">{{ palette.name }}</div>
              <div class="palette-colors">
                @for (color of palette.colors; track color) {
                  <div 
                    class="palette-color"
                    [style.background-color]="color"
                    (click)="selectColor(color)"
                    [title]="color"
                  ></div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Recent Colors -->
      @if (recentColors().length > 0) {
        <div class="recent-colors">
          <label>Recent</label>
          <div class="recent-grid">
            @for (color of recentColors(); track color) {
              <div 
                class="recent-color"
                [style.background-color]="color"
                (click)="selectColor(color)"
                [title]="color"
              ></div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .color-picker {
      background: #2a2a2a;
      padding: 12px;
      border-radius: 4px;
      min-width: 250px;
    }

    .color-picker-header h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #ccc;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .color-swatches {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      align-items: flex-end;
    }

    .swatch-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .swatch-group label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
    }

    .color-swatch-container {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .color-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .color-swatch {
      width: 48px;
      height: 48px;
      border: 2px solid #444;
      border-radius: 4px;
      cursor: pointer;
      position: relative;
    }

    .color-swatch:hover {
      border-color: #666;
    }

    .toggle-btn {
      background: #333;
      border: 1px solid #444;
      color: #ccc;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .toggle-btn:hover {
      background: #3a3a3a;
    }

    .swap-btn {
      background: #333;
      border: 1px solid #444;
      color: #ccc;
      width: 40px;
      height: 40px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px;
      align-self: flex-end;
      margin-bottom: 4px;
    }

    .swap-btn:hover {
      background: #3a3a3a;
    }

    .property-group {
      margin-bottom: 16px;
    }

    .property-group label {
      display: block;
      font-size: 12px;
      color: #ccc;
      margin-bottom: 6px;
    }

    .slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #444;
      outline: none;
      -webkit-appearance: none;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #0d6efd;
      cursor: pointer;
    }

    .slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #0d6efd;
      cursor: pointer;
      border: none;
    }

    .palettes {
      margin-top: 20px;
    }

    .palettes label {
      display: block;
      font-size: 12px;
      color: #ccc;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .palette-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .palette-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .palette-name {
      font-size: 10px;
      color: #999;
      text-transform: uppercase;
    }

    .palette-colors {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 4px;
    }

    .palette-color {
      width: 24px;
      height: 24px;
      border-radius: 2px;
      cursor: pointer;
      border: 1px solid #333;
    }

    .palette-color:hover {
      border-color: #fff;
      transform: scale(1.1);
    }

    .recent-colors {
      margin-top: 16px;
    }

    .recent-colors label {
      display: block;
      font-size: 12px;
      color: #ccc;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .recent-grid {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 4px;
    }

    .recent-color {
      width: 24px;
      height: 24px;
      border-radius: 2px;
      cursor: pointer;
      border: 1px solid #333;
    }

    .recent-color:hover {
      border-color: #fff;
      transform: scale(1.1);
    }
  `]
})
export class ColorPickerComponent {
  private colorService = inject(ColorService);
  private propertiesService = inject(DrawingPropertiesService);

  fillColor = this.propertiesService.fillColor;
  strokeColor = this.propertiesService.strokeColor;
  strokeWidth = this.propertiesService.strokeWidth;
  fillOpacity = this.propertiesService.fillOpacity;
  strokeOpacity = this.propertiesService.strokeOpacity;

  palettes = this.colorService.getPalettes();
  recentColors = signal(this.colorService.getRecentColors());

  protected Math = Math;

  onFillColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.propertiesService.setFillColor(input.value);
    this.colorService.addToRecent(input.value);
    this.updateRecentColors();
  }

  onStrokeColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.propertiesService.setStrokeColor(input.value);
    this.colorService.addToRecent(input.value);
    this.updateRecentColors();
  }

  onStrokeWidthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.propertiesService.setStrokeWidth(Number(input.value));
  }

  onFillOpacityChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.propertiesService.setFillOpacity(Number(input.value) / 100);
  }

  onStrokeOpacityChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.propertiesService.setStrokeOpacity(Number(input.value) / 100);
  }

  selectColor(color: string): void {
    // Apply to fill by default, could be made configurable
    this.propertiesService.setFillColor(color);
    this.colorService.addToRecent(color);
    this.updateRecentColors();
  }

  swapColors(): void {
    const fill = this.fillColor();
    const stroke = this.strokeColor();
    this.propertiesService.setFillColor(stroke);
    this.propertiesService.setStrokeColor(fill);
  }

  toggleFill(): void {
    this.propertiesService.toggleFill();
  }

  toggleStroke(): void {
    this.propertiesService.toggleStroke();
  }

  openColorPicker(type: 'fill' | 'stroke'): void {
    // Trigger the hidden color input
    const inputs = document.querySelectorAll('.color-input');
    const index = type === 'fill' ? 0 : 1;
    (inputs[index] as HTMLInputElement)?.click();
  }

  private updateRecentColors(): void {
    this.recentColors.set(this.colorService.getRecentColors());
  }
}
