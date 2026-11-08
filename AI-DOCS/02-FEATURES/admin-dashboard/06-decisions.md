# Decisions — Admin Dashboard

## ADM-DEC-004 — Publish the verified ADM-004 checkpoint

- **Status:** `approved by user`
- **Date:** 2026-11-08
- **Decision:** Checkpoint the verified dashboard API, approved CAT/ORD projections,
  and ADM-DEC-003 tracking acceptance on `work/ADM-backend`. Publish that branch to
  the existing origin.
- **Checkpoint:** Planned subject `chore(ADM-004): checkpoint dashboard projections`.
- **Scope:** Formal integration and original documentation validation remain open.

## ADM-DEC-003 — User acceptance of ADM-004 for backend tracking

- **Status:** `approved by user`
- **Date:** 2026-11-08
- **Decision:** Record ADM-004 as `done` for backend tracking based on the verified
  dashboard API and owner projections on `work/ADM-backend`.
- **Scope:** Formal verification on `feature/ADM-integration` and original documentation
  validation remain open. The acceptance record is local.

## ADM-DEC-002 — Local ADM-004 baseline and owner projections

- **Status:** User-approved coordinated amendment, 2026-11-08.
- **Decision:** Start `work/ADM-backend` from published `work/CUS-backend` at `a924554`.
  Reuse READ-CUS-001 and add the approved CAT product count and ORD dashboard
  projection in their owner repositories.
- **Scope:** ADM-004 backend implementation and disposable verification. The local
  baseline does not satisfy the frozen CAT/CUS dependencies or formal ADM integration.
  Original documentation validation remains open.

## ADM-DEC-001 — Operational projections only

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Compose bounded current counts/recent/attention data from owner contracts; add no analytics store, revenue logic, or charts.
- **Rationale:** Matches the explicitly lightweight dashboard and non-goals.
- **Alternatives:** Direct cross-table dashboard queries or analytics pipeline.
- **Consequences:** Dashboard availability depends on frozen owner projections and remains intentionally small.
- **Affected contracts/tasks:** ADM-001–ADM-003; API-ADM-001; NAV-ADM-001.
