import { SVGElementModel, Point } from '../models/svg-element.model';
import { Rect } from '../models/selection.model';

export interface HitResult {
  id: string;
  bounds: Rect;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function normalizeRect(start: Point, end: Point): Rect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return { x, y, width, height };
}

export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function rectIntersectsRect(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

export function getElementBounds(element: SVGElementModel | any): Rect | null {
  if (!element) return null;
  const type = element.type;
  const attributes = element.attributes || element.properties || {};

  if (type === 'polygon' || type === 'polyline') {
    const points = parsePoints(attributes.points);
    if (points.length === 0) return null;
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  if (type === 'path' && attributes.d) {
    const bounds = getPathBounds(attributes.d);
    if (bounds) return bounds;
  }

  const basicBounds = getBoundsFromAttributes(type, attributes);
  if (basicBounds) return basicBounds;

  return null;
}

export function getSelectionBounds(elements: (SVGElementModel | any)[]): Rect | undefined {
  const boundsList = elements
    .map(element => getElementBounds(element))
    .filter((bounds): bounds is Rect => !!bounds);

  if (boundsList.length === 0) return undefined;

  const minX = Math.min(...boundsList.map(b => b.x));
  const minY = Math.min(...boundsList.map(b => b.y));
  const maxX = Math.max(...boundsList.map(b => b.x + b.width));
  const maxY = Math.max(...boundsList.map(b => b.y + b.height));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function hitTestElements(point: Point, elements: (SVGElementModel | any)[]): HitResult | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (!isSelectableElement(element)) {
      continue;
    }
    const bounds = getElementBounds(element);
    if (!bounds) {
      continue;
    }
    if (pointInRect(point, bounds)) {
      if (element.id) {
        return { id: element.id, bounds };
      }
    }
  }
  return null;
}

export function getElementsInRect(rect: Rect, elements: (SVGElementModel | any)[]): string[] {
  const ids: string[] = [];
  elements.forEach(element => {
    if (!isSelectableElement(element)) {
      return;
    }
    const bounds = getElementBounds(element);
    if (!bounds) {
      return;
    }
    if (rectIntersectsRect(rect, bounds) && element.id) {
      ids.push(element.id);
    }
  });
  return ids;
}

export function isSelectableElement(element: any): boolean {
  if (!element) return false;
  if (element.hidden === true || element.locked === true) return false;
  if (element.attributes?.display === 'none') return false;
  return true;
}

function parsePoints(points?: string): Point[] {
  if (!points) return [];
  return points
    .trim()
    .split(/\s+/)
    .map(pair => {
      const [x, y] = pair.split(',').map(value => parseFloat(value));
      if (Number.isNaN(x) || Number.isNaN(y)) return null;
      return { x, y };
    })
    .filter((point): point is Point => !!point);
}

function getPathBounds(d: string): Rect | null {
  if (typeof document === 'undefined') return null;
  try {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    const bounds = path.getBBox();
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    };
  } catch {
    return null;
  }
}

function getBoundsFromAttributes(type: string, attributes: Record<string, any>): Rect | null {
  switch (type) {
    case 'rect':
      return {
        x: attributes['x'] ?? 0,
        y: attributes['y'] ?? 0,
        width: attributes['width'] ?? 0,
        height: attributes['height'] ?? 0
      };
    case 'circle': {
      const r = attributes['r'] ?? 0;
      return {
        x: (attributes['cx'] ?? 0) - r,
        y: (attributes['cy'] ?? 0) - r,
        width: r * 2,
        height: r * 2
      };
    }
    case 'ellipse': {
      const rx = attributes['rx'] ?? 0;
      const ry = attributes['ry'] ?? 0;
      return {
        x: (attributes['cx'] ?? 0) - rx,
        y: (attributes['cy'] ?? 0) - ry,
        width: rx * 2,
        height: ry * 2
      };
    }
    case 'line': {
      const x1 = attributes['x1'] ?? 0;
      const y1 = attributes['y1'] ?? 0;
      const x2 = attributes['x2'] ?? 0;
      const y2 = attributes['y2'] ?? 0;
      return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1)
      };
    }
    default:
      return null;
  }
}
