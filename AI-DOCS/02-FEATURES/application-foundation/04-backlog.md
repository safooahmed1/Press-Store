# Backlog — Application Foundation

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FND-001 | FND/runtime | WS-FND-01 | Establish feature-first client/server runtime and manifest seams | REQ-FND-001, REQ-FND-002, REQ-FND-003, REQ-FND-006, REQ-FND-010, REQ-FND-025 | None | `src/app/**`, `server/src/app/**`, root manifests | startup tests; lint | `done` | `feature/FND-application-foundation` | Planned completion subject: `feat(FND-001): establish modular runtime seams` | 2026-10-26: APP-FND-001 client registry, 43/43 opt-in MySQL integration, and production smoke on isolated MySQL 8.4.11 passed; health/SPA/asset 200, API 404 JSON, graceful exit 0. Unit, lint, build, whitespace, and docs validation passed; see verification-matrix §12. |
| 2 | FND-002 | FND/database | WS-FND-01 | Add MySQL pool, migration runner, transaction and query contracts | REQ-FND-012, REQ-FND-020, REQ-FND-023, REQ-FND-027 | FND-001 complete OR reviewed backend baseline `740c22b2fb3be6d1b5bd0080bbf42109e238c515` under approved FND-DEC-002; A-002 confirmed | `server/src/platform/db/**`, `scripts/migrate*`, FND DB tests; exact bounded configuration/lifecycle/tooling additions in technical contracts §2 | empty/upgrade migrations; transaction tests; interruption/recovery and lifecycle checks | `in-progress` | `feature/FND-application-foundation` | Backend checkpoint subject: `chore(FND-002): checkpoint verified backend persistence for handoff`; completion commit: None; planned completion subject: `feat(FND-002): add MySQL persistence foundation` | 2026-10-26 current state: MySQL 8.4.11 integration 43/43, lint/build and the restored documentation validator pass. Hosting engine/version, TLS, limits, privileges, and final acceptance remain unresolved; see verification-matrix §§10 and 12. |
| 3 | FND-003 | FND/http | WS-FND-01 | Add REST transport, validation, errors, request IDs, and scope guardrails | REQ-FND-005, REQ-FND-007, REQ-FND-011, REQ-FND-014, REQ-FND-021, REQ-FND-022, REQ-FND-024, REQ-FND-028, REQ-SCOPE-001 | FND-001 | `src/shared/api/**`, `server/src/platform/http/**` plus FND-owned provider/runtime composition | API boundary tests; lint | `done` | `feature/FND-application-foundation` | Planned completion subject: `feat(FND-003): add REST validation and errors` | 2026-10-26: Axios/React Query boundary, canonical HTTP errors, server request IDs, validation, body limits and scope exclusion implemented; 11 unit/32 integration, lint/build/docs validation and audit (0 vulnerabilities) pass; verification-matrix §13. |
| 4 | FND-004 | FND/storage | WS-FND-01 | Implement validated local image storage adapter and compensation | REQ-FND-018, REQ-FND-026 | FND-001 | `server/src/platform/storage/**`, storage tests | valid/malicious fixture tests | `not-started` | `feature/FND-application-foundation` | — | — |
| 5 | FND-005 | FND/quality | WS-FND-01 | Establish test helpers, safe observability, and performance sanity checks | REQ-FND-019, REQ-FND-020, REQ-FND-029 | FND-002, FND-003 | `tests/helpers/**`, `server/src/platform/observability/**` | test harness; redaction; query checks | `not-started` | `feature/FND-application-foundation` | — | — |
| 6 | FND-006 | FND/deployment | WS-FND-01 | Build one Hostinger-compatible production app and runbook | REQ-FND-013, REQ-FND-024, REQ-FND-025, REQ-FND-029, REQ-SCOPE-015 | FND-001–FND-005 | root build/start config, deployment docs | clean build; production smoke | `not-started` | `feature/FND-application-foundation` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| FND-002 | Hosting MySQL engine/version, TLS requirements, connection limits, and migration privileges unverified | Hosting owner / backend developer | Obtain and verify capabilities during authorized development; do not invent values or claim compatibility. A-002 technology selection is confirmed, not a remaining blocker. |

## Completion Summary

- **Completed:** 2/6
- **Next ready task:** `FND-004`; FND-002 remains `in-progress` pending hosting/acceptance gates. The separately approved UI early-start documentation is still required before UI branch creation.
- **Feature status:** `in-progress`; FND-001 and FND-003 are `done`, so 2/6 tasks are complete.

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
