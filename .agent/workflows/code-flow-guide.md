---
description: Guide on code flow, API calls, and component architecture in the Ionic 3 app
---

# Code Flow & Architecture Guidelines

This guide explains the core architectural patterns used in the application, focusing on how components, templates, styles, and modules work together.

**Reference Implementation:** `src/pages/type2/match/matchdetails/matchdetails.ts`

---

## 1. Module Structure

The application uses **Angular Modules (`NgModule`)** to organize code.
-   **Root Module**: `AppModule` (bootstraps the app).
-   **Shared Module**: `SharedmoduleModule` (`src/pages/sharedmodule/sharedmodule.module.ts`) defines components used across multiple pages (e.g., `MatchPage`, `MatchhistoryPage`).
    *   **Exports**: Components listed in `exports` can be used in other modules that import `SharedmoduleModule`.
    *   **IonicPageModule**: Imported here to enable Ionic features in child components.

---

## 2. Component Architecture (TS + HTML + SCSS)

Each page is a triad of files linked by the `@Component` decorator.

### TypeScript Class (`.ts`)
Defines the behavior.
```typescript
@IonicPage()
@Component({
  selector: "page-matchdetails",
  templateUrl: "matchdetails.html",
})
export class MatchdetailsPage { ... }
```

### HTML Template (`.html`)
Defines the view. Uses Angular bindings:
- **Interpolation**: `{{ match.MatchTitle }}`
- **Property Binding**: `[class.selected]="activeType"`
- **Event Binding**: `(click)="changeType(true)"`

### SCSS Styles (`.scss`)
Defines the look.
-   **Scope**: Wrapped in the component selector (e.g., `page-matchdetails { ... }`).
-   **Imports**: Often imports shared mixins like `@include android-sdk35-fixes;`.

---

## 3. Dependency Injection ("Private Constructors")

Dependencies are injected via the constructor. Using `private` or `public` accessors automatically creates class properties.

```typescript
constructor(
  public navCtrl: NavController,        // Navigation
  public commonService: CommonService,  // Utilities (Toast, Loader)
  private graphqlService: GraphqlService // API calls
) {}
```

---

## 4. App Initialization Flow (`app.component.ts`)

1.  **Platform Ready**: `platform.ready()` ensures device plugins are loaded.
2.  **Environment Config**: deeply sets URLs (`emailUrl`, `nodeURL`) based on `isProduction` flag.
3.  **Global Services**: Initializes `GoogleAnalytics`, `OneSignal` (Push Notifications), and `StatusBar`.
4.  **Version Check**: Checks Firebase (`ActivityPro/...`) for forced updates.
5.  **Root Page**: Sets `rootPage` to `MenuOrDashboard`.

---

## 5. Working with APIs (GraphQL)

The app uses `Apollo` and `GraphqlService`.

### Query Pattern
1.  **Define GQL**:
    ```typescript
    const query = gql`query getTeams($input: Input!) { ... }`;
    ```
2.  **Execute**:
    ```typescript
    this.graphqlService.query(query, { input: ... }, 0).subscribe(
      (res) => { this.data = res.data; },
      (err) => { this.commonService.toastMessage("Error", ...); }
    );
    ```

### Mutation Pattern
1.  **Define GQL**:
    ```typescript
    const mutation = gql`mutation update($input: Input!) { ... }`;
    ```
2.  **Execute**:
    ```typescript
    this.graphqlService.mutate(mutation, { input: ... }, 1).subscribe(...);
    ```

---

## 6. Event Handling & Data Flow

*   **Events**: `Events` service is used for cross-component messaging (e.g., `theme:changed`).
*   **Modals**: Use `ModalController` to open child pages (e.g., `MatchinviteplayersPage`) and handle data on dismiss.
    ```typescript
    let modal = this.modalCtrl.create("PageName", { data: ... });
    modal.onDidDismiss(data => { if(data) refresh(); });
    modal.present();
    ```

---

## 7. Theming Integration

*   **Logical**: Components subscribe to theme events.
*   **Properties**: `[class.dark-theme]="isDarkTheme"` is applied to the content wrapper.
*   **Visual**: SCSS files have specific blocks for `.dark-theme` and `.light-theme`.
