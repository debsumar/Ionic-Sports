---
description: Guide on code flow, API calls, and component architecture in the Ionic 3 app
---

# Code Flow & Architecture Guidelines

This guide explains the core architectural patterns used in the application, focusing on how components, templates, and styles work together, and how data is fetched via APIs.

**Reference Implementation:** `src/pages/type2/match/matchdetails/matchdetails.ts`

---

## 1. Component Architecture (TS + HTML + SCSS)

Each page or component in the application consists of three file types that work together. This relationship is defined in the `@Component` decorator in the TypeScript file.

### TypeScript Class (`.ts`)
The logic layer. It defines methods, properties, and handles data processing.

```typescript
@IonicPage()
@Component({
  selector: "page-matchdetails", // <page-matchdetails> element in DOM
  templateUrl: "matchdetails.html", // Links to the HTML template
})
export class MatchdetailsPage { ... }
```

### HTML Template (`.html`)
The view layer. It displays data from the TypeScript class using Angular bindings.
- **Interpolation `{{ }}`**: Displays values (e.g., `{{match.MatchTitle}}`).
- **Property Binding `[ ]`**: Binds values to attributes (e.g., `[class.dark-theme]="isDarkTheme"`).
- **Event Binding `( )`**: Calls methods on user interaction (e.g., `(click)="deleteConfirm()"`).

### SCSS Styles (`.scss`)
The styling layer. It targets the component using its selector tags.
*Note: Styles are often wrapped in the selector name to ensure encapsulation.*

```scss
page-matchdetails {
  .largetext {
    color: #154766;
  }
}
```

---

## 2. Dependency Injection ("Private Constructors")

Dependencies (services, controllers) are injected into the component via the constructor. This is known as **Constructor Injection**.

In TypeScript, using the `public` or `private` accessor in the constructor arguments automatically creates a class property.

**Example:**
```typescript
constructor(
  public navCtrl: NavController,       // Ionic Navigation
  public commonService: CommonService, // Shared utilities
  private graphqlService: GraphqlService, // API Service
  private themeService: ThemeService   // Theme management
) { ... }
```
*Effect:* `this.navCtrl`, `this.graphqlService`, etc., become available throughout the class without extra initialization code.

---

## 3. Working with APIs (GraphQL & Apollo)

The application uses GraphQL for data fetching, primarily handled by `GraphqlService` or `Apollo` directly.

### Step 1: Define the Query/Mutation (`gql` tag)
Queries are defined using the `gql` template tag.

```typescript
const getTeamsQuery = gql`
  query getTeamsByMatch($matchDetailsInput: FetchTeamsInput!) {
    getTeamsByMatch(matchDetailsInput: $matchDetailsInput) {
      Id
      TeamName
      ...
    }
  }
`;
```

### Step 2: Execute the Call
Use `graphqlService.query()` to fetch data or `graphqlService.mutate()` to change data.

**Fetching Data:**
```typescript
this.graphqlService.query(getTeamsQuery, { matchDetailsInput: { MatchId: "..." } }, 0)
  .subscribe((res: any) => {
    // Success: Assign data to local variables
    this.teams = res.data.getTeamsByMatch;
  }, (error) => {
    // Error Handling
    this.commonService.toastMessage("Failed to fetch teams", 2500, ToastMessageType.Error);
  });
```

**Modifying Data (Mutation):**
```typescript
this.graphqlService.mutate(update_Team, deleteVariable, 0)
  .subscribe((response) => {
     this.commonService.toastMessage("Success", ...);
  });
```

---

## 4. Theming Logic

Theming is handled both logically (TS) and visually (SCSS).

**In TypeScript:**
The component subscribes to theme changes via `ThemeService` or `Events`.
```typescript
this.events.subscribe('theme:changed', (theme) => {
  this.isDarkTheme = theme === 'dark';
});
```

**In HTML:**
Classes are conditionally applied based on the theme state.
```html
<ion-content [class.dark-theme]="isDarkTheme" [class.light-theme]="!isDarkTheme">
```

**In SCSS:**
Styles are nested to handle both theme cases.
```scss
page-matchdetails {
  &.light-theme {
    .largetext { color: #154766; }
  }
  &.dark-theme {
    .largetext { color: #f1f5f9; }
  }
}
```

---

## 5. Summary of Flow

1. **User navigates** to `MatchdetailsPage`.
2. **Constructor** runs: Dependencies are injected (nav, graphql, commonService).
3. **ionViewDidLoad** runs: Initial setup (like checking current theme).
4. **Data Fetech**: Methods like `getActiveTeams()` define `gql` queries and subscribe to `graphqlService`.
5. **Response**: Data is assigned to component properties (`this.teams`).
6. **View Update**: Angular detects changes and updates the HTML (e.g., `*ngFor="let team of teams"`).
7. **User Action**: User clicks a button -> `(click)="changeType()"` -> TypeScript method executes -> New API call or state update occurs.
