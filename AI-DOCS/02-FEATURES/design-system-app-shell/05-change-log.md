# Change Log — Design System and App Shell

### 2026-10-28 — UI-003 customer shell

- Added `CustomerNavbar`, `CustomerFooter`, `CustomerLayout`, and `CustomerShell` under the UI-owned customer shell path. The shell provides public/customer navigation, skip link and landmarks, responsive mobile menu focus handling, safe contact/social projection rendering, and optional contact loading behavior without API calls.
- Added five jsdom/Testing Library/axe tests covering navigation landmarks, cart/session states, Escape/focus return, safe optional links, loading contacts, and main-content focus. UI-003 is done at 3/4.

### 2026-10-28 — UI-002 accessible primitives

- Added focused `Button`, `Field`, `Dialog`, `Price`, and `Image` primitives plus `AsyncBoundary` and `CollectionState` shared states under the UI-owned paths. Components use UI-001 tokens, semantic HTML, safe text rendering, logical borders, reduced-motion classes, and no network/business logic.
- Added static UI-002 contract tests plus jsdom/Testing Library/user-event/axe-core component tests covering keyboard interaction, focus return, ARIA wiring, recovery actions, image failure, and axe accessibility checks.
- UI-002 is done at 2/4. No push, merge, deployment, or UI-003/UI-004 implementation occurred. Reference images remain untracked.

### 2026-10-28 — UI-001 fashion design system

- Implemented the Tailwind v4 Vite integration, centralized red/black/white tokens, Archivo and Noto Sans Arabic local WOFF2 fonts, reduced-motion/focus/base rules, responsive breakpoints, and an original Press Store favicon.
- The frontend-design review used the supplied home, shop, and product references as direction only: streetwear catalog structure, strong typography, hard rules, white space, and red signal accents; no screen was copied literally.
- A bounded branch exception created `feature/UI-design-system-app-shell` from FND checkpoint `aa61d3f`. The UI branch remains unmergeable until FND is present in `main`; no push or merge was performed.
- Evidence: `npm run test -- ui` passed 23/23 with elevated execution for the existing child-process regression helper; `npm run lint` and `npm run build` passed; Chrome headless visual QA passed at 390×844, 768×1024, and 1440×900. Screenshots are under `evidence/`.
- UI-001 is done. AC-UI-001 remains a shared feature criterion until UI-002 primitives render representative consumers. UI-002 is the next ready task.
