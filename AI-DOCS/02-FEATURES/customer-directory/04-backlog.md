# Backlog — Customer Directory

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CUS-001 | CUS/API | WS-CUS-01 | Implement admin-only paginated customer/order read projections | REQ-CUS-001, REQ-CUS-002 | READ-AUTH-001, READ-ORD-001, AUTH-AUTH-002 | `server/src/features/customers/**` | API/auth/query tests | `not-started` | `feature/CUS-customer-directory` | — | — |
| 2 | CUS-002 | CUS/UI | WS-CUS-01 | Build responsive customer list/detail with order history | REQ-CUS-001, REQ-CUS-002, REQ-CUS-003 | CUS-001, UI-004 | `src/features/customers/**` | component/responsive tests | `not-started` | `feature/CUS-customer-directory` | — | — |
| 3 | CUS-003 | CUS/scope-verification | WS-CUS-01 | Verify privacy, no-write ownership, bounded queries, and excluded CRM scope | REQ-CUS-003, REQ-SCOPE-007 | CUS-001, CUS-002 | CUS tests/docs | full CUS/privacy/build checks | `not-started` | `feature/CUS-customer-directory` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| None. | None. | None. | None. |

## Completion Summary

- **Completed:** 0/3
- **Next ready task:** `CUS-001` after ORD read contract
- **Feature status:** `planned`
