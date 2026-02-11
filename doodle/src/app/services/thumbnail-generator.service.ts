import { Injectable } from '@angular/core';
import { Frame } from '../models/frame.model';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailGeneratorService {
  private thumbnailCache = new Map<string, string>();
  private readonly DEFAULT_WIDTH = 120;
  private readonly DEFAULT_HEIGHT = 90;

  /**
   * Generate a thumbnail for a single frame
   */
  async generateThumbnail(
    frame: Frame,
    width: number = this.DEFAULT_WIDTH,
    height: number = this.DEFAULT_HEIGHT,
    projectDimensions?: { width: number; height: number }
  ): Promise<string> {
    // Check cache first
    const cacheKey = `${frame.id}-${width}x${height}`;
    const cached = this.thumbnailCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Create an SVG element with the frame content
      const svg = this.createSVGFromFrame(frame, projectDimensions);
      
      // Convert SVG to data URL
      const thumbnail = await this.svgToDataURL(svg, width, height);
      
      // Cache the result
      this.cacheThumbnail(cacheKey, thumbnail);
      
      return thumbnail;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return this.getPlaceholderThumbnail(width, height);
    }
  }

  /**
   * Generate thumbnails for multiple frames
   */
  async generateThumbnails(
    frames: Frame[],
    size: { width: number; height: number },
    projectDimensions?: { width: number; height: number }
  ): Promise<Map<string, string>> {
    const thumbnails = new Map<string, string>();

    for (const frame of frames) {
      const thumbnail = await this.generateThumbnail(
        frame,
        size.width,
        size.height,
        projectDimensions
      );
      thumbnails.set(frame.id, thumbnail);
    }

    return thumbnails;
  }

  /**
   * Cache a thumbnail
   */
  cacheThumbnail(frameId: string, thumbnail: string): void {
    this.thumbnailCache.set(frameId, thumbnail);
  }

  /**
   * Get cached thumbnail
   */
  getCachedThumbnail(frameId: string): string | null {
    return this.thumbnailCache.get(frameId) || null;
  }

  /**
   * Clear specific thumbnail from cache
   */
  clearThumbnail(frameId: string): void {
    // Clear all cached sizes for this frame
    Array.from(this.thumbnailCache.keys())
      .filter(key => key.startsWith(frameId))
      .forEach(key => this.thumbnailCache.delete(key));
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.thumbnailCache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.thumbnailCache.size;
  }

  /**
   * Create SVG element from frame data
   */
  private createSVGFromFrame(
    frame: Frame,
    projectDimensions?: { width: number; height: number }
  ): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    const width = projectDimensions?.width || 1920;
    const height = projectDimensions?.height || 1080;
    
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.background = 'white';

    // Add frame elements
    frame.elements.forEach(element => {
      try {
        const svgElement = this.createSVGElementFromData(element);
        if (svgElement) {
          svg.appendChild(svgElement);
        }
      } catch (error) {
        console.warn('Failed to create SVG element:', error);
      }
    });

    return svg;
  }

  /**
   * Create SVG element from element data
   */
  private createSVGElementFromData(elementData: any): SVGElement | null {
    try {
      const element = document.createElementNS(
        'http://www.w3.org/2000/svg',
        elementData.type
      );

      // Apply properties
      Object.entries(elementData.properties || {}).forEach(([key, value]) => {
        element.setAttribute(key, String(value));
      });

      return element;
    } catch (error) {
      console.error('Error creating SVG element:', error);
      return null;
    }
  }

  /**
   * Convert SVG to data URL using canvas
   */
  private async svgToDataURL(
    svg: SVGSVGElement,
    width: number,
    height: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        const dataURL = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataURL);
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };

      img.src = url;
    });
  }

  /**
   * Get placeholder thumbnail for empty or error frames
   */
  private getPlaceholderThumbnail(width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw a simple placeholder
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(0, 0, width, height);
      
      // Draw diagonal lines
      ctx.strokeStyle = '#ddd';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);
      ctx.stroke();
    }

    return canvas.toDataURL('image/png');
  }
}
