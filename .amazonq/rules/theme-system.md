---
inclusion: always
---

# ActivityPro Theme System Documentation

## Overview
The ActivityPro app implements a centralized dark/light theme system that provides consistent theming across all pages and components. The system is built around a global `ThemeService` that manages theme state and automatically applies changes throughout the application.

## Architecture

### Core Components

#### 1. ThemeService (`src/services/theme.service.ts`)
```typescript
@Injectable()
export class ThemeService {
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  public isDarkTheme$ = this.isDarkThemeSubject.asObservable();

  toggleTheme(): void;
  setTheme(isDark: boolean): void;
  getCurrentTheme(): boolean;
}
```

**Key Features:**
- Uses `BehaviorSubject` for reactive theme state management
- Initializes from system preference (`prefers-color-scheme: dark`)
- Provides observable stream for components to subscribe to theme changes
- No local storage dependency - maintains state globally in memory

#### 2. Dashboard Implementation
The dashboard serves as the primary theme controller:

```typescript
// Dashboard constructor
constructor(..., private themeService: ThemeService) {
  // Subscribe to global theme changes
  this.themeService.isDarkTheme$.subscribe(isDark => {
    this.isDarkTheme = isDark;
    this.applyTheme(isDark);
  });
}

// Theme toggle method
toggleTheme(): void {
  this.themeService.toggleTheme();
}

// Theme application
private applyTheme(isDark: boolean): void {
  const dashboardElement = document.querySelector('dashboard-page');
  if (dashboardElement) {
    if (isDark) {
      dashboardElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    } else {
      dashboardElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
    }
  }
}
```

## Theme Implementation Pattern

### For Any Component
```typescript
// 1. Import ThemeService
import { ThemeService } from '../../../services/theme.service';

// 2. Inject in constructor
constructor(..., private themeService: ThemeService) {}

// 3. Subscribe to theme changes
ionViewWillEnter() {
  this.themeService.isDarkTheme$.subscribe(isDark => {
    const element = document.querySelector('page-component-name');
    if (element) {
      if (isDark) {
        element.classList.remove('light-theme');
      } else {
        element.classList.add('light-theme');
      }
    }
  });
}

// 4. Add to module providers
@NgModule({
  providers: [ThemeService]
})
```

## CSS/SCSS Theme Handling

### Color Scheme Variables
```scss
// Dark theme (default)
$primary-blue: #2b92bb;        // Main theme
$secondary-blue: #35adff;      // Secondary theme
$light-blue: #3fbcd3;         // Accent color
$success-green: #32db64;       // Success states
$error-red: #f53d3d;          // Error states
$warning-orange: #f76e04;      // Warning states

// Background colors
$dark-bg: #1a1a1a;           // Dark background
$dark-card: #2d2d2d;         // Dark card background
$dark-text: #ffffff;         // Dark theme text

// Light theme overrides
$light-bg: #ffffff;          // Light background
$light-card: #f8f9fa;        // Light card background
$light-text: #333333;        // Light theme text
```

### Theme-Specific Styling Pattern
```scss
page-component {
  // Default dark theme styles
  background-color: $dark-bg;
  color: $dark-text;
  
  .modern-card {
    background-color: $dark-card;
    color: $dark-text;
  }
  
  // Light theme overrides
  &.light-theme {
    background-color: $light-bg;
    color: $light-text;
    
    .modern-card {
      background-color: $light-card;
      color: $light-text;
      border: 1px solid #e0e0e0;
    }
    
    .modern-navbar {
      background-color: $light-bg;
      color: $light-text;
    }
  }
}
```

## Dashboard Theme Controls

### Theme Toggle Button
Located in dashboard header:
```html
<div class="theme-toggle" (click)="toggleTheme()">
  <ion-icon [name]="isDarkTheme ? 'sunny' : 'moon'"></ion-icon>
</div>
```

### Visual Indicators
- **Dark Mode**: Moon icon (🌙)
- **Light Mode**: Sun icon (☀️)
- Icon changes dynamically based on current theme

## Component-Specific Theme Handling

### Modern Dashboard Cards
```scss
.modern-card {
  // Dark theme (default)
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &.light-theme {
    background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
}
```

### Icon and Button Theming
```scss
.card-icon-wrapper {
  // Dark theme
  background: rgba(43, 146, 187, 0.2);
  
  &.light-theme {
    background: rgba(43, 146, 187, 0.1);
  }
}

.theme-btn {
  // Dark theme
  color: #ffffff;
  
  &.light-theme {
    color: #333333;
  }
}
```

## Pages with Theme Integration

### ✅ Implemented Pages
- **Dashboard** - Primary theme controller
- **Competitions/Teams Listing** - Follows global theme
- **Tournament** - Follows global theme

### 🔄 Implementation Pattern for New Pages
1. Import and inject `ThemeService`
2. Subscribe to `isDarkTheme$` observable
3. Apply/remove `light-theme` CSS class
4. Add `ThemeService` to module providers
5. Create theme-specific SCSS styles

## Theme State Management

### Reactive Updates
- All components automatically update when theme changes
- No manual refresh or navigation required
- Changes propagate instantly across the app

### Memory Management
- Theme state maintained in `BehaviorSubject`
- No persistent storage dependency
- Initializes from system preference on app start

## Best Practices

### CSS Organization
```scss
page-name {
  // 1. Default (dark) theme styles first
  background-color: $dark-bg;
  
  // 2. Component-specific dark styles
  .component {
    color: $dark-text;
  }
  
  // 3. Light theme overrides at the end
  &.light-theme {
    background-color: $light-bg;
    
    .component {
      color: $light-text;
    }
  }
}
```

### Component Implementation
```typescript
// ✅ Good - Subscribe in ionViewWillEnter
ionViewWillEnter() {
  this.themeService.isDarkTheme$.subscribe(isDark => {
    this.applyTheme(isDark);
  });
}

// ❌ Avoid - Don't store theme in local storage
// ❌ Avoid - Don't create individual theme toggles
// ❌ Avoid - Don't manually manage theme state
```

## Color Palette

### Primary Colors
- **Primary Blue**: `#2b92bb` - Main brand color
- **Secondary Blue**: `#35adff` - Secondary actions
- **Light Blue**: `#3fbcd3` - Accent elements

### Status Colors
- **Success**: `#32db64` - Success states, confirmations
- **Error**: `#f53d3d` - Error states, warnings
- **Warning**: `#f76e04` - Warning states, alerts

### Theme-Specific Colors
```scss
// Dark Theme
$dark-primary: #2b92bb;
$dark-bg: #1a1a1a;
$dark-card: #2d2d2d;
$dark-text: #ffffff;
$dark-border: rgba(255, 255, 255, 0.1);

// Light Theme  
$light-primary: #2b92bb;
$light-bg: #ffffff;
$light-card: #f8f9fa;
$light-text: #333333;
$light-border: rgba(0, 0, 0, 0.1);
```

## Future Enhancements

### Potential Improvements
- System theme detection and auto-switching
- Custom theme colors per parent club
- Theme persistence across app sessions
- Animated theme transitions
- High contrast mode support

### Integration Points
- All new pages should implement theme subscription
- Custom components should support theme variants
- Third-party components should be themed consistently