# AI-DOCS — Press Store

## Purpose

This is the compact source of truth for implementing the clothing e-commerce store described by `ecommerce-prd.md`. It defines scope, contracts, ownership, task order, verification, and Git gates without copying the PRD or claiming implementation.

## Start Here

1. Read root `AGENTS.md`.
2. Read `00-PROJECT/project-overview.md` and `source-tree-blueprint.md`.
3. Select one requested feature in `02-FEATURES/_index.md`.
4. Read that feature's seven files and only its named dependency contracts.
5. Confirm the workstream, branch, and checks in `03-DELIVERY/`.

## Documentation Map

- `00-PROJECT/`: scope, requirements, architecture, domain, and decisions.
- `01-FOUNDATION/`: mandatory implementation rules.
- `02-FEATURES/`: feature-owned behavior, contracts, and ordered tasks.
- `03-DELIVERY/`: dependencies, branches, merge order, and evidence gates.

## Feature Index

See `02-FEATURES/_index.md` for the ten planned features and their owners.

## Delivery Workflow

The human-gated loop is one ready task per user authorization: preflight, implement, verify, update evidence, commit, report, and stop. A feature becomes `merge-ready` only after its full verification gate; merge and every remote action require explicit user instruction.

## Source-of-Truth Rules

Canonical facts live in their owning document. Consumers reference contract IDs instead of redefining them. Planned documents are not evidence of implementation, and the original PRD remains outside `AI-DOCS/`.
