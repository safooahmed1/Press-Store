# Feature Brief — Application Foundation

## 1. Identity

- **Feature ID:** `FND`
- **Kind:** `platform`
- **Parent Feature:** `None`
- **Owner:** `WS-FND-01`
- **Status:** `in-progress`

## 2. Summary

Establish the modular-monolith runtime, MySQL/migration infrastructure, REST/error boundaries, local image storage adapter, verification harness, and Hostinger-compatible production shape used by every business feature.

## 3. Business Value

Creates one simple, secure implementation path and prevents each feature from inventing infrastructure, error shapes, database access, or deployment behavior.

## 4. Roles and Users

All roles benefit indirectly. Implementation agents and operators are the direct users of the platform contracts.

## 5. Requirement Coverage

| Requirement ID | Summary | PRD Location |
|---|---|---|
| REQ-FND-001, REQ-FND-002, REQ-FND-003 | Simplicity, maintainability, extensibility, and React | §1, §3 |
| REQ-FND-005, REQ-FND-006, REQ-FND-007 | Axios, Zustand, and React Query boundaries | §3 |
| REQ-FND-010, REQ-FND-011, REQ-FND-012, REQ-FND-013 | Node/Express REST, MySQL, and Hostinger | §3, §28, §36 |
| REQ-FND-014, REQ-FND-017 | Separated responsibilities and focused business logic | §32 |
| REQ-FND-018, REQ-FND-019, REQ-FND-020 | Asset, rendering, data-loading, and query performance | §34 |
| REQ-FND-021, REQ-FND-022, REQ-FND-023, REQ-FND-024 | Backend validation, safe errors/queries/config | §30, §35 |
| REQ-FND-025, REQ-FND-026 | Single deployable and local upload storage | User decisions |
| REQ-FND-027, REQ-FND-028, REQ-FND-029, REQ-FND-030 | Relational integrity, bounded infrastructure, quality, simplest correct solution | §27, §34, §38–39 |
| REQ-SCOPE-001, REQ-SCOPE-003, REQ-SCOPE-004, REQ-SCOPE-005 | No shipping, multi-vendor, AI, or chatbot | §2, §37 |
| REQ-SCOPE-012, REQ-SCOPE-014, REQ-SCOPE-015 | No complex notifications, microservices, or Docker | §2, §37 |
| REQ-SCOPE-018, REQ-SCOPE-019 | No subscriptions or Redis | §37 |

## 6. In Scope

App/server bootstraps, feature manifests, transport/error primitives, database pool/migrations/transactions, upload adapter, test/fixture/logging primitives, build/start/health behavior, and scope guards.

## 7. Out of Scope

Feature entities, business pages, user authentication behavior, payment/order rules, deployment execution, or unapproved infrastructure.

## 8. User Flows

### Flow 1 — Request execution
1. Express assigns a request ID and safe middleware.
2. `/api/v1` dispatches to a feature manifest.
3. The feature returns a DTO or stable application error.
4. The boundary emits the canonical envelope and safe log.

Alternate flows:
- Static non-API paths serve the React build and SPA fallback.
- Invalid config prevents startup.

Exit states:
- Success: stable response and correlation evidence.
- Cancelled: client disconnect is logged safely.
- Failure: stable safe error; transaction/file compensation when relevant.

## 9. Screens and States

| Screen/View | Route/Entry | Purpose | Elements | Loading | Empty | Error | Unauthorized |
|---|---|---|---|---|---|---|---|
| Health endpoint | `/api/v1/health` | Operational readiness | Status/request ID | None | None | Safe unavailable state | Public, no internals |

## 10. Business Rules

Infrastructure remains feature-agnostic. Only validated config code reads environment variables. Shared primitives cannot import business features. Upload storage validates files before persistence. Production serves one same-origin application.

## 11. Edge Cases

Missing environment values, database unavailable, partial upload/database failures, duplicate migration execution, SPA routes resembling API routes, oversized bodies, and unhandled application errors.

## 12. Dependencies

Existing React/Vite repository and user-confirmed architecture. No feature dependency.

## 13. Assumptions and TODOs

> **ASSUMPTION A-002:** use explicit migrations and a small parameterized MySQL query layer unless a specific ORM is confirmed.  
> **TODO A-002:** confirm any required ORM/query builder before FND-002 installs the driver.
