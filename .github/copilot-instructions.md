## TypeScript Guidelines
- Use TypeScript for all new code
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (`const`, `readonly`)

## Naming Conventions
- Use PascalCase for component names, interfaces, and type aliases
- Use camelCase for variables, functions, and methods
- Prefix private class members with an underscore (`_`)
- Use ALL_CAPS for constants

## Error Handling
- Use try/catch blocks for async operations using emojis for logging
- Implement proper error boundaries in React components
- Always log errors with contextual information

## 🗒️ Code Commenting Standards

- **Explain key logic** with short, meaningful comments.
- **Use emojis** to make explanations more lively and readable.  
- **Avoid Repeating unnecessary code** just write the new code or changes made.
 
  Prefer **Angular** (targeting **Ionic 3** architectural patterns).

- **Code Structure:**  
  Maintain clean separation:
  - **HTML templates** (simple, semantic)
  - **SCSS/CSS stylesheets** (modular, reusable, and scoped)
  - **TypeScript components** (lightweight, focused classes)

- **No External Packages:**  
  Do **NOT** suggest or use external third-party libraries unless absolutely necessary.  
  All functionality must be written using **native Angular/Ionic** APIs and **browser features**.

- **Modular Code:**  
  Structure components, services, pipes, and modules **modularly**.  
  Each file should be focused on a **single responsibility**.

- **Ionic 3 Patterns:**  
  Respect traditional Ionic 3 idioms like:
  - `NavController` for navigation
  - `ion-*` components (e.g., `ion-list`, `ion-item`, `ion-button`)
  - Page Modules (`@IonicPage`) with lazy loading

- **SCSS Guidelines:**
  - Use **SCSS nesting responsibly** (avoid deep nesting).
  - Prefer **BEM naming** for classes.
  - Keep styles **modular** (specific to the component).
  - Always use **CSS Variables** when available for colors, spacing, fonts.

- **HTML Guidelines:**
  - Clean and semantic structure.
  - Proper usage of Ionic components like `<ion-header>`, `<ion-content>`, `<ion-footer>`.
  - Avoid div-spamming: **use meaningful tags**.
\
## Project-specific notes for AI agents

- Project type: Ionic 3 / Angular 5 mobile app with Cordova plugins. Main app root: `src/` and pages under `src/pages/`.
- Key services and responsibilities:
  - `src/services/common.service.ts` — app-wide utilities, navigation helpers, and shared state (BehaviorSubject `category`). Many pages import `CommonService` for UI helpers and API glue.
  - `src/services/http.service.ts` — central HTTP wrapper. Uses environment endpoints (`src/environments/...`) and exposes typed `get/post/put/delete(api_method, data, type?)` methods. Use `type` to select between `new_http_url` and `nest_url`.
  - `src/services/graphql.service.ts` and `src/app/apollo.config.ts` — GraphQL setup (Apollo). GraphQL code is used in parts of the app; prefer existing `Apollo`/`apollo-angular` patterns.

- Build / run workflows:
  - Local dev serve: `npm run start` (uses `ionic-app-scripts serve`).
  - Production build: `npm run ionic:build` or `npm run build` (uses `ionic-app-scripts build`).
  - Cordova resources: update `resources/icon.png` and `resources/splash.png` then run `ionic cordova resources`.
  - Platforms are in `platforms/` and many Cordova plugins are listed in `package.json` and `plugins/` — edits to native behavior must respect these plugins and Android/iOS config files under `platforms/`.

- Conventions and patterns found in this repo:
  - Ionic 3 pages use `@IonicPage()` lazy loading and page modules next to the page (`*.module.ts`). Example: `src/pages/type2/league/summary_tennis/tennis_summary_tennis.module.ts`.
  - Pages and components keep template, styles and logic next to each other with filenames like `page_name.ts/html/scss` (see `src/pages/type2/league/summary_tennis/`).
  - Use `NavController`/`ModalController` for navigation and modals (Ionic 3 idioms). Example: `TennisSummaryTennisPage` uses `ModalController` and `HttpService` providers.
  - Shared API paths and environment toggles are set in `src/app/app.component.ts` (switching between prod/dev URLs and setting `SharedServices` values). Respect these initializations when adding new network calls.
  - Use `SharedServices` (`src/pages/services/sharedservice.ts`) to access app-level URLs (email, nodeURL, graphql_url, cloudfront) rather than hard-coding endpoints.

- Integration points and external dependencies:
  - Cordova plugins: many native plugins (camera, file, local-notification, onesignal, etc.) listed in `package.json` and under `plugins/`. When changing native flows, validate on device/emulator.
  - Firebase: `angularfire2` + `firebase` — check `src/app/app.module.ts` for initialization using `environment.firebaseConfig`.
  - GraphQL/Apollo: See `src/app/apollo.config.ts` and `graphql.module.ts` for setup.
  - Mixed HTTP styles: both REST `HttpService` and Apollo GraphQL queries are present. Prefer the existing service for each feature.

- Files to reference for examples when implementing features:
  - `src/pages/type2/league/summary_tennis/` — complex page with modals, typed models, and sample JSON (`tennis_result_sample.json`). Use it as a pattern for match/league pages.
  - `src/services/http.service.ts` — show how typed requests are built using environment URLs.
  - `src/services/common.service.ts` — many UI helpers, date utilities, and app-level behaviors.
  - `src/app/app.component.ts` — app bootstrap and environment selection (production/dev toggle), sets shared URLs used globally.

- Small implementer contract (2–3 bullets):
  - Inputs: modify/add pages under `src/pages/` or services under `src/services/`.
  - Outputs: must compile with `npm run build` and run in `ionic serve` and on device for native plugin changes.
  - Error modes: when touching native plugins, validate on emulator/device; network calls use environment URLs configured in `app.component.ts`.

- Quick examples from the codebase:
  - Calling REST API (use typed HttpService):
    - httpService.post<MyResp>("Get_League_Match_Result", payload, null, 1)
  - Opening a modal (Ionic 3):
    - const modal = this.modalCtrl.create('SomeModalPage', { data: x }); modal.present();

- What *not* to change without further review:
  - Do not change Cordova plugin versions in `package.json` or remove plugins without verification on Android/iOS.
  - Avoid changing global environment keys in `app.component.ts` without sync with backend team.

## Merge notes
- I preserved existing TypeScript/Ionic style items from the original file and added focused project-specific guidance above.

If any section is unclear or you'd like me to expand examples (more pages, sample request/response shapes, or a short checklist for adding pages), tell me which area to expand and I'll iterate.


