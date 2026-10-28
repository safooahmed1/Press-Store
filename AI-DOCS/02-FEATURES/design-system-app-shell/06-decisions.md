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

## UI-DEC-006 — UI-004 admin layout continuation

- **Status:** `approved`
- **Date:** 2026-10-28
- **Decision:** Continue UI-004 locally on the existing UI branch with prop-driven admin layout primitives only. The layout owns responsive navigation, current-page semantics, and keyboard drawer behavior; admin features own data, API calls, logout policy, and route composition.
- **Boundary:** Create only `src/shared/ui/shell/admin/**`, focused tests, and named delivery documentation. No admin pages, metrics, server changes, API calls, route changes, push, merge, or deployment are authorized.

## UI-DEC-004 — UI-002 local implementation boundary

- **Status:** `approved`
- **Date:** 2026-10-28
- **Decision:** Continue UI-002 on `feature/UI-design-system-app-shell` from the existing FND checkpoint and UI-001 commit. UI-002 may create only shared primitives/state components and their focused tests; it may not modify feature pages, server code, routes, or shell components.
- **Rationale:** UI-001 tokens are complete and UI-002 is the next ready task. The task needs reusable client-side controls before customer/admin shells or business features can consume them.
- **Boundary:** No push, merge, deployment, or UI-003/UI-004 implementation is authorized. Root dependency manifests may change only for development test tooling required by UI-002 and must remain dev-only.
- **Testing note:** The prescribed DOM/component tooling is required for the completion gate. If registry access prevents installing it, UI-002 remains `in-progress` and no completion commit is created.

## UI-DEC-005 — UI-003 customer shell continuation

- **Status:** `approved`
- **Date:** 2026-10-28
- **Decision:** Continue UI-003 on `feature/UI-design-system-app-shell` using the frozen `API-SET-002` projection shape. The customer shell accepts session, cart count, contact projection, and content as inputs; it performs no API calls or feature routing.
- **Rationale:** UI-002 is complete and the shared shell contract is the next ordered UI task. Keeping contact data as an input preserves SET ownership and allows unavailable optional settings to remain hidden safely.
- **Boundary:** Create only `src/shared/ui/shell/customer/**` and its focused tests plus named UI/delivery documentation. Do not modify `src/features/**`, `server/**`, admin shell paths, or route composition. No push, merge, deployment, or UI-004 implementation is authorized.

## UI-DEC-003 — UI-001 visual token direction

- **Status:** `approved`
- **Date:** 2026-10-28
- **Decision:** Use Archivo Variable for English-first storefront typography with Noto Sans Arabic as a local fallback; use Canvas/Ink/Signal Red/Surface/Muted/Line tokens and hard-edged streetwear catalog composition.
- **Rationale:** The supplied references consistently use large product imagery, white space, black structure, and red action signals. The result preserves the editorial fashion requirement without copying any screen.
- **Affected contracts/tasks:** UI-001; UI-UI-005.
