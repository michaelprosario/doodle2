export type SVGElementType = 
  | 'rect' 
  | 'circle' 
  | 'ellipse' 
  | 'line' 
  | 'polyline' 
  | 'polygon' 
  | 'path' 
  | 'text';

export interface SVGAttributes {
  // Common attributes
  fill?: string;           // color (hex, rgb, rgba, gradient id)
  fillOpacity?: number;    // 0.0-1.0
  stroke?: string;         // color
  strokeWidth?: number;    // 1-50px
  strokeOpacity?: number;  // 0.0-1.0
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  strokeDasharray?: string; // for dashed lines
  opacity?: number;        // overall opacity
  
  // Rectangle
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;             // corner radius
  ry?: number;
  
  // Circle
  cx?: number;
  cy?: number;
  r?: number;
  
  // Ellipse (uses cx, cy, rx, ry from above)
  
  // Line
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  
  // Polyline/Polygon
  points?: string;         // space-separated coordinate pairs
  
  // Path
  d?: string;              // path data
  
  // Text
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAnchor?: 'start' | 'middle' | 'end';
}

export interface Transform {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;        // degrees
  skewX?: number;
  skewY?: number;
}

export interface SVGElementModel {
  id: string;              // UUID
  type: SVGElementType;
  attributes: SVGAttributes;
  transform?: Transform;
  createdAt: Date;
  updatedAt: Date;
}

export interface Point {
  x: number;
  y: number;
}

export interface BezierPoint extends Point {
  handleIn?: Point;        // Control point for incoming curve
  handleOut?: Point;       // Control point for outgoing curve
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Tool configuration models
export type ToolType = 
  | 'select'               // Selection tool (Epic 4)
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'polygon'
  | 'star'
  | 'triangle'
  | 'pen'                  // Bezier pen tool
  | 'pencil'               // Freehand drawing
  | 'brush'
  | 'eraser'
  | 'eyedropper'
  | 'pan';                 // Hand/pan tool

export interface DrawingTool {
  id: string;
  name: string;
  type: ToolType;
  icon: string;            // icon name or SVG
  shortcut?: string;       // keyboard shortcut (e.g., 'R' for rectangle)
  cursor?: string;         // CSS cursor style
}

export interface ToolState {
  activeTool: ToolType;
  isDrawing: boolean;
  startPoint?: Point;
  currentPoint?: Point;
  previewElement?: SVGElementModel;
  pathPoints?: Point[];    // for multi-point tools
}

// Drawing properties models
export interface DrawingProperties {
  // Fill properties
  fill: string;            // 'none' or color value
  fillOpacity: number;
  fillType: 'solid' | 'gradient' | 'none';
  
  // Stroke properties
  stroke: string;          // 'none' or color value
  strokeWidth: number;
  strokeOpacity: number;
  strokeType: 'solid' | 'dashed' | 'dotted' | 'none';
  strokeLinecap: 'butt' | 'round' | 'square';
  strokeLinejoin: 'miter' | 'round' | 'bevel';
  strokeDasharray?: string;
  
  // Gradient properties (for future)
  gradient?: {
    type: 'linear' | 'radial';
    stops: GradientStop[];
  };
}

export interface GradientStop {
  offset: number;          // 0.0-1.0
  color: string;
  opacity: number;
}

export interface ColorState {
  primary: string;         // Current fill/main color
  secondary: string;       // Current stroke color
  recentColors: string[];  // Last 10 used colors
  palette: ColorPalette;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}
