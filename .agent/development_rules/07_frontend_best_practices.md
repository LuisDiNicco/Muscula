# Frontend Best Practices

**Context:** Web frontends using TypeScript and modern frameworks (React, Vue, Angular, or similar).
**Goal:** Build maintainable, accessible, and performant user interfaces.

---

## Architecture and Organization

- Keep a clear separation between **UI components**, **state management**, and **data access**.
- Prefer feature-based folders (e.g., `features/checkout/`) with colocated tests and styles.
- Use a design system or shared component library for consistency and reuse.

---

## Type Safety and Data Flow

- Enable strict TypeScript settings; avoid `any` and use `unknown` with type guards when needed.
- Validate external data at the boundary (API responses) and map into app-specific models.
- Prefer unidirectional data flow and explicit props/events over implicit globals.

---

## UI Quality and Accessibility

- Follow WCAG basics: semantic HTML, proper labels, keyboard navigation, and visible focus states.
- Use responsive layouts that work across common breakpoints (mobile, tablet, desktop).
- Keep components small and focused; avoid deeply nested component trees.

---

## Performance

- Lazy-load heavy routes/components and split bundles by route.
- Optimize images (responsive sizes, modern formats) and avoid layout shifts.
- Use memoization only when profiling shows a real benefit.

---

## Security

- Treat all user input as untrusted; sanitize where needed.
- Never store secrets in frontend code; use server-side tokens when required.
- Protect against XSS by escaping dynamic content and avoiding `dangerouslySetInnerHTML` unless strictly necessary.

---

## Testing and Tooling

- Cover critical flows with integration tests (e.g., Cypress/Playwright).
- Add unit tests for complex components and state logic.
- Enforce formatting and linting consistently (Prettier + ESLint).
