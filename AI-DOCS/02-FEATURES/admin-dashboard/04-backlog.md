# Backlog — Admin Dashboard

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ADM-001 | ADM/navigation | WS-ADM-FE | Compose protected responsive admin route/navigation manifest and logout | REQ-ADM-001, REQ-ADM-004 | AUTH-004/AUTH-005, UI-004, owner route manifests | admin dashboard navigation paths | route/a11y/responsive tests | `not-started` | `work/ADM-frontend` | — | — |
| 2 | ADM-002 | ADM/dashboard | WS-ADM-INT | Integrate the live dashboard projection with the dashboard UI | REQ-ADM-002, REQ-ADM-003, REQ-SCOPE-011, REQ-SCOPE-021 | ADM-004, ADM-005 | `tests/integration/admin-dashboard/**` | live projection/UI/scope tests | `not-started` | `feature/ADM-integration` | — | — |
| 3 | ADM-003 | ADM/integration | WS-ADM-INT | Run full admin navigation, auth, responsive, and production-build integration gate | REQ-ADM-004 | ADM-001, ADM-002, all admin feature routes | ADM tests/docs | admin E2E/lint/build | `not-started` | `feature/ADM-integration` | — | — |

## DEC-008 Effective Delivery Overlay

ADM-002 keeps its stable ID but becomes the live dashboard integration task. Its previously mixed server/UI implementation is split below.

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1a | ADM-004 | ADM/dashboard-api | WS-ADM-BE | Implement bounded owner-projected dashboard metrics API | REQ-ADM-002, REQ-ADM-003, REQ-SCOPE-011, REQ-SCOPE-021 | CAT-006, ORD-006, CUS-003 | `server/src/features/admin-dashboard/**` | projection/auth/scope tests | `not-started` | `work/ADM-backend` | — | — |
| 1b | ADM-005 | ADM/dashboard-ui | WS-ADM-FE | Build responsive lightweight dashboard cards/lists and failure states | REQ-ADM-002, REQ-ADM-003, REQ-SCOPE-011, REQ-SCOPE-021 | Frozen API-ADM-001, UI-004 | `src/features/admin-dashboard/dashboard/**` | component/a11y/responsive tests with fixtures | `not-started` | `work/ADM-frontend` | — | — |

| Lane | Workstream | Effective Tasks | Effective Branch | Integration Rule |
|---|---|---|---|---|
| BE | WS-ADM-BE | ADM-004 | `work/ADM-backend` | Projection/auth/scope checks pass. |
| FE | WS-ADM-FE | ADM-001, ADM-005 | `work/ADM-frontend` | Navigation and dashboard capabilities pass with frozen contracts/fixtures. |
| INT | WS-ADM-INT | ADM-002–ADM-003 | `feature/ADM-integration` | ADM-002 proves the live projection/UI composition; ADM-003 runs final admin E2E/build. |

The original ADM-002 mixed implementation scope is superseded by ADM-004/ADM-005; ADM-002 now owns only live dashboard integration evidence.

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| ADM-002 | CAT/CUS count projection contracts are named but not yet implemented | CAT/CUS | Freeze in CAT-006 and CUS-003 |

## Completion Summary

- **Completed:** 0/5
- **Next ready task:** `ADM-001` after UI/AUTH and owner route manifests
- **Feature status:** `planned`
