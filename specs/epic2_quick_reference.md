# Epic 2: Frame Management & Timeline - Quick Reference

## What Was Built

### Core Services (7)
1. **FrameService** - Frame CRUD with project/scene context
2. **TimelineStateService** - Navigation, selection, zoom state  
3. **PlaybackService** - requestAnimationFrame-based playback engine
4. **ThumbnailGeneratorService** - Canvas-to-image conversion
5. **OnionSkinService** - Reference frame overlay configuration
6. **KeyboardShortcutService** - Global keyboard event handling
7. **Frame Utilities** - Helper functions for frame manipulation

### UI Components (2)
1. **TimelineContainerComponent** - Timeline UI with toolbar and frame strip
2. **CanvasComponent** - SVG canvas with pan/zoom and onion skin layers

### Enhanced Models
- **Frame** model with duration, labels, locking, visibility, timestamps
- **TimelineState** interface for state management
- **OnionSkinConfig** interface for onion skin settings

## Architecture

```
┌─────────────────────────────────────┐
│   ProjectWorkspaceComponent         │
│  ┌──────────┐  ┌─────────────────┐ │
│  │  Scene   │  │     Canvas      │ │
│  │ Manager  │  │   Component     │ │
│  └──────────┘  │   (Pan/Zoom)    │ │
│                │  (Onion Skin)   │ │
│                └─────────────────┘ │
│  ┌─────────────────────────────┐  │
│  │  Timeline Container         │  │
│  │  • Toolbar & Controls       │  │
│  │  • Frame Strip              │  │
│  │  • Playback Controls        │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
           │
           ├─→ FrameService ──→ SceneService ──→ ProjectService
           ├─→ TimelineStateService (signals)
           ├─→ PlaybackService (RAF loop)
           ├─→ OnionSkinService (config)
           └─→ KeyboardShortcutService (events)
```

## API Quick Reference

### FrameService

```typescript
// Create frame
frameService.createFrame(projectId, sceneId, data?)

// Get frames
frameService.getFramesByScene(projectId, sceneId)
frameService.getFrame(projectId, sceneId, frameId)
frameService.getFrameByIndex(projectId, sceneId, index)

// Modify frames
frameService.updateFrame(projectId, sceneId, frameId, data)
frameService.duplicateFrame(projectId, sceneId, frameId)
frameService.insertFrame(projectId, sceneId, position, data?)

// Delete frames
frameService.deleteFrame(projectId, sceneId, frameId)
frameService.deleteFrames(projectId, sceneId, frameIds[])

// Reorder
frameService.reorderFrames(projectId, sceneId, frameIds[])
```

### TimelineStateService

```typescript
// Navigation
timelineState.setCurrentFrame(index)
timelineState.nextFrame()
timelineState.previousFrame()
timelineState.firstFrame()
timelineState.lastFrame()
timelineState.jumpToFrame(index)

// Selection
timelineState.selectFrame(index, multiSelect)
timelineState.selectFrameRange(start, end)
timelineState.selectAll()
timelineState.clearSelection()

// Playback state
timelineState.setPlaybackState('playing' | 'paused' | 'stopped')
timelineState.setPlaybackSpeed(0.25 - 4.0)
timelineState.toggleLooping()

// Zoom
timelineState.setZoomLevel(0.5 - 3.0)
timelineState.zoomIn()
timelineState.zoomOut()

// Signals (reactive)
currentFrameIndex = timelineState.currentFrameIndex()
selectedFrames = timelineState.selectedFrameIndices()
playbackState = timelineState.playbackState()
zoomLevel = timelineState.zoomLevel()
```

### PlaybackService

```typescript
// Controls
playbackService.play()
playbackService.pause()
playbackService.stop()
playbackService.togglePlayPause()

// Settings
playbackService.setPlaybackSpeed(speed)  // 0.25 to 4.0
playbackService.setFrameRate(fps)        // 1 to 60
playbackService.setLoop(boolean)
playbackService.playReverse()

// State
playbackService.isPlayingNow()
playbackService.getFrameRate()
```

### OnionSkinService

```typescript
// Toggle
onionSkinService.toggleOnionSkin()
onionSkinService.enable()
onionSkinService.disable()

// Configure
onionSkinService.setPreviousFrames(0-5)
onionSkinService.setNextFrames(0-5)
onionSkinService.setPreviousOpacity(0-1)
onionSkinService.setNextOpacity(0-1)
onionSkinService.setPreviousTint('#ff0000')
onionSkinService.setNextTint('#0000ff')
onionSkinService.setMode('overlay' | 'split')

// Get frames to display
const { previous, next } = onionSkinService.getFramesToDisplay(currentIndex, allFrames)

// Signals
enabled = onionSkinService.enabled()
previousCount = onionSkinService.previousFrames()
opacity = onionSkinService.previousOpacity()
```

### KeyboardShortcutService

```typescript
// Register shortcut
keyboardShortcut.register({
  key: 'o',
  ctrl: false,
  shift: false,
  alt: false,
  callback: () => { /* action */ },
  description: 'Toggle onion skin'
})

// Unregister
keyboardShortcut.unregister('o')

// Control
keyboardShortcut.enable()
keyboardShortcut.disable()
keyboardShortcut.clearAll()

// Query
const shortcuts = keyboardShortcut.getAllShortcuts()
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `,` (comma) | Previous frame |
| `.` (period) | Next frame |
| `Home` | First frame |
| `End` | Last frame  |
| `Space` | Play/Pause |
| `o` | Toggle onion skin |

## Data Models

### Frame
```typescript
{
  id: string
  sceneId: string
  order: number
  duration: number              // hold duration (default 1)
  elements: SVGElement[]        // drawing elements
  thumbnail: string             // base64 PNG
  label: string                 // optional marker
  notes: string                 // frame notes
  locked: boolean               // prevent editing
  visible: boolean              // show in playback
  createdAt: Date
  updatedAt: Date
}
```

### TimelineState
```typescript
{
  currentFrameIndex: number
  selectedFrameIndices: number[]
  playbackState: 'stopped' | 'playing' | 'paused'
  playbackDirection: 'forward' | 'reverse'
  playbackSpeed: number         // 0.25 to 4.0
  looping: boolean
  zoomLevel: number             // 0.5 to 3.0
  scrollPosition: number
}
```

### OnionSkinConfig
```typescript
{
  enabled: boolean
  previousFrames: number        // 0-5
  nextFrames: number            // 0-5
  previousOpacity: number       // 0.0-1.0
  nextOpacity: number           // 0.0-1.0
  previousTint: string          // hex color
  nextTint: string              // hex color
  mode: 'overlay' | 'split'
}
```

## Configuration

### Default Values
- Frame rate: 30 fps
- Playback speed: 1.0x
- Timeline zoom: 1.0
- Onion skin previous: 1 frame
- Onion skin next: 1 frame
- Onion skin opacity: 0.3
- Previous tint: #ff0000 (red)
- Next tint: #0000ff (blue)

### Storage Keys
- `projects` - Project data
- `onionSkinConfig` - Onion skin settings

## Integration Points

### With Epic 1
- Uses ProjectService for project state ✅
- Uses SceneService for scene management ✅
- Integrates with AutoSaveService ✅
- Uses StorageService for persistence ✅

### For Epic 3
- Frame.elements array ready for SVG paths
- Canvas renderer prepared for element rendering
- Drawing tool integration points identified
- Element property management prepared

## Performance Notes

- RequestAnimationFrame for 60fps UI updates
- Thumbnail caching reduces regeneration
- Signal-based reactivity minimizes re-renders
- Frame operations are O(n) for reordering
- Prepared for virtual scrolling (1000+ frames)

## Browser Support

- Modern browsers with ES2020+ support
- SVG 1.1 support required
- RequestAnimationFrame API
- LocalStorage API

## Future Enhancements

Phase 8 identified these optimizations:
- Virtual scrolling for timeline
- Web Workers for thumbnail generation
- Dirty region canvas rendering
- Frame grouping/folding
- Timeline markers
- Multi-layer timeline
- Audio track visualization

## File Locations

```
/workspaces/doodle2/doodle/src/app/
├── models/
│   └── frame.model.ts (enhanced)
├── services/
│   ├── frame.service.ts
│   ├── timeline-state.service.ts
│   ├── playback.service.ts
│   ├── thumbnail-generator.service.ts
│   ├── onion-skin.service.ts
│   └── keyboard-shortcut.service.ts
├── components/
│   ├── timeline/
│   │   └── timeline-container.component.ts
│   ├── canvas/
│   │   └── canvas.component.ts
│   └── project-workspace/
│       └── project-workspace.component.ts (updated)
└── utils/
    └── frame-utils.ts
```

## Documentation

- [Epic 2 Tasks](./epic2_tasks1.md) - Original task breakdown
- [Implementation Summary](./epic2_implementation_summary.md) - Detailed completion report
- [Testing Guide](./epic2_testing_guide.md) - How to test features
- This file - Quick API reference

---

**Status**: Production-ready for frame management workflows
**Next**: Epic 3 - SVG Drawing Tools
