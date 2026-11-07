# Backlog — Homepage Merchandising

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | HOME-001 | HOME/core-api | WS-HOME-BE | Add hero/banner schema, public/admin APIs, and CAT curation orchestration | REQ-HOME-002, REQ-HOME-003, REQ-HOME-004, REQ-HOME-005, REQ-HOME-007, REQ-HOME-009 | CAT-003 contract, FND-004, AUTH guard | `server/src/features/homepage/**` | migration/API/limit tests | `blocked` | `work/HOME-backend` | User-authorized checkpoint, HOME-DEC-003; planned chore(HOME-001): checkpoint verified homepage APIs | HOME-001 verification appendix: code checks pass; original docs validation BLOCKED / NOT RUN. |
| 2 | HOME-002 | HOME/public-ui | WS-HOME-FE | Build ordered responsive homepage with Swiper and catalog navigation | REQ-FND-009, REQ-HOME-001, REQ-HOME-002, REQ-HOME-005, REQ-HOME-006, REQ-HOME-008, REQ-HOME-009 | HOME-001, CAT-002, UI-003 | `src/features/homepage/public/**` | component/a11y/responsive tests | `not-started` | `work/HOME-frontend` | — | — |
| 3 | HOME-003 | HOME/admin-ui | WS-HOME-FE | Build unified admin Homepage management area | REQ-HOME-003, REQ-HOME-004, REQ-HOME-005, REQ-HOME-006, REQ-HOME-007, REQ-HOME-009, REQ-HOME-010 | HOME-001, UI-004 | `src/features/homepage/admin/**` | admin UI/form tests | `not-started` | `work/HOME-frontend` | — | — |
| 4 | HOME-004 | HOME/verification | WS-HOME-INT | Complete limits, ordering, CAT integration, security, and visual verification | REQ-HOME-010 | HOME-001–HOME-003 | HOME tests/docs | full homepage suite/build | `not-started` | `feature/HOME-integration` | — | — |

## DEC-008 Effective Delivery Overlay

| Lane | Workstream | Effective Tasks | Effective Branch | Integration Rule |
|---|---|---|---|---|
| BE | WS-HOME-BE | HOME-001 | `work/HOME-backend` | Homepage API/limits/orchestration checks pass. |
| FE | WS-HOME-FE | HOME-002–HOME-003 | `work/HOME-frontend` | Public Homepage and admin Homepage are two complete reviewable capabilities; fixtures may stand in for a delayed API. |
| INT | WS-HOME-INT | HOME-004 | `feature/HOME-integration` | Real API ordering, limits, navigation, security, visual, and build gates pass. |

The ordered-task rows above and this lane summary are the canonical DEC-008 assignments; earlier planned assignments remain recoverable in Git history.

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| HOME-001 | Original required documentation validator missing. | Original tooling owner / user | Keep BLOCKED / NOT RUN; no substitute/waiver. |

## Completion Summary

- **Completed:** 0/4
- **Next ready task:** None in requested BE scope while HOME-001 formal completion is blocked; HOME-002/003 FE and HOME-004 INT separately owned.
- **Feature status:** `in-progress`

## 2026-11-06 — HOME-001 backend implementation

Approved HOME-DEC-002/CAT-DEC-011 provide local hero/banner/public/admin APIs and atomic CAT selection orchestration, reusing already approved FND/CAT seams only. Existing CAT/SET work remains untouched in separate worktrees; no frontend/source publication/next task. Formal completion blocked on original docs validation, HOME 0/4. Exact actual verification and limits are recorded in HOME-001 appendix.
