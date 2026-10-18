# Decisions — Checkout, Payments, and Orders

## ORD-DEC-001 — Manual electronic verification and paid retention

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Apply DEC-002/003: Wallet EG/InstaPay remain pending until admin verification, Wallet stores only sender number, no receipt/reference is uploaded, and paid orders never auto-expire.
- **Rationale:** Direct user confirmation and minimum operational complexity.
- **Alternatives:** Gateway integration, receipt upload, expiring paid orders.
- **Consequences:** Truthful separate payment/fulfillment states and admin verification action are mandatory.
- **Affected contracts/tasks:** ORD-001–ORD-008; API-ORD-001/003; JOB-ORD-001.

## ORD-DEC-002 — Atomic order transaction owns history

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** One idempotent transaction revalidates CAT/CART, snapshots immutable items/money, creates the order, and clears the exact cart.
- **Rationale:** Prevents duplicate/corrupt orders and stale availability.
- **Alternatives:** Client totals, multi-step nontransactional creation, numeric stock reservation.
- **Consequences:** Cross-feature read/command contracts must participate in one database transaction boundary.
- **Affected contracts/tasks:** ORD-002, ORD-003; READ-CART-001, CMD-CART-001, READ-CAT-001.
