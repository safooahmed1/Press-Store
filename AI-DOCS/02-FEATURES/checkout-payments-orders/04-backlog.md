# Backlog — Checkout, Payments, and Orders

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ORD-001 | ORD/order-core | WS-ORD-BE | Add order/item schema, snapshots, payment/fulfillment states, idempotency records | REQ-PAY-009, REQ-PAY-010, REQ-PAY-012, REQ-ORD-002, REQ-ORD-013, REQ-ORD-015 | FND-002, AUTH schema | order core migrations/domain | migration/state tests | `not-started` | `work/ORD-backend` | — | — |
| 2 | ORD-002 | ORD/checkout-core | WS-ORD-BE | Implement server quote, pickup guidance, three methods, payment destination/input rules | REQ-PAY-001, REQ-PAY-003, REQ-PAY-004, REQ-PAY-005, REQ-PAY-006, REQ-PAY-007, REQ-PAY-008, REQ-PAY-011, REQ-SCOPE-010, REQ-SCOPE-013 | ORD-001, READ-CART-001, READ-CAT-001, READ-SET-001 | order checkout server paths | quote/payment matrix tests | `not-started` | `work/ORD-backend` | — | — |
| 3 | ORD-003 | ORD/order-core | WS-ORD-BE | Implement idempotent atomic order creation, revalidation, snapshots, and cart clear | REQ-PAY-001, REQ-PAY-010, REQ-PAY-011, REQ-ORD-013, REQ-ORD-014 | ORD-002, CMD-CART-001 | order create services/routes | transaction/idempotency/race tests | `not-started` | `work/ORD-backend` | — | — |
| 4 | ORD-004 | ORD/checkout-ui | WS-ORD-FE | Build responsive checkout review, conditional payment, guidance, and confirmation | REQ-PAY-001, REQ-PAY-002, REQ-PAY-003, REQ-PAY-004, REQ-PAY-005, REQ-PAY-006, REQ-PAY-007, REQ-PAY-008 | ORD-002, ORD-003, UI-003 | `src/features/orders/checkout/**` | component/a11y/E2E tests | `not-started` | `work/ORD-frontend` | — | — |
| 5 | ORD-005 | ORD/customer-history | WS-ORD-INT | Integrate customer order list/detail API with responsive pages | REQ-ORD-001, REQ-ORD-002, REQ-ORD-003, REQ-ORD-005, REQ-SCOPE-017 | ORD-009, ORD-010 | `tests/integration/orders/customer-history/**` | live API/client isolation and UI checks | `not-started` | `feature/ORD-integration` | — | — |
| 6 | ORD-006 | ORD/admin-api | WS-ORD-BE | Implement admin list/detail, manual payment, prepare/deliver, and WhatsApp contracts | REQ-PAY-009, REQ-PAY-010, REQ-ORD-007, REQ-ORD-008, REQ-ORD-009, REQ-ORD-011, REQ-ORD-012, REQ-ORD-015 | ORD-001, READ-SET-002, AUTH-AUTH-002 | order admin server paths | action/state/deep-link tests | `not-started` | `work/ORD-backend` | — | — |
| 7 | ORD-007 | ORD/admin-ui | WS-ORD-FE | Build responsive admin Orders list/detail and clear daily actions | REQ-ORD-007, REQ-ORD-008, REQ-ORD-009, REQ-ORD-010, REQ-ORD-011, REQ-ORD-012 | ORD-006, UI-004 | `src/features/orders/admin/**` | admin component/responsive tests | `not-started` | `work/ORD-frontend` | — | — |
| 8 | ORD-008 | ORD/expiry-verification | WS-ORD-INT | Complete full live cross-feature/order expiry E2E suite | REQ-PAY-012, REQ-ORD-004, REQ-ORD-005, REQ-ORD-006 | ORD-003–ORD-007, ORD-011, A-001 confirmed/accepted | order integration/E2E tests and evidence | full clock/race/E2E/build checks | `not-started` | `feature/ORD-integration` | — | — |

## DEC-008 Effective Delivery Overlay

ORD-005 and ORD-008 keep their stable IDs but become INT coordination/verification tasks. Their previously mixed implementation is split into the new independently owned tasks below.

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 4a | ORD-009 | ORD/customer-history-api | WS-ORD-BE | Implement customer-owned paginated order list/detail API | REQ-ORD-001, REQ-ORD-002, REQ-ORD-003, REQ-ORD-005, REQ-SCOPE-017 | ORD-001, AUTH-AUTH-001 | `server/src/features/orders/customer/**` | API isolation/pagination tests | `not-started` | `work/ORD-backend` | — | — |
| 4b | ORD-010 | ORD/customer-history-ui | WS-ORD-FE | Build responsive Your Orders list/detail capability | REQ-ORD-001, REQ-ORD-002, REQ-ORD-003, REQ-ORD-005, REQ-SCOPE-017 | Frozen API-ORD-002, UI-003 | `src/features/orders/customer/**` | component/a11y/responsive tests with contract fixtures | `not-started` | `work/ORD-frontend` | — | — |
| 7a | ORD-011 | ORD/expiry-job | WS-ORD-BE | Implement rerunnable unpaid-cash expiry job with race-safe state guards | REQ-PAY-012, REQ-ORD-004, REQ-ORD-005, REQ-ORD-006 | ORD-003, A-001 confirmed/accepted, JOB-FND-001 | `server/src/features/orders/jobs/**` | clock/race/rerun tests | `not-started` | `work/ORD-backend` | — | — |

| Lane | Workstream | Effective Tasks | Effective Branch | Integration Rule |
|---|---|---|---|---|
| BE | WS-ORD-BE | ORD-001–ORD-003, ORD-006, ORD-009, ORD-011 | `work/ORD-backend` | Domain, quote/create, customer/admin APIs, and expiry checks pass. |
| FE | WS-ORD-FE | ORD-004, ORD-007, ORD-010 | `work/ORD-frontend` | Checkout, admin orders, and customer history are complete capabilities; fixtures may cover a delayed API. |
| INT | WS-ORD-INT | ORD-005, ORD-008 | `feature/ORD-integration` | ORD-005 integrates API-ORD-002 with ORD-010; ORD-008 runs the real full cross-feature/E2E gate including ORD-011. |

The original ORD-005 mixed server/client scope is superseded by ORD-009/ORD-010; ORD-005 now owns only live customer-history integration evidence. The original ORD-008 job/E2E mix is superseded by ORD-011; ORD-008 now owns only live integration/E2E evidence.

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| ORD-008 | A-001 exact cash expiry cutoff | User | Confirm seven-day automatic cutoff or supply deterministic alternative |

## Completion Summary

- **Completed:** 0/11
- **Next ready task:** `ORD-001` after foundation/auth schema; core consumers must be frozen before parallel UI/admin work
- **Feature status:** `planned`
