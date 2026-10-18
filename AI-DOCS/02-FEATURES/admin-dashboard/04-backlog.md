# Backlog — Admin Dashboard

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ADM-001 | ADM/navigation | WS-ADM-01 | Compose protected responsive admin route/navigation manifest and logout | REQ-ADM-001, REQ-ADM-004 | AUTH-004/AUTH-005, UI-004, owner route manifests | admin dashboard navigation paths | route/a11y/responsive tests | `not-started` | `feature/ADM-admin-dashboard` | — | — |
| 2 | ADM-002 | ADM/dashboard | WS-ADM-01 | Implement lightweight owner-projected metrics and dashboard UI | REQ-ADM-002, REQ-ADM-003, REQ-SCOPE-011, REQ-SCOPE-021 | CAT-006, ORD-006, CUS-003 | admin dashboard server/UI paths | projection/UI/scope tests | `not-started` | `feature/ADM-admin-dashboard` | — | — |
| 3 | ADM-003 | ADM/integration | WS-ADM-01 | Run full admin navigation, auth, responsive, and production-build integration gate | REQ-ADM-004 | ADM-001, ADM-002, all admin feature routes | ADM tests/docs | admin E2E/lint/build | `not-started` | `feature/ADM-admin-dashboard` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| ADM-002 | CAT/CUS count projection contracts are named but not yet implemented | CAT/CUS | Freeze in CAT-006 and CUS-003 |

## Completion Summary

- **Completed:** 0/3
- **Next ready task:** `ADM-001` after UI/AUTH and owner route manifests
- **Feature status:** `planned`
