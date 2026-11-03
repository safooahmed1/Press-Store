# Decisions — Catalog and Discovery

## CAT-DEC-001 — Boolean variant availability and historical-safe deletion

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Represent each purchasable color/size pair as a unique variant with boolean availability and no quantity; remove products from purchase without destroying order snapshots.
- **Rationale:** Directly implements the PRD's no-stock rule and history requirement.
- **Alternatives:** Numeric stock, independent color/size lists, destructive order-linked deletes.
- **Consequences:** CART/ORD must always call READ-CAT-001 before checkout; public reads hide removed options.
- **Affected contracts/tasks:** CAT-001–CAT-006; READ-CAT-001; CART and ORD consumers.


## CAT-DEC-002 — Bounded CAT-001 backend development baseline

- **Status:** approved by user, 2026-11-04.
- **Decision:** Following the preflight proposal, the user approved creating `work/CAT-backend` in a separate worktree from backend checkpoint `7e3ca00152afc3181a1ae2eaf3beff9f7888b6f1`, rather than waiting for the normally required frozen CAT integration baseline. This exception authorizes CAT-001 only.
- **Dependencies:** FND-002/FND-004 implementation is present; user acceptance for downstream work is recorded in FND-DEC-007/008. No AUTH-005 guard is needed by this domain-only task. AUTH task-tracking acceptance is not full integration/release evidence.
- **Boundaries:** Original AUTH uncommitted changes and stashes stay in their existing checkout. No cherry-pick, merge, frontend modification, remote write or dependency installation. Full CAT API/consumer freeze and normal lane integration remain required before parallel FE work and integration. No completion/validator gate is waived.

## CAT-DEC-003 — Exact percentage precision and unit-price rounding

- **Status:** approved by user, 2026-11-04.
- **Decision:** Discount percentages support at most two decimal places in [0,100]. Compute the final unit price from integer EGP minor units, rounding half a minor unit upward once per unit. Use integer basis points and BigInt intermediates, never floating-point money multiplication.
- **Example:** 101 minor units at 50% gives 51; 400000 at 20% gives 320000. Zero and 100% discounts are valid.
- **Representation:** Existing JSON `priceMinor` numeric contract requires positive safe integers, capped at Number.MAX_SAFE_INTEGER. SQL uses BIGINT with the same bound; returned BIGINT identifiers remain strings. Percent input may be an ordinary number or canonical decimal string; internal persisted value is a two-place decimal string.
- **Consumers:** CAT owns the rule; HOME/CART/ORD must use canonical price/availability services as their tasks land. No existing consumer implementation or DTO changed in this task.
