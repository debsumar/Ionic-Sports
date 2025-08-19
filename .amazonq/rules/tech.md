---
inclusion: always
---

# ActivityPro Development Guidelines

## Technology Stack
- **Ionic v3.9.5** + Angular v5.2.11 + TypeScript v3.3.3
- **Cordova** for native functionality
- **Apollo/GraphQL** + Firebase v4.12.1 backend

## Architecture

### Directory Structure
```
src/
├── app/                   # Core module
├── pages/                 # Application pages (lazy-loaded)
│   └── type2/            # Feature modules (league, match, member, etc.)
├── services/              # Global services
├── shared/                # Utilities, models, constants
├── components/            # Reusable UI components
└── theme/                 # Global styling
```

### Page Structure (4-file pattern)
- `[page-name].ts` - Component logic
- `[page-name].html` - Template
- `[page-name].scss` - Styles  
- `[page-name].module.ts` - Module for lazy loading

## Coding Standards

### Naming Conventions
- **Classes**: PascalCase (`CommonService`, `GalleryModel`)
- **Interfaces**: PascalCase with `I` prefix (`IActivityDetails`)
- **Properties/Methods**: camelCase (`parentclubId`, `validateUserInput()`)
- **Input Classes**: Suffix with `Input` (`VideoCreationInput`)
- **Model Classes**: Suffix with `Model` (`GalleryModel`)

### Required API Properties
All API calls must include:
```typescript
parentclubId: string;    // Parent club context
clubId: string;          // Club identification
activityId: string;      // Activity/sport identification
memberId: string;        // User identification
action_type: number;     // API action type
device_type: number;     // 1=Android, 2=iOS
app_type: number;        // Application type
device_id: string;       // Device identifier
updated_by: string;      // User who made changes
```

### Component Lifecycle
```typescript
ionViewDidLoad()     // Initial setup
ionViewWillEnter()   // Refresh data when entering
ionViewWillLeave()   // Cleanup subscriptions
```

### Subscription Management
Always cleanup in `ionViewWillLeave()`:
```typescript
if (this.subscription && !this.subscription.closed) {
  this.subscription.unsubscribe();
}
```

## Core Services
- **CommonService**: Utilities, loaders, toasts, date functions
- **HttpService**: HTTP client with environment-aware endpoints
- **SharedServices**: Application state and shared data
- **FirebaseService**: Authentication and real-time data

## UI Standards

### Ionic Components
- Layout: `ion-content`, `ion-header`, `ion-navbar`
- Grid: `ion-row`, `ion-col` with specs (`col-3`, `col-6`)
- Forms: `ion-item`, `ion-label`, `ion-input`, `ion-select`

### Color Scheme
```scss
$primary-blue: #2b92bb;      // Main theme
$secondary-blue: #35adff;    // Secondary theme
$light-blue: #3fbcd3;       // Accent color
$success-green: #32db64;     // Success states
$error-red: #f53d3d;        // Error states
```

### Toast Messages
```typescript
this.commonService.toastMessage(
  'Message text',
  2000,
  ToastMessageType.Success
);
```

## Data Management
- Use `@ionic/storage` for persistence
- Use `SharedServices` for app-wide state
- Use `BehaviorSubject` for reactive updates
- Store user context (parentclubId, memberId, etc.)

## Best Practices
- Use `@IonicPage()` for lazy loading
- Always cleanup subscriptions
- Handle HTTP errors with user-friendly messages
- Use TypeScript interfaces for type safety
- Use emoji comments: `// 🏢 Parent club ID`
- Cache frequently accessed data
- Check network connectivity before API calls