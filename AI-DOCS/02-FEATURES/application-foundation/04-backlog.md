# Backlog — Application Foundation

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FND-001 | FND/runtime | WS-FND-01 | Establish feature-first client/server runtime and manifest seams | REQ-FND-001, REQ-FND-002, REQ-FND-003, REQ-FND-010, REQ-FND-025 | None | `src/app/**`, `server/src/app/**`, root manifests | startup tests; lint | `not-started` | `feature/FND-application-foundation` | — | — |
| 2 | FND-002 | FND/database | WS-FND-01 | Add MySQL pool, migration runner, transaction and query contracts | REQ-FND-012, REQ-FND-020, REQ-FND-023, REQ-FND-027 | FND-001, A-002 confirmed or accepted | `server/src/platform/db/**`, `scripts/migrate*`, FND DB tests | empty/upgrade migrations; transaction tests | `not-started` | `feature/FND-application-foundation` | — | — |
| 3 | FND-003 | FND/http | WS-FND-01 | Add REST transport, validation, errors, request IDs, and scope guardrails | REQ-FND-005, REQ-FND-011, REQ-FND-014, REQ-FND-021, REQ-FND-022, REQ-FND-024, REQ-FND-028, REQ-SCOPE-001 | FND-001 | `src/shared/api/**`, `server/src/platform/http/**` | API boundary tests; lint | `not-started` | `feature/FND-application-foundation` | — | — |
| 4 | FND-004 | FND/storage | WS-FND-01 | Implement validated local image storage adapter and compensation | REQ-FND-018, REQ-FND-026 | FND-001 | `server/src/platform/storage/**`, storage tests | valid/malicious fixture tests | `not-started` | `feature/FND-application-foundation` | — | — |
| 5 | FND-005 | FND/quality | WS-FND-01 | Establish test helpers, safe observability, and performance sanity checks | REQ-FND-019, REQ-FND-020, REQ-FND-029 | FND-002, FND-003 | `tests/helpers/**`, `server/src/platform/observability/**` | test harness; redaction; query checks | `not-started` | `feature/FND-application-foundation` | — | — |
| 6 | FND-006 | FND/deployment | WS-FND-01 | Build one Hostinger-compatible production app and runbook | REQ-FND-013, REQ-FND-024, REQ-FND-025, REQ-FND-029, REQ-SCOPE-015 | FND-001–FND-005 | root build/start config, deployment docs | clean build; production smoke | `not-started` | `feature/FND-application-foundation` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| FND-002 | A-002 query library remains pending | User or implementation preflight | Confirm ORM requirement or accept minimal driver choice |

## Completion Summary

- **Completed:** 0/6
- **Next ready task:** `FND-001`
- **Feature status:** `planned`
