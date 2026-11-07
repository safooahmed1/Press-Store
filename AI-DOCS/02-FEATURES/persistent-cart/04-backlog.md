# Backlog — Persistent Cart

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CART-001 | CART/core-api | WS-CART-BE | Add persistent cart schema and self-owned CRUD API | REQ-CART-001, REQ-CART-002, REQ-CART-003 | FND-002/FND-003, AUTH-AUTH-001, READ-CAT-001 | `server/src/features/cart/**`; bounded CAT service/repository/tests under CAT-DEC-012 | migration/API/isolation tests | `blocked` | `work/CART-backend` | Preservation checkpoint `8209be1bd256d13fbed49f0716bf4638262d1f27` under CART-DEC-006; not a completion commit. | 2026-11-06: real CAT binding/manifest/migration implemented under CART-DEC-004/CAT-DEC-012. Focused units 10/10, focused MySQL 21/21, full unit 171/171, full mirror integration 116/116, lint/build/cleanup pass. Original mandatory docs validator remains absent; no completion commit. See activation verification appendix. |
| 2 | CART-002 | CART/integrity | WS-CART-BE | Implement current price/availability readiness and transactional order handoff | REQ-CART-003, REQ-CART-004, REQ-CART-005 | CART-001, CAT-006; early development exception CART-DEC-005 | CART checkout service/repository/tests; bounded CAT-DEC-013 owner read/tests; consumer documentation only | CAT integration/concurrency tests | `blocked` | `work/CART-backend` | Authorized checkpoint CART-DEC-006; planned `chore(CART-002): checkpoint verified transactional cart handoff`; not a completion commit. | 2026-11-06: early backend implementation verified under CART-DEC-005/CAT-DEC-013/ORD-DEC-003. Focused unit 13/13, real MySQL handoff 13/13, full unit 179/179, full mirror integration 129/129, lint/build/cleanup pass. CART-001/CAT-006 formal gates and original docs validation remain open; no completion commit. |
| 3 | CART-003 | CART/UI | WS-CART-FE | Build responsive Cart UI and exported add-to-cart adapter consumed by CAT's frozen extension slot | REQ-CART-001, REQ-CART-003, REQ-CART-004 | CART-001, CART-002, UI-003, CAT-004 | `src/features/cart/**` only | component/responsive tests | `not-started` | `work/CART-frontend` | — | — |
| 4 | CART-004 | CART/verification | WS-CART-INT | Complete persistence, isolation, stale variant, and concurrency verification | REQ-CART-002, REQ-CART-004 | CART-001–CART-003 | CART tests/docs | full cart integration/build | `not-started` | `feature/CART-integration` | — | — |

## DEC-008 Effective Delivery Overlay

| Lane | Workstream | Effective Tasks | Effective Branch | Integration Rule |
|---|---|---|---|---|
| BE | WS-CART-BE | CART-001–CART-002 | `work/CART-backend` | Persistence/readiness/concurrency contracts pass. |
| FE | WS-CART-FE | CART-003 | `work/CART-frontend` | Complete Cart capability and CAT adapter against frozen fixtures if necessary. |
| INT | WS-CART-INT | CART-004 | `feature/CART-integration` | Real persistence/isolation/stale-variant/build gate passes. |

The ordered-task rows above and this lane summary are the canonical DEC-008 assignments; earlier planned assignments remain recoverable in Git history.

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| CART-001 | Original mandatory docs validator is missing, BLOCKED / NOT RUN. | Original tooling owner / user | Restore verified original tool; no replacement or invented pass. |
| CART-002 | Original documentation validation and formal CART-001/CAT-006 prerequisites remain incomplete; CART-DEC-005 permits development only. | Original tooling / feature owners | Preserve verified backend evidence; do not promote task/feature or commit as complete. |
| CART-003 | Product Details is CAT-owned | CAT/CART owners | CAT-004 must expose an add-to-cart slot/adapter; no direct unapproved CAT edit |

## Completion Summary

- **Completed:** 0/4
- **Next ready task:** None in the requested BE scope while CART-001/CART-002 completion gates remain blocked.
- **Feature status:** `in-progress`


## 2026-11-06 — Authorized independent CART-001 development

User approved CART-DEC-002 baseline/limits/version policy, then explicitly selected independent work
with real CAT linking stopped (CART-DEC-003). CART source only; no frontend, CAT owner change or
CART-002 implementation. Schema is staged outside automatic discovery; factories require an explicit
catalog batch dependency, with no production fallback or manifest. Completion remains 0/4.
Original required documentation validator is absent. Full acceptance/production integration is not claimed.

## 2026-11-06 — Independent portion verified; full task blocked

Focused CART units 5/5, actual-MySQL CART cases 14/14, full unit 166/166, lint/build/whitespace pass.
Full integration 109/109 passes from a byte-verified /tmp source mirror; the default .codex worktree
path has a separately reproduced baseline FND static-page serving failure. Historical failed runs
are retained in the verification appendix. Real CAT/manifest/migration activation remain intentionally
stopped, original docs validation BLOCKED / NOT RUN; CART-001 blocked, total 0/4, no completion commit.
No frontend, CAT owner change, CART-002, application database/env, publication or next task.

## 2026-11-06 — CART-001 real backend linking resumed

CART-DEC-004 supersedes the earlier independent-only stop. User selected remaining item 1,
authorizing CAT-DEC-012 service/repository contract and test amendment, real manifest wiring
and discovery of the unchanged CART SQL. Separate CAT/AUTH/SET/HOME worktrees remain untouched.
No checkout-readiness/ORD handoff or CART-002/FE/INT implementation. Original documentation
validation remains unavailable; no completed task, checkpoint/completion commit or publication.

## 2026-11-06 — CART-001 real backend verified; original tooling gate remains

The earlier real-linking/activation blocker is resolved by CART-DEC-004/CAT-DEC-012. Current
backend source is wired to CAT, discovered routes and the unchanged registered migration.
Final evidence: 10 focused units, 21 focused real-MySQL cases (five real-app + two CAT batch +
14 independent CART cases), 171 full units, 116 full integration tests from an exact non-hidden
source mirror; lint/build/whitespace/host cleanup pass. No failures/cancellations/skips in final runs.
Original mandatory documentation validator remains absent, BLOCKED / NOT RUN. CART-001 stays
blocked with no completion commit; feature tracking 0/4, BE 0/2. No CART-002/FE/INT work or publication.

## 2026-11-06 — CART-002 approved early backend preflight

CART-DEC-005 records explicit approval despite CART-001/CAT-006 formal gates remaining open.
Use the same work/CART-backend and verified local baseline, preserve all prior uncommitted work.
Acceptance: current price/availability under locks, empty/unavailable rejection, exact-version
consumption inside the caller transaction, rollback and concurrency proofs; no stock mutation.
Owned paths are CART service/repository/tests, the bounded CAT-DEC-013 owner read/tests and
CART/CAT/ORD consumer/delivery documentation. Forbidden: frontend, ORD implementation, AUTH/FND,
schema/dependencies/config, other worktrees, existing DB/env. Checks: focused Node tests, fresh
disposable-MySQL handoff tests, full unit/integration, lint/build and original docs validator.
No commit/checkpoint, merge, push, deployment, next task or feature completion authorized.

## 2026-11-06 — CART-002 backend verified, formal gates retained

Focused boundaries 13/13, focused actual-MySQL handoff 13/13, full unit 179/179 and full integration
129/129 from a byte-verified non-hidden source mirror pass, no failures/cancellations/skips.
Lint/build/whitespace and host cleanup pass. Locking/current-price, exact-clear/version/ticket,
rollback and 100-line query-bound proofs are in the CART-002 verification appendix.
CART-001/CAT-006 formal gates and original docs validator remain open. CART-002 blocked, feature
0/4 and BE 0/2 complete, no completion commit. ORD implementation, FE/INT and publication untouched.


## 2026-11-06 — Checkpoint preservation authorized

CART-DEC-006 authorizes two separate checkpoint commits and a non-force branch push for existing
CART-001/002 work. Both task rows remain blocked, feature 0/4 and BE 0/2 complete. Observed tests
remain in their respective verification appendices. No completion/merge/PR target change or deployment.


## 2026-11-06 — CART-001 preservation checkpoint

Current blocked task, 171 full unit/116 exact-source mirror integration and lint/build/cleanup evidence
retained. Original validator absent; no completion claim. User authorized checkpoint publication
under CART-DEC-006. CART-002 is preserved separately in the next checkpoint.

## 2026-11-07 — CART-001 upgrade test correction

CART-DEC-008 limits the fixture to the initial CART migration. The focused test passed on
the CART branch and with later SET and ORD migrations discoverable in an isolated copy.
All 32 CART integration tests passed in the combined copy. See the verification matrix.
The fix leaves task tracking and published checkpoint references unchanged.
