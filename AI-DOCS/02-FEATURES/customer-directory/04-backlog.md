# Backlog — Customer Directory

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CUS-001 | CUS/API | WS-CUS-BE | Implement admin-only paginated customer/order read projections | REQ-CUS-001, REQ-CUS-002 | READ-AUTH-001, READ-ORD-001, AUTH-AUTH-002 | `server/src/features/customers/**` and approved owner reads under CUS-DEC-002 | API/auth/query tests | `done` | `work/CUS-backend` | CUS-DEC-003 tracking acceptance. CUS-DEC-004 checkpoint `chore(CUS-001): checkpoint customer directory API`. | Accepted for backend tracking after local verification under CUS-DEC-002. See the verification matrix. |
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
| CUS-001 formal verification | Tracking acceptance leaves the formal integration baseline and original docs validator open | Dependency and tooling owners | Verify on the documented CUS integration baseline and run the original validator |

## Completion Summary

- **Completed for tracking:** 1/3 by user acceptance (BE 1/1).
- **Next planned CUS BE task:** None. Formal verification remains blocked.
- **Feature status:** `in-progress`
