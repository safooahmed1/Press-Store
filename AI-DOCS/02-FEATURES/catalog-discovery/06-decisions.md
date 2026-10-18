# Decisions — Catalog and Discovery

## CAT-DEC-001 — Boolean variant availability and historical-safe deletion

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Represent each purchasable color/size pair as a unique variant with boolean availability and no quantity; remove products from purchase without destroying order snapshots.
- **Rationale:** Directly implements the PRD's no-stock rule and history requirement.
- **Alternatives:** Numeric stock, independent color/size lists, destructive order-linked deletes.
- **Consequences:** CART/ORD must always call READ-CAT-001 before checkout; public reads hide removed options.
- **Affected contracts/tasks:** CAT-001–CAT-006; READ-CAT-001; CART and ORD consumers.
