# Decisions — Admin Dashboard

## ADM-DEC-001 — Operational projections only

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Compose bounded current counts/recent/attention data from owner contracts; add no analytics store, revenue logic, or charts.
- **Rationale:** Matches the explicitly lightweight dashboard and non-goals.
- **Alternatives:** Direct cross-table dashboard queries or analytics pipeline.
- **Consequences:** Dashboard availability depends on frozen owner projections and remains intentionally small.
- **Affected contracts/tasks:** ADM-001–ADM-003; API-ADM-001; NAV-ADM-001.
