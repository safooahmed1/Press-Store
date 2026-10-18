# Feature Brief — Persistent Cart

## 1. Identity

- **Feature ID:** `CART`
- **Kind:** `business`
- **Parent Feature:** `None`
- **Owner:** `WS-CART-01`
- **Status:** `planned`

## 2. Summary

Provide one persistent customer-owned cart, variant/quantity mutations, current price display, and checkout-readiness validation without numeric stock.

## 3. Business Value

Customers can leave and return without losing selections while the store remains protected from stale or removed color/size choices.

## 4. Roles and Users

Authenticated Customer; Admin/Anonymous have no cart access.

## 5. Requirement Coverage

| Requirement ID | Summary | PRD Location |
|---|---|---|
| REQ-CART-001 | Add product with color, size, and quantity | §11 |
| REQ-CART-002 | Account-persistent cart | §11 |
| REQ-CART-003 | Preserve product, variant, quantity, and current applicable price | §11 |
| REQ-CART-004 | Revalidate selected variant before checkout | §11, §31 |
| REQ-CART-005 | No stock decrement | §31 |

## 6. In Scope

Cart/CartItem schema, self-owned API, add/update/remove/clear, current catalog projection, availability warnings, responsive Cart UI, persistence/isolation/concurrency tests, and order handoff read/clear contracts.

## 7. Out of Scope

Guest carts, cart merging, wishlist, reservations, stock quantities, checkout/payment/order creation, coupons, or shipping estimates.

## 8. User Flows

### Flow 1 — Add and revisit cart
1. Customer chooses an available variant and quantity on Product Details.
2. Server validates availability and adds/merges the variant row.
3. Customer logs out and later logs in.
4. Cart reloads with current price and any availability warning.

Alternate flows:
- Quantity update/remove.
- Admin removed the variant, so item is retained for explanation but blocked from checkout until removed.

Exit states:
- Success: cart totals/current items display.
- Cancelled: no mutation.
- Failure: validation/unavailable/auth/network feedback.

## 9. Screens and States

| Screen/View | Route/Entry | Purpose | Elements | Loading | Empty | Error | Unauthorized |
|---|---|---|---|---|---|---|---|
| Cart | `/cart` | Review/edit selections | Item rows, variants, prices, quantities, total, checkout | Skeleton | Continue shopping | Retry/item warning | Login action |

## 10. Business Rules

One cart per customer and at most one item row per variant. Quantity is positive and bounded. Every mutation/current read obtains CAT current data. A stale unavailable item cannot proceed to checkout. Cart never decrements or reserves stock.

## 11. Edge Cases

Duplicate add, concurrent quantity change, product price/discount change, product/variant removal, empty cart, unauthorized access, oversized quantity, and order transaction clearing a cart changed in another tab.

## 12. Dependencies

AUTH customer guard, CAT current product/variant/price contract, FND DB/HTTP, UI states.

## 13. Assumptions and TODOs

None.
