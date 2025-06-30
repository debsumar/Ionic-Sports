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


