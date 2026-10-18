# Backlog — Checkout, Payments, and Orders

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ORD-001 | ORD/order-core | WS-ORD-01 | Add order/item schema, snapshots, payment/fulfillment states, idempotency records | REQ-PAY-009, REQ-PAY-010, REQ-PAY-012, REQ-ORD-002, REQ-ORD-013, REQ-ORD-015 | FND-002, AUTH schema | order core migrations/domain | migration/state tests | `not-started` | `work/WS-ORD-01-order-core` | — | — |
| 2 | ORD-002 | ORD/checkout-core | WS-ORD-01 | Implement server quote, pickup guidance, three methods, payment destination/input rules | REQ-PAY-001, REQ-PAY-003, REQ-PAY-004, REQ-PAY-005, REQ-PAY-006, REQ-PAY-007, REQ-PAY-008, REQ-PAY-011, REQ-SCOPE-010, REQ-SCOPE-013 | ORD-001, READ-CART-001, READ-CAT-001, READ-SET-001 | order checkout server paths | quote/payment matrix tests | `not-started` | `work/WS-ORD-01-order-core` | — | — |
| 3 | ORD-003 | ORD/order-core | WS-ORD-01 | Implement idempotent atomic order creation, revalidation, snapshots, and cart clear | REQ-PAY-001, REQ-PAY-010, REQ-PAY-011, REQ-ORD-013, REQ-ORD-014 | ORD-002, CMD-CART-001 | order create services/routes | transaction/idempotency/race tests | `not-started` | `work/WS-ORD-01-order-core` | — | — |
| 4 | ORD-004 | ORD/checkout-ui | WS-ORD-02 | Build responsive checkout review, conditional payment, guidance, and confirmation | REQ-PAY-001, REQ-PAY-002, REQ-PAY-003, REQ-PAY-004, REQ-PAY-005, REQ-PAY-006, REQ-PAY-007, REQ-PAY-008 | ORD-002, ORD-003, UI-003 | `src/features/orders/checkout/**` | component/a11y/E2E tests | `not-started` | `work/WS-ORD-02-customer-orders` | — | — |
| 5 | ORD-005 | ORD/customer-history | WS-ORD-02 | Implement customer order list/detail API and responsive pages | REQ-ORD-001, REQ-ORD-002, REQ-ORD-003, REQ-ORD-005, REQ-SCOPE-017 | ORD-001, AUTH-AUTH-001 | order customer server/client paths | isolation/UI tests | `not-started` | `work/WS-ORD-02-customer-orders` | — | — |
| 6 | ORD-006 | ORD/admin-api | WS-ORD-03 | Implement admin list/detail, manual payment, prepare/deliver, and WhatsApp contracts | REQ-PAY-009, REQ-PAY-010, REQ-ORD-007, REQ-ORD-008, REQ-ORD-009, REQ-ORD-011, REQ-ORD-012, REQ-ORD-015 | ORD-001, READ-SET-002, AUTH-AUTH-002 | order admin server paths | action/state/deep-link tests | `not-started` | `work/WS-ORD-03-admin-operations` | — | — |
| 7 | ORD-007 | ORD/admin-ui | WS-ORD-03 | Build responsive admin Orders list/detail and clear daily actions | REQ-ORD-007, REQ-ORD-008, REQ-ORD-009, REQ-ORD-010, REQ-ORD-011, REQ-ORD-012 | ORD-006, UI-004 | `src/features/orders/admin/**` | admin component/responsive tests | `not-started` | `work/WS-ORD-03-admin-operations` | — | — |
| 8 | ORD-008 | ORD/expiry-verification | WS-ORD-03 | Add unpaid-cash expiry and complete full cross-feature/E2E suite | REQ-PAY-012, REQ-ORD-004, REQ-ORD-005, REQ-ORD-006 | ORD-003–ORD-007, A-001 confirmed/accepted, JOB-FND-001 | order jobs/tests | clock/race/E2E/build checks | `not-started` | `work/WS-ORD-03-admin-operations` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| ORD-008 | A-001 exact cash expiry cutoff | User | Confirm seven-day automatic cutoff or supply deterministic alternative |

## Completion Summary

- **Completed:** 0/8
- **Next ready task:** `ORD-001` after foundation/auth schema; core consumers must be frozen before parallel UI/admin work
- **Feature status:** `planned`
