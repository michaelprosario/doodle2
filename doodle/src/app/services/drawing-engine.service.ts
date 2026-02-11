import { Injectable, inject } from '@angular/core';
import { SVGElementModel, Point, ToolType, SVGAttributes, DrawingProperties } from '../models/svg-element.model';
import { createSVGElement, updateSVGElement } from '../utils/svg-utils';
import { FrameService } from './frame.service';
import { DrawingPropertiesService } from './drawing-properties.service';

@Injectable({
  providedIn: 'root'
})
export class DrawingEngineService {
  private frameService = inject(FrameService);
  private drawingPropertiesService = inject(DrawingPropertiesService);

  /**
   * Draw a shape based on tool type and points
   */
  drawShape(
    type: ToolType,
    startPoint: Point,
    endPoint: Point,
    properties: DrawingProperties,
    options?: DrawingOptions
  ): SVGElementModel | null {
    const attrs = this.propertiesToAttributes(properties);

    switch (type) {
      case 'rectangle':
        return this.drawRectangle(startPoint, endPoint, attrs, options);
      case 'circle':
        return this.drawCircle(startPoint, endPoint, attrs, options);
      case 'ellipse':
        return this.drawEllipse(startPoint, endPoint, attrs, options);
      case 'line':
        return this.drawLine(startPoint, endPoint, attrs, options);
      default:
        return null;
    }
  }

  /**
   * Draw a rectangle
   */
  private drawRectangle(
    startPoint: Point,
    endPoint: Point,
    attrs: SVGAttributes,
    options?: DrawingOptions
  ): SVGElementModel {
    let x = Math.min(startPoint.x, endPoint.x);
    let y = Math.min(startPoint.y, endPoint.y);
    let width = Math.abs(endPoint.x - startPoint.x);
    let height = Math.abs(endPoint.y - startPoint.y);

    // Shift key: constrain to square
    if (options?.constrainProportions) {
      const size = Math.min(width, height);
      width = size;
      height = size;
      
      // Adjust position based on drag direction
      if (endPoint.x < startPoint.x) x = startPoint.x - width;
      if (endPoint.y < startPoint.y) y = startPoint.y - height;
    }

    // Alt key: draw from center
    if (options?.drawFromCenter) {
      x = startPoint.x - width / 2;
      y = startPoint.y - height / 2;
    }

    return createSVGElement('rect', {
      ...attrs,
      x,
      y,
      width,
      height
    });
  }

  /**
   * Draw a circle or ellipse
   */
  private drawCircle(
    startPoint: Point,
    endPoint: Point,
    attrs: SVGAttributes,
    options?: DrawingOptions
  ): SVGElementModel {
    const cx = options?.drawFromCenter ? startPoint.x : (startPoint.x + endPoint.x) / 2;
    const cy = options?.drawFromCenter ? startPoint.y : (startPoint.y + endPoint.y) / 2;
    
    let rx = Math.abs(endPoint.x - startPoint.x) / 2;
    let ry = Math.abs(endPoint.y - startPoint.y) / 2;

    // Shift key: constrain to circle (equal radii)
    if (options?.constrainProportions) {
      const r = Math.min(rx, ry);
      rx = r;
      ry = r;
    }

    // If radii are equal, use circle element
    if (rx === ry) {
      return createSVGElement('circle', {
        ...attrs,
        cx,
        cy,
        r: rx
      });
    }

    return createSVGElement('ellipse', {
      ...attrs,
      cx,
      cy,
      rx,
      ry
    });
  }

  /**
   * Draw an ellipse
   */
  private drawEllipse(
    startPoint: Point,
    endPoint: Point,
    attrs: SVGAttributes,
    options?: DrawingOptions
  ): SVGElementModel {
    const cx = options?.drawFromCenter ? startPoint.x : (startPoint.x + endPoint.x) / 2;
    const cy = options?.drawFromCenter ? startPoint.y : (startPoint.y + endPoint.y) / 2;
    
    const rx = Math.abs(endPoint.x - startPoint.x) / 2;
    const ry = Math.abs(endPoint.y - startPoint.y) / 2;

    return createSVGElement('ellipse', {
      ...attrs,
      cx,
      cy,
      rx,
      ry
    });
  }

  /**
   * Draw a line
   */
  private drawLine(
    startPoint: Point,
    endPoint: Point,
    attrs: SVGAttributes,
    options?: DrawingOptions
  ): SVGElementModel {
    let x2 = endPoint.x;
    let y2 = endPoint.y;

    // Shift key: constrain to 45-degree angles
    if (options?.constrainProportions) {
      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      const angle = Math.atan2(dy, dx);
      const constrainedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      x2 = startPoint.x + distance * Math.cos(constrainedAngle);
      y2 = startPoint.y + distance * Math.sin(constrainedAngle);
    }

    // Lines should not have fill
    const lineAttrs = {
      ...attrs,
      fill: 'none'
    };

    return createSVGElement('line', {
      ...lineAttrs,
      x1: startPoint.x,
      y1: startPoint.y,
      x2,
      y2
    });
  }

  /**
   * Draw a polygon (regular polygon)
   */
  drawPolygon(
    center: Point,
    radius: number,
    sides: number,
    rotation: number,
    attrs: SVGAttributes
  ): SVGElementModel {
    const points: string[] = [];
    
    for (let i = 0; i < sides; i++) {
      const angle = (rotation + (i * 360 / sides)) * Math.PI / 180;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return createSVGElement('polygon', {
      ...attrs,
      points: points.join(' ')
    });
  }

  /**
   * Draw a star
   */
  drawStar(
    center: Point,
    outerRadius: number,
    innerRadius: number,
    points: number,
    rotation: number,
    attrs: SVGAttributes
  ): SVGElementModel {
    const pathPoints: string[] = [];
    const totalPoints = points * 2;
    
    for (let i = 0; i < totalPoints; i++) {
      const angle = (rotation + (i * 180 / points)) * Math.PI / 180;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      pathPoints.push(`${x},${y}`);
    }

    return createSVGElement('polygon', {
      ...attrs,
      points: pathPoints.join(' ')
    });
  }

  /**
   * Draw a triangle
   */
  drawTriangle(
    startPoint: Point,
    endPoint: Point,
    attrs: SVGAttributes,
    options?: DrawingOptions
  ): SVGElementModel {
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);
    
    let x = Math.min(startPoint.x, endPoint.x);
    let y = Math.min(startPoint.y, endPoint.y);

    // Constrain to equilateral triangle
    if (options?.constrainProportions) {
      const size = Math.min(width, height);
      const h = size * Math.sqrt(3) / 2;
      
      const points = [
        `${x + size / 2},${y}`,           // top
        `${x},${y + h}`,                  // bottom left
        `${x + size},${y + h}`            // bottom right
      ].join(' ');

      return createSVGElement('polygon', {
        ...attrs,
        points
      });
    }

    // Regular triangle
    const points = [
      `${x + width / 2},${y}`,            // top
      `${x},${y + height}`,               // bottom left
      `${x + width},${y + height}`        // bottom right
    ].join(' ');

    return createSVGElement('polygon', {
      ...attrs,
      points
    });
  }

  /**
   * Create path from points (for freehand drawing)
   */
  createPathFromPoints(points: Point[], attrs: SVGAttributes): SVGElementModel {
    if (points.length < 2) {
      throw new Error('Need at least 2 points to create a path');
    }

    const pathData = this.pointsToPathData(points);
    
    return createSVGElement('path', {
      ...attrs,
      d: pathData,
      fill: 'none' // Paths from freehand should not have fill by default
    });
  }

  /**
   * Convert points to SVG path data
   */
  private pointsToPathData(points: Point[]): string {
    if (points.length === 0) return '';
    
    const pathParts: string[] = [`M ${points[0].x} ${points[0].y}`];
    
    for (let i = 1; i < points.length; i++) {
      pathParts.push(`L ${points[i].x} ${points[i].y}`);
    }
    
    return pathParts.join(' ');
  }

  /**
   * Update shape preview during drawing
   */
  updateShapePreview(
    element: SVGElementModel,
    currentPoint: Point,
    options?: DrawingOptions
  ): SVGElementModel {
    // This is a simplified version - would need to reconstruct
    // based on element type and original start point
    return element;
  }

  /**
   * Finalize shape (cleanup and optimize)
   */
  finalizeShape(element: SVGElementModel): SVGElementModel {
    // Could add optimizations here like:
    // - Rounding coordinates to reduce precision
    // - Removing redundant attributes
    // - Simplifying paths
    return element;
  }

  /**
   * Add element to the current frame
   */
  addElementToFrame(frameId: string, element: SVGElementModel): void {
    // Note: Frame updates should be handled by the component with access to projectId and sceneId
    // This is a placeholder for the interface
    console.warn('Frame updates should be handled by the canvas component');
  }

  /**
   * Remove element from frame
   */
  removeElementFromFrame(frameId: string, elementId: string): void {
    // Note: Frame updates should be handled by the component with access to projectId and sceneId
    console.warn('Frame updates should be handled by the canvas component');
  }

  /**
   * Update element in frame
   */
  updateElement(
    frameId: string,
    elementId: string,
    attributes: Partial<SVGAttributes>
  ): void {
    // Note: Frame updates should be handled by the component with access to projectId and sceneId
    console.warn('Frame updates should be handled by the canvas component');
  }

  /**
   * Convert drawing properties to SVG attributes
   */
  private propertiesToAttributes(properties: DrawingProperties): SVGAttributes {
    return {
      fill: properties.fillType === 'none' ? 'none' : properties.fill,
      fillOpacity: properties.fillOpacity,
      stroke: properties.strokeType === 'none' ? 'none' : properties.stroke,
      strokeWidth: properties.strokeWidth,
      strokeOpacity: properties.strokeOpacity,
      strokeLinecap: properties.strokeLinecap,
      strokeLinejoin: properties.strokeLinejoin,
      strokeDasharray: properties.strokeDasharray
    };
  }

  /**
   * Get current drawing properties
   */
  getCurrentProperties(): DrawingProperties {
    return this.drawingPropertiesService.properties();
  }
}

export interface DrawingOptions {
  constrainProportions?: boolean;  // Shift key
  drawFromCenter?: boolean;        // Alt key
  snapToGrid?: boolean;
  snapAngle?: boolean;
}
