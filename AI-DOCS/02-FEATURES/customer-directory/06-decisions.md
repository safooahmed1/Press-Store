# Decisions — Customer Directory

## CUS-DEC-001 — Read-only projection feature

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** CUS owns only read projection/API/UI and persists no duplicate customer/order facts.
- **Rationale:** Preserves AUTH/ORD canonical ownership and excludes CRM scope.
- **Alternatives:** Direct cross-feature table queries or duplicated reporting tables.
- **Consequences:** CUS waits for frozen READ-AUTH-001 and READ-ORD-001.
- **Affected contracts/tasks:** CUS-001–CUS-003; API-CUS-001.
