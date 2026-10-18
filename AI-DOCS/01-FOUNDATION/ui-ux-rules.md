# UI UX Rules

## 1. Scope

Applies to customer and admin interfaces, visual language, responsive behavior, forms, state feedback, content, and accessibility.

## 2. Required Patterns

- Invoke `frontend-design` for visual implementation and document the chosen design direction.
- Use white backgrounds, black structure/text, and red accents with readable contrast; maintain an intentional editorial fashion feel.
- Build mobile-first responsive compositions for navigation, grids, filters, forms, tables/cards, cart, checkout, and dashboard.
- Every data view defines loading, empty, error, unauthorized, and success states; mutations show pending and prevent accidental duplicate submission.
- Every form associates labels/errors, preserves safe input after validation failure, focuses the first invalid field, and supports keyboard use.
- Use semantic landmarks, visible focus, alt text, accessible carousel controls, reduced-motion behavior, and non-color-only status indicators.
- Format EGP, dates, phone, and order numbers consistently from shared helpers.

## 3. Prohibited Patterns

- Literal screenshot copying, generic template styling, desktop-only layouts, inaccessible color contrast, hover-only operations, autoplay that cannot be controlled, hidden validation, or business logic embedded in large page components.

## 4. Conventions

Shared UI components live under `src/shared/ui`; feature-specific composed components remain with their owner. Breakpoints and spacing/color/type tokens are centralized. Content language follows A-003; layout must tolerate Arabic RTL content even if a runtime language switch is out of scope.

## 5. Security and Failure Handling

Escape content by default, sanitize/allowlist URLs, avoid rendering raw HTML, avoid exposing private data in generic errors, confirm destructive admin actions, and clearly distinguish payment-pending from paid without claiming external verification.

## 6. Testing and Verification

Run component tests for key states, keyboard/focus checks, contrast/accessibility tooling, and manual viewport checks at representative mobile/tablet/desktop sizes. Capture evidence for carousel, filters, cart, checkout, admin forms, and order actions.

## 7. Exceptions and Change Gate

New visual systems, breakpoints, inaccessible exceptions, or user-flow changes require UI owner review and, when behavior/scope changes, an approved feature decision.
