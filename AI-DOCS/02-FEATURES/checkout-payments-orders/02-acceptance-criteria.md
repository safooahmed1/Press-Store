# Acceptance Criteria — Checkout, Payments, and Orders

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-ORD-001 — Checkout quotes and creates one correct pickup order

- **Requirements:** `REQ-PAY-001` through `REQ-PAY-009`, `REQ-ORD-013`, `REQ-ORD-014`, `REQ-SCOPE-010`, `REQ-SCOPE-013`
- **Given:** an authenticated customer with a valid non-empty cart and configured settings
- **When:** each payment method is selected, reviewed, and confirmed
- **Then:** the server shows correct current items/discounts/total/guidance/destination, creates one immutable pickup order, stores method/wallet number when required, and clears the exact cart
- **Negative/edge behavior:** no shipping/coupon/gateway; stale/unavailable/empty/missing-payment input fails before commit; idempotent retry returns the same order
- **Evidence:** transaction/idempotency/payment matrix tests plus Checkout UI evidence
- [ ] Passed

### AC-ORD-002 — Manual payment state is truthful

- **Requirements:** `REQ-PAY-010`, `REQ-PAY-011`, `REQ-PAY-012`, `REQ-ORD-015`
- **Given:** electronic pending and cash unpaid orders
- **When:** admin verifies or pickup actions occur
- **Then:** only admin can mark electronic paid, no proof/reference is required, pending electronic cannot be prepared/delivered, cash becomes paid on delivery, and paid orders never expire
- **Negative/edge behavior:** repeat/invalid transitions conflict without changing timestamps
- **Evidence:** admin action API/state-machine tests
- [ ] Passed

### AC-ORD-003 — Customer sees only complete own active history

- **Requirements:** `REQ-ORD-001`, `REQ-ORD-002`, `REQ-ORD-003`, `REQ-ORD-005`, `REQ-SCOPE-017`
- **Given:** two customers with active/cancelled orders
- **When:** list/detail endpoints and pages are used
- **Then:** each customer sees only own non-cancelled orders with all required snapshot/payment/pickup fields and a simple presentation
- **Negative/edge behavior:** other/cancelled orders are absent without leaking existence; no delivery tracking appears
- **Evidence:** isolation API and customer UI tests
- [ ] Passed

### AC-ORD-004 — Admin daily workflow is complete

- **Requirements:** `REQ-ORD-007` through `REQ-ORD-012`, `REQ-ORD-015`
- **Given:** authorized admin and orders in relevant states
- **When:** list/detail, verify, prepare, deliver, and WhatsApp actions are used
- **Then:** required summary/detail fields render, valid transitions are audited, and WhatsApp uses stored phone
- **Negative/edge behavior:** no complex status column or manual phone entry; unauthorized/stale actions fail
- **Evidence:** admin API/UI and deep-link tests
- [ ] Passed

### AC-ORD-005 — Expiry is bounded and recoverable

- **Requirements:** `REQ-ORD-004`, `REQ-ORD-005`, `REQ-ORD-006`, `REQ-PAY-012`
- **Given:** controlled time with expired/unexpired cash, pending electronic, paid, and delivered orders
- **When:** the expiry job runs repeatedly
- **Then:** only expired unpaid cash becomes cancelled, disappears from customer active list, remains in admin/audit, and reruns produce no extra changes
- **Negative/edge behavior:** paid/electronic/delivered orders are never auto-cancelled
- **Evidence:** clock-controlled job/integration tests and safe job log
- [ ] Passed

## 3. Cross-Feature Scenarios

SET method numbers feed quotes; CAT changes invalidate stale carts; CART clears only after order commit; AUTH isolation protects every view; ADM consumes attention/recent projections.

## 4. Security and Permission Scenarios

Session-derived ownership, admin-only actions, CSRF, idempotency key scoping, no payment data in logs, safe 404/403 behavior, and state-transition authorization are mandatory.

## 5. Failure and Recovery Scenarios

Database rollback, duplicate submit, lost response/replay, CAT/SET outage, stale cart, expiry/action race, and WhatsApp popup failure have explicit outcomes without duplicate/corrupt orders.

## 6. Accessibility and Responsive Scenarios

Checkout method controls/conditional fields/notice, order cards/details, admin actions/confirmations, focus/errors, and mobile/tablet/desktop layouts are verified.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Unit | `npm run test -- orders` | yes | money/state/expiry/WhatsApp logic passes |
| Integration | `npm run test:integration -- orders` | yes | transaction, methods, isolation, admin, job cases pass |
| E2E | `npm run test:e2e -- checkout-orders` | yes | cash, Wallet, InstaPay and admin pickup paths pass |
| UI/a11y | checkout/customer/admin responsive procedure | yes | Required states accessible |
| Lint/build | `npm run lint && npm run build` | yes | Exit 0 |
