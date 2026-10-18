# Backlog — Identity and Accounts

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | AUTH-001 | AUTH/core | WS-AUTH-01 | Add identity/session schema, phone normalization, hashing, and secure session primitives | REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-010, REQ-AUTH-012 | FND-002, FND-003, A-005 confirmed/accepted | AUTH server/platform paths | migration/unit tests | `not-started` | `feature/AUTH-identity-accounts` | — | — |
| 2 | AUTH-002 | AUTH/customer | WS-AUTH-01 | Implement customer register/login/logout/account APIs | REQ-AUTH-003, REQ-AUTH-004, REQ-AUTH-005, REQ-AUTH-011 | AUTH-001 | AUTH customer routes/services | API integration tests | `not-started` | `feature/AUTH-identity-accounts` | — | — |
| 3 | AUTH-003 | AUTH/admin | WS-AUTH-01 | Implement single-admin bootstrap and separate admin auth APIs | REQ-AUTH-006, REQ-AUTH-007, REQ-AUTH-013, REQ-SCOPE-002 | AUTH-001 | admin auth paths, bootstrap script | bootstrap/admin tests | `not-started` | `feature/AUTH-identity-accounts` | — | — |
| 4 | AUTH-004 | AUTH/UI | WS-AUTH-01 | Build responsive customer/admin auth and Account screens | REQ-AUTH-003, REQ-AUTH-004, REQ-AUTH-005 | AUTH-002, AUTH-003, UI-002 | `src/features/auth/**` | component/manual tests | `not-started` | `feature/AUTH-identity-accounts` | — | — |
| 5 | AUTH-005 | AUTH/security | WS-AUTH-01 | Enforce fixed guards, isolation, CSRF/rate limits, and full auth security suite | REQ-AUTH-008, REQ-AUTH-009, REQ-AUTH-014 | AUTH-002–AUTH-004 | AUTH guards/tests | full security integration suite | `not-started` | `feature/AUTH-identity-accounts` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| AUTH-001 | A-005 phone geography | User | Confirm Egypt-only phone normalization or expand contract |

## Completion Summary

- **Completed:** 0/5
- **Next ready task:** `AUTH-001` after FND-002/FND-003
- **Feature status:** `planned`
