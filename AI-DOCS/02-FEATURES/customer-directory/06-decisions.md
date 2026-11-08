# Decisions — Customer Directory

## CUS-DEC-004 — Publish the verified CUS-001 checkpoint

- **Status:** `approved by user`
- **Date:** 2026-11-08
- **Decision:** Checkpoint the verified directory API, the approved AUTH/ORD reads,
  and the CUS-DEC-003 tracking acceptance on `work/CUS-backend`. Publish that branch
  to the existing origin.
- **Checkpoint:** Planned subject `chore(CUS-001): checkpoint customer directory API`.
- **Scope:** Formal integration and original documentation validation remain open.

## CUS-DEC-003 — User acceptance of CUS-001 for backend tracking

- **Status:** `approved by user`
- **Date:** 2026-11-08
- **Decision:** Record CUS-001 as `done` for backend tracking based on the verified
  directory API and owner projections on `work/CUS-backend`.
- **Scope:** Formal verification on `feature/CUS-integration` and original documentation
  validation remain open. The acceptance record is local.

## CUS-DEC-002 — Local CUS-001 baseline and owner projections

- **Status:** User-approved coordinated amendment, 2026-11-08.
- **Decision:** Start `work/CUS-backend` from published `Back-end` at `0a65139`.
  Implement CUS-001 using the existing admin guard, a bounded AUTH customer page and
  count, and ORD-owned batched counts and paginated admin-visible history.
- **Scope:** AUTH owns its identity repository extension. ORD owns its read-only
  projection repository. CUS composes their outputs. The frozen integration baseline,
  formal integration, and original documentation validation remain open.

## CUS-DEC-001 — Read-only projection feature

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** CUS owns only read projection/API/UI and persists no duplicate customer/order facts.
- **Rationale:** Preserves AUTH/ORD canonical ownership and excludes CRM scope.
- **Alternatives:** Direct cross-feature table queries or duplicated reporting tables.
- **Consequences:** CUS waits for frozen READ-AUTH-001 and READ-ORD-001.
- **Affected contracts/tasks:** CUS-001–CUS-003; API-CUS-001.
