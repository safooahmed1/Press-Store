# Backlog — Application Foundation

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FND-001 | FND/runtime | WS-FND-01 | Establish feature-first client/server runtime and manifest seams | REQ-FND-001, REQ-FND-002, REQ-FND-003, REQ-FND-006, REQ-FND-010, REQ-FND-025 | None | `src/app/**`, `server/src/app/**`, root manifests | startup tests; lint | `done` | `feature/FND-application-foundation` | Planned completion subject: `feat(FND-001): establish modular runtime seams` | 2026-10-26: APP-FND-001 client registry, 43/43 opt-in MySQL integration, and production smoke on isolated MySQL 8.4.11 passed; health/SPA/asset 200, API 404 JSON, graceful exit 0. Unit, lint, build, whitespace, and docs validation passed; see verification-matrix §12. |
| 2 | FND-002 | FND/database | WS-FND-01 | Add MySQL pool, migration runner, transaction and query contracts | REQ-FND-012, REQ-FND-020, REQ-FND-023, REQ-FND-027 | FND-001 complete OR reviewed backend baseline `740c22b2fb3be6d1b5bd0080bbf42109e238c515` under approved FND-DEC-002; A-002 confirmed | `server/src/platform/db/**`, `scripts/migrate*`, FND DB tests; exact bounded configuration/lifecycle/tooling additions in technical contracts §2 | empty/upgrade migrations; transaction tests; interruption/recovery and lifecycle checks | `blocked` | `feature/FND-application-foundation` | Backend checkpoint subject: `chore(FND-002): checkpoint verified backend persistence for handoff`; completion commit: None; planned completion subject: `feat(FND-002): add MySQL persistence foundation` | 2026-10-27: user confirms hosting is not yet available; hosting verification cannot run. Prior 2026-10-26 evidence: MySQL 8.4.11 integration 43/43, lint/build and the restored documentation validator pass. Hosting engine/version, TLS, limits, privileges, and final acceptance remain unresolved; see verification-matrix §§10 and 12. |
| 3 | FND-003 | FND/http | WS-FND-01 | Add REST transport, validation, errors, request IDs, and scope guardrails | REQ-FND-005, REQ-FND-007, REQ-FND-011, REQ-FND-014, REQ-FND-021, REQ-FND-022, REQ-FND-024, REQ-FND-028, REQ-SCOPE-001 | FND-001 | `src/shared/api/**`, `server/src/platform/http/**` plus FND-owned provider/runtime composition | API boundary tests; lint | `done` | `feature/FND-application-foundation` | Planned completion subject: `feat(FND-003): add REST validation and errors` | 2026-10-26: Axios/React Query boundary, canonical HTTP errors, server request IDs, validation, body limits and scope exclusion implemented; 11 unit/32 integration, lint/build/docs validation and audit (0 vulnerabilities) pass; verification-matrix §13. |
| 4 | FND-004 | FND/storage | WS-FND-01 | Implement validated local image storage adapter and compensation | REQ-FND-018, REQ-FND-026 | FND-001 | `server/src/platform/storage/**`, storage tests | valid/malicious fixture tests | `done` | `feature/FND-application-foundation` | Planned completion subject: `feat(FND-004): add local image storage adapter` | 2026-10-26: approved JPEG/PNG/WebP policy implemented with full decode/re-encode, 5 MiB/8000×8000/40 MP bounds, metadata stripping, opaque exclusive writes, safe deletion and compensation; 11/11 focused, 12/12 foundation unit and 36/36 integration passed; lint/build/docs validation and zero-vulnerability audit passed; verification-matrix §14. |
| 5 | FND-005 | FND/quality | WS-FND-01 | Establish test helpers, safe observability, and performance sanity checks | REQ-FND-019, REQ-FND-020, REQ-FND-029 | FND-003 complete; locally verified FND-002 under approved FND-DEC-004 development exception | `tests/helpers/**`, `server/src/platform/observability/**`; bounded runtime/HTTP/tooling wiring in technical contracts §11 | test harness; redaction; query checks | `blocked` | `feature/FND-application-foundation` | Checkpoint: `6b8675e`; completion commit: None; planned subject: `feat(FND-005): add safe observability and quality harness` | 2026-10-27: implementation, 8 focused unit/5 focused HTTP checks, 14 foundation unit-file checks and 54/54 real-MySQL/HTTP integration checks pass; lint/build pass. Mandatory docs validator BLOCKED / NOT RUN; cleanup resolved by user-executed, host-verified termination/removal on 2026-10-27. Static checkpoint review found no additional blocking code issue; no tests rerun. See verification-matrix §§15 and 17. |
| 6 | FND-006 | FND/deployment | WS-FND-01 | Build one Hostinger-compatible production app and runbook | REQ-FND-013, REQ-FND-024, REQ-FND-025, REQ-FND-029, REQ-SCOPE-015 | FND-001–FND-005 completion; local development exception FND-DEC-005 | root build/start scripts; production config/app wiring and tests; deployment runbook (contracts §12) | clean build; config/production HTTP/secret checks; real production smoke still required | `blocked` | `feature/FND-application-foundation` | No completion commit authorized; planned reference only: `chore(FND-006): add Hostinger production shape` | 2026-10-27: local preparation implemented; 3 focused config cases, 4 fake-DB production cases, 15 unit-file checks, 45 non-live-MySQL integration cases, lint/build/clean install passed. Both real DB suites explicitly skipped, not acceptance evidence. Validator BLOCKED / NOT RUN; upstream, hosting/session/persistence/recovery gates open. See verification-matrix §18 and hostinger-runbook.md. |

## DEC-008 Delivery Lane

FND is a grandfathered workstream: all six tasks remain on `feature/FND-application-foundation` under `WS-FND-01`; no historical task, status, or branch is rewritten. In the two-developer navigation, its remaining work is classified as platform/backend work.

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| FND-002 | User confirmed no hosting is ready; engine/version, TLS, connection budget and migration privileges cannot be verified. Mandatory documentation validator also unavailable. | Hosting/environment owner | Provide an identified hosting test environment and restore the original validator; do not infer hosting compatibility from local tests or substitute a database engine. |
| FND-005 | Mandatory canonical documentation validator BLOCKED / NOT RUN; completion commit absent. Cleanup resolved (user-executed, host-verified). Shared AC-FND-002 remains open with FND-002. | Local environment owner / acceptance owner | Restore the original validator and run the prescribed check; reconcile remaining acceptance evidence before requesting explicit completion-commit approval. Live MySQL reruns require fresh explicit authorization. See verification-matrix §17. |
| FND-006 | Local production preparation implemented, but upstream FND-002/FND-005 acceptance, mandatory validator, actual hosting/real-DB/session persistence and backup/restore evidence remain open | Hosting/environment and acceptance owners | Restore validator, close upstream gates, explicitly authorize any live MySQL tests and hosting operations, and execute the runbook gates before acceptance; no commit/deployment authorization inferred. |

## Completion Summary

- **Completed:** 3/6
- **Next ready task:** None. FND-002/FND-005/FND-006 remain `blocked`; FND-006 local preparation is implemented under FND-DEC-005 but upstream, validator and release acceptance gates remain open.
- **Feature status:** `in-progress`; FND-001, FND-003, and FND-004 are `done`, so 3/6 tasks are complete.

## 2026-10-27 — FND-005 implementation, completion withheld

FND-DEC-004 records explicit user approval to begin against locally verified FND-002 persistence.
Added allowlisted structured logs, HTTP request/error/abort correlation, startup outcomes, sink-failure
isolation, shared HTTP/temp-directory/query-count helpers and client/database performance sanity
checks. The final opt-in MySQL integration suite passed 54/54 without skips; 14 unit-file checks,
8 focused unit cases, 5 focused HTTP cases, lint and build pass. No dependencies or database/business
contracts changed. The canonical docs validator is absent again in the current environment; earlier
successful evidence remains historical. The sandboxed initialization attempt also left an owned
initializer/private directory that requires host intervention. No completion commit, promotion of
AC-FND-002, FND-006 implementation or remote action occurred.

## 2026-10-21 — Backend review fixes (FND-001 remains blocked)

FIX-001 and FIX-002 implemented under explicit backend-only authorization. Observed: 22 unit tests (18 new server manifest tests, 2 existing server config tests, 2 existing client tests), 10 HTTP integration tests, lint, build, and 17 production entry-point smoke probes passed. Regression coverage includes ID types, atomic registry validation, encoded API/hidden/asset paths, malformed encoding, single decoding, and valid SPA navigation. See handoff addendum for exact commands and limitations. Status remains `blocked`; completion remains 0/6. Commit reference remains None; no commit authorized. FND-002 was not started.

## 2026-10-21 — Backend Review Round 2 routing fix

Rejected repeated leading separators in the once-decoded production pathname before static/SPA handling. All four confirmed targets have raw GET/HEAD regressions. New regressions failed before the fix (16 failing target/method subtests, plus 2 failed parent tests) and passed afterward. Backend unit 20/20; integration 28/28 including subtests; lint/build and 36 actual production routing assertions passed. See handoff Round 2 addendum. FND-001 remains `blocked`, 0/6 complete, planned commit reference unchanged and no commit authorized; mandatory documentation validator remains unavailable. FND-002 not started.

## 2026-10-21 — Authorized WIP preservation checkpoint

The user explicitly authorized one WIP commit with the exact subject `chore(FND-001): WIP checkpoint of application foundation` and a non-force push of only `feature/FND-application-foundation` to `origin`. This supersedes earlier session-specific no-commit restrictions solely for checkpoint preservation under AGENTS.md §10. The user reports the backend passed independent review; the checkpoint intentionally retains unfinished client foundation work. FND-001 remains `blocked`, completion 0/6, acceptance checkboxes unchanged, and no completion commit exists. The prescribed documentation validator remains unavailable and has not passed. No additional fixes, feature work, PR, merge, or deployment is authorized. The resulting checkpoint hash belongs in the execution report, avoiding a circular follow-up commit.

## 2026-10-23 — Approved FND-002 early-start documentation

FND-DEC-002 records user approval of D1–D5, superseding only the earlier prohibition on FND-002 backend development once separately instructed. The reviewed baseline is `740c22b2fb3be6d1b5bd0080bbf42109e238c515`; FND-001 remains `blocked`, FND-002 remains `not-started`, and completion remains 0/6. A-002 is confirmed. No code, dependency, database, branch, commit, remote, or other downstream action is authorized by this documentation-only instruction. Historical evidence above is unchanged.

## 2026-10-23 — FND-002 Fix Round 1

The independently confirmed transaction and disposable-helper findings were fixed without later-task work. A query failure now terminally invalidates its transaction, blocks queued/later driver work, and prevents commit even when caught. Same-instance nested transactions reject through asynchronous callback context before acquiring a second connection; unrelated top-level transactions remain concurrent. Disposable MySQL cleanup retains only owned initializer/server handles, bounds graceful/forced shutdown, removes its private root, and is idempotent across connection, shutdown, initialization, and cleanup failures. Focused regressions pass 16/16; full disposable MySQL/HTTP integration passes 43/43 on MySQL 8.4.11; lint/build/whitespace pass. FND-002 remains `in-progress`, uncommitted, and 0/6 complete pending independent re-review and unavailable mandatory documentation validation.

## 2026-10-23 — Host verification report and independent review recorded

Verification-matrix §10 is the canonical observer/command record: the user confirmed host integration success and cleanup; Codex's prior direct unit/lint/in-memory-build results and PASS WITH WARNINGS review are recorded separately. No live database checks were run by Codex for this update. FND-002 remains `in-progress`, FND-001 remains `blocked`, and completion stays 0/6; validator/hosting blockers and acceptance checkboxes are unchanged. No commit is authorized.

FND-003 is `not-started` and depends on formal FND-001 completion, not FND-002 completion. The FND-002-only baseline exception does not satisfy FND-003's dependency or authorize its implementation. Once FND-001 passes its documented completion gate, FND-003 still requires explicit user authorization and the normal preflight on `feature/FND-application-foundation`, restricted to its owned paths and verification requirements.

## 2026-10-23 — Authorized backend handoff checkpoint

The user explicitly authorized committing and non-force pushing the current verified backend work on `feature/FND-application-foundation` for frontend handoff. Planned checkpoint subject: `chore(FND-002): checkpoint verified backend persistence for handoff`. This supersedes earlier session-specific no-commit/no-push restrictions only for this checkpoint, under AGENTS.md §10. It is not formal FND-001/FND-002 acceptance. FND-001 stays `blocked`, FND-002 stays `in-progress`, and completion remains 0/6; acceptance checkboxes and unresolved blockers are unchanged. Verification-matrix §10 retains the canonical 49-unit, host MySQL 8.4.11 43/43 integration, cleanup, lint, and in-memory build evidence with its original provenance. No application verification or database operation is rerun for Git handoff. No FND-003 work, PR, merge, deployment, or code modification is authorized. Report the resulting checkpoint hash and push outcome in chat without a self-referencing follow-up commit.

## 2026-10-26 — FND-001 client foundation completion work

`APP-FND-001` is now implemented with Zustand, `FeatureActionProvider`, and lifecycle-safe
registration/dispatch hooks. The focused registry checks and full foundation checks pass; the required
documentation validator now passes. FND-001 remains `blocked`, not done, because its final actual
production smoke requires a valid MySQL runtime that is unavailable locally. No FND-003 or UI-owned
implementation was started.

## 2026-10-26 — FND-001 completion

Oracle MySQL Community Server 8.4.11 was downloaded to an isolated temporary directory after the
local Docker daemon proved unavailable. The opt-in foundation integration suite passed 43/43 against
a fresh disposable database. A production entry-point smoke then returned 200 for health, SPA and the
built asset, returned the canonical JSON 404 for an unknown API route, and exited 0 after SIGTERM.
The database fixture stopped and removed its private data directory. Unit, lint, build, whitespace and
the mandatory documentation validator also passed. FND-001 is `done`; FND-003 is next after review.

## 2026-10-26 — FND-003 completion

Implemented the shared same-origin Axios transport and React Query provider, including safe client
error normalization and one bounded retry for transient reads only. Added server-generated request
IDs, canonical success/error helpers, explicit JSON/form limits, feature-owned validation middleware,
and safe malformed/oversized/unknown error handling. The requirement mapping now includes the
previously omitted REQ-FND-007 assignment already present in the canonical requirements index.
Observed 11/11 unit and 32/32 HTTP integration passes, lint/build/docs validation passes, and a final
`npm audit` result of zero vulnerabilities after bounded compatible dependency updates. AC-FND-002
remains unchecked because its persistence and later observability portions are not complete.

## 2026-10-26 — FND-004 completion

Implemented STO-FND-001 using the user-approved JPEG/PNG/WebP, 5 MiB, 8000×8000 and 40 MP policy.
`sharp` fully decodes and safely re-encodes accepted images, auto-orients them, strips metadata, and
rejects malformed, spoofed, unsupported, animated, multipage or over-limit input. Files use opaque
UUID names, exclusive 0600 writes inside the configured absolute root, safe deletion and owning-work
compensation. Observed 11/11 focused storage checks, 12/12 foundation unit and 36/36 integration passes;
lint, build, whitespace, documentation validation and the zero-vulnerability audit passed.

## 2026-10-27 — FND-005 closeout retry blocked

The user requested the remaining FND-005 work. Read-only rechecks confirmed that the prescribed
validator is still absent (invocation exit 2; validation BLOCKED / NOT RUN) and host PID 10626 still
identifies the exact test initializer using `/tmp/press-fnd002-mysql-pXE2jY/data`. Its private root
still exists. Prior TERM/KILL permission failures and the interactive sudo requirement remain
unresolved; no repeated signals or deletion of an active datadir were attempted. FND-005 is now
`blocked`. No implementation edits, application-test reruns, commit or push occurred in this retry.
Restore the original validator and obtain verified host cleanup before retrying completion.

## 2026-10-27 — Authorized FND-005 checkpoint

The user explicitly requested a local commit of the current unfinished FND-005 work. Planned
checkpoint subject: `chore(FND-005): checkpoint blocked quality foundation`. This authorizes one
preservation commit only, not completion or push. FND-005 remains `blocked`, the mandatory validator
remains BLOCKED / NOT RUN, host cleanup remains unresolved, and completion stays 3/6. Existing
verification evidence is retained without claiming new application test runs. Report the resulting
hash in chat; do not add a circular follow-up commit to store its own hash.

## 2026-10-27 — FND-002 closeout blocked by unavailable hosting

The user requested remaining FND-002 work, then confirmed that no hosting is ready. Preflight found
a clean worktree on `feature/FND-application-foundation`; FND-001 is done and A-002 is confirmed.
The remaining acceptance requires actual hosting engine/version, TLS requirements, connection budget,
migration privileges and compatible named-lock/InnoDB behavior. No target database or test environment
is available. FND-002 is now `blocked`; local implementation and prior successful evidence are retained.
No application code/configuration, TLS defaults, database engine, connection, migration, test rerun,
commit or remote operation was performed. The mandatory validator remains BLOCKED / NOT RUN.
See verification-matrix §16.

## 2026-10-27 — FND-005 user-verified cleanup and checkpoint review

The user reports safely terminating Node test PID 10580 and disposable MySQL initializer PID 10626,
verifying both absent, checking remaining associated processes/open files, removing only
`/tmp/press-fnd002-mysql-pXE2jY`, and confirming the directory absent. Record this as
**user-executed and host-verified**; Codex did not execute or independently observe the cleanup.
This resolves the cleanup blocker and supersedes only its outstanding status, not historical evidence.

Static review of checkpoint `6b8675e80b4b2252faa97ff17290d1b9a57c00ec` covered application wiring,
allowlisted logging, sink/error/disconnect behavior, shared harness, client loading and disposable-query
checks against the FND-005 scope. No additional blocking code issue was identified in this static
review; no new test pass is claimed. FND-005 remains `blocked`: mandatory validator BLOCKED / NOT RUN,
shared AC-FND-002 still open with FND-002, and no completion commit. FND-DEC-004 remains a development
exception, not full FND acceptance. Restore the original validator, reconcile mandatory acceptance
evidence, then seek explicit completion-commit approval. Do not rerun live MySQL without new explicit
authorization. No application changes, commit, push or FND-006 work in this update.

## 2026-10-27 — FND-006 local preparation, completion blocked

The user explicitly approved the bounded local-development exception FND-DEC-005. Added production
startup input/root checks, same-process opaque upload reads and a test/runbook surface without
changing AUTH or database contracts. All local results and skipped checks are recorded in
verification-matrix §18. FND-006 and AC-FND-004 are not complete; no live MySQL rerun, release,
commit, push or feature completion is authorized. Prior uncommitted delivery notes are preserved.
