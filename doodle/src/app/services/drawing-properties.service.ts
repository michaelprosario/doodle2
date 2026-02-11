import { Injectable, signal, computed } from '@angular/core';
import { DrawingProperties } from '../models/svg-element.model';

export interface PropertyPreset {
  id: string;
  name: string;
  properties: DrawingProperties;
}

@Injectable({
  providedIn: 'root'
})
export class DrawingPropertiesService {
  private readonly STORAGE_KEY = 'doodle_drawing_properties';
  private readonly PRESETS_KEY = 'doodle_property_presets';

  // Current drawing properties state
  private propertiesSignal = signal<DrawingProperties>(this.getDefaultProperties());
  
  // Public read-only signal
  properties = this.propertiesSignal.asReadonly();
  
  // Computed signals for specific properties
  fillColor = computed(() => this.propertiesSignal().fill);
  strokeColor = computed(() => this.propertiesSignal().stroke);
  strokeWidth = computed(() => this.propertiesSignal().strokeWidth);
  fillOpacity = computed(() => this.propertiesSignal().fillOpacity);
  strokeOpacity = computed(() => this.propertiesSignal().strokeOpacity);

  constructor() {
    // Load saved properties from localStorage
    this.loadFromStorage();
  }

  /**
   * Get the default drawing properties
   */
  getDefaultProperties(): DrawingProperties {
    return {
      fill: '#000000',
      fillOpacity: 1,
      fillType: 'solid',
      stroke: '#000000',
      strokeWidth: 2,
      strokeOpacity: 1,
      strokeType: 'solid',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    };
  }

  /**
   * Update drawing properties
   */
  updateProperties(props: Partial<DrawingProperties>): void {
    this.propertiesSignal.update(current => ({
      ...current,
      ...props
    }));
    this.saveToStorage();
  }

  /**
   * Set fill color
   */
  setFillColor(color: string): void {
    this.updateProperties({ fill: color, fillType: color === 'none' ? 'none' : 'solid' });
  }

  /**
   * Set stroke color
   */
  setStrokeColor(color: string): void {
    this.updateProperties({ stroke: color, strokeType: color === 'none' ? 'none' : 'solid' });
  }

  /**
   * Set stroke width
   */
  setStrokeWidth(width: number): void {
    // Clamp between 1 and 50
    const clampedWidth = Math.max(1, Math.min(50, width));
    this.updateProperties({ strokeWidth: clampedWidth });
  }

  /**
   * Set fill opacity
   */
  setFillOpacity(opacity: number): void {
    // Clamp between 0 and 1
    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    this.updateProperties({ fillOpacity: clampedOpacity });
  }

  /**
   * Set stroke opacity
   */
  setStrokeOpacity(opacity: number): void {
    // Clamp between 0 and 1
    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    this.updateProperties({ strokeOpacity: clampedOpacity });
  }

  /**
   * Reset to default properties
   */
  resetToDefaults(): void {
    this.propertiesSignal.set(this.getDefaultProperties());
    this.saveToStorage();
  }

  /**
   * Set stroke style (solid, dashed, dotted)
   */
  setStrokeStyle(style: 'solid' | 'dashed' | 'dotted' | 'none'): void {
    let dasharray: string | undefined;
    
    switch (style) {
      case 'dashed':
        dasharray = '10 5';
        break;
      case 'dotted':
        dasharray = '2 2';
        break;
      default:
        dasharray = undefined;
    }
    
    this.updateProperties({ 
      strokeType: style,
      strokeDasharray: dasharray
    });
  }

  /**
   * Toggle fill on/off
   */
  toggleFill(): void {
    const current = this.propertiesSignal();
    if (current.fillType === 'none') {
      this.updateProperties({ 
        fill: '#000000',
        fillType: 'solid'
      });
    } else {
      this.updateProperties({ 
        fill: 'none',
        fillType: 'none'
      });
    }
  }

  /**
   * Toggle stroke on/off
   */
  toggleStroke(): void {
    const current = this.propertiesSignal();
    if (current.strokeType === 'none') {
      this.updateProperties({ 
        stroke: '#000000',
        strokeType: 'solid'
      });
    } else {
      this.updateProperties({ 
        stroke: 'none',
        strokeType: 'none'
      });
    }
  }

  /**
   * Save current properties as a preset
   */
  savePreset(name: string): PropertyPreset {
    const preset: PropertyPreset = {
      id: `preset-${Date.now()}`,
      name,
      properties: { ...this.propertiesSignal() }
    };
    
    const presets = this.getPresets();
    presets.push(preset);
    localStorage.setItem(this.PRESETS_KEY, JSON.stringify(presets));
    
    return preset;
  }

  /**
   * Load a preset
   */
  loadPreset(presetId: string): void {
    const presets = this.getPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (preset) {
      this.propertiesSignal.set({ ...preset.properties });
      this.saveToStorage();
    }
  }

  /**
   * Get all saved presets
   */
  getPresets(): PropertyPreset[] {
    const stored = localStorage.getItem(this.PRESETS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.getBuiltInPresets();
      }
    }
    return this.getBuiltInPresets();
  }

  /**
   * Delete a preset
   */
  deletePreset(presetId: string): void {
    const presets = this.getPresets().filter(p => p.id !== presetId);
    localStorage.setItem(this.PRESETS_KEY, JSON.stringify(presets));
  }

  /**
   * Get built-in preset styles
   */
  private getBuiltInPresets(): PropertyPreset[] {
    return [
      {
        id: 'preset-black-fill',
        name: 'Black Fill',
        properties: {
          fill: '#000000',
          fillOpacity: 1,
          fillType: 'solid',
          stroke: 'none',
          strokeWidth: 2,
          strokeOpacity: 1,
          strokeType: 'none',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }
      },
      {
        id: 'preset-black-stroke',
        name: 'Black Stroke',
        properties: {
          fill: 'none',
          fillOpacity: 1,
          fillType: 'none',
          stroke: '#000000',
          strokeWidth: 2,
          strokeOpacity: 1,
          strokeType: 'solid',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }
      },
      {
        id: 'preset-blue-fill',
        name: 'Blue Fill',
        properties: {
          fill: '#2563eb',
          fillOpacity: 1,
          fillType: 'solid',
          stroke: 'none',
          strokeWidth: 2,
          strokeOpacity: 1,
          strokeType: 'none',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }
      },
      {
        id: 'preset-red-stroke',
        name: 'Red Stroke',
        properties: {
          fill: 'none',
          fillOpacity: 1,
          fillType: 'none',
          stroke: '#dc2626',
          strokeWidth: 3,
          strokeOpacity: 1,
          strokeType: 'solid',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }
      },
      {
        id: 'preset-dashed',
        name: 'Dashed Line',
        properties: {
          fill: 'none',
          fillOpacity: 1,
          fillType: 'none',
          stroke: '#000000',
          strokeWidth: 2,
          strokeOpacity: 1,
          strokeType: 'dashed',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: '10 5'
        }
      }
    ];
  }

  /**
   * Save current properties to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.propertiesSignal()));
    } catch (error) {
      console.error('Failed to save drawing properties:', error);
    }
  }

  /**
   * Load properties from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const props = JSON.parse(stored);
        // Migration: Fix old default where stroke was 'none'
        // If both fill and stroke are default values, use new defaults
        if (props.stroke === 'none' && props.fill === '#000000' && props.fillType === 'solid') {
          console.log('Migrating old drawing properties - enabling stroke');
          props.stroke = '#000000';
          props.strokeType = 'solid';
        }
        this.propertiesSignal.set(props);
        // Save migrated properties
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Failed to load drawing properties:', error);
    }
  }
}
