import { SVGElementModel, SVGAttributes, SVGElementType, Point, BoundingBox, Transform } from '../models/svg-element.model';

/**
 * Generate a unique ID for SVG elements
 */
export function generateElementId(): string {
  return `svg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new SVG element model
 */
export function createSVGElement(
  type: SVGElementType, 
  attributes: SVGAttributes
): SVGElementModel {
  return {
    id: generateElementId(),
    type,
    attributes,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Update an existing SVG element with new attributes
 */
export function updateSVGElement(
  element: SVGElementModel, 
  attributes: Partial<SVGAttributes>
): SVGElementModel {
  return {
    ...element,
    attributes: {
      ...element.attributes,
      ...attributes
    },
    updatedAt: new Date()
  };
}

/**
 * Convert SVG element model to actual DOM SVGElement
 */
export function svgElementToDOM(element: SVGElementModel): SVGElement {
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', element.type);
  
  // Set all attributes
  Object.entries(element.attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Convert camelCase to kebab-case for SVG attributes
      const attrName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      svgElement.setAttribute(attrName, String(value));
    }
  });
  
  // Apply transform if exists
  if (element.transform) {
    svgElement.setAttribute('transform', transformToString(element.transform));
  }
  
  // Set ID
  svgElement.setAttribute('id', element.id);
  
  return svgElement;
}

/**
 * Convert DOM SVGElement to element model
 */
export function domToSVGElement(domElement: SVGElement): SVGElementModel {
  const attributes: SVGAttributes = {};
  
  // Extract attributes
  for (let i = 0; i < domElement.attributes.length; i++) {
    const attr = domElement.attributes[i];
    if (attr.name !== 'id' && attr.name !== 'transform') {
      // Convert kebab-case to camelCase
      const key = attr.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      const value = parseAttributeValue(attr.value);
      (attributes as any)[key] = value;
    }
  }
  
  return {
    id: domElement.getAttribute('id') || generateElementId(),
    type: domElement.tagName as SVGElementType,
    attributes,
    transform: parseTransform(domElement.getAttribute('transform') || ''),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Clone an SVG element (deep copy)
 */
export function cloneSVGElement(element: SVGElementModel): SVGElementModel {
  return {
    ...element,
    id: generateElementId(),
    attributes: { ...element.attributes },
    transform: element.transform ? { ...element.transform } : undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Serialize SVG element to string
 */
export function serializeSVGElement(element: SVGElementModel): string {
  const dom = svgElementToDOM(element);
  return new XMLSerializer().serializeToString(dom);
}

/**
 * Transform screen coordinates to canvas SVG coordinates
 */
export function screenToCanvasCoordinates(
  screenX: number, 
  screenY: number, 
  canvasElement: SVGSVGElement
): Point {
  const pt = canvasElement.createSVGPoint();
  pt.x = screenX;
  pt.y = screenY;
  
  const ctm = canvasElement.getScreenCTM();
  if (!ctm) {
    return { x: screenX, y: screenY };
  }
  
  const transformed = pt.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

/**
 * Calculate bounding box for an SVG element
 */
export function calculateBoundingBox(element: SVGElementModel): BoundingBox {
  const attrs = element.attributes;
  
  switch (element.type) {
    case 'rect':
      return {
        x: attrs.x || 0,
        y: attrs.y || 0,
        width: attrs.width || 0,
        height: attrs.height || 0
      };
      
    case 'circle':
      const r = attrs.r || 0;
      return {
        x: (attrs.cx || 0) - r,
        y: (attrs.cy || 0) - r,
        width: r * 2,
        height: r * 2
      };
      
    case 'ellipse':
      const rx = attrs.rx || 0;
      const ry = attrs.ry || 0;
      return {
        x: (attrs.cx || 0) - rx,
        y: (attrs.cy || 0) - ry,
        width: rx * 2,
        height: ry * 2
      };
      
    case 'line':
      const x1 = attrs.x1 || 0;
      const y1 = attrs.y1 || 0;
      const x2 = attrs.x2 || 0;
      const y2 = attrs.y2 || 0;
      return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1)
      };
      
    default:
      // For complex paths, would need proper calculation
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

/**
 * Get default drawing attributes
 */
export function getDefaultAttributes(): SVGAttributes {
  return {
    fill: '#000000',
    fillOpacity: 1,
    stroke: 'none',
    strokeWidth: 2,
    strokeOpacity: 1,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
}

/**
 * Convert transform object to SVG transform string
 */
function transformToString(transform: Transform): string {
  const parts: string[] = [];
  
  if (transform.translateX !== 0 || transform.translateY !== 0) {
    parts.push(`translate(${transform.translateX},${transform.translateY})`);
  }
  
  if (transform.rotation !== 0) {
    parts.push(`rotate(${transform.rotation})`);
  }
  
  if (transform.scaleX !== 1 || transform.scaleY !== 1) {
    parts.push(`scale(${transform.scaleX},${transform.scaleY})`);
  }
  
  if (transform.skewX) {
    parts.push(`skewX(${transform.skewX})`);
  }
  
  if (transform.skewY) {
    parts.push(`skewY(${transform.skewY})`);
  }
  
  return parts.join(' ');
}

/**
 * Parse transform string to transform object
 */
function parseTransform(transformStr: string): Transform | undefined {
  if (!transformStr) return undefined;
  
  const transform: Transform = {
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  };
  
  // Basic parsing - could be enhanced
  const translateMatch = transformStr.match(/translate\(([^,]+),([^)]+)\)/);
  if (translateMatch) {
    transform.translateX = parseFloat(translateMatch[1]);
    transform.translateY = parseFloat(translateMatch[2]);
  }
  
  const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/);
  if (rotateMatch) {
    transform.rotation = parseFloat(rotateMatch[1]);
  }
  
  const scaleMatch = transformStr.match(/scale\(([^,]+),([^)]+)\)/);
  if (scaleMatch) {
    transform.scaleX = parseFloat(scaleMatch[1]);
    transform.scaleY = parseFloat(scaleMatch[2]);
  }
  
  return transform;
}

/**
 * Parse attribute value to appropriate type
 */
function parseAttributeValue(value: string): string | number {
  const num = parseFloat(value);
  if (!isNaN(num) && isFinite(num)) {
    return num;
  }
  return value;
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Calculate angle between two points (in degrees)
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
}

/**
 * Constrain angle to nearest 45 degree increment
 */
export function constrainAngle(degrees: number, increment: number = 45): number {
  return Math.round(degrees / increment) * increment;
}

/**
 * Calculate center point between two points
 */
export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}
