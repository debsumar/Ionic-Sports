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

The application supports per-ParentClub theming stored in Firebase. Theme configuration is fetched from `ParentClub/Type2/{ParentClubKey}/Theme` and applied dynamically.

### Theme Object Structure

```typescript
interface ThemeConfig {
  HeaderBG: string;      // Header background color
  HeaderText: string;    // Header text color
  TabBG: string;         // Tab bar background
  TabText: string;       // Tab bar text color
  DashboardBG: string;   // Dashboard background
  HomepageBG: string;    // Homepage background
}
```

---

## 4. Dark Mode Support

The app uses a hybrid approach for Dark Mode:
1.  **Service**: `ThemeService` tracks the state (`isDarkTheme$`).
2.  **CSS Classes**: Components toggle `.dark-theme` / `.light-theme` classes on the content container.
3.  **SCSS Nesting**: Styles are nested within these classes.

```scss
page-matchdetails {
  .light-theme & {
    .largetext { color: #154766; }
  }
  .dark-theme & {
    .largetext { color: #f1f5f9; }
  }
}
```

---

## 5. Typography

The application uses **Roboto** and **Noto Sans** (imported in `variables.scss`).

*   **Primary Font**: Roboto (Ionic default)
*   **Secondary Font**: Noto Sans

Ensure all text elements inherit these defaults unless a specific override is required for branding.

---

## 6. UI Component Standards

### Status Bar
*   Light/Default style: `backgroundColorByHexString('#f7f7f7')`

### Toast Messages
Use `CommonService.toastMessage()` with standard types:
*   **Success**: Green (`#32db64`)
*   **Error**: Red (`#f53d3d`)
*   **Info**: Orange (`#f76e04`)

### Loading Spinners
Use the custom CSS-based spinner `.spinner1` (bouncing dots) rather than the default Ionic loading spinner when possible, for a custom brand feel.

### Modals & Popups
*   **Animation**: Custom `@keyframes popup` animation.
*   **Tablet Support**: Full-screen width on devices > 768px.
*   **Overlay**: `rgba(0, 0, 0, 0.6)` background opacity.

---

## 7. Utility Classes (`app.scss`)

| Class | Description |
|-------|-------------|
| `.tk-center` | Text align center |
| `.para_overflow` | Text truncation with ellipsis |
| `.margin_auto` | `margin: auto` |
| `.custom_toggle` | Custom styled checkbox toggle |
| `.HideButton` | Utilities to hide alert buttons dynamically |

---

## 8. Best Practices

1.  **Variable Usage**: Always use SCSS variables (`$colors`, `$blue-light`, etc.) instead of hardcoded hex values.
2.  **Scoped Styling**: Wrap page-specific styles in the page selector (e.g., `page-matchdetails { ... }`).
3.  **Theme Awareness**: When adding new text or backgrounds, always define both Light and Dark mode variations.
4.  **Asset Handling**: Store background images in `assets/images/background/` and use variables for their paths.
