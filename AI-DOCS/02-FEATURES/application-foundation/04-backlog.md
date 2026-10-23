# Backlog — Application Foundation

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FND-001 | FND/runtime | WS-FND-01 | Establish feature-first client/server runtime and manifest seams | REQ-FND-001, REQ-FND-002, REQ-FND-003, REQ-FND-010, REQ-FND-025 | None | `src/app/**`, `server/src/app/**`, root manifests | startup tests; lint | `blocked` | `feature/FND-application-foundation` | WIP checkpoint subject: `chore(FND-001): WIP checkpoint of application foundation`; completion commit: None; planned completion subject unchanged | 2026-10-20: 4 unit + 8 integration tests, lint/build, dev/prod probes pass; subsequent backend evidence and WIP preservation authorization below; mandatory docs validator unavailable; see `08-FND-001-development-handoff.md`. |
| 2 | FND-002 | FND/database | WS-FND-01 | Add MySQL pool, migration runner, transaction and query contracts | REQ-FND-012, REQ-FND-020, REQ-FND-023, REQ-FND-027 | FND-001 complete OR reviewed backend baseline `740c22b2fb3be6d1b5bd0080bbf42109e238c515` under approved FND-DEC-002; A-002 confirmed | `server/src/platform/db/**`, `scripts/migrate*`, FND DB tests; exact bounded configuration/lifecycle/tooling additions in technical contracts §2 | empty/upgrade migrations; transaction tests; interruption/recovery and lifecycle checks | `in-progress` | `feature/FND-application-foundation` | Backend checkpoint subject: `chore(FND-002): checkpoint verified backend persistence for handoff`; completion commit: None; planned completion subject: `feat(FND-002): add MySQL persistence foundation` | 2026-10-23: independent review PASS WITH WARNINGS; Codex previously ran 49 unit tests, lint and in-memory production build successfully; user confirmed host MySQL 8.4.11 integration 43/43 and clean lifecycle. Observer/command details: verification-matrix §10. Mandatory validator and hosting/acceptance gates remain unresolved. |
| 3 | FND-003 | FND/http | WS-FND-01 | Add REST transport, validation, errors, request IDs, and scope guardrails | REQ-FND-005, REQ-FND-011, REQ-FND-014, REQ-FND-021, REQ-FND-022, REQ-FND-024, REQ-FND-028, REQ-SCOPE-001 | FND-001 | `src/shared/api/**`, `server/src/platform/http/**` | API boundary tests; lint | `not-started` | `feature/FND-application-foundation` | — | — |
| 4 | FND-004 | FND/storage | WS-FND-01 | Implement validated local image storage adapter and compensation | REQ-FND-018, REQ-FND-026 | FND-001 | `server/src/platform/storage/**`, storage tests | valid/malicious fixture tests | `not-started` | `feature/FND-application-foundation` | — | — |
| 5 | FND-005 | FND/quality | WS-FND-01 | Establish test helpers, safe observability, and performance sanity checks | REQ-FND-019, REQ-FND-020, REQ-FND-029 | FND-002, FND-003 | `tests/helpers/**`, `server/src/platform/observability/**` | test harness; redaction; query checks | `not-started` | `feature/FND-application-foundation` | — | — |
| 6 | FND-006 | FND/deployment | WS-FND-01 | Build one Hostinger-compatible production app and runbook | REQ-FND-013, REQ-FND-024, REQ-FND-025, REQ-FND-029, REQ-SCOPE-015 | FND-001–FND-005 | root build/start config, deployment docs | clean build; production smoke | `not-started` | `feature/FND-application-foundation` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| FND-001 | Mandatory documentation validator path is unavailable; task cannot complete | User / tooling owner | Restore the documented validator or explicitly authorize a command change; rerun validation and review before any future completion authorization. Only the explicitly authorized WIP checkpoint is permitted; no completion commit. |
| FND-002 | Mandatory documentation validator unavailable; completion blocked | User / tooling owner | Restore the prescribed validator through an approved process; no replacement, bypass, completion claim, or completion commit. FND-DEC-002 permits development only after a subsequent implementation instruction. |
| FND-002 | Hosting MySQL engine/version, TLS requirements, connection limits, and migration privileges unverified | Hosting owner / backend developer | Obtain and verify capabilities during authorized development; do not invent values or claim compatibility. A-002 technology selection is confirmed, not a remaining blocker. |

## Completion Summary

- **Completed:** 0/6
- **Next ready task:** None. FND-002 is `in-progress`; independent review and user-observed host evidence are recorded, but mandatory documentation validation and hosting/acceptance gates remain unresolved. No other downstream task is authorized.
- **Feature status:** `in-progress`; FND-001 remains `blocked` and 0/6 tasks are complete.

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
