# Feature Brief — Checkout, Payments, and Orders

## 1. Identity

- **Feature ID:** `ORD`
- **Kind:** `business`
- **Parent Feature:** `None`
- **Owner:** `WS-ORD-01`, `WS-ORD-02`, `WS-ORD-03`
- **Status:** `planned`

## 2. Summary

Own pickup checkout, server-calculated quotes, three payment choices, atomic order creation/snapshots, manual electronic-payment verification, customer order history, admin preparation/delivery/WhatsApp operations, and unpaid-cash expiry.

## 3. Business Value

Converts a valid cart into an operationally reliable store-pickup order without a payment gateway, preserves history, and gives the store a simple daily workflow.

## 4. Roles and Users

Authenticated Customer places and views own orders; Admin verifies payment and manages pickup; Anonymous has no access.

## 5. Requirement Coverage

| Requirement ID | Summary | PRD Location |
|---|---|---|
| REQ-PAY-001, REQ-PAY-002, REQ-PAY-003 | Pickup-only checkout, stored account info, full review | §12 |
| REQ-PAY-004, REQ-PAY-005 | 10–60/approximately-30-minute guidance and cash-only 3–7-day notice | §12, §14.2 |
| REQ-PAY-006, REQ-PAY-007, REQ-PAY-008, REQ-PAY-009 | Three methods, configured destinations, wallet confirmation, stored method | §13 |
| REQ-PAY-010, REQ-PAY-011, REQ-PAY-012 | Manual verification, no receipt/reference, indefinite paid pickup | User decision |
| REQ-ORD-001, REQ-ORD-002, REQ-ORD-003 | Customer own order list/detail and simple status view | §14.1 |
| REQ-ORD-004, REQ-ORD-005, REQ-ORD-006 | Unpaid cash expiry/removal and simple reliable cleanup | §14.2, A-001 |
| REQ-ORD-007, REQ-ORD-008, REQ-ORD-009, REQ-ORD-010 | Admin list and prepared/delivered actions without complex column | §20 |
| REQ-ORD-011, REQ-ORD-012 | Admin detail and stored-phone WhatsApp | §21 |
| REQ-ORD-013, REQ-ORD-014, REQ-ORD-015 | Immutable snapshots, atomic validation/totals, valid audited transitions | §27, §31 |
| REQ-SCOPE-010, REQ-SCOPE-013, REQ-SCOPE-017 | No coupons, extra gateways, or delivery tracking | §2, §37 |

## 6. In Scope

Order/payment schema and states, quote API, idempotent transactional creation, checkout/customer/admin UIs, customer/admin APIs, payment verification, prepared/delivered actions, WhatsApp deep link, seven-day assumed cash expiry, cancelled-order filtering, and end-to-end verification.

## 7. Out of Scope

Shipping, addresses, delivery tracking, gateway APIs, receipt uploads, transaction references, refunds, coupons, complex customer statuses, push/email notifications, or auto-expiry of paid orders.

## 8. User Flows

### Flow 1 — Customer checkout and order creation
1. Customer opens Checkout from a non-empty cart.
2. Server returns a quote after revalidating variants, current prices, discounts, totals, and selected payment destination.
3. Customer reviews stored account info, pickup guidance, items, totals, and payment method.
4. Wallet EG additionally requires the sending wallet number; InstaPay requires no extra proof field.
5. Customer confirms once with an idempotency key.
6. Server transaction revalidates, snapshots, creates the order/payment state, and clears the exact cart.

Alternate flows:
- Cash displays 3–7-day cancellation copy and starts unpaid.
- Wallet/InstaPay display their independent store number and start payment-pending.

Exit states:
- Success: order detail/number is shown.
- Cancelled: cart remains intact.
- Failure: cart remains; stale price/variant requires refreshed review.

### Flow 2 — Customer views orders
1. Customer opens Your Orders.
2. Server returns only non-cancelled orders owned by the session customer.
3. Customer opens full immutable detail and pickup/payment information.

Alternate flows:
- No orders shows an empty Shop action.

Exit states:
- Success: order detail shown.
- Cancelled: return to list.
- Failure: retry or login state.

### Flow 3 — Admin operates an order
1. Admin opens Orders/detail.
2. For Wallet/InstaPay, admin verifies externally and records payment as paid.
3. Admin marks prepared, then delivered; direct placed-to-delivered is allowed for a real counter pickup.
4. WhatsApp opens using the stored normalized customer phone.

Alternate flows:
- Unpaid electronic order cannot be prepared/delivered.
- Cash delivery records payment paid at delivery.
- Expiry job cancels only unpaid cash past the cutoff.

Exit states:
- Success: audited state/timestamp updates.
- Cancelled: no state change.
- Failure: stale/invalid transition conflict.

## 9. Screens and States

| Screen/View | Route/Entry | Purpose | Elements | Loading | Empty | Error | Unauthorized |
|---|---|---|---|---|---|---|---|
| Checkout | `/checkout` | Review/place pickup order | Account summary, items, totals, guidance, methods, payment destination/field, confirm | Quote skeleton | Empty-cart action | Refresh quote/retry | Login action |
| Your Orders | `/orders` | List active own orders | Order cards, dates, totals, method, view | Skeleton | Shop action | Retry | Login action |
| Customer Order Detail | `/orders/:id` | Historical/pickup detail | Number, items, financial/payment/pickup info | Skeleton | Not found | Retry | Login/404-safe |
| Admin Orders | `/admin/orders` | Daily operation | Required summary fields and actions | Skeleton | No orders | Retry/conflict | Admin only |
| Admin Order Detail | `/admin/orders/:id` | Full operation | Customer, items, totals, method, timestamps, actions, WhatsApp | Skeleton | Not found | Retry/conflict | Admin only |

## 10. Business Rules

Server money and current availability are authoritative. Order creation and cart clear are one idempotent transaction. Order items are immutable snapshots. Cash starts `unpaid`; electronic starts `payment_pending`. Only admin changes electronic payment to `paid`. Electronic orders cannot be prepared/delivered before payment; cash may be prepared unpaid and becomes paid on delivery. Paid orders never auto-expire. Under A-001, only unpaid cash auto-cancels exactly seven calendar days after creation and is hidden from customer active history but retained for admin/audit.

## 11. Edge Cases

Double submit/retry, changed price/discount, removed variant, empty/stale cart, settings missing, same payment numbers, wallet field missing, admin double verification, invalid state transition, delivery before preparation, pending-payment operation, expiry racing delivery/payment, customer probing another order, and WhatsApp number formatting.

## 12. Dependencies

AUTH customer/admin guards and customer summary; CART locked read/clear; CAT current availability/prices; SET payment/contact projections; FND DB/job/HTTP; UI contracts.

## 13. Assumptions and TODOs

> **ASSUMPTION A-001:** unpaid Cash on Pickup auto-cancels exactly seven calendar days after creation, the maximum of the approved 3–7-day window.  
> **TODO A-001:** confirm or replace the exact cutoff before ORD-008.
