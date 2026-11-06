# Backlog — Store Settings

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | SET-001 | SET/core-api | WS-SET-BE | Add singleton schema, admin API, and minimized consumer projections | REQ-SET-001, REQ-SET-002, REQ-SET-003 | FND-002, FND-003, AUTH-AUTH-002 | `server/src/features/settings/**` | migration/API/privacy tests | `done` | `work/SET-backend` | User-authorized checkpoint, SET-DEC-005; planned chore(SET-001): checkpoint verified store settings APIs | 2026-11-06: accepted task-tracking closeout; prior unit 169/169, isolated integration 104/104, lint/build/diff pass. Original docs validator BLOCKED / NOT RUN; no feature acceptance/commit claimed. |
| 2 | SET-002 | SET/admin-ui | WS-SET-FE | Build responsive version-aware admin Settings form | REQ-SET-001, REQ-SET-002 | SET-001, UI-002, UI-004 | `src/features/settings/**` | form/a11y tests | `not-started` | `work/SET-frontend` | — | — |
| 3 | SET-003 | SET/consumers | WS-SET-INT | Verify footer/payment/WhatsApp projections and privacy boundaries | REQ-SET-003, REQ-SET-004 | SET-001, SET-002 | settings tests/contracts | consumer/privacy suite | `not-started` | `feature/SET-integration` | — | — |

## DEC-008 Effective Delivery Overlay

| Lane | Workstream | Effective Tasks | Effective Branch | Integration Rule |
|---|---|---|---|---|
| BE | WS-SET-BE | SET-001 | `work/SET-backend` | Schema/API/privacy checks pass before integration. |
| FE | WS-SET-FE | SET-002 | `work/SET-frontend` | Complete Settings capability against the frozen contract if API is delayed. |
| INT | WS-SET-INT | SET-003 | `feature/SET-integration` | Live consumer projections and privacy boundaries pass. |

The ordered-task rows above and this lane summary are the canonical DEC-008 assignments; earlier planned assignments remain recoverable in Git history.

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| Feature verification/release | Original required docs validator is unavailable. | Original tooling owner / user | Keep BLOCKED / NOT RUN; no substitute or invented pass. SET-001 task accounting accepted under SET-DEC-004 only. |

## Completion Summary

- **Completed:** 1/3 — SET-001 done by user acceptance, SET-DEC-004; BE 1/1 accepted.
- **Next ready task:** None remaining in the requested SET BE scope. SET-002 FE and SET-003 INT are separately owned; no next task authorized.
- **Feature status:** `in-progress`

## 2026-11-04 — SET-001 backend development

SET-DEC-002/003 and FND-DEC-012/CAT-DEC-009 record the approved early baseline, policies and shared source changes. Implemented singleton/admin/public/internal projections with isolated verification; no completion commit or feature acceptance. A-004 is resolved for optional network policy, not FE integration. Original required docs validator remains BLOCKED / NOT RUN.
