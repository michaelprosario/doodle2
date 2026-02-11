# Epic 3: SVG Drawing Tools - Implementation Tasks

## Overview
Epic 3 implements comprehensive vector drawing capabilities, enabling users to create SVG-based animations with various shape tools, path tools, and styling options. This epic builds on the canvas infrastructure from Epic 1 & 2 to provide a robust drawing experience.

## Technical Approach

### Architecture Decisions
1. **Tool Architecture**: Strategy pattern for tool implementations with a unified tool interface
2. **SVG Manipulation**: Direct SVG DOM manipulation for real-time drawing and editing
3. **Tool State Management**: Dedicated service for active tool, properties, and tool state
4. **Event Handling**: Mouse/touch event system with coordinate transformation (screen to canvas space)
5. **Property Management**: Centralized style/property service with observables for reactive updates
6. **Path Editing**: Bezier curve manipulation with control point handles
7. **Color Management**: RGB/HSL/Hex color system with opacity controls
8. **Undo Integration**: All drawing operations integrate with history service

### Data Models

#### SVG Element Model
```typescript
interface SVGElement {
  id: string;              // UUID
  type: 'rect' | 'circle' | 'ellipse' | 'line' | 'polyline' | 'polygon' | 'path' | 'text';
  attributes: SVGAttributes;
  transform?: Transform;
  createdAt: Date;
  updatedAt: Date;
}

interface SVGAttributes {
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
  
  // Shape-specific attributes
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
  
  // Ellipse
  // cx, cy (above)
  // rx, ry (above)
  
  // Line
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  
  // Polyline/Polygon
  points?: string;         // space-separated coordinate pairs
  
  // Path
  d?: string;              // path data
}

interface Transform {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;        // degrees
  skewX?: number;
  skewY?: number;
}
```

#### Tool Configuration Models
```typescript
interface DrawingTool {
  id: string;
  name: string;
  type: ToolType;
  icon: string;            // icon name or SVG
  shortcut?: string;       // keyboard shortcut (e.g., 'R' for rectangle)
  cursor?: string;         // CSS cursor style
}

type ToolType = 
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

interface ToolState {
  activeTool: ToolType;
  isDrawing: boolean;
  startPoint?: Point;
  currentPoint?: Point;
  previewElement?: SVGElement;
  pathPoints?: Point[];    // for multi-point tools
}

interface Point {
  x: number;
  y: number;
}

interface BezierPoint extends Point {
  handleIn?: Point;        // Control point for incoming curve
  handleOut?: Point;       // Control point for outgoing curve
}
```

#### Drawing Properties Model
```typescript
interface DrawingProperties {
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

interface GradientStop {
  offset: number;          // 0.0-1.0
  color: string;
  opacity: number;
}

interface ColorState {
  primary: string;         // Current fill/main color
  secondary: string;       // Current stroke color
  recentColors: string[];  // Last 10 used colors
  palette: ColorPalette;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}
```

## Implementation Tasks

### Phase 1: Core Infrastructure (Tasks 1-6)

**Task 1: Create SVG Element Model & Utilities**
- [ ] Update `src/app/models/frame.model.ts` to use detailed SVGElement type
- [ ] Create `src/app/models/svg-element.model.ts` with all interfaces
- [ ] Create `src/app/utils/svg-utils.ts` with helper functions:
  - `createSVGElement(type: string, attributes: SVGAttributes): SVGElement`
  - `updateSVGElement(element: SVGElement, attributes: Partial<SVGAttributes>): void`
  - `svgElementToDOM(element: SVGElement): SVGElement` (convert to actual SVG DOM)
  - `domToSVGElement(domElement: SVGElement): SVGElement` (convert from DOM to model)
  - `cloneSVGElement(element: SVGElement): SVGElement`
  - `serializeSVGElement(element: SVGElement): string`
- [ ] Add coordinate transformation utilities (screen to canvas space)
- [ ] Add bounding box calculation utilities

**Task 2: Create Drawing Properties Service**
- [ ] Create `src/app/services/drawing-properties.service.ts`
- [ ] Manage current drawing properties state with observable
- [ ] Methods:
  - `getProperties(): Observable<DrawingProperties>`
  - `updateProperties(props: Partial<DrawingProperties>): void`
  - `setFillColor(color: string): void`
  - `setStrokeColor(color: string): void`
  - `setStrokeWidth(width: number): void`
  - `setFillOpacity(opacity: number): void`
  - `setStrokeOpacity(opacity: number): void`
  - `setStrokeStyle(style: string): void`
  - `toggleFill(): void`
  - `toggleStroke(): void`
  - `getDefaultProperties(): DrawingProperties`
  - `resetToDefaults(): void`
  - `savev(): void`
  - `loadPreset(presetId: string): void`
- [ ] Implement property presets (5-10 common styles)
- [ ] Persist last used properties to localStorage

**Task 3: Create Color Service**
- [ ] Create `src/app/services/color.service.ts`
- [ ] Manage color state and palettes
- [ ] Methods:
  - `getPrimaryColor(): Observable<string>`
  - `getSecondaryColor(): Observable<string>`
  - `setPrimaryColor(color: string): void`
  - `setSecondaryColor(color: string): void`
  - `swapColors(): void`
  - `addToRecent(color: string): void`
  - `getRecentColors(): string[]`
  - `createPalette(name: string, colors: string[]): ColorPalette`
  - `getPalettes(): ColorPalette[]`
  - `loadPalette(paletteId: string): void`
  - `savePalette(palette: ColorPalette): void`
  - `deletePalette(paletteId: string): void`
- [ ] Color conversion utilities (hex to RGB, RGB to HSL, etc.)
- [ ] Implement default color palettes (Material, Flat, Pastel)
- [ ] Recent colors tracking (last 20 colors)

**Task 4: Create Tool Service**
- [ ] Create `src/app/services/tool.service.ts`
- [ ] Manage active tool and tool state
- [ ] Methods:
  - `getActiveTool(): Observable<ToolType>`
  - `setActiveTool(tool: ToolType): void`
  - `getToolState(): Observable<ToolState>`
  - `updateToolState(state: Partial<ToolState>): void`
  - `startDrawing(point: Point): void`
  - `continueDrawing(point: Point): void`
  - `endDrawing(point: Point): void`
  - `cancelDrawing(): void`
  - `getTools(): DrawingTool[]`
  - `getToolByShortcut(key: string): DrawingTool | null`
- [ ] Register all available tools with metadata
- [ ] Handle tool switching and cleanup
- [ ] Cursor management for different tools

**Task 5: Create Drawing Engine Service**
- [ ] Create `src/app/services/drawing-engine.service.ts`
- [ ] Core drawing logic and SVG generation
- [ ] Methods:
  - `drawShape(type: ToolType, startPoint: Point, endPoint: Point, properties: DrawingProperties): SVGElement`
  - `updateShapePreview(element: SVGElement, currentPoint: Point): void`
  - `finalizeShape(element: SVGElement): SVGElement`
  - `addElementToFrame(frameId: string, element: SVGElement): void`
  - `removeElementFromFrame(frameId: string, elementId: string): void`
  - `updateElement(frameId: string, elementId: string, attributes: Partial<SVGAttributes>): void`
- [ ] Shape generation for all basic shapes
- [ ] Live preview during drawing
- [ ] Integration with FrameService to persist elements

**Task 6: Enhance Canvas Component for Drawing**
- [ ] Update `src/app/components/canvas/canvas.component.ts`
- [ ] Add mouse event handlers:
  - `onMouseDown(event: MouseEvent): void`
  - `onMouseMove(event: MouseEvent): void`
  - `onMouseUp(event: MouseEvent): void`
  - `onMouseLeave(event: MouseEvent): void`
- [ ] Add touch event handlers for mobile/tablet support
- [ ] Coordinate transformation (screen to canvas SVG coordinates)
- [ ] SVG preview layer for drawing in progress
- [ ] Cursor updates based on active tool
- [ ] Right-click context menu prevention during drawing
- [ ] Zoom/pan interaction (should not interfere with drawing)

---

### Phase 2: Basic Shape Tools (Tasks 7-12)

**Task 7: Implement Rectangle Tool**
- [ ] Create `src/app/services/tools/rectangle-tool.service.ts`
- [ ] Implement click-drag rectangle drawing
- [ ] Support for:
  - Normal rectangle (drag from corner to corner)
  - Shift-constrain for squares
  - Alt-draw from center
  - Corner radius support (optional)
- [ ] Live preview with dotted outline
- [ ] Apply current drawing properties (fill, stroke)
- [ ] Add to frame on mouse up

**Task 8: Implement Circle/Ellipse Tool**
- [ ] Create `src/app/services/tools/circle-tool.service.ts`
- [ ] Implement click-drag circle/ellipse drawing
- [ ] Support for:
  - Ellipse mode (default): drag to define bounds
  - Circle mode (with Shift): constrained to equal radii
  - Alt-draw from center
- [ ] Live preview
- [ ] Apply drawing properties

**Task 9: Implement Line Tool**
- [ ] Create `src/app/services/tools/line-tool.service.ts`
- [ ] Implement click-drag straight line drawing
- [ ] Support for:
  - Shift-constrain to 45° angles (0°, 45°, 90°, 135°, 180°)
  - Arrow heads (optional enhancement)
- [ ] Live preview with current stroke properties
- [ ] No fill for line tool

**Task 10: Implement Polygon Tool**
- [ ] Create `src/app/services/tools/polygon-tool.service.ts`
- [ ] UI for specifying number of sides (3-20)
- [ ] Click-drag to define size
- [ ] Support for:
  - Regular polygons (equal sides and angles)
  - Rotation during creation (mouse movement)
  - Shift-constrain rotation to 15° increments
- [ ] Live preview
- [ ] Apply drawing properties

**Task 11: Implement Star Tool**
- [ ] Create `src/app/services/tools/star-tool.service.ts`
- [ ] UI for specifying:
  - Number of points (3-20, default 5)
  - Inner radius ratio (0.2-0.9, default 0.5)
- [ ] Click-drag to define outer radius
- [ ] Rotation support similar to polygon
- [ ] Live preview
- [ ] Apply drawing properties

**Task 12: Implement Triangle Tool**
- [ ] Create `src/app/services/tools/triangle-tool.service.ts`
- [ ] Multiple triangle modes:
  - Equilateral (default)
  - Right angle
  - Isosceles
- [ ] Click-drag to define size
- [ ] Rotation support
- [ ] Live preview
- [ ] Apply drawing properties

---

### Phase 3: Path & Freehand Tools (Tasks 13-17)

**Task 13: Implement Pencil/Freehand Tool**
- [ ] Create `src/app/services/tools/pencil-tool.service.ts`
- [ ] Capture mouse path points during drag
- [ ] Path smoothing algorithm:
  - Catmull-Rom spline or Bezier curve fitting
  - Simplification to reduce point count (Douglas-Peucker algorithm)
  - Smoothness parameter (adjustable)
- [ ] Real-time path rendering during drawing
- [ ] Convert to SVG path element on mouse up
- [ ] Apply stroke properties (no fill by default)
- [ ] Pressure sensitivity support (for devices that support it)

**Task 14: Implement Brush Tool**
- [ ] Create `src/app/services/tools/brush-tool.service.ts`
- [ ] Similar to pencil but with variable width
- [ ] Brush settings:
  - Size (min/max width)
  - Hardness/softness
  - Opacity
  - Taper (start/end tapering)
- [ ] Variable width stroke implementation:
  - Multiple overlapping circles
  - SVG filter effects for soft edges
  - Path with stroke-width variations
- [ ] Pressure sensitivity for width variation
- [ ] Real-time preview

**Task 15: Implement Pen Tool (Bezier)**
- [ ] Create `src/app/services/tools/pen-tool.service.ts`
- [ ] Click to add anchor points
- [ ] Drag handles to create curves (Bezier control points)
- [ ] Path building state machine:
  - Open path mode (default)
  - Closed path mode (click on first point to close)
- [ ] Handle manipulation:
  - Smooth handles (mirrored)
  - Corner handles (independent)
  - Convert between smooth/corner
- [ ] Path preview as user adds points
- [ ] Enter key or double-click to finalize path
- [ ] Escape key to cancel
- [ ] Apply stroke properties

**Task 16: Implement Path Editing**
- [ ] Create `src/app/services/tools/path-edit-tool.service.ts`
- [ ] Select existing path elements
- [ ] Display anchor points and control handles
- [ ] Edit operations:
  - Move anchor points (drag)
  - Adjust control handles (drag)
  - Add point to path (click on segment)
  - Delete point from path (click point + Delete)
  - Convert point type (smooth ↔ corner)
  - Split path at point
  - Join two paths
- [ ] Visual feedback:
  - Anchor points as circles
  - Control handles as lines with endpoint circles
  - Highlight on hover
- [ ] Live path updates during editing

**Task 17: Path Utility Functions**
- [ ] Create `src/app/utils/path-utils.ts`
- [ ] Path parsing: `parseSVGPath(d: string): PathCommand[]`
- [ ] Path building: `buildPathString(commands: PathCommand[]): string`
- [ ] Path simplification: `simplifyPath(points: Point[], tolerance: number): Point[]`
- [ ] Path smoothing: `smoothPath(points: Point[], smoothness: number): BezierPoint[]`
- [ ] Bezier interpolation utilities
- [ ] Point-on-path calculations
- [ ] Path length calculations
- [ ] Bounding box from path data

---

### Phase 4: Drawing Properties UI (Tasks 18-22)

**Task 18: Create Color Picker Component**
- [ ] Create `src/app/components/shared/color-picker/color-picker.component.ts`
- [ ] Color selection modes:
  - Hue + saturation/lightness square
  - RGB sliders
  - HSL sliders
  - Hex input field
  - Opacity slider
- [ ] Visual color preview (current + previous)
- [ ] Recent colors palette (clickable swatches)
- [ ] Preset color palettes dropdown
- [ ] Input validation for hex codes
- [ ] Emit color changes to ColorService
- [ ] Responsive design (collapsible for small screens)

**Task 19: Create Stroke Properties Panel**
- [ ] Create `src/app/components/shared/stroke-properties/stroke-properties.component.ts`
- [ ] Stroke width slider (1-50px) with numeric input
- [ ] Stroke opacity slider (0-100%) with numeric input
- [ ] Stroke style selector:
  - Solid (default)
  - Dashed (multiple dash patterns)
  - Dotted
  - None
- [ ] Linecap selector (butt, round, square) with visual icons
- [ ] Linejoin selector (miter, round, bevel) with visual icons
- [ ] Color picker integration for stroke color
- [ ] Live preview of stroke settings
- [ ] Bind to DrawingPropertiesService

**Task 20: Create Fill Properties Panel**
- [ ] Create `src/app/components/shared/fill-properties/fill-properties.component.ts`
- [ ] Fill type selector:
  - Solid color (default)
  - None
  - Gradient (future enhancement)
  - Pattern (future enhancement)
- [ ] Fill opacity slider (0-100%) with numeric input
- [ ] Color picker integration for fill color
- [ ] None/solid toggle button
- [ ] Live preview circle/square showing current fill
- [ ] Bind to DrawingPropertiesService

**Task 21: Create Tool Options Panel**
- [ ] Create `src/app/components/shared/tool-options/tool-options.component.ts`
- [ ] Dynamic options based on active tool:
  - Polygon: number of sides
  - Star: points count, inner radius ratio
  - Pencil: smoothness level
  - Brush: size, hardness, taper
  - Path editing: snap to grid, angle constraints
- [ ] Conditional rendering based on ToolService.activeTool
- [ ] Preset buttons for common configurations
- [ ] Remember last-used settings per tool

**Task 22: Create Main Drawing Toolbar**
- [ ] Create `src/app/components/shared/drawing-toolbar/drawing-toolbar.component.ts`
- [ ] Vertical toolbar component for left sidebar
- [ ] Tool buttons with icons:
  - Selection tool (for Epic 4 integration)
  - Rectangle, Circle, Line
  - Polygon, Star, Triangle
  - Pen, Pencil, Brush
  - Eraser (future)
  - Eyedropper (future)
  - Pan/Hand tool
- [ ] Active tool highlighting
- [ ] Tooltips with tool names and shortcuts
- [ ] Keyboard shortcut handling (delegate to KeyboardShortcutService)
- [ ] Tool grouping/categories (shapes, paths, etc.)
- [ ] Collapsible mode for more canvas space

---

### Phase 5: Advanced Drawing Features (Tasks 23-25)

**Task 23: Implement Eyedropper Tool**
- [ ] Create `src/app/services/tools/eyedropper-tool.service.ts`
- [ ] Click on canvas element to sample color
- [ ] Show preview of color under cursor
- [ ] Sample options:
  - Fill color
  - Stroke color
  - All properties (fill + stroke + width)
- [ ] Apply sampled color to current tool properties
- [ ] Keyboard shortcut toggle (Alt key while other tool active)
- [ ] Magnifier zoom preview for precise sampling
- [ ] Sample from anywhere on screen (if browser allows)

**Task 24: Implement Eraser Tool (Basic)**
- [ ] Create `src/app/services/tools/eraser-tool.service.ts`
- [ ] Click on elements to delete them entirely
- [ ] Visual feedback:
  - Highlight element under cursor
  - Cursor indicates delete action
- [ ] Eraser modes:
  - Delete entire element (click)
  - Path segment eraser (drag over path portions - advanced)
- [ ] Undo integration for deleted elements
- [ ] Confirmation for locked/important elements

**Task 25: Gradient Support (Foundation)**
- [ ] Create `src/app/models/gradient.model.ts`
- [ ] Create `src/app/services/gradient.service.ts`
- [ ] Gradient types:
  - Linear gradient
  - Radial gradient
- [ ] Gradient editor component (basic):
  - Add/remove color stops
  - Adjust stop positions
  - Color picker for each stop
  - Gradient angle (linear) or focus (radial)
- [ ] SVG gradient definition generation
- [ ] Apply gradient as fill to elements
- [ ] Gradient presets library
- [ ] Note: Full gradient editor can be Epic 9 enhancement

---

### Phase 6: Integration & Polish (Tasks 26-30)

**Task 26: Keyboard Shortcuts for Tools**
- [ ] Update `src/app/services/keyboard-shortcut.service.ts`
- [ ] Register tool shortcuts:
  - `V` - Selection tool
  - `R` - Rectangle tool
  - `C` - Circle/Ellipse tool
  - `L` - Line tool
  - `P` - Pen tool (Bezier)
  - `N` - Pencil tool
  - `B` - Brush tool
  - `E` - Eraser tool
  - `I` - Eyedropper tool
  - `H` or `Space` - Pan tool
  - `X` - Swap fill/stroke colors
  - `D` - Reset to default colors (black fill, no stroke)
  - `/` - Toggle fill/stroke
- [ ] Number keys for quick property access:
  - `1-9` - Opacity levels (10%-90%)
  - `0` - 100% opacity
  - `[` / `]` - Decrease/increase brush size
- [ ] Modifier key support:
  - `Shift` - Constrain proportions/angles
  - `Alt` - Draw from center / eyedropper toggle
  - `Ctrl` - Duplicate mode (Epic 4)

**Task 27: Drawing Performance Optimization**
- [ ] Implement debouncing for property updates
- [ ] Optimize SVG rendering during real-time drawing:
  - Use canvas buffer for preview, swap to SVG on complete
  - Throttle mouse move events (every 10-20ms)
  - Simplify preview paths during drawing
- [ ] Lazy loading for complex path rendering
- [ ] Viewport culling for off-screen elements
- [ ] Element pooling for repeated shape creation
- [ ] Performance monitoring for draw operations

**Task 28: Drawing Tool Testing**
- [ ] Unit tests for each tool service:
  - Rectangle, Circle, Line, Polygon, Star, Triangle
  - Pen, Pencil, Brush
  - Eyedropper, Eraser
- [ ] Test SVG element generation with various properties
- [ ] Test coordinate transformation functions
- [ ] Test path utilities (parsing, simplifying, smoothing)
- [ ] Integration tests for tool switching
- [ ] Test undo/redo with drawing operations
- [ ] Test drawing properties persistence
- [ ] User acceptance testing for drawing experience

**Task 29: Accessibility for Drawing Tools**
- [ ] ARIA labels for all tool buttons
- [ ] Keyboard-only tool switching
- [ ] Screen reader announcements for:
  - Active tool changes
  - Drawing actions (element created, deleted)
  - Property updates
- [ ] High contrast mode for tool UI
- [ ] Focus indicators for all interactive elements
- [ ] Alternative input methods (keyboard drawing)

**Task 30: Documentation & Examples**
- [ ] Create `docs/drawing-tools.md` with:
  - Overview of drawing system architecture
  - Guide for adding new tools
  - Tool API reference
  - Property system documentation
- [ ] Create example templates with pre-drawn elements
- [ ] Video tutorial: Using drawing tools
- [ ] Interactive tool hints in UI (first-time user guide)
- [ ] JSDoc comments for all public APIs
- [ ] Architecture decision records (ADRs) for major decisions

---

## Testing Strategy

### Unit Tests
- Each tool service with isolated tests
- SVG utility functions with edge cases
- Color conversion and validation
- Path parsing and generation
- Property service state management

### Integration Tests
- Tool switching and state cleanup
- Drawing → Frame → Storage pipeline
- Undo/redo with drawing operations
- Property changes applied to elements
- Keyboard shortcuts triggering tools

### E2E Tests
- Complete drawing workflows:
  - Draw rectangle, change color, add circle
  - Draw freehand path, edit with pen tool
  - Sample color with eyedropper, apply to shape
- Multi-frame drawing (draw on frame 1, new frame, draw more)
- Drawing properties persistence across sessions

### Performance Tests
- Drawing responsiveness with 100+ elements
- Path smoothing performance with long strokes
- Real-time preview rendering lag
- Memory usage with complex scenes

---

## Dependencies & Prerequisites

### Before Starting Epic 3
- ✅ Canvas component must be functional (Epic 1)
- ✅ Frame service must support element storage (Epic 2)
- ✅ Basic keyboard shortcut service (Epic 2)

### External Libraries to Consider
- **d3-path**: For advanced path operations (optional)
- **paper.js**: Comprehensive vector graphics library (alternative approach)
- **@svgdotjs/svg.js**: SVG manipulation library (alternative)
- **bezier-js**: Bezier curve utilities for pen tool
- **color**: Color manipulation utilities
- Decision: Prefer native implementation first, add libraries only if needed

---

## Acceptance Criteria

### For Phase 1-2 (Basic Shapes)
- [ ] User can select rectangle tool and draw rectangles with mouse
- [ ] User can draw circles, lines, and basic polygons
- [ ] Shapes display with configured fill and stroke properties
- [ ] Shapes are saved to current frame and persist on reload

### For Phase 3 (Paths)
- [ ] User can draw smooth freehand strokes with pencil tool
- [ ] User can create bezier curves with pen tool
- [ ] Paths are smooth and visually appealing
- [ ] Pen tool control handles are interactive

### For Phase 4 (Properties)
- [ ] User can change fill and stroke colors via color picker
- [ ] Stroke width changes are immediately reflected
- [ ] Opacity controls work for both fill and stroke
- [ ] Recent colors are tracked and accessible

### For Phase 5 (Advanced)
- [ ] Eyedropper samples colors from existing elements
- [ ] Eraser deletes elements on click
- [ ] Basic gradient fills can be applied

### For Phase 6 (Polish)
- [ ] All keyboard shortcuts work as documented
- [ ] Drawing is responsive with no noticeable lag
- [ ] Tools pass automated test suite
- [ ] Documentation is complete and accurate

---

## Timeline Estimate

- **Phase 1**: Core Infrastructure (4-6 days)
- **Phase 2**: Basic Shape Tools (4-5 days)
- **Phase 3**: Path & Freehand Tools (6-8 days)
- **Phase 4**: Properties UI (4-5 days)
- **Phase 5**: Advanced Features (3-4 days)
- **Phase 6**: Integration & Polish (4-5 days)

**Total Estimate**: 25-33 days

---

## Future Enhancements (Post-Epic 3)

1. **Advanced Brush Engine**: Custom brush shapes, texture brushes
2. **Shape Libraries**: Pre-made shape collections (arrows, icons, etc.)
3. **Pattern Fills**: Repeating patterns as fills
4. **Text Tool**: SVG text elements with font selection (separate epic)
5. **Image Import**: Place raster images on canvas (separate epic)
6. **Vector Tracing**: Convert raster images to vector paths
7. **Boolean Operations**: Union, intersect, subtract shapes (Epic 4)
8. **Smart Guides**: Snapping and alignment helpers (Epic 4)
9. **Blob Brush**: Organic shaped strokes
10. **Calligraphy Pen**: Angle-sensitive stroke width
