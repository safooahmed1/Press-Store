# AI-DOCS — Press Store

## Purpose

This is the compact source of truth for implementing the clothing e-commerce store described by `ecommerce-prd.md`. It defines scope, contracts, ownership, task order, verification, and Git gates without copying the PRD or claiming implementation.

## Start Here

1. Read root `AGENTS.md`.
2. Read `00-PROJECT/project-overview.md` and `source-tree-blueprint.md`.
3. Select one requested feature in `02-FEATURES/_index.md`.
4. Choose `03-DELIVERY/backend-track.md` or `frontend-track.md`, then read the selected feature's seven files and only its named dependency contracts.
5. Confirm the BE, FE, or INT workstream, branch, ownership, and checks in `03-DELIVERY/`.

## Documentation Map

- `00-PROJECT/`: scope, requirements, architecture, domain, and decisions.
- `01-FOUNDATION/`: mandatory implementation rules.
- `02-FEATURES/`: feature-owned behavior, contracts, and ordered tasks.
- `03-DELIVERY/`: dependencies, branches, merge order, and evidence gates.
- `03-DELIVERY/backend-track.md` and `frontend-track.md`: non-canonical navigation views for each developer lane; they link back to feature-owned contracts and backlogs.

## Feature Index

See `02-FEATURES/_index.md` for the ten planned features and their owners.

## Delivery Workflow

The human-gated loop is one ready BE, FE, or INT task per user authorization: preflight, implement, verify, update evidence, commit, report, and stop. AUTH and later features use an integration branch with separate backend and frontend branches. A feature becomes `merge-ready` only after both lanes and the live integration gate pass; merge and every remote action require explicit user instruction.

## Source-of-Truth Rules

Canonical facts live in their owning document. Consumers reference contract IDs instead of redefining them. Planned documents are not evidence of implementation, and the original PRD remains outside `AI-DOCS/`.
