# Backlog — Customer Directory

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CUS-001 | CUS/API | WS-CUS-BE | Implement admin-only paginated customer/order read projections | REQ-CUS-001, REQ-CUS-002 | READ-AUTH-001, READ-ORD-001, AUTH-AUTH-002 | `server/src/features/customers/**` | API/auth/query tests | `not-started` | `work/CUS-backend` | — | — |
| 2 | CUS-002 | CUS/UI | WS-CUS-FE | Build responsive customer list/detail with order history | REQ-CUS-001, REQ-CUS-002, REQ-CUS-003 | CUS-001, UI-004 | `src/features/customers/**` | component/responsive tests | `not-started` | `work/CUS-frontend` | — | — |
| 3 | CUS-003 | CUS/scope-verification | WS-CUS-INT | Verify privacy, no-write ownership, bounded queries, and excluded CRM scope | REQ-CUS-003, REQ-SCOPE-007 | CUS-001, CUS-002 | CUS tests/docs | full CUS/privacy/build checks | `not-started` | `feature/CUS-integration` | — | — |

## DEC-008 Effective Delivery Overlay

| Lane | Workstream | Effective Tasks | Effective Branch | Integration Rule |
|---|---|---|---|---|
| BE | WS-CUS-BE | CUS-001 | `work/CUS-backend` | Projection/auth/query checks pass. |
| FE | WS-CUS-FE | CUS-002 | `work/CUS-frontend` | Complete list/detail capability against the frozen CUS contract if necessary. |
| INT | WS-CUS-INT | CUS-003 | `feature/CUS-integration` | Real privacy/no-write/bounded-query/build gate passes. |

The ordered-task rows above and this lane summary are the canonical DEC-008 assignments; earlier planned assignments remain recoverable in Git history.

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| None. | None. | None. | None. |

## Completion Summary

- **Completed:** 0/3
- **Next ready task:** `CUS-001` after ORD read contract
- **Feature status:** `planned`
