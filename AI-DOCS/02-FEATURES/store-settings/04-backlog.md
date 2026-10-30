# Backlog — Store Settings

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | SET-001 | SET/core-api | WS-SET-BE | Add singleton schema, admin API, and minimized consumer projections | REQ-SET-001, REQ-SET-002, REQ-SET-003 | FND-002, FND-003, AUTH-AUTH-002 | `server/src/features/settings/**` | migration/API/privacy tests | `not-started` | `work/SET-backend` | — | — |
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
| SET-002 | A-004 social networks | User | Keep social map optional until confirmed |

## Completion Summary

- **Completed:** 0/3
- **Next ready task:** `SET-001` after FND/AUTH contracts
- **Feature status:** `planned`
