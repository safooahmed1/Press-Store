# Backlog — Identity and Accounts

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | AUTH-001 | AUTH/core | WS-AUTH-BE | Add identity/session schema, phone normalization, hashing, and secure session primitives | REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-010, REQ-AUTH-012 | FND-002, FND-003, A-005 confirmed/accepted | AUTH server/platform paths | migration/unit tests | `blocked` | `work/AUTH-backend` | Authorized checkpoint subject: `chore(AUTH-001): checkpoint verified identity and session foundation`; completion commit: None. | 2026-11-02: final focused suite 13/13, including actual disposable MySQL 8.4.11 constraints, migrations, rotation rollback and pool-recreation persistence; cleanup verified; lint passed. Original docs validator BLOCKED / NOT RUN; no commit authorized. See verification-matrix §23. |
| 2 | AUTH-002 | AUTH/customer | WS-AUTH-BE | Implement customer register/login/logout/account APIs | REQ-AUTH-003, REQ-AUTH-004, REQ-AUTH-005, REQ-AUTH-011 | AUTH-001 development dependency satisfied only by approved AUTH-DEC-004 | AUTH customer routes/services | API integration tests | `blocked` | `work/AUTH-backend` | Authorized checkpoint subject: `chore(AUTH-002): checkpoint verified customer authentication APIs`; completion commit: None. | 2026-11-02: user-requested full verification passes: unit 136/136; all integration with actual disposable MySQL 66/66, no skips; lint/build/whitespace pass; fixture cleanup verified. Original docs validator BLOCKED / NOT RUN; no completion commit. See verification-matrix §25. |
| 3 | AUTH-003 | AUTH/admin | WS-AUTH-BE | Implement single-admin bootstrap and separate admin auth APIs | REQ-AUTH-006, REQ-AUTH-007, REQ-AUTH-013, REQ-SCOPE-002 | AUTH-001 development dependency satisfied only by approved AUTH-DEC-007 | admin auth paths, bootstrap script; approved config/tooling in FND-DEC-010 | bootstrap/admin tests | `blocked` | `work/AUTH-backend` | Planned subject: `feat(AUTH-003): implement protected admin authentication`; no commit authorized. | 2026-11-02: full rerun unit 140/140, integration 71/71, no skips; lint/build/diff pass; host cleanup verified. Original validator BLOCKED / NOT RUN. See verification-matrix §27; no commit authorized. |
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
| AUTH-002 | Original mandatory documentation validator unavailable; code/API and actual MySQL verification passed. | Original tooling owner / user | Restore the verified original validator; task remains blocked, no completion commit or later-task work. |
| AUTH-003 | Original mandatory documentation validator unavailable; code tests and host cleanup pass (§27). | Original tooling owner / user | Restore original validator; no completion/commit. |

## Completion Summary

- **Completed:** 0/5
- **Next ready task:** None. AUTH-001/002 remain blocked; AUTH-003 development was authorized by AUTH-DEC-007/008 and is now implemented but blocked on original docs validation; sandbox fixture cleanup resolved (§27).
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

## 2026-11-02 — AUTH-002 authorized preflight

Clean worktree on work/AUTH-backend at the published checkpoint; existing stashes untouched.
AUTH-DEC-004 records the approved development exception without promoting AUTH-001 completion.
Preflight found a shared runtime seam change required for the documented API paths and pool ownership.
AUTH-DEC-005 specifies the proposed owner/consumer changes and verification. Per AGENTS.md §5,
implementation pauses for shared-owner authorization. No code, dependency, database, commit or push.

## 2026-11-02 — AUTH-002 implementation and verification

The user approved AUTH-DEC-005 / FND-DEC-009 before coordinated source changes. Added customer
registration/login/logout/account endpoints on their frozen URLs with injected lifecycle-owned DB,
validation, safe customer DTOs, atomic identity/session creation, rotation/revocation, no-store and
same-origin mutation handling. No admin API, bootstrap, FE or rate-limit task was implemented.
Observed 136/136 full unit tests, 5/5 final focused actual-MySQL/HTTP tests, 50 reported non-live
foundation regression checks, lint and build pass. Real-DB tests include duplicate races, storage
failure rollback, app restart persistence, account/actor isolation, expiry and idempotent logout.
The original documentation validator remains unavailable. AUTH-002 stays blocked; no completion
commit, checkpoint/push of these changes, merge or AUTH-003 work. See verification-matrix §24.

## 2026-11-02 — Authorized AUTH-002 checkpoint and publication

The user explicitly requested a commit and push of the current verified work. This authorizes one
preservation checkpoint and non-force push to origin/work/AUTH-backend, including the approved
FND-DEC-009 owner/consumer amendment and the AUTH-002 code/tests/evidence. It supersedes the prior
session-specific no-commit/no-push restriction only for this checkpoint. AUTH-002 stays blocked on
the missing original validator; no completion, PR, merge, deployment or AUTH-003 authorization.
Planned subject: `chore(AUTH-002): checkpoint verified customer authentication APIs`.
Report resulting commit hash/push outcome in chat; do not create a circular follow-up commit.

## 2026-11-02 — Approved AUTH-003 implementation and review handoff

AUTH-DEC-007/008 and FND-DEC-010 authorize the bounded early start, bootstrap policy, admin APIs,
configuration reader and ESLint amendment. Backend code/tests implemented; original endpoint/DTO
contracts preserved. Focused 9/9, full unit 140/140 and all integration 71/71 passed without skips;
lint/build passed. Exact evidence, initial failures and remaining cleanup are in §26. AUTH-003 is
blocked, AUTH completion stays 0/5, all acceptance boxes remain unchanged, and no commit/push,
merge, deploy, frontend change or next task is authorized. Planned subject is informational only.

### 2026-11-02 — Requested test rerun and host cleanup resolution

Full unit 140/140 and full actual-MySQL integration 71/71 pass without failures/skips; lint/build/
diff pass. Before rerun the four prior initializer PIDs were observed absent; removed only their
exact inactive temporary directories. Final host inventory: no disposable processes/roots, unrelated
system MySQL PID 1719 untouched. This resolves the prior cleanup blocker without rewriting failure
history. Original validator still exits 2, BLOCKED / NOT RUN; AUTH-003 remains blocked, AUTH 0/5.
No implementation change, independent review, commit, push, merge, deploy or next task. Exact
commands, logs and evidence: verification-matrix §27.

## 2026-11-02 — Authorized AUTH-003 checkpoint publication

The user explicitly requested committing and pushing the current reviewed AUTH-003 implementation.
Planned checkpoint subject: `chore(AUTH-003): checkpoint reviewed admin authentication`. This authorizes one preservation commit and non-force
push of work/AUTH-backend to origin, including approved FND-DEC-010 configuration/tooling changes.
It supersedes earlier session-specific no-commit/no-push restrictions only for this checkpoint.
AUTH-003 remains blocked on original documentation validation; AUTH remains 0/5. Independent
review PASS WITH WARNINGS and scope are recorded in verification-matrix §28. No completion,
acceptance waiver, PR, merge, deployment or next task. Resulting hash/push result reported in chat;
no circular follow-up commit.
