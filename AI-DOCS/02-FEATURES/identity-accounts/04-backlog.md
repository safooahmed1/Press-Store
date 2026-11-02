# Backlog — Identity and Accounts

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | AUTH-001 | AUTH/core | WS-AUTH-BE | Add identity/session schema, phone normalization, hashing, and secure session primitives | REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-010, REQ-AUTH-012 | FND-002, FND-003, A-005 confirmed/accepted | AUTH server/platform paths | migration/unit tests | `blocked` | `work/AUTH-backend` | Authorized checkpoint subject: `chore(AUTH-001): checkpoint verified identity and session foundation`; completion commit: None. | 2026-11-02: final focused suite 13/13, including actual disposable MySQL 8.4.11 constraints, migrations, rotation rollback and pool-recreation persistence; cleanup verified; lint passed. Original docs validator BLOCKED / NOT RUN; no commit authorized. See verification-matrix §23. |
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
| AUTH-001 | Original documentation validator remains unavailable; completion commit is not authorized. Live MySQL verification now passed. | Original tooling owner / user | Restore verified original validator; no replacement or completion claim. See verification-matrix §23. |

## Completion Summary

- **Completed:** 0/5
- **Next ready task:** None while AUTH-001 is blocked on original documentation validation; AUTH-002 follows completion.
- **Feature status:** `in-progress`

## 2026-11-02 — AUTH-001 local implementation

Selected BE task only, from frozen integration baseline 4e92f8f on work/AUTH-backend.
FND prerequisites accepted by user; A-005 reconfirmed; AUTH-DEC-003 approved explicitly.
Added schema, credential/summary reads, phone/password and scoped session/cookie primitives.
No endpoints, admin bootstrap, UI, origin/CSRF/rate-limit or later-task implementation.
Migration/constraint checks against actual MySQL and original documentation validation remain open.
No commit/push; AUTH-001 is not done and AUTH-002 was not started.

## 2026-11-02 — AUTH-001 actual MySQL verification

The user requested remaining work after being told that actual MySQL tests were outstanding.
Ran only AUTH-owned tests on a new disposable MySQL 8.4.11 instance outside the restrictive sandbox.
Final suite: 13 passed, 0 failed, 0 skipped, 6 suites; includes real migration/constraint checks and
session lookup after closing/recreating the database pool and service. Lint passes. Fixture stopped
and removed its private root; no remaining mysqld process or matching temporary root observed.
This supersedes the prior NOT RUN disposition for AUTH-001 local MySQL verification, not the
historical evidence. The original validator invocation still exits 2 because its file is absent.
AUTH-001 is blocked on that required check; no completion commit, push or later-task work.

## 2026-11-02 — Authorized preservation commit and branch publication

The user explicitly requested saving and pushing the current work on its branch. This authorizes
one checkpoint commit and non-force push of work/AUTH-backend to origin, including the current
AUTH-001 implementation/tests and documentation of accepted FND prerequisites. It supersedes the
prior no-commit/no-push restriction only for preservation. AUTH-001 remains blocked on the original
missing documentation validator; no completion claim, AUTH-002, PR, merge or deployment is authorized.
Planned checkpoint subject: `chore(AUTH-001): checkpoint verified identity and session foundation`.
Resulting commit hash and push outcome are reported in chat, without a circular follow-up commit.
