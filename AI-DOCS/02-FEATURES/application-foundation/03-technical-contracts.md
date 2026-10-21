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

`NODE_ENV`, provider `PORT`, MySQL configuration, `SESSION_SECRET`, `APP_ORIGIN`, `UPLOAD_ROOT`, and upload limits are server-only. Production values have no defaults; the concrete MySQL driver remains gated by A-002.

## 10. Error, Retry, and Recovery Behavior

HTTP-FND-001 is `{error:{code,message,fieldErrors?,requestId}}`. Unknown errors map to `INTERNAL_ERROR` without detail. Transactions roll back; file writes use compensation; safe reads may retry only bounded transient connection errors.

## 11. Performance and Limits

Global JSON/form limits are small and explicit. Upload limits are configured and enforced before/after decode. Database pools are bounded. API lists must paginate at feature owners.

## 12. Contract Change Rule

Changes to envelopes, config names, database/storage/job interfaces, or manifest loading require FND approval, named consumer updates, full integration tests, and explicit user approval if architecture changes.

## 13. Assumptions and TODOs

> **ASSUMPTION A-002:** use explicit SQL migrations and a small parameterized query layer.  
> **TODO A-002:** select and record the maintained MySQL driver during FND-002.

### FND-001 runtime seam implementation — 2026-10-20

> **ASSUMPTION A-008:** manifests are named `manifest.js` immediately inside each feature directory and expose a named `feature` export. This fills the previously unspecified file/export convention; no business feature currently consumes it. FND-003 remains the documented contract freeze point.

- Client discovery: `src/features/*/manifest.js`, using Vite glob discovery. The export is `{ id, routes: [{ path, load }] }`; `load` resolves a module whose default export is a React page. IDs are unique lowercase kebab-case. The initial seam supports exact absolute paths with lowercase letters/digits/hyphens, rejects duplicate paths and the `/api` namespace, and lazy-loads matched pages. Native document navigation is sufficient for this initial seam; parameter matching and client navigation helpers are not implemented. Empty/unmatched routes render nothing until UI/feature owners provide pages. Suspense and an app error boundary provide minimal loading/failure infrastructure.
- Server discovery: `server/src/features/*/manifest.js`. The export is `{ id, path, router }`; IDs are unique lowercase kebab-case, `path` is a unique single-segment lowercase kebab-case mount below `/api/v1`, and `router` is an Express router/middleware function. `/health` is reserved. Missing feature trees and directories without manifests are allowed; invalid/duplicate manifests and import failures prevent startup.
- Config currently validates only `NODE_ENV` and `PORT` in `server/src/config/`. Development/test default to port 3000; production requires an explicit valid port. Environment files are not loaded. Database/session/origin/upload validation remains with the appropriate later tasks; this is not the complete CFG-FND-001 release gate.
- Health currently reports runtime readiness, with an injectable fail-closed dependency check. No MySQL readiness exists before FND-002. A minimal request ID and sanitized runtime errors preserve the existing envelope; FND-003 still owns full HTTP/validation/transport infrastructure.
- Production composition checks for `dist/index.html` before listening, serves built assets and HTML document routes, and reserves `/api` before fallback. Missing assets, hidden paths, unsupported methods, and non-HTML requests do not receive SPA HTML. FND-006 still owns release packaging and the Hostinger runbook.
