# Backlog — Identity and Accounts

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | AUTH-001 | AUTH/core | WS-AUTH-BE | Add identity/session schema, phone normalization, hashing, and secure session primitives | REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-010, REQ-AUTH-012 | FND-002, FND-003, A-005 confirmed/accepted | AUTH server/platform paths | migration/unit tests | `not-started` | `work/AUTH-backend` | — | — |
| 2 | AUTH-002 | AUTH/customer | WS-AUTH-BE | Implement customer register/login/logout/account APIs | REQ-AUTH-003, REQ-AUTH-004, REQ-AUTH-005, REQ-AUTH-011 | AUTH-001 | AUTH customer routes/services | API integration tests | `not-started` | `work/AUTH-backend` | — | — |
| 3 | AUTH-003 | AUTH/admin | WS-AUTH-BE | Implement single-admin bootstrap and separate admin auth APIs | REQ-AUTH-006, REQ-AUTH-007, REQ-AUTH-013, REQ-SCOPE-002 | AUTH-001 | admin auth paths, bootstrap script | bootstrap/admin tests | `not-started` | `work/AUTH-backend` | — | — |
| 4 | AUTH-004 | AUTH/UI | WS-AUTH-FE | Build responsive customer/admin auth and Account screens | REQ-AUTH-003, REQ-AUTH-004, REQ-AUTH-005 | AUTH-002, AUTH-003, UI-002 | `src/features/auth/**` | component/manual tests | `not-started` | `work/AUTH-frontend` | — | — |
| 5 | AUTH-005 | AUTH/security | WS-AUTH-INT | Enforce fixed guards, isolation, CSRF/rate limits, and full auth security suite | REQ-AUTH-008, REQ-AUTH-009, REQ-AUTH-014 | AUTH-002–AUTH-004 | AUTH guards/tests | full security integration suite | `not-started` | `feature/AUTH-integration` | — | — |

## DEC-008 Effective Delivery Overlay

| Lane | Workstream | Effective Tasks | Effective Branch | Integration Rule |
|---|---|---|---|---|
| BE | WS-AUTH-BE | AUTH-001–AUTH-003 | `work/AUTH-backend` | Merge to `feature/AUTH-integration` only after BE verification. |
| FE | WS-AUTH-FE | AUTH-004 | `work/AUTH-frontend` | Frozen contracts allow fixture completion; live API is deferred to INT. |
| INT | WS-AUTH-INT | AUTH-005 | `feature/AUTH-integration` | Real auth/security suite must pass before merge-ready. |

The ordered-task rows above and this lane summary are the canonical DEC-008 assignments; earlier planned assignments remain recoverable in Git history.

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| None. | None. | None. | A-005 was confirmed on 2026-10-31: Egyptian local and `+20` input normalize to unique `+20` E.164. |

## Completion Summary

- **Completed:** 0/5
- **Next ready task:** `AUTH-001` after FND-002/FND-003
- **Feature status:** `planned`
