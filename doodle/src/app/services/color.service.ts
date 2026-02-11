import { Injectable, signal } from '@angular/core';
import { ColorState, ColorPalette } from '../models/svg-element.model';

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private readonly STORAGE_KEY = 'doodle_color_state';
  private readonly MAX_RECENT_COLORS = 20;

  // Color state signal
  private colorStateSignal = signal<ColorState>(this.getDefaultColorState());
  
  // Public read-only signals
  colorState = this.colorStateSignal.asReadonly();
  
  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get default color state
   */
  private getDefaultColorState(): ColorState {
    return {
      primary: '#000000',
      secondary: '#ffffff',
      recentColors: [],
      palette: this.getDefaultPalettes()[0]
    };
  }

  /**
   * Get primary (fill) color
   */
  getPrimaryColor(): string {
    return this.colorStateSignal().primary;
  }

  /**
   * Get secondary (stroke) color
   */
  getSecondaryColor(): string {
    return this.colorStateSignal().secondary;
  }

  /**
   * Set primary color
   */
  setPrimaryColor(color: string): void {
    this.colorStateSignal.update(state => ({
      ...state,
      primary: color
    }));
    this.addToRecent(color);
    this.saveToStorage();
  }

  /**
   * Set secondary color
   */
  setSecondaryColor(color: string): void {
    this.colorStateSignal.update(state => ({
      ...state,
      secondary: color
    }));
    this.addToRecent(color);
    this.saveToStorage();
  }

  /**
   * Swap primary and secondary colors
   */
  swapColors(): void {
    this.colorStateSignal.update(state => ({
      ...state,
      primary: state.secondary,
      secondary: state.primary
    }));
    this.saveToStorage();
  }

  /**
   * Add color to recent colors
   */
  addToRecent(color: string): void {
    this.colorStateSignal.update(state => {
      const recentColors = [color, ...state.recentColors.filter(c => c !== color)]
        .slice(0, this.MAX_RECENT_COLORS);
      
      return {
        ...state,
        recentColors
      };
    });
    this.saveToStorage();
  }

  /**
   * Get recent colors
   */
  getRecentColors(): string[] {
    return this.colorStateSignal().recentColors;
  }

  /**
   * Create a new color palette
   */
  createPalette(name: string, colors: string[]): ColorPalette {
    return {
      id: `palette-${Date.now()}`,
      name,
      colors
    };
  }

  /**
   * Get all available palettes
   */
  getPalettes(): ColorPalette[] {
    return this.getDefaultPalettes();
  }

  /**
   * Load a palette
   */
  loadPalette(paletteId: string): void {
    const palettes = this.getPalettes();
    const palette = palettes.find(p => p.id === paletteId);
    
    if (palette) {
      this.colorStateSignal.update(state => ({
        ...state,
        palette
      }));
      this.saveToStorage();
    }
  }

  /**
   * Get default color palettes
   */
  private getDefaultPalettes(): ColorPalette[] {
    return [
      {
        id: 'material',
        name: 'Material Design',
        colors: [
          '#f44336', '#e91e63', '#9c27b0', '#673ab7',
          '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
          '#009688', '#4caf50', '#8bc34a', '#cddc39',
          '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
        ]
      },
      {
        id: 'flat',
        name: 'Flat Colors',
        colors: [
          '#1abc9c', '#16a085', '#2ecc71', '#27ae60',
          '#3498db', '#2980b9', '#9b59b6', '#8e44ad',
          '#34495e', '#2c3e50', '#f1c40f', '#f39c12',
          '#e67e22', '#d35400', '#e74c3c', '#c0392b'
        ]
      },
      {
        id: 'pastel',
        name: 'Pastel Colors',
        colors: [
          '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9',
          '#bae1ff', '#d4baff', '#ffbaf3', '#ffc9ba',
          '#c9e4de', '#f3e5ab', '#c4a6c0', '#b5c7d3',
          '#e8d5c4', '#f5c3c2', '#d9b8f3', '#b8e6f3'
        ]
      },
      {
        id: 'monochrome',
        name: 'Monochrome',
        colors: [
          '#000000', '#1a1a1a', '#333333', '#4d4d4d',
          '#666666', '#808080', '#999999', '#b3b3b3',
          '#cccccc', '#e6e6e6', '#f2f2f2', '#ffffff'
        ]
      }
    ];
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): RGB | null {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse 3-digit or 6-digit hex
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    if (hex.length !== 6) {
      return null;
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }
    
    return { r, g, b };
  }

  /**
   * Convert RGB to hex color
   */
  rgbToHex(rgb: RGB): string {
    const toHex = (n: number) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Convert RGB to HSL
   */
  rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      
      switch (max) {
        case r:
          h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / delta + 2) / 6;
          break;
        case b:
          h = ((r - g) / delta + 4) / 6;
          break;
      }
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convert HSL to RGB
   */
  hslToRgb(hsl: HSL): RGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Convert hex to HSL
   */
  hexToHsl(hex: string): HSL | null {
    const rgb = this.hexToRgb(hex);
    return rgb ? this.rgbToHsl(rgb) : null;
  }

  /**
   * Convert HSL to hex
   */
  hslToHex(hsl: HSL): string {
    return this.rgbToHex(this.hslToRgb(hsl));
  }

  /**
   * Validate hex color
   */
  isValidHex(hex: string): boolean {
    return /^#?([0-9A-Fa-f]{3}){1,2}$/.test(hex);
  }

  /**
   * Parse color string (hex, rgb, rgba, hsl, hsla) to hex
   */
  parseColor(color: string): string | null {
    color = color.trim();
    
    // Hex color
    if (this.isValidHex(color)) {
      return color.startsWith('#') ? color : `#${color}`;
    }
    
    // RGB/RGBA
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return this.rgbToHex({
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      });
    }
    
    // HSL/HSLA
    const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
    if (hslMatch) {
      return this.hslToHex({
        h: parseInt(hslMatch[1]),
        s: parseInt(hslMatch[2]),
        l: parseInt(hslMatch[3])
      });
    }
    
    return null;
  }

  /**
   * Save color state to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.colorStateSignal()));
    } catch (error) {
      console.error('Failed to save color state:', error);
    }
  }

  /**
   * Load color state from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        this.colorStateSignal.set(state);
      }
    } catch (error) {
      console.error('Failed to load color state:', error);
    }
  }
}
