# Decisions — Design System and App Shell

## UI-DEC-001 — Visual direction requires frontend-design

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Run the `frontend-design` skill during UI-001 and preserve its documented direction within the PRD's red/black/white, editorial-fashion constraints.
- **Rationale:** The PRD explicitly assigns visual design responsibility to that skill.
- **Alternatives:** Copy the reference image or use an unmodified generic UI kit.
- **Consequences:** Visual QA artifacts and shared tokens become required evidence.
- **Affected contracts/tasks:** UI-001 through UI-004; UI-UI-001 through UI-UI-004.

## UI-DEC-002 — UI-001 bounded branch and integration exception

- **Status:** `approved`
- **Date:** 2026-10-28
- **Decision:** Develop UI-001 on `feature/UI-design-system-app-shell` from FND checkpoint `aa61d3f` while FND remains incomplete. Allow only the minimum shared wiring changes in `package.json`, `package-lock.json`, `vite.config.js`, and `src/main.jsx`.
- **Rationale:** FND-001/FND-003 contracts are complete and UI-001 has no business-feature dependency, but the documented UI parent branch cannot be created from `main` until FND is merged.
- **Boundary:** No push, merge, FND source changes, server changes, or UI-002+ implementation is authorized. The branch remains blocked from integration until the normal FND merge gate passes.
- **Affected contracts/tasks:** UI-001; UI-UI-005.

## UI-DEC-003 — UI-001 visual token direction

- **Status:** `approved`
- **Date:** 2026-10-28
- **Decision:** Use Archivo Variable for English-first storefront typography with Noto Sans Arabic as a local fallback; use Canvas/Ink/Signal Red/Surface/Muted/Line tokens and hard-edged streetwear catalog composition.
- **Rationale:** The supplied references consistently use large product imagery, white space, black structure, and red action signals. The result preserves the editorial fashion requirement without copying any screen.
- **Affected contracts/tasks:** UI-001; UI-UI-005.
