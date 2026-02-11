# Epic 1: Project & Scene Management - Implementation Tasks

## Overview
Epic 1 establishes the foundation for organizing and managing animation work in Doodle2. This includes project creation, scene management, and file operations.

## Technical Approach

### Architecture Decisions
1. **Angular Standalone Components**: Use modern Angular standalone component architecture (no NgModules)
2. **State Management**: Service-based state management with RxJS BehaviorSubjects/Signals
3. **Storage**: Browser LocalStorage for initial implementation (future: IndexedDB/Cloud)
4. **Routing**: Angular Router for navigation between dashboard and project workspace
5. **Form Management**: Reactive Forms for project creation and settings

### Data Models

#### Project Model
```typescript
interface Project {
  id: string;              // UUID
  name: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
  };
  frameRate: number;       // fps (1-60)
  backgroundColor: string; // hex color
  createdAt: Date;
  updatedAt: Date;
  scenes: Scene[];
  metadata?: {
    template?: string;     // '1080p', '4K', 'social', etc.
  };
}
```

#### Scene Model
```typescript
interface Scene {
  id: string;              // UUID
  projectId: string;
  name: string;
  duration: number;        // in frames
  notes?: string;
  order: number;           // for scene ordering
  thumbnail?: string;      // base64 or blob URL
  frames: Frame[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Frame Model (basic for Epic 1)
```typescript
interface Frame {
  id: string;
  sceneId: string;
  order: number;
  elements: SVGElement[];  // to be expanded in Epic 3
  thumbnail?: string;
}
```

## Implementation Tasks

### Phase 1: Core Services & Models (Tasks 1-5)

**Task 1: Create Data Models**
- [ ] Create `src/app/models/project.model.ts`
- [ ] Create `src/app/models/scene.model.ts`
- [ ] Create `src/app/models/frame.model.ts`
- [ ] Add utility interfaces for dimensions, templates, etc.

**Task 2: Create StorageService**
- [ ] Create `src/app/services/storage.service.ts`
- [ ] Implement LocalStorage wrapper with error handling
- [ ] Methods: save, load, delete, clear, exists
- [ ] Add data serialization/deserialization helpers
- [ ] Implement versioning for data migration

**Task 3: Create ProjectService**
- [ ] Create `src/app/services/project.service.ts`
- [ ] Implement CRUD operations (create, read, update, delete)
- [ ] State management with BehaviorSubject/Signal for active project
- [ ] Methods for:
  - `createProject(data: Partial<Project>): Project`
  - `getProject(id: string): Project | null`
  - `getAllProjects(): Project[]`
  - `updateProject(id: string, data: Partial<Project>): void`
  - `deleteProject(id: string): void`
  - `saveProject(project: Project): void`
  - `getRecentProjects(limit: number): Project[]`
- [ ] UUID generation for project IDs
- [ ] Timestamp management (createdAt, updatedAt)

**Task 4: Create SceneService**
- [ ] Create `src/app/services/scene.service.ts`
- [ ] Implement scene CRUD operations within projects
- [ ] Methods for:
  - `createScene(projectId: string, data: Partial<Scene>): Scene`
  - `getScene(projectId: string, sceneId: string): Scene | null`
  - `getScenesByProject(projectId: string): Scene[]`
  - `updateScene(projectId: string, sceneId: string, data: Partial<Scene>): void`
  - `deleteScene(projectId: string, sceneId: string): void`
  - `duplicateScene(projectId: string, sceneId: string): Scene`
  - `reorderScenes(projectId: string, sceneIds: string[]): void`
- [ ] Thumbnail generation (placeholder for now)

**Task 5: Create AutoSaveService**
- [ ] Create `src/app/services/auto-save.service.ts`
- [ ] Implement interval-based auto-save (30 seconds)
- [ ] Track unsaved changes
- [ ] Debounce save operations
- [ ] Save status indicators (saving, saved, error)
- [ ] Manual save trigger

### Phase 2: Project Dashboard (Tasks 6-10)

**Task 6: Create Project Dashboard Component**
- [ ] Create `src/app/components/project-dashboard/project-dashboard.component.ts`
- [ ] Display grid of project cards
- [ ] Search/filter functionality
- [ ] Sort options (recent, name, date)
- [ ] Empty state when no projects
- [ ] Loading states

**Task 7: Create Project Card Component**
- [ ] Create `src/app/components/project-card/project-card.component.ts`
- [ ] Display project thumbnail (first scene preview)
- [ ] Show metadata (name, dimensions, frame rate, last modified)
- [ ] Action buttons (open, delete, duplicate)
- [ ] Hover effects and animations
- [ ] Confirmation dialog for delete

**Task 8: Create Project Creation Modal/Component**
- [ ] Create `src/app/components/project-create/project-create.component.ts`
- [ ] Reactive form with validation
- [ ] Fields: name, description, dimensions, frame rate, background color
- [ ] Template selector (1080p, 4K, 720p, Instagram, TikTok, custom)
- [ ] Template presets:
  - 1080p: 1920x1080, 30fps
  - 4K: 3840x2160, 30fps
  - 720p: 1280x720, 24fps
  - Instagram Square: 1080x1080, 30fps
  - Instagram Story: 1080x1920, 30fps
  - TikTok: 1080x1920, 30fps
- [ ] Color picker for background
- [ ] Form validation (required fields, dimension limits)
- [ ] Create and navigate vs Create and close options

**Task 9: Setup Routing**
- [ ] Update `src/app/app.routes.ts`
- [ ] Routes:
  - `/` - Redirect to dashboard
  - `/dashboard` - Project Dashboard
  - `/project/:id` - Project Workspace (prepare for Epic 2)
  - `/project/:id/settings` - Project Settings
- [ ] Route guards for project existence
- [ ] Navigation between views

**Task 10: Create Project Settings Component**
- [ ] Create `src/app/components/project-settings/project-settings.component.ts`
- [ ] Edit project metadata
- [ ] Change dimensions (with warning about existing content)
- [ ] Adjust frame rate
- [ ] Background color change
- [ ] Delete project with confirmation
- [ ] Cancel/Save buttons

### Phase 3: Scene Management (Tasks 11-14)

**Task 11: Create Scene Manager Component**
- [ ] Create `src/app/components/scene-manager/scene-manager.component.ts`
- [ ] Display as sidebar or panel in project workspace
- [ ] List all scenes in project
- [ ] Add new scene button
- [ ] Scene reordering (drag-and-drop with CDK)
- [ ] Scene search/filter

**Task 12: Create Scene Card/Item Component**
- [ ] Create `src/app/components/scene-item/scene-item.component.ts`
- [ ] Display scene thumbnail
- [ ] Show scene name, duration, frame count
- [ ] Action buttons (edit, duplicate, delete)
- [ ] Click to select/open scene
- [ ] Visual indicator for active scene

**Task 13: Create Scene Dialog Component**
- [ ] Create `src/app/components/scene-dialog/scene-dialog.component.ts`
- [ ] Modal for creating/editing scenes
- [ ] Fields: name, notes, duration estimate
- [ ] Validation
- [ ] Used for both create and edit operations

**Task 14: Implement Scene Duplication**
- [ ] Deep copy scene data
- [ ] Copy all frames in scene
- [ ] Generate new IDs
- [ ] Append " (Copy)" to name
- [ ] Add to project scenes list

### Phase 4: File Operations (Tasks 15-18)

**Task 15: Implement Auto-Save**
- [ ] Integrate AutoSaveService into project workspace
- [ ] Visual indicator in UI (auto-save status)
- [ ] Save on interval (30 seconds)
- [ ] Save on critical actions (scene create/delete)
- [ ] Prevent data loss on browser close

**Task 16: Implement Manual Save**
- [ ] Save button in toolbar
- [ ] Keyboard shortcut (Ctrl+S / Cmd+S)
- [ ] Save with timestamp
- [ ] Success/error feedback
- [ ] Save status in UI

**Task 17: Implement Export/Import Project**
- [ ] Export project as JSON file
- [ ] Download functionality
- [ ] Import from JSON file
- [ ] File validation on import
- [ ] Error handling for corrupted files
- [ ] Version compatibility checking

**Task 18: Recent Projects List**
- [ ] Track last opened projects
- [ ] Store in separate LocalStorage key
- [ ] Limit to last 10 projects
- [ ] Display in dashboard
- [ ] Quick access section

### Phase 5: UI/UX Polish (Tasks 19-22)

**Task 19: Create Shared UI Components**
- [ ] Button component with variants
- [ ] Modal/Dialog component
- [ ] Confirmation dialog component
- [ ] Toast/Notification service
- [ ] Loading spinner component
- [ ] Empty state component

**Task 20: Styling and Theme**
- [ ] Setup SCSS variables and mixins
- [ ] Color palette definition
- [ ] Typography system
- [ ] Spacing system
- [ ] Component styles
- [ ] Responsive layouts

**Task 21: Error Handling**
- [ ] Global error handling service
- [ ] User-friendly error messages
- [ ] Retry mechanisms for storage errors
- [ ] Error logging (console for now)
- [ ] Graceful degradation

**Task 22: Testing Setup**
- [ ] Unit tests for services
- [ ] Component tests
- [ ] Integration tests for key workflows
- [ ] Test utilities and mocks

## Dependencies

### Angular Dependencies
- @angular/common
- @angular/core
- @angular/forms (ReactiveFormsModule)
- @angular/router
- @angular/cdk (for drag-and-drop)

### Third-Party Libraries (to consider)
- `uuid`: For generating unique IDs
- `date-fns` or `dayjs`: For date manipulation
- `ngx-color-picker`: For color selection (or build custom)

## Success Criteria

1. ✅ Users can create new projects with templates or custom settings
2. ✅ Projects are persisted in LocalStorage
3. ✅ Users can view all projects in a dashboard
4. ✅ Users can create, edit, and delete scenes within a project
5. ✅ Users can reorder scenes
6. ✅ Users can duplicate scenes
7. ✅ Auto-save works reliably every 30 seconds
8. ✅ Users can manually save projects
9. ✅ Users can export/import projects as JSON
10. ✅ Recent projects are tracked and displayed
11. ✅ UI is responsive and intuitive
12. ✅ No data loss occurs during normal operations

## Estimated Timeline

- **Phase 1 (Core Services)**: 3-4 days
- **Phase 2 (Dashboard)**: 3-4 days
- **Phase 3 (Scene Management)**: 2-3 days
- **Phase 4 (File Operations)**: 2 days
- **Phase 5 (Polish)**: 2-3 days

**Total Estimate**: 12-16 days

## Notes

- Keep Epic 2 (Frame Management) in mind while building Scene components
- Frame data structure should be flexible for future drawing tools (Epic 3)
- Consider IndexedDB for future performance with large projects
- Cloud sync will be added in a future epic
- Keep components modular for easier testing and maintenance

## Next Steps After Epic 1

1. Begin Epic 2: Frame Management & Timeline
2. Canvas component setup
3. Timeline component with frame thumbnails
4. Frame navigation and onion skinning
