# Backlog — Persistent Cart

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CART-001 | CART/core-api | WS-CART-01 | Add persistent cart schema and self-owned CRUD API | REQ-CART-001, REQ-CART-002, REQ-CART-003 | FND-002/FND-003, AUTH-AUTH-001, READ-CAT-001 | `server/src/features/cart/**` | migration/API/isolation tests | `not-started` | `feature/CART-persistent-cart` | — | — |
| 2 | CART-002 | CART/integrity | WS-CART-01 | Implement current price/availability readiness and transactional order handoff | REQ-CART-003, REQ-CART-004, REQ-CART-005 | CART-001, CAT-006 | CART services/contracts | CAT integration/concurrency tests | `not-started` | `feature/CART-persistent-cart` | — | — |
| 3 | CART-003 | CART/UI | WS-CART-01 | Build responsive Cart UI and exported add-to-cart adapter consumed by CAT's frozen extension slot | REQ-CART-001, REQ-CART-003, REQ-CART-004 | CART-001, CART-002, UI-003, CAT-004 | `src/features/cart/**` only | component/responsive tests | `not-started` | `feature/CART-persistent-cart` | — | — |
| 4 | CART-004 | CART/verification | WS-CART-01 | Complete persistence, isolation, stale variant, and concurrency verification | REQ-CART-002, REQ-CART-004 | CART-001–CART-003 | CART tests/docs | full cart integration/build | `not-started` | `feature/CART-persistent-cart` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| CART-003 | Product Details is CAT-owned | CAT/CART owners | CAT-004 must expose an add-to-cart slot/adapter; no direct unapproved CAT edit |

## Completion Summary

- **Completed:** 0/4
- **Next ready task:** `CART-001` after AUTH and CAT contracts
- **Feature status:** `planned`
