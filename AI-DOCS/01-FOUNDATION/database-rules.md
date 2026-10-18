# Database Rules

## 1. Scope

Applies to MySQL schema, migrations, queries, transactions, indexes, seed/bootstrap operations, and data lifecycle.

## 2. Required Patterns

- Use explicit forward migrations with unique ordered names and an idempotent migration runner.
- Use `bigint` identifiers, `snake_case`, foreign keys, unique/check constraints where supported, and UTC timestamps.
- Store EGP money as integer minor units; never use floating point. Store normalized phones separately from display formatting.
- Use parameterized queries only. Keep queries in the owning feature repository and select only needed columns.
- Use transactions for checkout/order creation, critical state transitions, and multi-row merchandising limits.
- Add indexes for foreign keys, unique phones/order numbers, catalog filters, customer/order queries, active homepage order, session expiry, and cash expiry scanning.
- Preserve order item snapshots and state timestamps; retain cancelled and delivered operational records.

## 3. Prohibited Patterns

- Numeric inventory columns, cross-feature writes, schema mutation outside migrations, destructive production resets, silent cascade deletion of history, money floats, local-time persistence, or duplicated mutable catalog facts in orders beyond explicit snapshots.

## 4. Conventions

Tables are plural `snake_case`; primary keys are singular `<entity>_id`; booleans begin `is_`; timestamps end `_at`. Every migration documents owner, rollback/recovery implications, and required indexes. A-002 governs driver/ORM selection.

## 5. Security and Failure Handling

Use least-privilege database credentials per environment. Never embed connection strings. Map constraint errors to stable safe application errors. On partial external file failure, compensate without leaving broken database references.

## 6. Testing and Verification

Run migrations against an empty database and an upgraded fixture database. Test constraints, rollback-on-failure, concurrent order creation/idempotency, query bounds, owner isolation, and cash-expiry selection. Inspect representative query plans for catalog filters and order lists.

## 7. Exceptions and Change Gate

Entity ownership changes, destructive migrations, enum/state changes, or money/identity strategy changes require an approved project decision, backup/recovery plan, and explicit user approval.
