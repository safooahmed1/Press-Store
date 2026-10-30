# Decisions — Application Foundation

## FND-DEC-006 — React Router manifest composition

- **Status:** `approved`
- **Date:** 2026-10-30
- **Authorization:** User explicitly approved replacing the exact-path client runtime seam with React Router DOM while preserving feature-manifest discovery.
- **Decision:** Add `react-router-dom@^7.18.5`. `src/app/App.jsx` owns `BrowserRouter`; FND-owned `src/routes/RouterApp.jsx` maps validated Vite-discovered manifests to lazy React Router routes. Feature pages remain manifest-owned; no central page registry, nested layout change, authentication rule, or business route is introduced.
- **Route contract:** Support static paths and named lowercase parameters. Reject `/api`, splats, optional parameters, malformed paths, literal duplicates, and equivalent dynamic signatures. Preserve the blank unknown-route behavior until a feature owner defines it.
- **Boundaries:** Existing anchors/navigation are not converted in this amendment. UI owns any later `Link`/`NavLink` consumer migration. Server SPA fallback remains responsible for direct non-API routes.
- **Verification:** Manifest validation/lazy-loading tests, RouterApp static/dynamic/unknown rendering tests, direct production GET/HEAD SPA fallback regressions, foundation suite, lint, build, audit, whitespace, and the documentation validator.
- **Affected tasks/contracts:** FND-001 and A-008; source-tree route ownership. No feature manifest consumer needs a source edit.

## FND-DEC-005 — Local FND-006 development before upstream closeout

- **Status:** `approved`
- **Date:** 2026-10-27
- **Authorization:** The user explicitly approved local FND-006 code/runbook development despite FND-002/FND-005 remaining blocked. No validator waiver, hosting compatibility acceptance, live MySQL test rerun, deployment, commit or push is authorized.
- **Scope:** Production configuration/startup checks, same-process static/API/upload serving, production-mode tests and operational runbook. Minimal FND-owned app/config/storage-serving and root verification-script wiring only; no database interface, authentication/session implementation or business-feature changes.
- **Boundaries:** FND-001/FND-003/FND-004 are done; the approved FND-005 checkpoint provides local observability/test seams. Existing uncommitted delivery documentation is preserved. All ordinary completion and release gates remain in force; this decision supersedes only FND-006's development dependency restriction.
- **Verification:** Configuration tests, production-mode HTTP tests with an explicit fake database, static bundle secret checks, lint/build and documented operator procedures. A fake database is local wiring evidence only. Real MySQL, host persistence/TLS/proxy/limits, session persistence, backup/restore execution and full release acceptance stay unverified until separately available/authorized.
- **Consequence:** FND-006 cannot be marked done or AC-FND-004 checked while mandatory verification remains unavailable. No later feature, remote action or release is inferred.

## FND-DEC-004 — FND-005 development against verified local persistence

- **Status:** `approved`
- **Date:** 2026-10-27
- **Authorization:** The user explicitly approved starting FND-005 against the locally tested FND-002 implementation while FND-002 remains `in-progress`. This exception satisfies FND-005's development dependency only; it does not accept hosting compatibility or authorize FND-006, merging, publishing, or deployment.
- **Scope:** FND-005 observability, shared test helpers, and performance sanity checks. Minimal FND-owned app/startup composition, HTTP error-code capture, test discovery and lint coverage changes wire these into the existing runtime and verification commands. No database interface or business-feature change.
- **Implementation:** Use dependency-free structured JSON process logs with an allowlist of operational metadata. Drop unapproved fields rather than attempting to scrub arbitrary messages, SQL, bodies or exceptions. Record route templates, never actual request URLs or parameter values. Logging failure must not affect requests or database work.
- **Verification:** Exercise correlation, success/failure/disconnect logs, sink failure isolation, disposable database query bounds/index plans, and actual React Query request deduplication/retry bounds. Future business-query plans and order/auth/job events remain with their feature owners. No new production latency target is invented.
- **Completion boundary:** All ordinary FND-005 verification/documentation/commit gates still apply. Shared AC-FND-002 stays unchecked until FND-002 acceptance; production retention and hosting checks remain release gates.
- **Alternatives:** Wait for hosting verification; introduce a logging or telemetry dependency. Neither is required for this bounded local task.
- **Affected tasks/contracts:** FND-005; existing HTTP-FND-001 and DB-FND-001 behavior stays unchanged.

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

## FND-DEC-003 — Bounded image policy and decoder

- **Status:** `approved`
- **Date:** 2026-10-26
- **Decision:** STO-FND-001 accepts JPEG, PNG, and WebP only. Encoded input is limited to 5 MiB; decoded dimensions are limited to 8000×8000 and 40 megapixels. Animated or multipage images are rejected. `sharp` is the sole image decoder and normalizer; accepted images are decoded, auto-oriented, stripped of metadata, and safely re-encoded before an adapter-generated filename is persisted.
- **Rationale:** The user approved concrete security limits. Full decode and re-encoding reject spoofed or malformed image payloads and remove embedded metadata while satisfying REQ-FND-018 without coupling storage to a business feature.
- **Alternatives:** Signature-only inspection, retaining original bytes/metadata, accepting GIF/SVG, or adding multiple image libraries. These are not selected because they weaken validation or expand attack surface.
- **Consequences:** Consumers must supply the original filename, declared MIME type, and bytes; the adapter validates all three against decoded format. Replacement/database workflows use the adapter's compensation helper. Future limit or format changes are STO-FND-001 contract changes.
- **Affected contracts/tasks:** FND-004; STO-FND-001; REQ-FND-018/026; AC-FND-003.
