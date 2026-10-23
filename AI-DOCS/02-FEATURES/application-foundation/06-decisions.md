# Decisions — Application Foundation

## FND-DEC-001 — Single deployable modular monolith

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Follow project decisions DEC-004 through DEC-006: one Express deployment serves React/API, local storage is adapter-backed, and the existing JavaScript/Vite base remains.
- **Rationale:** Matches user choices and the PRD's simplicity/Hostinger constraints.
- **Alternatives:** Separate frontend/backend deployments, object storage, Docker, TypeScript migration.
- **Consequences:** Same-origin security is simpler; upload persistence and Hostinger runtime must be verified.
- **Affected contracts/tasks:** FND-001, FND-004, FND-006; STO-FND-001.

## FND-DEC-002 — Bounded FND-002 backend early start

- **Status:** `approved`
- **Date:** 2026-10-23
- **Authorization:** User approved decisions D1–D5 with clarifications; the current authorization is documentation only. FND-002 implementation requires a subsequent user instruction.
- **D1 — Dependency exception:** FND-002 backend development may use independently reviewed FND-001 backend baseline `740c22b2fb3be6d1b5bd0080bbf42109e238c515` without formal FND-001 completion. This satisfies only FND-002's runtime dependency for development and root AGENTS.md §4 dependency preflight. FND-001 remains `blocked`; frontend completion belongs to another developer. No other downstream task is authorized.
- **D2 — A-002 confirmed:** Use `mysql2/promise`, explicit parameterized SQL, and forward SQL migrations with an FND-owned runner; no ORM, query builder, or additional migration framework. Record the exact driver version in the root dependency graph and lockfile only during authorized implementation after compatibility verification. Tradeoff: fewer dependencies and explicit SQL, with FND responsible for connection cleanup, transactions, migration bookkeeping, and recovery tests; no ORM schema generation or relationship mapping.
- **D3 — Migration failure/recovery:** Approve the named lock, immutable names/SHA-256 checksums, and persistent interruption marker defined by DB-FND-001 in technical contracts §4. Unresolved markers block automatic retries. MySQL DDL is not assumed transactionally reversible. Recovery requires explicit inspection, documented evidence, and separate user approval; no recovery operation is authorized by this decision.
- **D4 — Narrow integration ownership:** Approve only the additional database configuration, lifecycle integration, and tooling files enumerated in technical contracts §2. Existing FND-002 DB paths remain owned. General HTTP, authentication/sessions, uploads, observability, frontend/Zustand, business schemas, and later-task implementation remain excluded.
- **D5 — Validation boundary:** Authorized development may proceed with documentation visibly unvalidated. The original mandatory validator remains a completion blocker; no bypass, replacement, task-completion claim, or completion commit is authorized. Other verification and merge/release gates remain unchanged.
- **Branch:** Continue `feature/FND-application-foundation`; preserve the WIP checkpoint and existing merge strategy. No branch creation, commit, push, PR, merge, or deployment is authorized by this documentation change.
- **Open verification:** Hosting MySQL engine/version, TLS requirements, connection limits, and migration privileges remain unverified. Named-lock/InnoDB support and exact driver compatibility must also be checked during authorized development. Do not invent hosting values or silently substitute MariaDB. Migration ordering and recovery procedures require documentation and verification before runner acceptance.
- **Alternatives:** Wait for formal FND-001 completion; introduce an ORM/query builder through a separate approved decision. Neither is selected for this bounded early start.
- **Affected contracts/tasks:** FND-002; DB-FND-001, CFG-FND-001, API-FND-001 readiness integration. No consumer implementation is authorized; FND-003's HTTP/manifest freeze and full FND completion gates remain unchanged.
