# Doodle2 - Technical Design Document

## 1. Overview

**Doodle2** is a web-based SVG animation software built with Angular 21 that enables animators to create frame-by-frame animations with intuitive drawing tools and streamlined workflow management. The application supports multi-scene projects, frame management, vector drawing tools, and real-time animation preview with onion skinning.

### Key Features
- Project and scene management with auto-save
- Frame-by-frame animation timeline with thumbnail previews
- SVG-based vector drawing tools (rectangle, circle, ellipse, line, polygon, star, pen, brush)
- Onion skinning for animation guidance
- Playback controls with variable speed and looping
- Keyboard shortcut system for rapid workflow
- Local storage persistence

---

## 2. Architecture Principles

### 2.1 Single Page Application (SPA)
The application is designed as a fully client-side SPA with no backend dependency initially. All data is stored locally in browser storage.

### 2.2 Component-Based Architecture
Following Angular best practices with:
- **Standalone components** (no NgModule)
- Smart/Container and Presentational component separation
- Reusable UI components for consistency

### 2.3 Signal-Based Reactive State Management
Angular Signals provide fine-grained reactivity:
- Eliminates need for external state management libraries
- Automatic change detection optimization
- Clear data flow and dependencies
- Computed values for derived state

### 2.4 Service-Oriented Design
Business logic is encapsulated in injectable services with clear separations of concern:
- Data services (Project, Scene, Frame)
- UI state services (Timeline, Tool, OnionSkin)
- Utility services (Storage, Notification, AutoSave)
- Drawing engine services (DrawingEngine, DrawingProperties)

### 2.5 Domain-Driven Design
Models reflect the animation domain:
- **Project** → contains multiple Scenes
- **Scene** → contains ordered Frames
- **Frame** → contains SVG Elements
- Clear hierarchy and relationships

### 2.6 Separation of Concerns
- **Models**: Data structures and types (`models/`)
- **Services**: Business logic and state management (`services/`)
- **Components**: UI presentation and user interactions (`components/`)
- **Utils**: Pure helper functions (`utils/`)

### 2.7 Progressive Enhancement
Features are organized into epics for incremental development:
- **Epic 1**: Project & Scene Management
- **Epic 2**: Frame Management & Timeline
- **Epic 3**: SVG Drawing Tools
- **Epic 4**: Advanced Features (planned)

---

## 3. Technology Stack

### 3.1 Core Framework
- **Angular 21.x** - Latest Angular with standalone components
- **TypeScript 5.9** - Strong typing and modern JavaScript features
- **RxJS 7.8** - Reactive programming utilities (minimal use with Signals)

### 3.2 UI & Styling
- **Native SVG** - Direct SVG manipulation for drawings
- **SCSS** - Component-scoped styling
- **Angular CDK** - UI component primitives (drag-drop, overlays)
- **Flexbox/Grid** - Modern CSS layout

### 3.3 Development Tools
- **Angular CLI** - Project scaffolding and build tooling
- **Vitest** - Fast unit/integration testing
- **ESBuild** - Fast bundling via Angular 21
- **TypeScript Compiler** - Type checking

### 3.4 Libraries
- **uuid** - Unique identifier generation
- **jsdom** - DOM testing utilities

---

## 4. Data Models

### 4.1 Project Model
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  dimensions: { width: number; height: number };
  frameRate: number;
  backgroundColor: string;
  scenes: Scene[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: ProjectMetadata;
}
```

**Responsibilities:**
- Top-level container for animation work
- Defines canvas dimensions and frame rate
- Contains all scenes for the project

### 4.2 Scene Model
```typescript
interface Scene {
  id: string;
  projectId: string;
  name: string;
  duration: number;
  order: number;
  frames: Frame[];
  thumbnail?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Responsibilities:**
- Organizes animation into logical segments
- Contains ordered frames
- Maintains scene-specific metadata

### 4.3 Frame Model
```typescript
interface Frame {
  id: string;
  sceneId: string;
  order: number;
  duration?: number;
  elements: SVGElementModel[];
  thumbnail?: string;
  label?: string;
  notes?: string;
  locked?: boolean;
  visible?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Responsibilities:**
- Represents a single animation frame
- Contains all drawing elements for that frame
- Supports frame-specific attributes (locked, visible)

### 4.4 SVG Element Model
```typescript
interface SVGElementModel {
  id: string;
  type: SVGElementType; // 'rect' | 'circle' | 'ellipse' | 'line' | 'path' | ...
  attributes: SVGAttributes;
  transform?: Transform;
  createdAt: Date;
  updatedAt: Date;
}

interface SVGAttributes {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  x?, y?, width?, height?: number; // rect
  cx?, cy?, r?: number; // circle
  rx?, ry?: number; // ellipse
  x1?, y1?, x2?, y2?: number; // line
  points?: string; // polygon
  d?: string; // path
  // ... other SVG properties
}
```

**Responsibilities:**
- Represents individual vector drawing elements
- Encapsulates all SVG attributes
- Supports geometric transformations

---

## 5. Major Services

### 5.1 Data Management Services

#### ProjectService
**Purpose:** Manages project lifecycle and persistence.

**Key Responsibilities:**
- CRUD operations for projects
- Active project state management
- Recent projects tracking
- Project duplication
- Local storage persistence

**Signal State:**
```typescript
projectsSignal: Signal<Project[]>
activeProjectSignal: Signal<Project | null>
```

#### SceneService
**Purpose:** Manages scenes within projects.

**Key Responsibilities:**
- Scene creation, update, deletion
- Scene ordering and reordering
- Scene duplication
- Coordinating with ProjectService for persistence

#### FrameService
**Purpose:** Manages frames within scenes.

**Key Responsibilities:**
- Frame creation, update, deletion
- Frame ordering and reordering
- Frame duplication
- Bulk frame operations
- Adding/removing SVG elements to frames

### 5.2 Drawing Services

#### DrawingEngineService
**Purpose:** Core drawing engine for creating SVG elements.

**Key Responsibilities:**
- Drawing primitive shapes (rect, circle, ellipse, line)
- Converting tool inputs to SVG elements
- Handling drawing modifiers (Shift for proportions, Alt for center)
- Creating preview elements during drawing

**Key Methods:**
```typescript
drawShape(type, startPoint, endPoint, properties, options): SVGElementModel
drawRectangle(startPoint, endPoint, attrs, options): SVGElementModel
drawCircle(startPoint, endPoint, attrs, options): SVGElementModel
```

#### DrawingPropertiesService
**Purpose:** Manages current drawing properties.

**Key Responsibilities:**
- Stroke color, fill color, stroke width
- Drawing property presets
- Property state for tools

**Signal State:**
```typescript
properties: Signal<DrawingProperties>
```

#### ToolService
**Purpose:** Manages active drawing tool and tool state.

**Key Responsibilities:**
- Tool selection and switching
- Tool configuration (cursor, shortcuts)
- Tool state (drawing, idle)
- Keyboard shortcut to tool mapping

**Available Tools:**
- select, rectangle, circle, ellipse, line
- polygon, star, triangle, pen, pencil, brush
- eraser, eyedropper, pan

### 5.3 Timeline & Playback Services

#### TimelineStateService
**Purpose:** Manages timeline UI state and frame navigation.

**Key Responsibilities:**
- Current frame tracking
- Frame selection (single/multi)
- Playback state (playing/paused/stopped)
- Timeline zoom and scroll position
- Frame navigation (next, previous, first, last)

**Signal State:**
```typescript
currentFrameIndex: Signal<number>
selectedFrameIndices: Signal<number[]>
playbackState: Signal<'stopped' | 'playing' | 'paused'>
```

#### PlaybackService
**Purpose:** Manages animation playback.

**Key Responsibilities:**
- Play, pause, stop controls
- Frame rate control (1-60 fps)
- Playback speed multiplier (0.25x - 4.0x)
- Looping mode
- Forward/reverse playback

**Key Methods:**
```typescript
play(): void
pause(): void
stop(): void
setFrameRate(fps: number): void
setPlaybackSpeed(speed: number): void
```

#### OnionSkinService
**Purpose:** Manages onion skinning configuration.

**Key Responsibilities:**
- Enable/disable onion skinning
- Configure previous/next frame count (0-5)
- Opacity settings for previous/next frames
- Color tinting (red for previous, blue for next)
- Persistence of onion skin settings

**Signal State:**
```typescript
config: Signal<OnionSkinConfig>
enabled: Signal<boolean>
previousOpacity: Signal<number>
nextOpacity: Signal<number>
```

### 5.4 Utility Services

#### StorageService
**Purpose:** Abstracts browser local storage operations.

**Key Responsibilities:**
- Get/set/delete operations
- JSON serialization/deserialization
- Error handling for storage operations
- Storage quota management

#### AutoSaveService
**Purpose:** Automatic project saving.

**Key Responsibilities:**
- Periodic auto-save (every 30 seconds)
- Debounced save on changes (2 second debounce)
- Save status tracking (idle/saving/saved/error)
- Last save timestamp
- Manual save triggering

**Signal State:**
```typescript
saveStatus: Signal<'idle' | 'saving' | 'saved' | 'error'>
lastSaveTime: Signal<Date | null>
```

#### NotificationService
**Purpose:** Toast notification system.

**Key Responsibilities:**
- Show success/error/warning/info messages
- Auto-dismiss timeout
- Notification queue management

#### KeyboardShortcutService
**Purpose:** Global keyboard shortcut handling.

**Key Responsibilities:**
- Register shortcut handlers
- Keyboard event capture and dispatch
- Shortcut conflict resolution
- Platform-specific key handling (Cmd/Ctrl)

#### DrawingShortcutsService
**Purpose:** Drawing-specific keyboard shortcuts.

**Key Responsibilities:**
- Tool switching shortcuts (V, R, C, E, L, P, etc.)
- Frame navigation (,/. for prev/next)
- Undo/redo (Cmd+Z, Cmd+Shift+Z)
- Onion skin toggle (O)

---

## 6. Major Components

### 6.1 Container Components

#### ProjectDashboardComponent
**Purpose:** Landing page showing all projects.

**Features:**
- Grid of project cards
- Create new project dialog
- Recent projects list
- Project actions (open, duplicate, delete)

**Child Components:**
- ProjectCardComponent
- ProjectCreateComponent

#### ProjectWorkspaceComponent
**Purpose:** Main workspace for editing a project.

**Features:**
- Layout orchestration (header, sidebars, canvas, timeline)
- Active scene management
- Auto-save integration
- Keyboard shortcut registration

**Child Components:**
- SceneManagerComponent
- CanvasComponent
- TimelineContainerComponent
- DrawingToolbarComponent

### 6.2 Feature Components

#### CanvasComponent
**Purpose:** Main drawing canvas with SVG rendering.

**Features:**
- SVG element rendering from current frame
- Onion skin rendering (previous/next frames)
- Drawing interactions (mouse events)
- Preview element during drawing
- Zoom and pan controls
- Tool cursor handling

**Key Inputs:**
```typescript
currentFrame: Frame | null
projectId: string
sceneId: string
width: number
height: number
backgroundColor: string
```

**Key Outputs:**
```typescript
frameUpdated: EventEmitter<void>
```

#### TimelineContainerComponent
**Purpose:** Timeline with frame thumbnails and playback controls.

**Features:**
- Frame strip with thumbnails
- Current frame indicator
- Frame selection (single/multi)
- Playback controls (play, pause, stop, step)
- Timeline zoom controls
- Add/duplicate/delete frame actions
- Frame counter display

**Key Methods:**
```typescript
addFrame(): void
duplicateFrame(): void
deleteFrame(): void
togglePlayback(): void
selectFrame(index: number): void
```

#### SceneManagerComponent
**Purpose:** Sidebar for managing scenes.

**Features:**
- Scene list with thumbnails
- Create new scene
- Scene selection
- Scene actions (duplicate, delete, reorder)
- Scene dialog for creating/editing

**Child Components:**
- SceneItemComponent
- SceneDialogComponent

#### DrawingToolbarComponent
**Purpose:** Vertical toolbar with drawing tools.

**Features:**
- Tool buttons with icons
- Active tool highlighting
- Tool tooltips with shortcuts
- Color picker for stroke/fill
- Stroke width selector

**Child Components:**
- ColorPickerComponent

### 6.3 Shared/Reusable Components

#### ButtonComponent
Generic button with variants (primary, secondary, text) and sizes (small, medium, large).

#### ModalComponent
Generic modal/dialog container with overlay and close handling.

#### ConfirmationDialogComponent
Confirmation dialog for destructive actions.

#### ColorPickerComponent
Color selection widget with presets and custom color input.

#### ToastContainerComponent
Container for notification toasts.

#### LoadingSpinnerComponent
Loading indicator.

#### EmptyStateComponent
Empty state placeholder with call-to-action.

---

## 7. State Management

### 7.1 Signal-Based Architecture

Angular Signals provide the foundation for state management:

```typescript
// Example: TimelineStateService
export class TimelineStateService {
  private currentFrameIndexSignal = signal<number>(0);
  private framesSignal = signal<Frame[]>([]);
  
  // Read-only public signals
  currentFrameIndex = this.currentFrameIndexSignal.asReadonly();
  frames = this.framesSignal.asReadonly();
  
  // Computed signals
  currentFrame = computed(() => {
    const frames = this.framesSignal();
    const index = this.currentFrameIndexSignal();
    return frames[index] || null;
  });
  
  totalFrames = computed(() => this.framesSignal().length);
  hasMultipleFrames = computed(() => this.framesSignal().length > 1);
}
```

### 7.2 State Flow

1. **User Action** → Component event handler
2. **Component** → Calls service method
3. **Service** → Updates signal state
4. **Signal** → Automatically propagates changes
5. **Dependent Components** → Re-render with new state

### 7.3 Persistence Layer

```
User Action
    ↓
Service updates in-memory state (Signals)
    ↓
Service calls ProjectService.saveProject()
    ↓
ProjectService calls StorageService.set()
    ↓
Data persisted to localStorage
```

### 7.4 Data Loading

```
Component initialization
    ↓
ProjectService.loadProjects()
    ↓
StorageService.get(PROJECTS_KEY)
    ↓
Deserialize JSON to Project objects
    ↓
Update projectsSignal
    ↓
Components reactively update
```

---

## 8. File Structure

```
doodle/
├── src/
│   ├── app/
│   │   ├── app.ts                    # Root component
│   │   ├── app.config.ts             # App configuration
│   │   ├── app.routes.ts             # Route definitions
│   │   ├── components/               # UI Components
│   │   │   ├── canvas/               # Canvas component
│   │   │   ├── timeline/             # Timeline container
│   │   │   ├── project-dashboard/   # Dashboard view
│   │   │   ├── project-workspace/   # Workspace view
│   │   │   ├── scene-manager/       # Scene management
│   │   │   ├── scene-dialog/        # Scene create/edit dialog
│   │   │   ├── scene-item/          # Scene list item
│   │   │   ├── shared/              # Reusable components
│   │   │   │   ├── button/
│   │   │   │   ├── color-picker/
│   │   │   │   ├── modal/
│   │   │   │   ├── drawing-toolbar/
│   │   │   │   └── ...
│   │   ├── models/                  # Data models & types
│   │   │   ├── project.model.ts
│   │   │   ├── scene.model.ts
│   │   │   ├── frame.model.ts
│   │   │   ├── svg-element.model.ts
│   │   │   └── template.model.ts
│   │   ├── services/                # Business logic services
│   │   │   ├── project.service.ts   # Project CRUD
│   │   │   ├── scene.service.ts     # Scene CRUD
│   │   │   ├── frame.service.ts     # Frame CRUD
│   │   │   ├── drawing-engine.service.ts
│   │   │   ├── drawing-properties.service.ts
│   │   │   ├── drawing-shortcuts.service.ts
│   │   │   ├── tool.service.ts
│   │   │   ├── timeline-state.service.ts
│   │   │   ├── playback.service.ts
│   │   │   ├── onion-skin.service.ts
│   │   │   ├── auto-save.service.ts
│   │   │   ├── storage.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── keyboard-shortcut.service.ts
│   │   │   ├── color.service.ts
│   │   │   └── thumbnail-generator.service.ts
│   │   └── utils/                   # Pure utility functions
│   │       ├── svg-utils.ts         # SVG manipulation helpers
│   │       └── frame-utils.ts       # Frame calculation helpers
│   ├── index.html                   # HTML entry point
│   ├── main.ts                      # App bootstrap
│   └── styles.scss                  # Global styles
├── specs/                           # Design documents
│   ├── rootRequirements.md
│   ├── expandedRequirements.md
│   ├── epic1_projectCreation_tasks1.md
│   ├── epic2_tasks1.md
│   ├── epic3_tasks1.md
│   └── techDesign.md               # This document
├── angular.json                     # Angular CLI configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Project documentation
```

---

## 9. Key Architectural Patterns

### 9.1 Dependency Injection
All services use Angular's DI system:
```typescript
@Injectable({ providedIn: 'root' })
export class ProjectService { ... }

// In component:
constructor(private projectService: ProjectService) {}
```

### 9.2 Observer Pattern
Signals implement reactive observer pattern:
```typescript
// Service creates signal
private dataSignal = signal<Data>(initialValue);
public data = this.dataSignal.asReadonly();

// Component reads reactively
effect(() => {
  console.log('Data changed:', this.service.data());
});
```

### 9.3 Factory Pattern
SVG element creation uses factory functions:
```typescript
export function createSVGElement(
  type: SVGElementType,
  attributes: SVGAttributes
): SVGElementModel {
  return {
    id: uuidv4(),
    type,
    attributes,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
```

### 9.4 Strategy Pattern
Drawing tools implement strategy pattern:
```typescript
drawShape(type: ToolType, ...args) {
  switch (type) {
    case 'rectangle': return this.drawRectangle(...args);
    case 'circle': return this.drawCircle(...args);
    case 'line': return this.drawLine(...args);
  }
}
```

### 9.5 Command Pattern (Planned)
Undo/redo system will use command pattern:
```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class AddElementCommand implements Command {
  execute() { /* add element */ }
  undo() { /* remove element */ }
}
```

### 9.6 Repository Pattern
StorageService abstracts data persistence:
```typescript
export class StorageService {
  get<T>(key: string): T | null { ... }
  set<T>(key: string, value: T): void { ... }
  delete(key: string): void { ... }
}
```

---

## 10. Data Flow Examples

### 10.1 Creating a New Frame

```
1. User clicks "Add Frame" button in TimelineContainer
   ↓
2. TimelineContainer.addFrame() called
   ↓
3. Calls FrameService.createFrame(projectId, sceneId)
   ↓
4. FrameService:
   - Gets scene from SceneService
   - Creates new Frame object with UUID
   - Adds frame to scene.frames array
   - Calls SceneService.updateScene()
   ↓
5. SceneService:
   - Updates scene in project.scenes array
   - Calls ProjectService.saveProject()
   ↓
6. ProjectService:
   - Updates projectsSignal
   - Calls StorageService.set()
   ↓
7. StorageService:
   - Serializes project to JSON
   - Saves to localStorage
   ↓
8. Signal propagation:
   - TimelineContainer receives new frames list
   - Re-renders timeline with new frame
   - CanvasComponent receives updated currentFrame
```

### 10.2 Drawing a Rectangle

```
1. User selects Rectangle tool in DrawingToolbar
   ↓
2. DrawingToolbar calls ToolService.setActiveTool('rectangle')
   ↓
3. User mouse-down on canvas
   ↓
4. CanvasComponent.onMouseDown(event)
   - Converts screen coords to canvas coords
   - Stores startPoint
   - Sets isDrawing = true
   ↓
5. User drags mouse (mouse-move)
   ↓
6. CanvasComponent.onMouseMove(event)
   - Gets current point
   - Calls DrawingEngine.drawShape('rectangle', startPoint, currentPoint)
   - Updates previewElement signal (shows dashed preview)
   ↓
7. User releases mouse (mouse-up)
   ↓
8. CanvasComponent.onMouseUp(event)
   - Calls DrawingEngine.drawShape() for final element
   - Gets SVGElementModel back
   - Calls FrameService.updateFrame() to add element
   ↓
9. FrameService adds element to frame.elements array
   ↓
10. Saves through SceneService → ProjectService → StorageService
    ↓
11. Canvas re-renders with new element
```

### 10.3 Onion Skin Display

```
1. User toggles "Onion Skin" button in ProjectWorkspace
   ↓
2. Calls OnionSkinService.toggleOnionSkin()
   ↓
3. OnionSkinService updates config.enabled signal
   ↓
4. CanvasComponent has effect watching onionSkinEnabled()
   ↓
5. Effect triggers, CanvasComponent:
   - Gets previousFrames from TimelineState
   - Gets onion skin config (opacity, tint)
   - Renders previous frames with reduced opacity
   ↓
6. Template conditionally shows onion skin layers:
   @if (onionSkinEnabled()) {
     @for (prevFrame of previousFrames(); track prevFrame.id) {
       <g [attr.opacity]="previousOpacity()">
         <!-- Render frame elements -->
       </g>
     }
   }
```

---

## 11. Performance Considerations

### 11.1 Signal Optimization
- Signals only trigger updates when values actually change
- Computed signals memoize results
- Effects run only when dependencies change

### 11.2 Virtual Scrolling (Planned)
For timelines with hundreds of frames, implement Angular CDK virtual scrolling.

### 11.3 Lazy Loading
Routes can be lazy-loaded for faster initial load:
```typescript
{ 
  path: 'project/:id', 
  loadComponent: () => import('./components/project-workspace/...')
}
```

### 11.4 SVG Optimization
- Minimize DOM manipulation
- Use `trackBy` in `@for` loops for frame elements
- Debounce drawing operations during mouse move

### 11.5 Local Storage Quotas
- Implement storage quota checking
- Warn users when approaching limits (typically 5-10MB)
- Provide export to file option

---

## 12. Future Architecture Considerations

### 12.1 Backend Integration
When adding server persistence:
- Replace StorageService with HttpService
- Add authentication service
- Implement WebSocket for real-time collaboration
- Add conflict resolution for concurrent edits

### 12.2 Export/Render Pipeline
- Video export service (convert frames to video)
- GIF export service
- SVG export service (export as animated SVG)
- Render queue management

### 12.3 Plugin System
- Plugin interface for custom tools
- Third-party brush/effect plugins
- Custom export formats

### 12.4 Advanced Features
- Vector selection and transformation (Epic 4)
- Text tool with font management
- Layer system within frames
- Gradient and pattern fills
- Filter effects (blur, shadow, etc.)
- Audio timeline synchronization

---

## 13. Testing Strategy

### 13.1 Unit Tests
- Service logic (FrameService, ProjectService)
- Utility functions (svg-utils, frame-utils)
- Computed signals and state updates

### 13.2 Component Tests
- Component rendering and user interactions
- Signal binding and updates
- Event emission

### 13.3 Integration Tests
- Full user workflows (create project → add scene → draw)
- Storage persistence
- Auto-save functionality

### 13.4 E2E Tests (Planned)
- Critical user paths
- Cross-browser compatibility
- Performance benchmarks

---

## 14. Development Workflow

### 14.1 Epic-Based Development
Features are organized into epics with clear deliverables:
- **Epic 1 (Complete)**: Project & Scene Management
- **Epic 2 (Complete)**: Frame Management & Timeline
- **Epic 3 (In Progress)**: SVG Drawing Tools
- **Epic 4 (Planned)**: Selection, Transformation, Undo/Redo

### 14.2 Branching Strategy
- `main` branch for stable releases
- Feature branches for epic development
- Pull requests for code review

### 14.3 Code Quality
- TypeScript strict mode enabled
- ESLint for code style
- Prettier for formatting
- Pre-commit hooks for linting

---

## 15. Deployment

### 15.1 Build Process
```bash
ng build --configuration production
```
- Output: `dist/doodle/browser/`
- Optimized bundles with tree-shaking
- Minified CSS and JavaScript
- Source maps for debugging

### 15.2 Hosting Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, Fastly
- **Self-hosted**: Nginx, Apache

### 15.3 Progressive Web App (Potential)
- Add service worker for offline support
- Manifest.json for installability
- Cache assets for faster load

---

## Conclusion

Doodle2 is built on modern Angular best practices with a signal-based reactive architecture, clear separation of concerns, and a service-oriented design. The application is structured for scalability, maintainability, and progressive enhancement. The signal-based state management eliminates the need for complex state libraries while providing excellent performance and developer experience.

The architecture supports the current feature set while being flexible enough to accommodate future enhancements like backend integration, collaboration features, and advanced animation capabilities.
