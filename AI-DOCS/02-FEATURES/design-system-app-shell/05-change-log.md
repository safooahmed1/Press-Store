# Change Log — Design System and App Shell

### 2026-10-28 — UI-001 fashion design system

- Implemented the Tailwind v4 Vite integration, centralized red/black/white tokens, Archivo and Noto Sans Arabic local WOFF2 fonts, reduced-motion/focus/base rules, responsive breakpoints, and an original Press Store favicon.
- The frontend-design review used the supplied home, shop, and product references as direction only: streetwear catalog structure, strong typography, hard rules, white space, and red signal accents; no screen was copied literally.
- A bounded branch exception created `feature/UI-design-system-app-shell` from FND checkpoint `aa61d3f`. The UI branch remains unmergeable until FND is present in `main`; no push or merge was performed.
- Evidence: `npm run test -- ui` passed 23/23 with elevated execution for the existing child-process regression helper; `npm run lint` and `npm run build` passed; Chrome headless visual QA passed at 390×844, 768×1024, and 1440×900. Screenshots are under `evidence/`.
- UI-001 is done. AC-UI-001 remains a shared feature criterion until UI-002 primitives render representative consumers. UI-002 is the next ready task.
