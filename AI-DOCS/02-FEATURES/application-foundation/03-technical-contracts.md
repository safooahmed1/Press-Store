# Technical Contracts — Application Foundation

## 1. Ownership

**Owns**
- Routes/screens: `/api/v1/health`; React/Express bootstraps and feature manifest loaders.
- Source paths: FND paths in `source-tree-blueprint.md`.
- API endpoints: health and canonical HTTP/error behavior.
- Entities/write authority: migration registry and infrastructure metadata only.
- Jobs/events: job runner/registry shell, not feature logic.
- Configuration: database, session-secret input boundary, origins, port, upload root, environment.

**Must Not Touch**
- `src/features/**` and `server/src/features/**` — owned by named business features.
- `src/shared/ui/**` — owned by UI.
- `server/src/platform/auth/**` — owned by AUTH.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| API-FND-001 | API | Health/readiness | operations | §3 |
| HTTP-FND-001 | error/transport | Success/error envelope and request ID | all features | §10 |
| DB-FND-001 | service | Pool, transaction, migration interfaces | server features | §4 |
| STO-FND-001 | service | Validated local image put/delete/public URL | CAT, HOME | §8 |
| JOB-FND-001 | service | Feature job registration and run evidence | ORD | §5 |
| CFG-FND-001 | configuration | Validated server configuration | platform/features | §9 |
| APP-FND-001 | client integration | Feature action registration and dispatch | CAT, CART, app composition | §6 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| None. | None. | None. | None. |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `src/app/**`, `src/shared/api/**` | Client providers, discovery, Axios/error setup | FND-001, FND-003 | Feature behavior |
| `server/src/app/**`, `server/src/config/**` | Express composition and validated config | FND-001, FND-003 | Secret literals/domain rules |
| `server/src/platform/db/**` | MySQL pool, transaction, migrations | FND-002 | Feature SQL |
| `server/src/platform/http/**` | HTTP validation/error middleware | FND-003 | Feature-specific codes without registration |
| `server/src/platform/storage/**` | Local storage adapter | FND-004 | Catalog/homepage decisions |
| `server/src/platform/observability/**` | Safe logs/correlation/health helpers | FND-005 | External analytics |
| `tests/helpers/**`, `tests/e2e/**` | Shared test and release harness | FND-005 | Production credentials |
| Root scripts/config | Build, start, lint, test, Hostinger runbook | FND-006 | Docker/VPS configuration |

### FND-002 bounded integration ownership — FND-DEC-002

The following exact additions supplement FND-002's existing `server/src/platform/db/**`, `scripts/migrate*`, and FND DB test ownership. They do not transfer the general app/configuration or root-tooling responsibilities assigned above. Approval records ownership only; the current user instruction permits documentation changes, not implementation.

| Additional Path/File | Permitted FND-002 Change Only |
|---|---|
| `server/src/config/database-config.js`, `server/src/config/database-config.test.js` | Centralized database configuration validation, bounded pool/time options, and focused tests |
| `server/src/app/start-server.js` | Create/check pool before listening, inject database readiness, clean up failed startup |
| `server/src/server.js` | Close pool after HTTP shutdown |
| `server/src/app/foundation-runtime.integration.test.js` | Database startup failure, readiness, and lifecycle regressions |
| `package.json`, `package-lock.json` | Approved driver and explicit migration command only |
| `test.config.js` | Restrict test discovery to source tests, excluding dependency tests |
| `eslint.config.js` | Include migration CLI in Node lint coverage |

No frontend, business-feature, AUTH, storage, observability, general HTTP, or release implementation is included. Shared configuration/composition/tooling paths must not be written concurrently by another developer.

## 3. API Contracts

### API-FND-001 — Health
| Field | Value |
|---|---|
| Method and path | `GET /api/v1/health` |
| Authentication | None |
| Permission | None |
| Idempotency | Safe read |

Request:
```json
{}
```

Success response:
```json
{"data":{"status":"ready"},"meta":{"requestId":"opaque"}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `SERVICE_UNAVAILABLE` | 503 | Required dependency is not ready | Do not route traffic; operator investigates |

## 4. Data Contracts

### MigrationRecord (`owner: FND`)
| Field | Type | Required | Default | Constraints | Index/Relationship |
|---|---|---|---|---|---|
| migrationName | varchar | yes | None. | unique immutable name | primary/unique |
| checksum | varchar | yes | None. | detects changed applied migration | None. |
| appliedAt | datetime UTC | yes | current UTC | immutable | indexed |

Lifecycle: append once per applied migration.  
Concurrency/transaction rule: migration runner holds a database lock and never reapplies a matching record.

### DB-FND-001 — Approved migration failure/recovery semantics

FND-DEC-002 approves the following behavior for future FND-002 implementation; it is not implementation evidence.

- Hold a database-scoped named lock on one dedicated connection throughout migration execution. Migration names and SHA-256 checksums are immutable; matching completed records are skipped and checksum mismatches stop execution.
- Before executing a migration, persist its name, checksum, and UTC start time in the FND-owned infrastructure table `migration_execution_state`. This interruption marker is separate from completed MigrationRecord history; no business tables are authorized.
- After successful execution, atomically insert the completed MigrationRecord and remove the marker. Failure, connection loss, or process interruption leaves an unresolved marker that blocks subsequent migration execution and automatic retries.
- MySQL DDL may implicitly commit. Never promise migration-wide DDL rollback, automatically retry unresolved migrations, alter completed history, or silently mark a migration applied. Application data transactions still require rollback on failure; that promise does not extend to DDL.
- Recovery requires separate user approval, explicit inspection of actual schema/data state, and documented evidence. The approved recovery procedure must either complete the intended migration or restore a verified pre-migration state before retry. This contract authorizes no recovery operation.
- Document and test migration ordering and recovery procedures before runner acceptance. Ordinary application startup never executes migrations.

## 5. Events and Background Jobs

| Contract ID | Event/Job | Producer | Consumers | Payload | Retry/Ordering/Deduplication |
|---|---|---|---|---|---|
| JOB-FND-001 | feature job runner | FND | ORD | job name, started/finished time, counts, error summary | one named job lock; feature logic must be rerunnable |

## 6. Shared UI Contracts

| Contract ID | Component | Props/Input | States | Consumers | Accessibility |
|---|---|---|---|---|---|
| APP-FND-001 | `FeatureActionRegistry` | stable action ID and validated payload; one registered handler per action | registered, unavailable, pending, failed, succeeded | CAT and CART | triggering control owns focus/status; unavailable actions fail visibly |

## 7. Permissions and Security

Health exposes no version, environment, schema, or credentials. HTTP hooks support same-origin cookies, CSRF, safe body limits, and owner guards. The platform does not grant permissions itself.

## 8. External Integrations

STO-FND-001 writes only within the configured Hostinger upload root, accepts decoded approved image types/size limits, generates filenames, and returns an opaque relative public URL. No external storage provider is used in V1.

## 9. Configuration and Secrets

`NODE_ENV`, provider `PORT`, MySQL configuration, `SESSION_SECRET`, `APP_ORIGIN`, `UPLOAD_ROOT`, and upload limits are server-only. Production values have no defaults. A-002 is confirmed by FND-DEC-002: use `mysql2/promise`, explicit parameterized SQL, and forward SQL migrations without an ORM or query builder; exact driver compatibility/version remains to be verified and recorded during authorized implementation.

FND-002 uses discrete `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` inputs with validated finite pool/time limits; production connection settings have no defaults. Only `server/src/config/` reads environment values. Do not automatically load environment files or access the existing `server/.env`. Integration tests require an explicitly designated disposable database and test-only credentials. TLS configuration must follow verified hosting requirements, not invented values. Authentication/session/upload settings remain outside FND-002.

Approved lifecycle wiring checks database connectivity before listening, injects database readiness through the existing `isReady` callback, cleans up startup failures, and closes the pool after HTTP shutdown. No migration runs on application startup. Hosting MySQL engine/version, TLS requirements, connection limits, and migration privileges are open verification items under FND-DEC-002; no hosting compatibility is claimed.

## 10. Error, Retry, and Recovery Behavior

HTTP-FND-001 is `{error:{code,message,fieldErrors?,requestId}}`. Unknown errors map to `INTERNAL_ERROR` without detail. Transactions roll back; file writes use compensation; safe reads may retry only bounded transient connection errors.

DB-FND-001 transaction query failure is terminal for that transaction handle. Queued and later queries reject without driver execution, caught query failures still prevent commit, and rollback/connection cleanup remain mandatory. Nested `database.transaction()` calls on the same database instance are unsupported and reject before acquiring another connection; unrelated concurrent top-level transactions remain permitted. FND-002 adds no implicit savepoints or transaction retries.

## 11. Performance and Limits

Global JSON/form limits are small and explicit. Upload limits are configured and enforced before/after decode. Database pools are bounded. API lists must paginate at feature owners.

## 12. Contract Change Rule

Changes to envelopes, config names, database/storage/job interfaces, or manifest loading require FND approval, named consumer updates, full integration tests, and explicit user approval if architecture changes.

## 13. Assumptions and TODOs

> **CONFIRMED A-002 — 2026-10-23:** use `mysql2/promise`, explicit parameterized SQL, and forward SQL migrations with an FND-owned runner; no ORM or query builder. See FND-DEC-002 and the assumptions register. Exact driver version and hosting compatibility remain development verification items, not unresolved technology selection.

### FND-001 runtime seam implementation — 2026-10-20

> **ASSUMPTION A-008:** manifests are named `manifest.js` immediately inside each feature directory and expose a named `feature` export. This fills the previously unspecified file/export convention; no business feature currently consumes it. FND-003 remains the documented contract freeze point.

- Client discovery: `src/features/*/manifest.js`, using Vite glob discovery. The export is `{ id, routes: [{ path, load }] }`; `load` resolves a module whose default export is a React page. IDs are unique lowercase kebab-case. The initial seam supports exact absolute paths with lowercase letters/digits/hyphens, rejects duplicate paths and the `/api` namespace, and lazy-loads matched pages. Native document navigation is sufficient for this initial seam; parameter matching and client navigation helpers are not implemented. Empty/unmatched routes render nothing until UI/feature owners provide pages. Suspense and an app error boundary provide minimal loading/failure infrastructure.
- Server discovery: `server/src/features/*/manifest.js`. The export is `{ id, path, router }`; IDs are unique lowercase kebab-case, `path` is a unique single-segment lowercase kebab-case mount below `/api/v1`, and `router` is an Express router/middleware function. `/health` is reserved. Missing feature trees and directories without manifests are allowed; invalid/duplicate manifests and import failures prevent startup.
- Config currently validates only `NODE_ENV` and `PORT` in `server/src/config/`. Development/test default to port 3000; production requires an explicit valid port. Environment files are not loaded. Database/session/origin/upload validation remains with the appropriate later tasks; this is not the complete CFG-FND-001 release gate.
- Health currently reports runtime readiness, with an injectable fail-closed dependency check. No MySQL readiness exists before FND-002. A minimal request ID and sanitized runtime errors preserve the existing envelope; FND-003 still owns full HTTP/validation/transport infrastructure.
- Production composition checks for `dist/index.html` before listening, serves built assets and HTML document routes, and reserves `/api` before fallback. Missing assets, hidden paths, unsupported methods, and non-HTML requests do not receive SPA HTML. FND-006 still owns release packaging and the Hostinger runbook.
