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

### Revamped UI Color System

The following colors are used across the revamped listing and form pages:

| Token | Dark Value | Light Value | Usage |
|-------|-----------|-------------|-------|
| Page BG | `#0f172a` | `#f8fafc` | Page background base |
| Page BG Gradient | `#0f172a → #1a2744 → #0f172a` | `#f8fafc → #eef4fb → #f8fafc` | Subtle diagonal gradient (165deg) |
| Card BG (listing) | `rgba(30, 41, 59, 0.5)` | `rgba(255, 255, 255, 0.55)` | Glassmorphism cards |
| Card BG (forms) | `#1e293b` | `#ffffff` | Solid form item cards |
| Card Border | `rgba(71, 85, 105, 0.4)` | `rgba(226, 232, 240, 0.6)` | Card borders |
| Card Inner Gradient | `rgba(43, 146, 187, 0.3) → transparent` | `rgba(43, 146, 187, 0.25) → transparent` | 145deg gradient on `.card-content` |
| Accent Blue | `#3fbcd3` | `#2b92bb` | Detail icons, player count |
| Primary Blue | `#2b92bb` | `#2b92bb` | Buttons, active states |
| Title Text | `#f1f5f9` | `#1e293b` | Card titles, bold text |
| Subtitle Text | `#94a3b8` | `#64748b` | Labels, secondary text |
| Muted Text | `#64748b` | `#94a3b8` | Placeholders, hints |
| Divider | `rgba(71, 85, 105, 0.3)` | `rgba(226, 232, 240, 0.6)` | Card dividers |
| Violet (Teams) | `#8b5cf6 → #7c3aed` | `#7c3aed` | Team type accent strip + badge |
| Blue (Singles) | `#35adff` | `#007bff` | Singles type accent + badge |
| Orange (Doubles) | `#f76e04` | `#fd7e14` | Doubles type accent + badge |
| Public Green | `#10b981` | `#10b981` | Corner ribbon (public) |
| Private Red | `#ef4444` | `#ef4444` | Corner ribbon (private) |

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
2.  **Storage**: Theme persisted as boolean in `@ionic/storage` under key `dashboardTheme`.
3.  **CSS Classes**: Components toggle `.light-theme` class on the page element. Dark is the default.
4.  **Events**: `theme:changed` event via Ionic `Events` for cross-component sync.

### Standard Theme Implementation Pattern (Required for all pages)

```typescript
// 1. Imports
import { ThemeService } from '../../../../services/theme.service';
import { Events } from 'ionic-angular';
import { Renderer2 } from '@angular/core';

// 2. Constructor injection
constructor(
  private themeService: ThemeService,
  private events: Events,
  private renderer: Renderer2,
  public storage: Storage
) {}

// 3. Properties
isDarkTheme: boolean = true; // Default dark

// 4. ionViewWillEnter — load + subscribe
ionViewWillEnter() {
  this.loadTheme();
  this.themeService.isDarkTheme$.subscribe(isDark => {
    this.applyTheme(isDark);
  });
  this.events.subscribe('theme:changed', (isDark) => {
    this.applyTheme(isDark);
  });
}

// 5. ionViewWillLeave — cleanup
ionViewWillLeave() {
  this.events.unsubscribe('theme:changed');
}

// 6. loadTheme — read from storage
async loadTheme() {
  const isDarkTheme = await this.storage.get('dashboardTheme');
  const isDark = isDarkTheme !== null ? isDarkTheme : true;
  this.isDarkTheme = isDark;
  this.applyTheme(isDark);
}

// 7. applyTheme — toggle class on page element
applyTheme(isDark: boolean) {
  this.isDarkTheme = isDark;
  const el = document.querySelector('page-YOURPAGE');
  if (el) {
    isDark ? this.renderer.removeClass(el, 'light-theme')
           : this.renderer.addClass(el, 'light-theme');
  }
}
```

### SCSS Theme Pattern

Dark theme is the default. Light theme uses `&.light-theme` selector on the page element:

```scss
page-example {
  // Dark theme styles (default)
  .scroll-content { background: #0f172a !important; }

  // Light theme overrides
  &.light-theme {
    .scroll-content { background: #f8fafc !important; }
  }
}
```

---

## 5. Typography

The application uses **Roboto** and **Noto Sans** (imported in `variables.scss`).

*   **Primary Font**: Roboto (Ionic default)
*   **Secondary Font**: Noto Sans

### Typography Scale (Revamped Pages)

| Element | Size | Weight | Line-height | Letter-spacing | Notes |
|---------|------|--------|-------------|----------------|-------|
| Card Title | 15px | 700 | 1.3 | -0.2px | Tight tracking for headings |
| Card Subtitle | 12px | 500 | 1.3 | 0.1px | |
| Detail Text | 13px | 600 | 1.3 | 0.1px | Date, venue, age group |
| Tags | 10px | 700 | 1.4 | 0.4px | Uppercase |
| Player Count | 11px | 700 | 1 | 0.2px | Accent blue color |
| Card Description | 12px | 400 | 1.5 | 0.1px | |
| Tab Buttons | 13px | 700 | 1 | 0.3px | |
| Search Input | 14px | 500 | 1.2 | 0.1px | |
| Empty Title | 18px | 700 | 1.3 | -0.3px | |
| Empty Description | 13px | 400 | 1.5 | 0.1px | |

### Form Typography Scale (Create Pages)

| Element | Size | Weight | Style | Notes |
|---------|------|--------|-------|-------|
| Form Label | 11px | 700 | Uppercase, `letter-spacing: 0.6px` | Muted color (`#64748b` / `#94a3b8`) |
| Form Value | 16px | 600 | Right-aligned | Bold, dark color |
| Toggle Label | 11px | 700 | Uppercase, `letter-spacing: 0.6px` | Same as form label |
| Description Textarea | 15px | 500 | Left-aligned, `line-height: 1.5` | |
| Create Button | 16px | 700 | `letter-spacing: 0.5px` | Gradient shine animation |

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

## 8. Revamped Page Architectures

### 8.1 League & Team Listing (`leagueteamlisting`)

**Pattern**: Glassmorphism card grid with gradient page background.

**Structure**:
- Page background: 165deg gradient (`#0f172a → #1a2744 → #0f172a`)
- Tab pill toggle: Sliding pill selector (Competitions / Teams)
- Search bar: Rounded pill with count badge
- Card grid: Single column mobile, 2-col tablet, 3-col desktop
- External toggle: Right-aligned toggle on Teams tab

**Card Anatomy (`.revamp-card`)**:
```
┌─────────────────────────────────────┐
│▌ Card Accent (5px, color by type)   │ ← Corner Ribbon (public/private)
│  ┌──────┐ Title              →      │
│  │ Icon │ Subtitle                  │
│  └──────┘                           │
│  ─────────── divider ───────────    │
│  📅 Date · 📍 Venue                │
│  [Type Tag] [Category] [Grade]      │
└─────────────────────────────────────┘
```

- **Accent strip**: Dynamic color from `getLeagueTypeColor()` — violet for Teams, blue for Singles, orange for Doubles
- **Icon**: Activity-specific via `getActivityIcon()`, trophy fallback
- **Icon wrapper**: Frosted glass (`backdrop-filter: blur(8px)`)
- **Corner ribbon**: CSS triangle with globe/lock icon (green public, red private)
- **Card content**: Inner gradient overlay (`rgba(43, 146, 187, 0.3)`)
- **Tags**: Uppercase pills — type (colored), category (muted), grade (purple)
- **Team cards**: Show age group (no truncation) + venue + player count with people icon

**Responsive Breakpoints**:
| Breakpoint | Grid | Card Padding | Title Size |
|-----------|------|-------------|-----------|
| < 360px | 1 col | 10px | 13px |
| 360–399px | 1 col | 12px | 14px |
| 400px+ | 1 col | 14px | 15px |
| 768px+ | 2 col | 16px | 16px |
| 1024px+ | 3 col | 16px | 16px |

### 8.2 Create Match & Create League Forms

**Pattern**: Elevated card form items with uppercase labels and bold values.

**Structure**:
- Page background: Solid (`#f8fafc` light / `#0f172a` dark)
- Form items: Rounded cards (`border-radius: 12px`) with subtle shadow
- Labels: 11px uppercase, muted color, left-aligned
- Values: 16px bold, right-aligned
- Description: Stacked label + glassmorphism textarea (`.description-item`)
- Create button: Sticky floating gradient button with shine animation

**Form Item Anatomy**:
```
┌──────────────────────────────────────┐
│  LABEL (muted, uppercase)    Value → │
└──────────────────────────────────────┘
```

**Toggle Pattern**:
- Width: 54px, Height: 28px
- Track: `#cbd5e1` off / `#2b92bb` on
- Knob: 22px white circle with shadow

**Public/Private Buttons**:
- Two side-by-side buttons with globe/lock icons
- Selected state: `#2b92bb` background, white text

**Create Button (`.btn-gradient-shine`)**:
- Sticky bottom position inside `ion-content` (not `ion-footer`)
- Gradient: `linear-gradient(135deg, #2b92bb, #35adff)`
- Animated shine sweep (`@keyframes shine-sweep`, 3s loop)
- Height: 48px, border-radius: 8px

**Fee Sub-Fields Dropdown (`.fee-sub-fields`)** — now replaced by `<app-expandable-section>` shared component (see Section 8.3).

### 8.3 Shared Reusable Components (`src/shared/components/`)

All shared components use `ViewEncapsulation.None` with dark theme as default and `.light-theme` as the only override. Registered in `SharedComponentsModule` — must be imported in any module that uses them.

**Module**: `src/shared/components/shared-components.module.ts`
**Important**: If a page is declared in `SharedmoduleModule` (`src/pages/sharedmodule/sharedmodule.module.ts`), `SharedComponentsModule` must be imported there too — not just in the page's own module.

#### `<app-expandable-section>` — Generic Toggle Dropdown

Replaces the old `.fee-sub-fields` + `.paid-compact-item` pattern. Uses `ng-content` projection for any child content.

| Input/Output | Type | Description |
|---|---|---|
| `[(expanded)]` | `boolean` | Two-way binding for toggle state |
| `label` | `string` | Header label text (e.g., "FEE", "ADVANCED") |
| `(expandedChange)` | `EventEmitter<boolean>` | Fires when toggle changes |

**Animation**: `max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)`, `opacity 0.3s ease 0.1s`
**Visual**: Left accent border `3px solid #2b92bb`, child items `border-radius: 0 12px 12px 0`

```html
<app-expandable-section label="FEE" [(expanded)]="isPaid" (expandedChange)="onFeeToggle($event)">
  <ion-item><!-- any content --></ion-item>
</app-expandable-section>
```

#### `<app-access-toggle>` — Public/Private Sliding Pill

Modern sliding pill toggle replacing the old `.select-type` button pair.

| Input/Output | Type | Description |
|---|---|---|
| `[(isPublic)]` | `boolean` | Two-way binding for public/private state |
| `label` | `string` | Label text (e.g., "Status", "Team Access") |
| `(isPublicChange)` | `EventEmitter<boolean>` | Fires when selection changes |

**Visual**: Sliding blue pill (`#2b92bb`) on dark track (`#334155`) / light track (`#e2e8f0`)
**Animation**: `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

```html
<app-access-toggle [(isPublic)]="publicType"
  (isPublicChange)="changeType($event ? 'public' : 'private')" label="Status">
</app-access-toggle>
```

#### `<app-pill-tabs>` — Sliding Tab Toggle

Two-tab sliding pill selector (e.g., Competitions / Teams).

| Input/Output | Type | Description |
|---|---|---|
| `[(activeIndex)]` | `number` | Two-way binding (0 = left, 1 = right) |
| `leftLabel` / `rightLabel` | `string` | Tab labels |
| `leftIcon` / `rightIcon` | `string` | Optional Ionic icon names |
| `(activeIndexChange)` | `EventEmitter<number>` | Fires when tab changes |

**Dark**: `#1e293b` track, `#2b92bb` slider, `#64748b` inactive text
**Light**: `#e2e8f0` track

```html
<app-pill-tabs leftLabel="Competitions" rightLabel="Teams"
  leftIcon="trophy" rightIcon="people"
  [(activeIndex)]="activeIndex" (activeIndexChange)="changeType($event)">
</app-pill-tabs>
```

#### `<app-search-bar>` — Rounded Search Input with Count Badge

Pill-shaped search input with icon, placeholder, and result count badge.

| Input/Output | Type | Description |
|---|---|---|
| `[(value)]` | `string` | Two-way binding for search text |
| `placeholder` | `string` | Placeholder text |
| `count` | `number` | Result count shown in badge (null to hide) |
| `(search)` | `EventEmitter<any>` | Fires on input event (passes native event) |

**Dark**: `#1e293b` bg, `#334155` border, `#f1f5f9` text, `#2b92bb` count badge
**Light**: `#ffffff` bg, `#e2e8f0` border, `#1e293b` text
**Focus**: Border changes to `#2b92bb`

```html
<app-search-bar
  [placeholder]="'Search competitions...'"
  [(value)]="searchInput"
  [count]="filteredItems.length"
  (search)="onSearch($event)">
</app-search-bar>
```

---

## 9. Best Practices

1.  **Variable Usage**: Use SCSS variables (`$colors`, `$blue-light`, etc.) for shared values. Page-specific hex values are acceptable when scoped inside the page selector.
2.  **Scoped Styling**: Wrap page-specific styles in the page selector (e.g., `page-matchdetails { ... }`).
3.  **Theme Awareness**: When adding new text or backgrounds, always define both Light and Dark mode variations.
4.  **Asset Handling**: Store background images in `assets/images/background/` and use variables for their paths.
5.  **Theme Storage Key**: Always use `dashboardTheme` (boolean) from `@ionic/storage`. Never use `selectedTheme`.
6.  **Theme Subscription Cleanup**: Always unsubscribe from `theme:changed` events in `ionViewWillLeave()`.
7.  **Form Pages**: Use SCSS-only styling changes. Never modify HTML structure for visual changes on form pages to avoid breaking `ngModel` bindings and `*ngIf` conditions.
8.  **Glassmorphism**: Use `backdrop-filter: blur(16px)` with semi-transparent backgrounds. Add `-webkit-backdrop-filter` for iOS support.
9.  **Responsive**: Use `min-width: 0` on flex children and `text-overflow: ellipsis` to prevent layout breaks on narrow screens. Exception: age group text should never truncate.
10. **Shared Components**: Use `<app-expandable-section>`, `<app-access-toggle>`, `<app-pill-tabs>`, and `<app-search-bar>` from `SharedComponentsModule` instead of duplicating markup. Import the module in both the page module AND `SharedmoduleModule` if the page is declared there.
11. **Component Theming**: Shared components use `ViewEncapsulation.None` with dark as default. Only add `.light-theme` overrides — never use `:not(.light-theme)` selectors.
12. **CUSTOM_ELEMENTS_SCHEMA**: If a module uses this schema, Angular treats unknown elements as pass-through HTML. Ensure `SharedComponentsModule` is imported so `app-*` components are recognized as Angular components, not inert elements.
