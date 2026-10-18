# Decisions — Homepage Merchandising

## HOME-DEC-001 — Catalog owns product merchandising flags

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** HOME owns the curation workflow/UI but changes Best Seller/New Arrival through CAT's CMD-CAT-001; no duplicate selection table is introduced.
- **Rationale:** The PRD defines flags on Product and asks for manual homepage selection; one canonical representation avoids duplication.
- **Alternatives:** HOME-owned join tables duplicating product flag state.
- **Consequences:** CAT contract must freeze before HOME-001 and enforce max-eight atomically.
- **Affected contracts/tasks:** HOME-001–HOME-004; CMD-CAT-001.
