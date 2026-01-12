---
description: Theming and UI guidelines for the Ionic 3 application
---

# Theming and UI Rules

This document outlines the theming architecture, UI standards, and best practices for the ActivityPro Ionic 3 application.

---

## 1. File Structure

| File | Purpose |
|------|---------|
| `src/theme/variables.scss` | Global Ionic SCSS variables, color palette definitions |
| `src/app/app.scss` | Global application styles, reusable utility classes |
| `src/services/theme.service.ts` | Runtime theme management (dark/light mode) |
| `src/pages/type2/appuiconfig/theme.ts` | Admin theme configuration page |
| `src/pages/_league-theme.scss` | League-specific theming overrides |

---

## 2. Color Palette

### Primary Colors (Defined in `variables.scss`)

```scss
$colors: (
  primary: #488aff,
  secondary: #32db64,
  danger: #f53d3d,
  light: #f4f4f4,
  dark: #222,
  Peace: #f76e04
);
```

### Application-Specific Colors (Defined in `app.scss`)

| Variable | Value | Usage |
|----------|-------|-------|
| `$dashoboard-icon-color` | `#3fbcd3` | Dashboard icons |
| `$blue-light` | `#3fbcd3` | Primary accent color |
| `$themecardleftbordercolor` | `#35adff` | Card left border highlights |
| `$cardhightlighttextcolor` | `#111164` | Highlighted text in cards |
| `$themelistotheritemcolor1` | `#7F7F7F` | Secondary list item text |
| `$backgroundcolor` | `#f8f8f8` | Default page background |
| `$deepblueundistinguishablebluecolor` | `#01012c` | Deep blue accent |
| `$red-background` | `#fff6f6` | Error/danger background |
| `$red-light` | `#ffa99c` | Light red accent |
| `$red-dark` | `#74000e` | Dark red for critical errors |

---

## 3. Dynamic Theming (Firebase-based)

The application supports per-ParentClub theming stored in Firebase. Theme configuration is fetched from:

```
ParentClub/Type2/{ParentClubKey}/Theme
```

### Theme Object Structure

```typescript
interface ThemeConfig {
  HeaderBG: string;      // Header background color (default: "#17445b")
  HeaderText: string;    // Header text color (default: "#f4f4f4")
  TabBG: string;         // Tab bar background (default: "#17445b")
  TabText: string;       // Tab bar text color (default: "#f4f4f4")
  DashboardBG: string;   // Dashboard background (default: "#17445b")
  HomepageBG: string;    // Homepage background (default: "#f4f4f4")
}
```

### Usage

1. Fetch theme config from Firebase on app initialization
2. Apply colors dynamically using Angular property binding
3. Admin users can modify theme via `Theme` page (`src/pages/type2/appuiconfig/theme.ts`)

---

## 4. Dark Mode Support

Use `ThemeService` for dark mode toggling:

```typescript
import { ThemeService } from '../services/theme.service';

constructor(private themeService: ThemeService) {
  // Subscribe to theme changes
  this.themeService.isDarkTheme$.subscribe(isDark => {
    // Apply dark theme styles
  });
}

// Toggle theme
this.themeService.toggleTheme();

// Set specific theme
this.themeService.setTheme(true);  // Enable dark mode
this.themeService.setTheme(false); // Enable light mode
```

---

## 5. UI Component Standards

### Status Bar

```typescript
// Light background with dark content
this.statusBar.backgroundColorByHexString('#f7f7f7');
this.statusBar.styleDefault();
```

### Toast Messages

Use consistent toast styling classes:

| Class | Color | Usage |
|-------|-------|-------|
| `.success` | `#32db64` | Success notifications |
| `.error` | `#f53d3d` | Error notifications |
| `.info` | `#f76e04` | Informational messages |

```typescript
this.commonService.toastMessage(
  "Message text",
  2500,
  ToastMessageType.Success,
  ToastPlacement.Top
);
```

### Card Styling

```scss
// iOS/Android consistent card margins
$card-ios-margin-top: 6px;
$card-ios-margin-bottom: 6px;
$card-md-margin-top: 6px;
$card-md-margin-bottom: 6px;
```

### Toggle Buttons

Standard toggle sizing:

```scss
// iOS
$toggle-ios-height: 20px;
$toggle-ios-width: 30px;

// Material Design
$toggle-md-track-width: 30px;
$toggle-md-track-height: 10px;
```

---

## 6. Utility Classes

### Text Utilities

```scss
.tk-center { text-align: center; }

.para_overflow {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.margin_auto { margin: auto; }
```

### Custom Toggle Component

Use the `.custom_toggle` class for custom toggle switches:

```html
<label class="custom_toggle">
  <input type="checkbox" [(ngModel)]="isEnabled">
  <span data-checked="ON" data-unchecked="OFF"></span>
</label>
```

---

## 7. Modal & Popup Styling

### Standard Modal Wrapper

```scss
.modal_wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  animation: popup 0.9s;
}

.modal_content {
  position: relative;
  width: 90%;
  left: 50%;
  top: 50%;
  height: auto;
  padding: 10px;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
```

### Alert Customization

For custom alert widths:

```scss
.event-alert .alert-wrapper {
  max-width: 320px !important;
}
```

---

## 8. Tablet/iPad Support

Ensure modals display full-screen on larger devices:

```scss
@media only screen and (min-height: 768px) and (min-width: 768px) {
  .modal-wrapper {
    left: 0 !important;
    top: 0 !important;
    position: absolute;
    width: 100% !important;
    height: 100% !important;
  }
}
```

---

## 9. Loading Spinner

Use the custom bounce spinner for loading states:

```html
<div class="spinner1">
  <div class="bounce1"></div>
  <div class="bounce2"></div>
  <div class="bounce3"></div>
</div>
```

---

## 10. Animations

### Zoom-In Effect (for magnific popup)

The `.mfp-zoom-in` class provides smooth zoom transitions.

### Popup Animation

The `@keyframes popup` provides a bounce-in effect for modals.

---

## 11. Best Practices

1. **Use SCSS variables** - Never hardcode colors; always use defined variables
2. **Platform-specific styles** - Use `.md`, `.ios`, or `.wp` mode classes for platform-specific styling
3. **Consistent spacing** - Use the predefined margin/padding values
4. **Firebase theming** - Always check for Firebase theme overrides before applying defaults
5. **Accessibility** - Ensure sufficient color contrast (WCAG 2.1 AA minimum)
6. **Responsive design** - Test on both mobile and tablet viewports

---

## 12. Adding New Theme Colors

1. Add SCSS variable in `src/theme/variables.scss` or `src/app/app.scss`
2. If the color should be editable per-club, add it to the `ThemeConfig` interface
3. Update `theme.ts` to handle the new color in the admin configuration
4. Update Firebase `Theme` object in `ParentClub/Type2/{key}/Theme`

---

## 13. Background Images

Default background path:

```scss
$color1-login-background-image: '../assets/images/background/loginbg.png';

.scroll-content {
  background-image: url("../assets/images/background/backgroundimg1.png") !important;
}
```

Store all background images in `src/assets/images/background/`.
