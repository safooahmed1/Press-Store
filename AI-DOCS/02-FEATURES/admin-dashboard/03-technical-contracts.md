# Technical Contracts — Admin Dashboard

## 1. Ownership

**Owns**
- Routes/screens: `/admin` dashboard and admin navigation composition.
- Source paths: `src/features/admin-dashboard/**`, `server/src/features/admin-dashboard/**`, `tests/integration/admin-dashboard/**`.
- API endpoints: lightweight dashboard projection.
- Entities/write authority: None.
- Jobs/events: None.
- Configuration: recent/attention list limits.

**Must Not Touch**
- Feature management screens/entities; shared UI shell implementation; AUTH/CAT/ORD/CUS source paths.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| API-ADM-001 | API | Lightweight admin dashboard | Dashboard UI | §3 |
| NAV-ADM-001 | UI manifest | Required admin destinations | Admin shell | §6 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| AUTH-AUTH-002, API-AUTH-002 | AUTH | guard/logout/session | fixed admin boundary |
| READ-CAT-003 | CAT | total product count | active/admin catalog count |
| READ-ORD-002 | ORD | total/recent/attention orders | bounded operational projection |
| READ-CUS-001 | CUS | total customer count | current count |
| UI-UI-002, UI-UI-004 | UI | states/admin layout | accessible responsive shell |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `src/features/admin-dashboard/navigation/**` | required route manifest/navigation content | ADM-001 | Owner feature page implementations |
| `server/src/features/admin-dashboard/**` | compose bounded metrics | ADM-004 | Analytics persistence/foreign writes |
| `src/features/admin-dashboard/dashboard/**` | dashboard cards/lists | ADM-005 | Revenue/charts |
| `tests/integration/admin-dashboard/**` | live dashboard composition plus route/metrics/scope evidence | ADM-002, ADM-003 | Production data or unfinished BE/FE implementation |

## 3. API Contracts

### API-ADM-001 — Dashboard projection
| Field | Value |
|---|---|
| Method and path | `GET /api/v1/admin/dashboard` |
| Authentication | Admin session |
| Permission | `admin:dashboard:read` |
| Idempotency | Safe read; short cache allowed |

Request:
```json
{}
```

Success response:
```json
{"data":{"totalProducts":0,"totalOrders":0,"totalCustomers":0,"attentionOrders":[],"recentOrders":[]}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `DASHBOARD_UNAVAILABLE` | 503 | Required owner projection fails | Show retry; do not invent partial totals |

## 4. Data Contracts

None. ADM owns no persistent entity and composes owner projections.

## 5. Events and Background Jobs

None.

## 6. Shared UI Contracts

| Contract ID | Component | Props/Input | States | Consumers | Accessibility |
|---|---|---|---|---|---|
| NAV-ADM-001 | Admin navigation manifest | fixed path/label/icon entries plus logout action | current/nested/mobile | UI-UI-004, all admin pages | current-page semantics, keyboard ordering |

## 7. Permissions and Security

All dashboard/navigation session data is admin-only. Logout uses API-AUTH-002. Client route hiding never replaces API guard.

## 8. External Integrations

None.

## 9. Configuration and Secrets

Bound recent and attention lists (for example 5–10 each); no secrets.

## 10. Error, Retry, and Recovery Behavior

Read may retry. Missing dependency yields unavailable rather than partial invented totals. Expired session clears admin cache and returns to admin login.

## 11. Performance and Limits

Owner contracts supply indexed counts and bounded lists; no full-table client loads, analytics jobs, or chart payloads.

## 12. Contract Change Rule

New destinations/metrics require an approved requirement and owner read contract. ADM cannot directly query or write another owner's data.

## 13. Assumptions and TODOs

`READ-CAT-003` and `READ-CUS-001` are read projection interfaces that their owners must freeze in CAT-006 and CUS-003 before ADM-002.
