# Decisions — Persistent Cart

## CART-DEC-001 — Persistent cart with current-price projection

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Persist selected variant/quantity and cached current applicable price, but recalculate through CAT on cart reads and order creation; do not reserve/decrement stock.
- **Rationale:** Matches persistent-cart and no-numeric-stock requirements while preventing stale checkout.
- **Alternatives:** Guest/localStorage cart, locked prices, inventory reservation.
- **Consequences:** CAT must be available for readiness and ORD revalidates transactionally.
- **Affected contracts/tasks:** CART-001–CART-004; READ-CART-001; READ-CAT-001.
