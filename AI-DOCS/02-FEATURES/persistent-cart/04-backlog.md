# Backlog — Persistent Cart

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CART-001 | CART/core-api | WS-CART-BE | Add persistent cart schema and self-owned CRUD API | REQ-CART-001, REQ-CART-002, REQ-CART-003 | FND-002/FND-003, AUTH-AUTH-001, READ-CAT-001 | `server/src/features/cart/**`; bounded CAT service/repository/tests under CAT-DEC-012 | migration/API/isolation tests | `blocked` | `work/CART-backend` | Authorized checkpoint under CART-DEC-006; planned `chore(CART-001): checkpoint verified persistent cart APIs`; not a completion commit. | 2026-11-06: real CAT binding/manifest/migration implemented under CART-DEC-004/CAT-DEC-012. Focused units 10/10, focused MySQL 21/21, full unit 171/171, full mirror integration 116/116, lint/build/cleanup pass. Original mandatory docs validator remains absent; no completion commit. See activation verification appendix. |
| 2 | CART-002 | CART/integrity | WS-CART-BE | Implement current price/availability readiness and transactional order handoff | REQ-CART-003, REQ-CART-004, REQ-CART-005 | CART-001, CAT-006 | CART services/contracts | CAT integration/concurrency tests | `not-started` | `work/CART-backend` | — | — |
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
| CART-003 | Product Details is CAT-owned | CAT/CART owners | CAT-004 must expose an add-to-cart slot/adapter; no direct unapproved CAT edit |

## Completion Summary

- **Completed:** 0/4
- **Next ready task:** None while CART-001 remains partial; CART-002 also depends on CAT-006.
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

## 2026-11-06 — CART-001 preservation checkpoint

Current blocked task, 171 full unit/116 exact-source mirror integration and lint/build/cleanup evidence
retained. Original validator absent; no completion claim. User authorized checkpoint publication
under CART-DEC-006. CART-002 is preserved separately in the next checkpoint.
