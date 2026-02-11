import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../../services/tool.service';
import { ToolType, DrawingTool } from '../../../models/svg-element.model';

@Component({
  selector: 'app-drawing-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="drawing-toolbar">
      <div class="toolbar-header">
        <h3>Tools</h3>
      </div>
      
      <div class="tool-buttons">
        @for (tool of tools; track tool.id) {
          <button
            class="tool-btn"
            [class.active]="activeTool() === tool.type"
            (click)="selectTool(tool.type)"
            [title]="tool.name + (tool.shortcut ? ' (' + tool.shortcut + ')' : '')">
            <span class="tool-icon">{{ getToolIcon(tool.type) }}</span>
            <span class="tool-name">{{ tool.name }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .drawing-toolbar {
      background: #2a2a2a;
      border-right: 1px solid #444;
      padding: 12px 8px;
      min-width: 200px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .toolbar-header {
      margin-bottom: 12px;
      padding: 0 8px;
    }

    .toolbar-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #ccc;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tool-buttons {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tool-btn {
      background: #333;
      border: 1px solid #444;
      color: #ccc;
      padding: 10px 12px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;
      font-size: 13px;
    }

    .tool-btn:hover {
      background: #3a3a3a;
      border-color: #555;
    }

    .tool-btn.active {
      background: #0d6efd;
      border-color: #0d6efd;
      color: #fff;
    }

    .tool-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .tool-name {
      flex: 1;
      text-align: left;
    }
  `]
})
export class DrawingToolbarComponent {
  private toolService = inject(ToolService);

  activeTool = this.toolService.activeTool;
  tools = this.toolService.getTools();

  selectTool(tool: ToolType): void {
    this.toolService.setActiveTool(tool);
  }

  getToolIcon(tool: ToolType): string {
    const icons: Record<ToolType, string> = {
      'select': '⬆',
      'rectangle': '▭',
      'circle': '○',
      'ellipse': '◯',
      'line': '⁄',
      'polygon': '⬡',
      'star': '★',
      'triangle': '△',
      'pen': '✏',
      'pencil': '✐',
      'brush': '🖌',
      'eraser': '⌫',
      'eyedropper': '💧',
      'pan': '✋'
    };
    return icons[tool] || '?';
  }
}
