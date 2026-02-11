# Epic 2: Frame Management & Timeline - Implementation Tasks

## Overview
Epic 2 implements the core animation timeline functionality, enabling frame-by-frame animation workflow. This includes frame creation, manipulation, timeline interface with scrubbing, frame navigation, and onion skinning for reference drawing.

## Technical Approach

### Architecture Decisions
1. **Canvas Integration**: HTML5 Canvas or SVG-based renderer for frame display
2. **Timeline Architecture**: Virtual scrolling for performance with 1000+ frames
3. **Frame Storage**: Frames stored as SVG DOM or serialized JSON in Scene model
4. **Playback Engine**: RequestAnimationFrame-based animation loop with FPS control
5. **Onion Skin Rendering**: Layered canvas/SVG with opacity and color filters
6. **State Management**: Frame selection and navigation state via service observables
7. **Thumbnail Generation**: Canvas-to-image conversion with caching strategy

### Data Models

#### Enhanced Frame Model
```typescript
interface Frame {
  id: string;              // UUID
  sceneId: string;
  order: number;           // position in sequence (0-indexed)
  duration?: number;       // frame hold duration (default: 1)
  elements: SVGElement[];  // drawing elements (expanded in Epic 3)
  thumbnail?: string;      // base64 PNG thumbnail for timeline
  label?: string;          // optional frame label/marker
  notes?: string;          // frame-specific notes
  locked?: boolean;        // prevent editing
  visible?: boolean;       // hide from playback
  createdAt: Date;
  updatedAt: Date;
}
```

#### Timeline State Model
```typescript
interface TimelineState {
  currentFrameIndex: number;
  selectedFrameIndices: number[];
  playbackState: 'stopped' | 'playing' | 'paused';
  playbackDirection: 'forward' | 'reverse';
  playbackSpeed: number;    // multiplier (0.25 to 4.0)
  looping: boolean;
  zoomLevel: number;        // timeline zoom (0.5 to 3.0)
  scrollPosition: number;   // timeline scroll offset
}
```

#### Onion Skin Config Model
```typescript
interface OnionSkinConfig {
  enabled: boolean;
  previousFrames: number;   // 0-5 frames before
  nextFrames: number;       // 0-5 frames after
  previousOpacity: number;  // 0.0-1.0
  nextOpacity: number;      // 0.0-1.0
  previousTint: string;     // hex color (default: '#ff0000')
  nextTint: string;         // hex color (default: '#0000ff')
  mode: 'overlay' | 'split'; // display mode
}
```

## Implementation Tasks

### Phase 1: Frame Service & Core Operations (Tasks 1-6)

**Task 1: Enhance Frame Model**
- [ ] Update `src/app/models/frame.model.ts` with enhanced properties
- [ ] Add frame duration, label, lock, visible properties
- [ ] Create FrameCreateDTO and FrameUpdateDTO interfaces
- [ ] Add validation helpers (order, duration limits)

**Task 2: Create FrameService**
- [ ] Create `src/app/services/frame.service.ts`
- [ ] Implement frame CRUD operations within scenes
- [ ] Methods:
  - `createFrame(sceneId: string, data?: Partial<Frame>): Frame`
  - `getFrame(sceneId: string, frameId: string): Frame | null`
  - `getFramesByScene(sceneId: string): Frame[]`
  - `updateFrame(sceneId: string, frameId: string, data: Partial<Frame>): void`
  - `deleteFrame(sceneId: string, frameId: string): void`
  - `deleteFrames(sceneId: string, frameIds: string[]): void`
  - `duplicateFrame(sceneId: string, frameId: string): Frame`
  - `insertFrame(sceneId: string, position: number, data?: Partial<Frame>): Frame`
  - `reorderFrames(sceneId: string, frameIds: string[]): void`
- [ ] Frame counter/numbering logic
- [ ] Integration with ProjectService and SceneService

**Task 3: Create Timeline State Service**
- [ ] Create `src/app/services/timeline-state.service.ts`
- [ ] Manage timeline state with BehaviorSubject/Signal
- [ ] Methods:
  - `setCurrentFrame(index: number): void`
  - `selectFrame(index: number, multiSelect: boolean): void`
  - `selectFrameRange(startIndex: number, endIndex: number): void`
  - `clearSelection(): void`
  - `nextFrame(): void`
  - `previousFrame(): void`
  - `firstFrame(): void`
  - `lastFrame(): void`
  - `jumpToFrame(index: number): void`
  - `setPlaybackState(state: PlaybackState): void`
  - `setZoomLevel(zoom: number): void`
- [ ] Selection state management (single/multi-select)
- [ ] Observable streams for state changes

**Task 4: Create Playback Service**
- [ ] Create `src/app/services/playback.service.ts`
- [ ] Implement animation playback engine
- [ ] RequestAnimationFrame-based loop
- [ ] FPS calculation and frame timing
- [ ] Methods:
  - `play(): void`
  - `pause(): void`
  - `stop(): void`
  - `setPlaybackSpeed(speed: number): void`
  - `toggleLoop(): void`
  - `playReverse(): void`
  - `setFrameRate(fps: number): void`
- [ ] Playback state observables
- [ ] Frame range playback (start/end frames)
- [ ] Loop count support

**Task 5: Create Thumbnail Generator Service**
- [ ] Create `src/app/services/thumbnail-generator.service.ts`
- [ ] Canvas-to-image conversion
- [ ] SVG-to-canvas rendering
- [ ] Thumbnail caching strategy
- [ ] Methods:
  - `generateThumbnail(frame: Frame, width: number, height: number): Promise<string>`
  - `generateThumbnails(frames: Frame[], size: { width: number, height: number }): Promise<Map<string, string>>`
  - `cacheThumbnail(frameId: string, thumbnail: string): void`
  - `getCachedThumbnail(frameId: string): string | null`
  - `clearCache(): void`
- [ ] Background generation with Web Worker (optional)
- [ ] Debounced regeneration on frame update

**Task 6: Create Frame Manipulation Utilities**
- [ ] Create `src/app/utils/frame-utils.ts`
- [ ] Copy/paste frame helpers
- [ ] Frame data deep copy
- [ ] Frame comparison utilities
- [ ] Frame validation helpers
- [ ] Order/position calculation utilities

### Phase 2: Timeline Component (Tasks 7-12)

**Task 7: Create Timeline Container Component**
- [ ] Create `src/app/components/timeline/timeline-container.component.ts`
- [ ] Main timeline wrapper component
- [ ] Integrate TimelineStateService
- [ ] Layout: toolbar + frame strip + controls
- [ ] Responsive height adjustment
- [ ] Collapsible/expandable

**Task 8: Create Timeline Toolbar Component**
- [ ] Create `src/app/components/timeline/timeline-toolbar.component.ts`
- [ ] Frame operation buttons:
  - Add frame
  - Duplicate frame
  - Delete frame(s)
  - Insert frame
- [ ] Playback controls:
  - Play/Pause
  - Stop
  - Previous/Next frame
  - First/Last frame
- [ ] Timeline zoom controls
- [ ] Frame counter display
- [ ] Frame rate indicator

**Task 9: Create Frame Strip Component**
- [ ] Create `src/app/components/timeline/frame-strip.component.ts`
- [ ] Horizontal scrollable frame list
- [ ] Display frame thumbnails
- [ ] Virtual scrolling for performance (CDK ScrollingModule)
- [ ] Frame selection (single/multi with Ctrl/Shift)
- [ ] Current frame indicator (playhead)
- [ ] Frame numbers overlay
- [ ] Drag-and-drop reordering (CDK DragDropModule)

**Task 10: Create Frame Thumbnail Component**
- [ ] Create `src/app/components/timeline/frame-thumbnail.component.ts`
- [ ] Display frame thumbnail image
- [ ] Selection state styling
- [ ] Current frame highlight
- [ ] Frame label display
- [ ] Locked indicator icon
- [ ] Hidden frame indicator
- [ ] Click to select/navigate
- [ ] Context menu (right-click)

**Task 11: Implement Timeline Scrubbing**
- [ ] Mouse drag on frame strip to scrub
- [ ] Playhead dragging
- [ ] Smooth frame preview while scrubbing
- [ ] Snap to frame boundaries
- [ ] Visual feedback during scrub
- [ ] Touch support for mobile

**Task 12: Implement Timeline Zoom**
- [ ] Zoom in/out controls
- [ ] Thumbnail size adjustment
- [ ] Zoom levels: 0.5x, 1x, 2x, 3x
- [ ] Zoom keyboard shortcuts (Ctrl +/-)
- [ ] Maintain scroll position on zoom
- [ ] Fit timeline to container

### Phase 3: Canvas & Frame Display (Tasks 13-16)

**Task 13: Create Canvas Component**
- [ ] Create `src/app/components/canvas/canvas.component.ts`
- [ ] SVG or Canvas element container
- [ ] Frame content rendering
- [ ] Viewport management (pan/zoom)
- [ ] Responsive sizing
- [ ] Background color/transparency
- [ ] Grid overlay (optional)
- [ ] Integration with frame data

**Task 14: Create Canvas Renderer Service**
- [ ] Create `src/app/services/canvas-renderer.service.ts`
- [ ] Render SVG elements to canvas
- [ ] Clear and redraw frame content
- [ ] Layer rendering (elements by z-index)
- [ ] Transform application (translate, scale, rotate)
- [ ] Clipping and masking support
- [ ] Performance optimization (dirty rect rendering)

**Task 15: Create Project Workspace Component**
- [ ] Create `src/app/components/project-workspace/project-workspace.component.ts`
- [ ] Main workspace layout
- [ ] Canvas area (center)
- [ ] Timeline (bottom)
- [ ] Toolbar (top)
- [ ] Panels (left/right - prepare for Epic 3)
- [ ] Responsive layout with resizable panels

**Task 16: Integrate Workspace with Routing**
- [ ] Update route for `/project/:id`
- [ ] Load project and active scene
- [ ] Initialize timeline state
- [ ] Canvas setup with first frame
- [ ] Error handling for missing projects

### Phase 4: Frame Navigation & Keyboard Shortcuts (Tasks 17-19)

**Task 17: Implement Frame Navigation**
- [ ] Next frame (. key or Right Arrow)
- [ ] Previous frame (, key or Left Arrow)
- [ ] First frame (Home)
- [ ] Last frame (End)
- [ ] Jump to frame dialog (Ctrl+G)
- [ ] Page Up/Down for larger jumps (10 frames)
- [ ] Navigate during playback (pause and jump)

**Task 18: Create Keyboard Shortcut Service**
- [ ] Create `src/app/services/keyboard-shortcut.service.ts`
- [ ] Global keyboard event handling
- [ ] Shortcut registration and binding
- [ ] Context-aware shortcuts
- [ ] Prevent default browser behaviors
- [ ] Shortcuts:
  - `.` / Right Arrow: Next frame
  - `,` / Left Arrow: Previous frame
  - `Home`: First frame
  - `End`: Last frame
  - `Space`: Play/Pause
  - `Shift+Space`: Play Reverse
  - `Ctrl+D`: Duplicate frame
  - `Delete`: Delete selected frames
  - `Ctrl+G`: Jump to frame
  - `Ctrl++`/`Ctrl+-`: Timeline zoom

**Task 19: Create Jump to Frame Dialog**
- [ ] Create `src/app/components/dialogs/jump-to-frame-dialog.component.ts`
- [ ] Number input for frame number
- [ ] Validation (1 to total frames)
- [ ] Keyboard shortcut (Ctrl+G)
- [ ] Quick navigation

### Phase 5: Onion Skinning (Tasks 20-23)

**Task 20: Create Onion Skin Service**
- [ ] Create `src/app/services/onion-skin.service.ts`
- [ ] Onion skin configuration state management
- [ ] Methods:
  - `toggleOnionSkin(): void`
  - `setOnionSkinConfig(config: Partial<OnionSkinConfig>): void`
  - `setPreviousFrames(count: number): void`
  - `setNextFrames(count: number): void`
  - `setPreviousOpacity(opacity: number): void`
  - `setNextOpacity(opacity: number): void`
  - `getFramesToDisplay(currentIndex: number): { previous: Frame[], next: Frame[] }`
- [ ] Configuration persistence (LocalStorage)
- [ ] Observable config stream

**Task 21: Implement Onion Skin Rendering**
- [ ] Render previous frames with red tint and opacity
- [ ] Render next frames with blue tint and opacity
- [ ] Layer ordering (previous → current → next)
- [ ] SVG filter for color tinting
- [ ] Canvas composite operations for blending
- [ ] Performance optimization (cache rendered skins)

**Task 22: Create Onion Skin Controls Component**
- [ ] Create `src/app/components/onion-skin/onion-skin-controls.component.ts`
- [ ] Toggle button for onion skin
- [ ] Previous/Next frame count sliders (0-5)
- [ ] Opacity sliders for previous/next
- [ ] Color pickers for tint colors (optional)
- [ ] Preset buttons (1 frame, 2 frames, 3 frames)
- [ ] Quick access in toolbar or panel

**Task 23: Implement Onion Skin Visualization**
- [ ] Update canvas rendering to include onion skin layers
- [ ] Ghosted appearance for reference frames
- [ ] Toggle visibility without reloading
- [ ] Smooth opacity transitions
- [ ] Visual indicator when onion skin is active

### Phase 6: Frame Manipulation UI (Tasks 24-27)

**Task 24: Implement Frame Selection Logic**
- [ ] Click to select single frame
- [ ] Ctrl+Click for multi-select
- [ ] Shift+Click for range select
- [ ] Selection visual feedback
- [ ] Select all (Ctrl+A in timeline)
- [ ] Deselect (Esc or click empty area)

**Task 25: Implement Frame Context Menu**
- [ ] Create `src/app/components/timeline/frame-context-menu.component.ts`
- [ ] Right-click menu on frame thumbnails
- [ ] Options:
  - Duplicate frame
  - Delete frame
  - Insert frame before/after
  - Add label
  - Lock/Unlock
  - Hide/Show
  - Copy frame
  - Paste frame
- [ ] Keyboard shortcut alternatives

**Task 26: Implement Frame Copy/Paste**
- [ ] Copy selected frame(s) to clipboard (Ctrl+C)
- [ ] Cut frame(s) (Ctrl+X)
- [ ] Paste frame(s) (Ctrl+V)
- [ ] Paste inserts after current frame
- [ ] Update clipboard service for frame data
- [ ] Visual feedback for copy/paste operations

**Task 27: Implement Frame Drag-and-Drop Reordering**
- [ ] Use Angular CDK DragDropModule
- [ ] Drag frame thumbnail to new position
- [ ] Visual placeholder during drag
- [ ] Drop zone indicators
- [ ] Update frame order on drop
- [ ] Trigger auto-save after reorder
- [ ] Animate reordering

### Phase 7: Playback & Preview (Tasks 28-31)

**Task 28: Implement Play/Pause Functionality**
- [ ] Play button starts animation loop
- [ ] Pause button stops at current frame
- [ ] Space bar toggle play/pause
- [ ] Visual playback indicator
- [ ] Smooth frame transitions
- [ ] FPS-accurate playback

**Task 29: Implement Playback Speed Control**
- [ ] Speed selector UI (dropdown or slider)
- [ ] Speeds: 0.25x, 0.5x, 1x, 2x, 4x
- [ ] Update playback timing calculation
- [ ] Display current speed
- [ ] Keyboard shortcuts (optional: [ and ] keys)

**Task 30: Implement Loop Control**
- [ ] Loop toggle button
- [ ] Loop indicator in UI
- [ ] Reset to first frame on loop
- [ ] Loop count option (optional)
- [ ] Ping-pong loop (play forward then reverse)

**Task 31: Implement Stop Functionality**
- [ ] Stop button returns to first frame
- [ ] Stop on reaching last frame (if not looping)
- [ ] Clear playback state
- [ ] Reset playhead position

### Phase 8: UI Polish & Performance (Tasks 32-36)

**Task 32: Timeline Styling and Animations**
- [ ] Visual design for timeline
- [ ] Frame thumbnail borders and shadows
- [ ] Selection highlight styles
- [ ] Playhead design (vertical line with handle)
- [ ] Smooth CSS transitions
- [ ] Dark/light theme support
- [ ] Responsive breakpoints

**Task 33: Performance Optimization**
- [ ] Virtual scrolling for large frame counts
- [ ] Lazy thumbnail generation
- [ ] Debounce rapid frame changes
- [ ] Memoize expensive calculations
- [ ] RequestAnimationFrame for playback
- [ ] Canvas dirty region optimization
- [ ] Pagination for 1000+ frames

**Task 34: Loading States and Feedback**
- [ ] Loading indicators for thumbnails
- [ ] Skeleton screens for timeline
- [ ] Progress bars for long operations
- [ ] Smooth transitions between states
- [ ] Error states for failed operations

**Task 35: Notification Integration**
- [ ] Success messages (frame created, duplicated, etc.)
- [ ] Error messages (delete failed, etc.)
- [ ] Warning messages (deleting last frame)
- [ ] Undo notifications (Ctrl+Z to undo)
- [ ] Auto-save status in timeline

**Task 36: Accessibility**
- [ ] ARIA labels for timeline controls
- [ ] Keyboard navigation for all features
- [ ] Screen reader support
- [ ] Focus indicators
- [ ] High contrast mode support
- [ ] Reduced motion support

### Phase 9: Testing & Documentation (Tasks 37-38)

**Task 37: Unit and Integration Tests**
- [ ] FrameService tests
- [ ] TimelineStateService tests
- [ ] PlaybackService tests
- [ ] OnionSkinService tests
- [ ] ThumbnailGenerator tests
- [ ] Timeline component tests
- [ ] Canvas component tests
- [ ] Integration tests for frame operations
- [ ] Playback accuracy tests

**Task 38: Documentation**
- [ ] API documentation for services
- [ ] Component usage documentation
- [ ] Frame management user guide
- [ ] Timeline interaction guide
- [ ] Onion skinning guide
- [ ] Keyboard shortcuts reference

## Dependencies

### Angular Dependencies
- @angular/cdk (Virtual scrolling, Drag-drop)
- @angular/animations (for smooth transitions)

### Third-Party Libraries (to consider)
- `fabric.js` or `konva.js`: Canvas manipulation (evaluate for Epic 3)
- `html2canvas`: For thumbnail generation from canvas
- `rxjs`: Operators for state management

### Browser APIs
- `requestAnimationFrame`: Playback loop
- `Canvas API`: Rendering and thumbnails
- `ResizeObserver`: Responsive timeline

## Success Criteria

1. ✅ Users can create, duplicate, insert, and delete frames
2. ✅ Timeline displays frame thumbnails with virtual scrolling
3. ✅ Users can navigate frames with keyboard shortcuts
4. ✅ Users can scrub through timeline by dragging
5. ✅ Users can play/pause animation with accurate FPS
6. ✅ Users can adjust playback speed (0.25x to 4x)
7. ✅ Users can enable onion skinning to see previous/next frames
8. ✅ Users can adjust onion skin opacity and frame count
9. ✅ Users can select single or multiple frames
10. ✅ Users can reorder frames via drag-and-drop
11. ✅ Users can copy/paste frames
12. ✅ Timeline handles 1000+ frames without performance degradation
13. ✅ Frame operations trigger auto-save
14. ✅ UI is responsive and provides clear feedback

## Estimated Timeline

- **Phase 1 (Frame Service)**: 3-4 days
- **Phase 2 (Timeline Component)**: 4-5 days
- **Phase 3 (Canvas & Display)**: 3-4 days
- **Phase 4 (Navigation)**: 2 days
- **Phase 5 (Onion Skinning)**: 2-3 days
- **Phase 6 (Frame Manipulation)**: 2-3 days
- **Phase 7 (Playback)**: 2-3 days
- **Phase 8 (Polish & Performance)**: 2-3 days
- **Phase 9 (Testing)**: 2 days

**Total Estimate**: 22-30 days

## Technical Considerations

### Performance Strategies
1. **Virtual Scrolling**: Only render visible frames in timeline
2. **Thumbnail Caching**: Cache generated thumbnails in memory and LocalStorage
3. **Lazy Loading**: Generate thumbnails on-demand as they become visible
4. **Debouncing**: Debounce rapid frame changes during scrubbing
5. **Web Workers**: Consider offloading thumbnail generation to workers
6. **Dirty Checking**: Only re-render canvas when frame content changes
7. **RequestAnimationFrame**: Use for smooth 60fps UI updates

### Edge Cases to Handle
- Deleting the last frame (prevent or create new blank frame)
- Deleting currently selected frame (select next/previous)
- Playback at end of timeline (loop or stop)
- Frame reordering with multi-select
- Copy/paste across different scenes
- Very large frame counts (1000+)
- Empty scenes (no frames)
- Frame data corruption

### Future Enhancements (Post-Epic 2)
- Audio track visualization in timeline
- Multiple layer timeline
- Frame grouping/folding
- Advanced onion skin modes (relative, absolute)
- Timeline markers and regions
- Frame rate changes within a scene
- Export frame range as separate animation

## Integration with Other Epics

### Dependencies from Epic 1
- Scene model and SceneService
- Project state management
- Auto-save infrastructure
- Storage service
- Project workspace routing

### Prepares for Epic 3 (Drawing Tools)
- Canvas component ready for drawing interactions
- Frame element array ready for SVG paths
- Canvas renderer can display SVG elements
- Current frame management for active drawing

### Prepares for Epic 4 (Selection & Manipulation)
- Element array structure in frames
- Canvas rendering of elements
- Selection state in timeline is model for canvas selection

## Notes

- Keep drawing tools (Epic 3) in mind when designing canvas component
- Frame elements array should be flexible for various SVG element types
- Timeline should be performant with 1000+ frames from the start
- Onion skinning is critical for animation workflow - prioritize smooth rendering
- Keyboard shortcuts are essential for animator efficiency
- Consider touch/mobile support for timeline interactions
- Thumbnail generation should not block UI thread

## Next Steps After Epic 2

1. Begin Epic 3: SVG Drawing Tools
2. Implement basic shape tools (rectangle, circle, line)
3. Path/pen tool with bezier curves
4. Drawing properties (stroke, fill, color)
5. Integration with frame elements array

