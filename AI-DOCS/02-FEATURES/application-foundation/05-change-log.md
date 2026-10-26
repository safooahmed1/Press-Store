# Change Log — Application Foundation

## 2026-10-26 — FND-003 REST transport and validation

- Added the versioned same-origin Axios client, safe `ApiError` normalization, and one app-owned React
  Query client. Transient reads retry once; client errors and all mutations do not retry by default.
- Replaced the minimal runtime error path with server-generated request IDs, canonical data/error
  envelopes, `HttpError`, 64 KiB JSON and 16 KiB form limits, and feature-owned validation helpers.
  Unknown errors are sanitized and `/api/v1/shipping` remains absent/404.
- Added focused server/client contract tests and runtime integration for valid/invalid input,
  malformed JSON, oversized bodies, known/unknown failures, request-ID trust, and scope exclusion.
- Installed approved Axios/React Query dependencies. Updated body-parser, zod and Vite within compatible
  ranges to remediate three high advisories; final audit reports zero vulnerabilities.

## 2026-10-26 — FND-001 client foundation completion work

- Added Zustand-backed `APP-FND-001` FeatureActionRegistry at the app root. Feature owners register
  lowercase kebab-case actions through lifecycle-safe hooks and dispatch without feature-to-feature
  imports; registry state is registered, unavailable, pending, succeeded, or failed.
- The registry validates IDs, handlers, uniqueness, availability, and duplicate pending dispatches.
  Feature handlers retain domain payload validation and their original failure values. No shared UI,
  feature page, visual state, routing behavior, or HTTP implementation changed.
- Added focused registry tests for invalid and duplicate registration, cleanup/unavailable behavior,
  payload dispatch, pending state, success, and failure. Observed: 8 unit tests and 31 integration
  tests passed; lint, build, whitespace, and the prescribed documentation validator passed.

## 2026-10-26 — FND-001 completion verification

- Ran the opt-in foundation integration suite against an isolated Oracle MySQL Community Server
  8.4.11 instance: 43 tests passed across the HTTP runtime and disposable database suites.
- Ran the actual production entry point with synthetic database configuration. Health, SPA fallback,
  and the referenced built asset returned 200; unknown API returned the canonical JSON 404; SIGTERM
  produced exit 0 with clean database shutdown.
- Completed the final diff/security/scope review and the required unit, lint, build, whitespace, and
  documentation validation gates. FND-001 is complete; FND-003 and UI implementation were not started.

At initial log creation, no implementation activity had been recorded.

## 2026-10-20 — FND-001 development, completion blocked

- Added client/server runtime composition, validated manifest discovery, runtime-only configuration validation, public health, and production API/static/SPA separation. Retained the original demo files without deleting or designing UI.
- Added approved Express dependency, Node test entry points, Vite API proxy, server lint globals, and recursive environment ignore rules. Existing `server/.env` was not read, loaded, staged, or modified.
- Recorded noncritical manifest convention assumption A-008 in the canonical contract and global register; FND-003 remains the freeze point.
- Observed 4 unit and 8 HTTP integration tests passing, lint/build passing, and successful dev/prod entry-point probes. Initial HTTP sandbox restrictions required an elevated rerun. Audit reports one moderate existing Vite advisory.
- Mandatory validator command fails because its script is absent. No substitute or waiver; task remains blocked, no acceptance checkbox marked passed, no commit created. See `08-FND-001-development-handoff.md` for exact evidence and limitations.

## 2026-10-21 — FND-001 backend review fixes

- FIX-001: explicitly require string server manifest IDs before the unchanged lowercase kebab-case regex; invalid registries fail composition before listening or attaching feature routes.
- FIX-002: classify one decoded production pathname before static serving; encoded API and hidden segments receive JSON 404, malformed encoding safely receives JSON 404, and missing encoded asset paths cannot fall through to SPA HTML. Original request URLs remain intact; no recursive decoding or path normalization introduced.
- Added 18 server manifest unit tests and 2 HTTP integration tests (10 total integration tests); temporary fixture directories now have teardown hooks, including existing runtime fixtures.
- Unit suite 22/22, integration 10/10, lint/build and 17 production smoke probes passed. Mandatory documentation validator still exits 2 because its script is absent. No typecheck script exists. Frontend files, dependencies, and environment files unchanged; no staging or commit. FND-001 remains blocked. See handoff addendum.

## 2026-10-21 — Backend Review Round 2

- Minimal routing change: reject `pathname.startsWith('//')` after the existing single decode, using safe JSON 404 before static files and SPA fallback. No URL mutation, normalization, or second decode.
- Added GET/HEAD integration groups with 16 request-target subtests covering all four confirmed examples, percent case, literal/encoded repeated separators, SPA and static targets; added controls for normal API/SPA/static/HEAD behavior, hidden paths, malformed encoding, and literal double encoding.
- Red/green evidence: all 16 new target/method subtests returned 200 before the fix and 404 afterward. Final backend unit 20/20; integration 28/28 including parents/subtests; lint/build and 36 production routing assertions passed. Fixtures cleaned up; environment metadata unchanged, ignored and untracked.
- Documentation validator remains unavailable; task remains blocked and uncommitted. No frontend or later-task changes. See handoff addendum.

## 2026-10-23 — Approved FND-002 decisions, documentation only

- Recorded FND-DEC-002 D1–D5 and the narrowly bounded root task-loop exception against independently reviewed backend checkpoint `740c22b2fb3be6d1b5bd0080bbf42109e238c515`. FND-001 remains `blocked`; frontend completion belongs to another developer; no other downstream task is authorized.
- Confirmed A-002: `mysql2/promise`, explicit parameterized SQL, and forward SQL migrations without an ORM/query builder or additional migration framework. No dependency was installed or version selected.
- Documented immutable migration checksums, a dedicated-connection database lock, persistent interruption markers in FND infrastructure metadata, blocked automatic retries, and separately approved recovery requiring inspection/evidence. No transactional DDL rollback is assumed.
- Clarified only the exact approved database configuration, lifecycle integration, and tooling paths. Hosting engine/version, TLS requirements, connection limits, and migration privileges remain open verification items; no values or compatibility results are invented.
- FND-002 remains `not-started`, completion stays 0/6, and no acceptance checkbox changes. The instruction authorizes these documentation changes only; implementation awaits a subsequent user instruction. Branch/merge strategy and all historical evidence remain unchanged.
- During that documentation-only authorization, the unchanged mandatory validator command was attempted and exited 2 because the script was absent. Validation did not run or pass; no replacement or bypass occurred. No code, tests, build, database operations, environment access, staging, commit, or remote action occurred in that documentation-only scope.

## 2026-10-23 — FND-002 Fix Round 1

- Made transaction query failure terminal, serialized per-transaction query execution, cancelled queued/later driver calls after failure, and preserved rollback plus connection release. A caught query error can no longer be followed by usable work or commit.
- Rejected same-instance nested transactions before connection acquisition using asynchronous callback context. Independent concurrent top-level transactions still use separate connections; no savepoints or retries added.
- Reworked the disposable MySQL helper to retain only its initializer/server handles, bound initialization and shutdown waits, escalate through SIGTERM/SIGKILL, fall back after connection or `SHUTDOWN` failure, remove its private root, and make cleanup idempotent.
- Added deadlock-shaped queued-query, caught-error, nested atomicity/concurrency, initialization/authentication/shutdown/termination/removal, and repeated-cleanup regressions. Focused tests 16/16 and full integration 43/43 passed on isolated MySQL 8.4.11; lint/build/whitespace passed with no leftover disposable process/directory.
- Mandatory documentation validation remains unavailable and did not pass. FND-002 stays `in-progress`; no acceptance checkbox, completion commit, merge, push, deployment, or later task.

## 2026-10-23 — User-observed host verification recorded

- Added the canonical provenance record in verification-matrix §10: user-confirmed host command, MySQL 8.4.11 integration result (43/43, two suites, exit 0), and user-observed cleanup with system MySQL PID 1661 retained. The initial `test` command transcription was explicitly corrected by the user to `test:integration`; Codex did not execute or directly observe the host run or its cleanup.
- Recorded Codex's prior direct 49-unit-test, lint, in-memory production-build, and PASS WITH WARNINGS review evidence separately; no application verification was rerun for this documentation update. Actual MySQL deadlock generation and Hostinger compatibility are not claimed.
- Updated current FND-002 evidence summaries while retaining `in-progress`, FND-001 `blocked`, 0/6 completion, and unchanged acceptance checkboxes. FND-003 still depends on formal FND-001 completion and separate user authorization; its dependency is not waived by FND-DEC-002.
- The prescribed documentation validator was attempted for this update and exited 2 because the script remains absent. No validation pass, replacement, bypass, completion commit, or downstream authorization is claimed. Backend/frontend code and prior historical evidence were preserved; no environment-file access, staging, commit, or remote action.

## 2026-10-23 — Authorized backend checkpoint for frontend handoff

- Recorded explicit user authorization for one descriptive backend checkpoint and non-force publication of only the existing FND feature branch; planned subject `chore(FND-002): checkpoint verified backend persistence for handoff`.
- Preserved existing backend implementation, tests, approved dependency/tooling/configuration changes, FND-DEC-002 and its task-loop exception, and delivery evidence. No frontend source or application code was modified during this handoff operation.
- Retained verification provenance in verification-matrix §10: 49 prior unit tests, user-host MySQL 8.4.11 integration 43/43 and cleanup, and earlier lint/in-memory build pass. No fresh test, build, cleanup, or database result is claimed for this Git-only operation.
- FND-001 remains `blocked`, FND-002 remains `in-progress`, completion stays 0/6, and acceptance criteria are not promoted. The unchanged prescribed documentation validator remains missing and did not pass; hosting and other acceptance blockers remain unresolved. This is preservation for handoff, not formal acceptance, merge readiness, or FND-003 authorization.
