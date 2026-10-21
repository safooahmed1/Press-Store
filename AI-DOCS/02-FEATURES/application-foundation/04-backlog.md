# Backlog — Application Foundation

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FND-001 | FND/runtime | WS-FND-01 | Establish feature-first client/server runtime and manifest seams | REQ-FND-001, REQ-FND-002, REQ-FND-003, REQ-FND-010, REQ-FND-025 | None | `src/app/**`, `server/src/app/**`, root manifests | startup tests; lint | `blocked` | `feature/FND-application-foundation` | WIP checkpoint subject: `chore(FND-001): WIP checkpoint of application foundation`; completion commit: None; planned completion subject unchanged | 2026-10-20: 4 unit + 8 integration tests, lint/build, dev/prod probes pass; subsequent backend evidence and WIP preservation authorization below; mandatory docs validator unavailable; see `08-FND-001-development-handoff.md`. |
| 2 | FND-002 | FND/database | WS-FND-01 | Add MySQL pool, migration runner, transaction and query contracts | REQ-FND-012, REQ-FND-020, REQ-FND-023, REQ-FND-027 | FND-001, A-002 confirmed or accepted | `server/src/platform/db/**`, `scripts/migrate*`, FND DB tests | empty/upgrade migrations; transaction tests | `not-started` | `feature/FND-application-foundation` | — | — |
| 3 | FND-003 | FND/http | WS-FND-01 | Add REST transport, validation, errors, request IDs, and scope guardrails | REQ-FND-005, REQ-FND-011, REQ-FND-014, REQ-FND-021, REQ-FND-022, REQ-FND-024, REQ-FND-028, REQ-SCOPE-001 | FND-001 | `src/shared/api/**`, `server/src/platform/http/**` | API boundary tests; lint | `not-started` | `feature/FND-application-foundation` | — | — |
| 4 | FND-004 | FND/storage | WS-FND-01 | Implement validated local image storage adapter and compensation | REQ-FND-018, REQ-FND-026 | FND-001 | `server/src/platform/storage/**`, storage tests | valid/malicious fixture tests | `not-started` | `feature/FND-application-foundation` | — | — |
| 5 | FND-005 | FND/quality | WS-FND-01 | Establish test helpers, safe observability, and performance sanity checks | REQ-FND-019, REQ-FND-020, REQ-FND-029 | FND-002, FND-003 | `tests/helpers/**`, `server/src/platform/observability/**` | test harness; redaction; query checks | `not-started` | `feature/FND-application-foundation` | — | — |
| 6 | FND-006 | FND/deployment | WS-FND-01 | Build one Hostinger-compatible production app and runbook | REQ-FND-013, REQ-FND-024, REQ-FND-025, REQ-FND-029, REQ-SCOPE-015 | FND-001–FND-005 | root build/start config, deployment docs | clean build; production smoke | `not-started` | `feature/FND-application-foundation` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| FND-001 | Mandatory documentation validator path is unavailable; task cannot complete | User / tooling owner | Restore the documented validator or explicitly authorize a command change; rerun validation and review before any future completion authorization. Only the explicitly authorized WIP checkpoint is permitted; no completion commit. |
| FND-002 | A-002 query library remains pending | User or implementation preflight | Confirm ORM requirement or accept minimal driver choice |

## Completion Summary

- **Completed:** 0/6
- **Next ready task:** None; resolve the FND-001 verification blocker first. Later tasks are not authorized.
- **Feature status:** `in-progress`; FND-001 remains `blocked` and 0/6 tasks are complete.

## 2026-10-21 — Backend review fixes (FND-001 remains blocked)

FIX-001 and FIX-002 implemented under explicit backend-only authorization. Observed: 22 unit tests (18 new server manifest tests, 2 existing server config tests, 2 existing client tests), 10 HTTP integration tests, lint, build, and 17 production entry-point smoke probes passed. Regression coverage includes ID types, atomic registry validation, encoded API/hidden/asset paths, malformed encoding, single decoding, and valid SPA navigation. See handoff addendum for exact commands and limitations. Status remains `blocked`; completion remains 0/6. Commit reference remains None; no commit authorized. FND-002 was not started.

## 2026-10-21 — Backend Review Round 2 routing fix

Rejected repeated leading separators in the once-decoded production pathname before static/SPA handling. All four confirmed targets have raw GET/HEAD regressions. New regressions failed before the fix (16 failing target/method subtests, plus 2 failed parent tests) and passed afterward. Backend unit 20/20; integration 28/28 including subtests; lint/build and 36 actual production routing assertions passed. See handoff Round 2 addendum. FND-001 remains `blocked`, 0/6 complete, planned commit reference unchanged and no commit authorized; mandatory documentation validator remains unavailable. FND-002 not started.

## 2026-10-21 — Authorized WIP preservation checkpoint

The user explicitly authorized one WIP commit with the exact subject `chore(FND-001): WIP checkpoint of application foundation` and a non-force push of only `feature/FND-application-foundation` to `origin`. This supersedes earlier session-specific no-commit restrictions solely for checkpoint preservation under AGENTS.md §10. The user reports the backend passed independent review; the checkpoint intentionally retains unfinished client foundation work. FND-001 remains `blocked`, completion 0/6, acceptance checkboxes unchanged, and no completion commit exists. The prescribed documentation validator remains unavailable and has not passed. No additional fixes, feature work, PR, merge, or deployment is authorized. The resulting checkpoint hash belongs in the execution report, avoiding a circular follow-up commit.
