import { Injectable, inject } from '@angular/core';
import { KeyboardShortcutService } from './keyboard-shortcut.service';
import { ToolService } from './tool.service';
import { DrawingPropertiesService } from './drawing-properties.service';
import { ColorService } from './color.service';

@Injectable({
  providedIn: 'root'
})
export class DrawingShortcutsService {
  private keyboardService = inject(KeyboardShortcutService);
  private toolService = inject(ToolService);
  private propertiesService = inject(DrawingPropertiesService);
  private colorService = inject(ColorService);

  /**
   * Register all drawing-related keyboard shortcuts
   */
  registerShortcuts(): void {
    // Tool selection shortcuts
    this.registerToolShortcuts();
    
    // Color shortcuts
    this.registerColorShortcuts();
    
    // Opacity shortcuts
    this.registerOpacityShortcuts();
  }

  /**
   * Register tool selection shortcuts
   */
  private registerToolShortcuts(): void {
    // V - Select tool
    this.keyboardService.register({
      key: 'v',
      callback: () => this.toolService.setActiveTool('select'),
      description: 'Select tool',
      context: 'drawing'
    });

    // R - Rectangle tool
    this.keyboardService.register({
      key: 'r',
      callback: () => this.toolService.setActiveTool('rectangle'),
      description: 'Rectangle tool',
      context: 'drawing'
    });

    // C - Circle tool
    this.keyboardService.register({
      key: 'c',
      callback: () => this.toolService.setActiveTool('circle'),
      description: 'Circle tool',
      context: 'drawing'
    });

    // E - Ellipse tool
    this.keyboardService.register({
      key: 'e',
      callback: () => this.toolService.setActiveTool('ellipse'),
      description: 'Ellipse tool',
      context: 'drawing'
    });

    // L - Line tool
    this.keyboardService.register({
      key: 'l',
      callback: () => this.toolService.setActiveTool('line'),
      description: 'Line tool',
      context: 'drawing'
    });

    // P - Pen tool
    this.keyboardService.register({
      key: 'p',
      callback: () => this.toolService.setActiveTool('pen'),
      description: 'Pen tool (Bezier)',
      context: 'drawing'
    });

    // N - Pencil tool
    this.keyboardService.register({
      key: 'n',
      callback: () => this.toolService.setActiveTool('pencil'),
      description: 'Pencil tool (freehand)',
      context: 'drawing'
    });

    // B - Brush tool
    this.keyboardService.register({
      key: 'b',
      callback: () => this.toolService.setActiveTool('brush'),
      description: 'Brush tool',
      context: 'drawing'
    });

    // I - Eyedropper tool
    this.keyboardService.register({
      key: 'i',
      callback: () => this.toolService.setActiveTool('eyedropper'),
      description: 'Eyedropper tool',
      context: 'drawing'
    });

    // H - Pan tool
    this.keyboardService.register({
      key: 'h',
      callback: () => this.toolService.setActiveTool('pan'),
      description: 'Pan tool (hand)',
      context: 'drawing'
    });

    // Space - Temporarily switch to pan tool
    // Note: This would need special handling for hold/release
    this.keyboardService.register({
      key: ' ',
      callback: () => this.toolService.setActiveTool('pan'),
      description: 'Temporarily switch to pan tool',
      context: 'drawing'
    });
  }

  /**
   * Register color-related shortcuts
   */
  private registerColorShortcuts(): void {
    // X - Swap fill and stroke colors
    this.keyboardService.register({
      key: 'x',
      callback: () => this.colorService.swapColors(),
      description: 'Swap fill and stroke colors',
      context: 'drawing'
    });

    // D - Reset to default colors (black fill, no stroke)
    this.keyboardService.register({
      key: 'd',
      callback: () => {
        this.propertiesService.setFillColor('#000000');
        this.propertiesService.setStrokeColor('none');
      },
      description: 'Reset to default colors',
      context: 'drawing'
    });

    // / - Toggle fill/stroke
    this.keyboardService.register({
      key: '/',
      callback: () => this.propertiesService.toggleFill(),
      description: 'Toggle fill on/off',
      context: 'drawing'
    });
  }

  /**
   * Register opacity shortcuts
   */
  private registerOpacityShortcuts(): void {
    // Number keys 0-9 for opacity levels
    for (let i = 0; i <= 9; i++) {
      const opacity = i === 0 ? 1.0 : i / 10;
      this.keyboardService.register({
        key: i.toString(),
        callback: () => this.propertiesService.setFillOpacity(opacity),
        description: `Set opacity to ${Math.round(opacity * 100)}%`,
        context: 'drawing'
      });
    }

    // [ - Decrease stroke width
    this.keyboardService.register({
      key: '[',
      callback: () => {
        const current = this.propertiesService.strokeWidth();
        this.propertiesService.setStrokeWidth(Math.max(1, current - 1));
      },
      description: 'Decrease stroke width',
      context: 'drawing'
    });

    // ] - Increase stroke width
    this.keyboardService.register({
      key: ']',
      callback: () => {
        const current = this.propertiesService.strokeWidth();
        this.propertiesService.setStrokeWidth(Math.min(50, current + 1));
      },
      description: 'Increase stroke width',
      context: 'drawing'
    });
  }

  /**
   * Unregister all drawing shortcuts
   */
  unregisterShortcuts(): void {
    // This could be expanded to specifically unregister drawing shortcuts
    // For now, individual shortcuts can be unregistered as needed
  }
}
