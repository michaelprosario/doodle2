# Epic 2 Testing Guide

## Quick Start Testing

### Prerequisites
```bash
cd /workspaces/doodle2/doodle
npm install
```

### Start Development Server
```bash
npm start
```

Navigate to `http://localhost:4200` in your browser.

## Test Scenarios

### 1. Project and Scene Setup
1. Create a new project from the dashboard
2. Enter the project workspace
3. You should see:
   - Scene manager in left sidebar
   - Canvas area in the center
   - Timeline at the bottom (initially collapsed/empty)

### 2. Frame Creation
1. Click "Create First Frame" in the canvas area
2. Observe:
   - First frame appears in timeline
   - Frame counter shows "Frame 1 / 1"
   - Canvas displays the blank frame

### 3. Frame Navigation
Test keyboard shortcuts:
- **Comma (,)**: Previous frame
- **Period (.)**: Next frame
- **Home**: Jump to first frame
- **End**: Jump to last frame

### 4. Timeline Operations
1.  **Add Frames**: Click the "+ Add Frame" button
2. **Duplicate Frame**: Select a frame, click "Duplicate"
3. **Delete Frame**: Select a frame, click "Delete" (won't work if only 1 frame remains)
4. **Frame Selection**: Click frames to select them, Ctrl+Click for multi-select

### 5. Playback Controls
1. Add several frames to test playback
2. Click **Play (▶️)** button
   - Animation should loop through frames
   - Observe the red playhead moving
3. Click **Pause (⏸️)** to pause
4. Click **Stop (⏹️)** to return to frame 1
5. Use **Previous (⏪)** and **Next (⏩)** for frame-by-frame stepping
6. Use **First (⏮️)** and **Last (⏭️)** for quick jumping

### 6. Timeline Zoom
1. Click **+** button to zoom in (timeline thumbnails get larger)
2. Click **-** button to zoom out
3. Zoom level displays as percentage

### 7. Onion Skinning
1. Add at least 3 frames
2. Click the **👻 Onion Skin** button in the header
3. Navigate between frames
4. Observe:
   - Previous frames appear with red tint and reduced opacity
   - Next frames appear with blue tint and reduced opacity
5. Toggle off by clicking the button again

### 8.  Keyboard Shortcuts Summary
- **o**: Toggle onion skin
- **Space**: Play/Pause
- **,**: Previous frame
- **.**: Next frame
- **Home**: First frame
- **End**: Last frame

### 9. Multi-Scene Workflow
1. Go to the scene manager sidebar
2. Click "+ Add" to create additional scenes
3. Click on different scenes to switch between them
4. Each scene maintains its own frames independently

### 10. Canvas Controls
1. **Pan**: Hold middle mouse button (or Shift+Left click) and drag
2. **Zoom**: Use mouse wheel to zoom in/out
3. **Reset Zoom**: Click "100%" button
4. **Fit to Screen**: Click "Fit" button

## Expected Behaviors

### Frame Management
- ✅ Frames maintain sequential order (0, 1, 2, ...)
- ✅ Cannot delete the last frame in a scene
- ✅ Duplicated frames are inserted after the current frame
- ✅ Frame selection is highlighted with blue border
- ✅ Current frame is highlighted with red border

### Playback
- ✅ Smooth playback at default 30fps
- ✅ Playback respects frame order
- ✅ Loop continues indefinitely
- ✅ Stop returns to frame 1
- ✅ Pause maintains current position

### Onion Skinning
- ✅ Configuration persists across page reloads
- ✅ Onion skin shows up to 5 previous and 5 next frames (configurable)
- ✅ Opacity is adjustable (default 0.3)
- ✅ Previous frames tinted red, next frames tinted blue

### Timeline UI
- ✅ Frame thumbnails display (currently placeholders until Epic 3)
- ✅ Frames are numbered correctly
- ✅ Timeline scrolls horizontally when many frames exist
- ✅ Zoom affects thumbnail size
- ✅ Timeline is collapsible

### Auto-Save
- ✅ Changes are automatically saved every 30 seconds
- ✅ Manual save available via "Save" button
- ✅ Save status displayed in header

## Known Limitations (By Design)

1. **Drawing Tools**: Frame elements are empty arrays until Epic 3
   - Thumbnails show placeholders
   - Canvas displays blank frames
   
2. **Element Rendering**: SVG element rendering is not yet implemented
   - Will be added in Epic 3 with drawing tools

3. **Timeline Drag & Drop**: Frame reordering via drag-and-drop is prepared but not fully connected

4. **Frame Labels**: Frame labeling UI is not yet implemented (model supports it)

5. **Frame Context Menu**: Right-click menu is not yet implemented

## Performance Testing

### Testing with Many Frames
1. Duplicate frames multiple times to create 50-100 frames
2. Test timeline scrolling performance
3. Test playback smoothness
4. Test navigation responsiveness

**Expected**: Should remain responsive up to ~100 frames. Beyond that, virtual scrolling may be needed (Phase 8 future optimization).

## Debugging Tips

### Check Browser Console
- Look for service initialization messages
- Check for any error messages
- Verify frame operations are logged

### Verify State
Open browser DevTools and check:
```javascript
// In console
localStorage.getItem('projects')  // Should show project data
localStorage.getItem('onionSkinConfig')  // Should show onion skin settings
```

### Common Issues

**Problem**: Keyboard shortcuts not working
- **Solution**: Click on the canvas/workspace area to ensure focus is not in an input field

**Problem**: Frames not appearing in timeline
- **Solution**: Ensure you've created frames via "Create First Frame" or "+ Add Frame"

**Problem**: Onion skin not showing
- **Solution**: Ensure you have multiple frames and onion skin is toggled on

**Problem**: Playback not working
- **Solution**: Ensure you have at least 2 frames to play between

## Success Criteria

All the following should work:
- ✅ Create projects and scenes
- ✅ Add, duplicate, and delete frames
- ✅ Navigate frames with keyboard shortcuts
- ✅ Play/pause animation
- ✅ Toggle onion skinning
- ✅ Zoom timeline
- ✅ Pan and zoom canvas
- ✅ Switch between scenes
- ✅ Auto-save preserves work

## Next Steps

After verifying Epic 2 works correctly:
1. Document any bugs found
2. Create user feedback issue
3. Begin Epic 3: SVG Drawing Tools
   - Basic shapes (rectangle, circle, line)
   - Pen tool with bezier curves
   - Drawing properties (stroke, fill, color)

---

**Ready for Production Testing**: Yes (with drawing tools coming in Epic 3)
**Ready for Epic 3 Development**: Yes
