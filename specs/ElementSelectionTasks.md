# Epic 4: Element Selection & Manipulation - Implementation Tasks

## Overview
Epic 4 implements selection, transformation, and arrangement of SVG elements on the canvas. This adds an interactive selection layer, transformation handles, and layer/arrangement tools that operate on elements within a frame.

## Technical Approach

### Architecture Decisions
1. **Selection Layer**: Separate overlay la\yer for selection UI (bounding box, handles) without mutating SVG elements until confirmed.
2. **Transform Pipeline**: Transform matrix applied to selected elements using a centralized transform utility and immutable element updates.
3. **Interaction Model**: Pointer-driven interactions (mouse/touch) with hit-testing that respects element visibility/lock state.
4. **Selection State**: Dedicated service to track selected element IDs, bounding boxes, and active transform mode.
5. **Layer Control**: Z-order managed via element array ordering in each frame with helper functions for reordering.
6. **Keyboard Support**: Global shortcuts for selection, movement, and duplication integrated with existing shortcut service.
7. **Undo Integration**: All selection edits and transforms routed through history service for undo/redo.

### Data Models

#### Selection State Model
```typescript
interface SelectionState {
  selectedIds: string[];
  selectionBounds?: Rect; // union bounds of selected elements
  activeHandle?: TransformHandle;
  activeMode: 'idle' | 'move' | 'scale' | 'rotate' | 'box-select';
  isDragging: boolean;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type TransformHandle =
  | 'n' | 's' | 'e' | 'w'
  | 'ne' | 'nw' | 'se' | 'sw'
  | 'rotate';
```

#### Layer State Model
```typescript
interface LayerEntry {
  id: string;
  name?: string;
  type: string; // matches SVGElement.type
  locked?: boolean;
  hidden?: boolean;
  order: number; // z-index, 0 = back
}
```

## Implementation Tasks

### Phase 1: Selection Infrastructure (Tasks 1-6)

**Task 1: Create Selection Utilities**
- [ ] Create `src/app/utils/selection-utils.ts`
- [ ] Add hit-testing helpers for SVG elements
- [ ] Add bounding box union utilities for multiple elements
- [ ] Add selection box geometry helpers (point-in-rect, rect-intersects-rect)
- [ ] Add transform handle hit-testing helpers

**Task 2: Create Selection State Service**
- [ ] Create `src/app/services/selection.service.ts`
- [ ] Manage selection state with BehaviorSubject/Signal
- [ ] Methods:
  - `getSelection(): Observable<SelectionState>`
  - `setSelection(ids: string[]): void`
  - `toggleSelection(id: string): void`
  - `clearSelection(): void`
  - `setActiveMode(mode: SelectionState['activeMode']): void`
  - `setSelectionBounds(bounds?: Rect): void`
- [ ] Track selected elements per frame
- [ ] Ignore locked/hidden elements when selecting

**Task 3: Add Selection Overlay Component**
- [ ] Create `src/app/components/selection/selection-overlay.component.ts`
- [ ] Render selection bounds and resize/rotate handles
- [ ] Display active selection state (single vs multi)
- [ ] Render selection box for drag-select
- [ ] Hook into Canvas component with absolute positioning

**Task 4: Implement Canvas Hit-Testing**
- [ ] Update `src/app/components/canvas/canvas.component.ts`
- [ ] Add hit-testing on pointer down to select elements
- [ ] Support multi-select with Shift/Ctrl
- [ ] Support click-away to clear selection
- [ ] Support drag-select (marquee selection)

**Task 5: Add Selection Shortcuts**
- [ ] Update `src/app/services/keyboard-shortcut.service.ts`
- [ ] Add shortcuts:
  - `Ctrl+A` select all
  - `Esc` clear selection
  - Arrow keys move 1px (10px with Shift)
- [ ] Prevent conflicts with drawing tools

**Task 6: Integrate Selection with Frame Model**
- [ ] Ensure frame elements expose stable IDs for selection
- [ ] Update SVG element rendering to apply `data-id` attributes
- [ ] Add selection state reset on frame change

---

### Phase 2: Transform Operations (Tasks 7-12)

**Task 7: Create Transform Utilities**
- [ ] Create `src/app/utils/transform-utils.ts`
- [ ] Add matrix helpers for translate/scale/rotate
- [ ] Add helpers to apply transforms to SVG attributes
- [ ] Add snapping helpers (angle and scale step)

**Task 8: Implement Move/Translate**
- [ ] Add move handler in canvas interactions
- [ ] Support drag move and arrow key nudges
- [ ] Update selected elements in frame model
- [ ] Respect element lock/hidden states

**Task 9: Implement Scale Handles**
- [ ] Handle scale for all handle directions
- [ ] Support proportional scale with Shift
- [ ] Support scale from center with Alt
- [ ] Update selection bounds live during scale

**Task 10: Implement Rotate Handle**
- [ ] Add rotation handle above selection bounds
- [ ] Display angle readout during rotation
- [ ] Support Shift snapping to 15-degree increments
- [ ] Update element transforms with rotation

**Task 11: Add Numeric Transform Inputs**
- [ ] Create `src/app/components/transform-panel/transform-panel.component.ts`
- [ ] Inputs for X, Y, W, H, Rotation
- [ ] Bind to selection state and update elements
- [ ] Disable when no selection

**Task 12: Multi-Selection Transform**
- [ ] Apply transforms to multiple selected elements
- [ ] Use group bounds for scale/rotate reference
- [ ] Keep relative positions intact

---

### Phase 3: Arrangement, Layers, and Editing (Tasks 13-19)

**Task 13: Create Layer Panel Component**
- [ ] Create `src/app/components/layers/layer-panel.component.ts`
- [ ] Render elements as layer list with order
- [ ] Click to select layer
- [ ] Drag to reorder layers

**Task 14: Implement Z-Order Commands**
- [ ] Create `src/app/utils/layer-utils.ts`
- [ ] Methods:
  - `bringToFront(ids: string[]): void`
  - `sendToBack(ids: string[]): void`
  - `bringForward(ids: string[]): void`
  - `sendBackward(ids: string[]): void`
- [ ] Update frame element ordering

**Task 15: Lock/Hide Layers**
- [ ] Add lock/unlock toggle per layer
- [ ] Add hide/show toggle per layer
- [ ] Prevent selection on locked/hidden items
- [ ] Visual indicators in canvas and layer list

**Task 16: Implement Delete/Cut/Copy/Paste**
- [ ] Add selection delete handler (Delete/Backspace)
- [ ] Add clipboard service for SVG elements
- [ ] Implement cut/copy/paste commands
- [ ] Paste at offset or cursor position

**Task 17: Implement Duplicate & Grouping**
- [ ] Add `Ctrl+D` duplicate of selection
- [ ] Add group/ungroup commands
- [ ] Group selection into SVG `<g>` element
- [ ] Preserve transform and element order

**Task 18: Add Rename and Notes**
- [ ] Support editable layer names
- [ ] Add optional notes/tags in layer panel
- [ ] Persist metadata in SVGElement model

**Task 19: Align & Distribute Tools**
- [ ] Create `src/app/components/align-panel/align-panel.component.ts`
- [ ] Align: left/center/right, top/middle/bottom
- [ ] Distribute: horizontal/vertical
- [ ] Align to canvas or selection bounds

---

### Phase 4: Testing & Polish (Tasks 20-23)

**Task 20: Selection and Transform Unit Tests**
- [ ] Add unit tests for `selection-utils.ts`
- [ ] Add unit tests for `transform-utils.ts`
- [ ] Add tests for selection service state transitions

**Task 21: Integration Tests for Canvas Interactions**
- [ ] Test click selection, box selection, and multi-select
- [ ] Test move/scale/rotate on single and multiple elements
- [ ] Test undo/redo integration

**Task 22: Accessibility & UX Polish**
- [ ] Add visible focus outlines for selected layers
- [ ] Add tooltips for selection handles and layer actions
- [ ] Add cursor changes for handles

**Task 23: Performance Checks**
- [ ] Ensure hit-testing is throttled/debounced as needed
- [ ] Validate selection overlay renders efficiently for many elements
