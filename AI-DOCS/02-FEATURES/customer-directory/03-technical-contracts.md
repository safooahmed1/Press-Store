# Technical Contracts — Customer Directory

## 1. Ownership

**Owns**
- Routes/screens: `/admin/customers`, `/admin/customers/:id`.
- Source paths: `src/features/customers/**`, `server/src/features/customers/**`, `tests/integration/customers/**`.
- API endpoints: admin customer list/detail projections.
- Entities/write authority: None.
- Jobs/events: None.
- Configuration: pagination bounds.

**Must Not Touch**
- AUTH Customer/session tables or ORD Order tables/files; all are consumed through read contracts.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| API-CUS-001 | API | Admin customer list/detail | CUS UI | §3 |
| READ-CUS-001 | service | Total customer count projection | ADM | §4 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| AUTH-AUTH-002, READ-AUTH-001 | AUTH | guard/customer identity | admin-only safe summaries |
| READ-ORD-001 | ORD | count/order projections | admin-visible history |
| HTTP-FND-001 | FND | API | stable envelope |
| UI-UI-002, UI-UI-004 | UI | admin UI | states/layout |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `server/src/features/customers/**` | compose read-only admin projections | CUS-001 | Migrations/foreign writes |
| `src/features/customers/**` | list/detail UI | CUS-002 | Customer edit forms/analytics |
| `tests/integration/customers/**` | privacy/performance/scope evidence | CUS-003 | Production data |

## 3. API Contracts

### API-CUS-001 — Admin customer directory
| Field | Value |
|---|---|
| Method and path | `GET /api/v1/admin/customers`, `GET /api/v1/admin/customers/:id` |
| Authentication | Admin session |
| Permission | `admin:customers:read` |
| Idempotency | Safe paginated reads |

Request:
```json
{"query":{"page":1,"pageSize":20}}
```

Success response:
```json
{"data":{"items":[{"customerId":"1","name":"Amina Ali","phone":"+20...","orderCount":3}]},"meta":{"page":1,"pageSize":20,"total":1}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `CUSTOMER_NOT_FOUND` | 404 | Missing detail | Return to list |
| `DEPENDENCY_UNAVAILABLE` | 503 | Canonical projection fails | Show retry, not partial count |

## 4. Data Contracts

None. CUS owns no persistent entity and composes read-only AUTH/ORD projections. READ-CUS-001 returns one current aggregate count without customer rows or duplicated storage.

## 5. Events and Background Jobs

None.

## 6. Shared UI Contracts

None.

## 7. Permissions and Security

All endpoints require admin. Do not expose password/session data, addresses, analytics, or arbitrary filters. Phone is operational data and handled according to logging rules.

## 8. External Integrations

None.

## 9. Configuration and Secrets

Default page 20, maximum 50. No secrets.

## 10. Error, Retry, and Recovery Behavior

Reads may retry. Dependency failure yields no misleading partial composition. Missing customer returns safe 404.

## 11. Performance and Limits

Bounded pagination and batched/aggregate contracts avoid N+1. Detail order history paginates when needed.

## 12. Contract Change Rule

New customer fields/actions require scope approval and the owning AUTH/ORD contract change; CUS cannot add writes independently.

## 13. Assumptions and TODOs

None.
