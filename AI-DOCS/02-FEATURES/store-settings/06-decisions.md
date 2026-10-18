# Decisions — Store Settings

## SET-DEC-001 — Singleton with minimized projections

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Store business-editable contact/payment values in one versioned singleton and expose separate minimum public/internal projections.
- **Rationale:** Keeps Settings small and prevents unnecessary payment-data exposure.
- **Alternatives:** Arbitrary key/value store or one public full-settings endpoint.
- **Consequences:** New fields require explicit projection/privacy handling.
- **Affected contracts/tasks:** SET-001–SET-003; API-SET-001/002; READ-SET-001/002.
