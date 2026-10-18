# Technical Contracts — Store Settings

## 1. Ownership

**Owns**
- Routes/screens: `/admin/settings`; footer public settings API.
- Source paths: `src/features/settings/**`, `server/src/features/settings/**`, `tests/integration/settings/**`.
- API endpoints: full admin settings and public contact projection.
- Entities/write authority: StoreSettings.
- Jobs/events: None.
- Configuration: validation bounds only; values are database-managed.

**Must Not Touch**
- Order/payment state, footer shared components, AUTH guards, or FND configuration.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| API-SET-001 | API | Admin settings read/update | settings admin UI | §3 |
| API-SET-002 | API | Public footer contact projection | UI | §3 |
| READ-SET-001 | service | Selected payment destination | ORD | §4 |
| READ-SET-002 | service | WhatsApp/store pickup contact | ORD, CUS | §4 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| DB-FND-001, HTTP-FND-001 | FND | persistence/API | standard contracts |
| AUTH-AUTH-002 | AUTH | admin endpoint | fixed admin guard |
| UI-UI-001, UI-UI-002, UI-UI-004 | UI | admin form | controls/states/layout |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `server/src/features/settings/**` | schema, validation, projections, API | SET-001 | Order/payment verification logic |
| `src/features/settings/**` | admin Settings UI | SET-002 | Shared shell |
| `tests/integration/settings/**` | privacy/consumer evidence | SET-003 | Other feature writes |

## 3. API Contracts

### API-SET-001 — Admin settings
| Field | Value |
|---|---|
| Method and path | `GET`, `PUT /api/v1/admin/settings` |
| Authentication | Admin session |
| Permission | `admin:settings:manage` |
| Idempotency | PUT replaces validated settings and uses version conflict check |

Request:
```json
{"storeName":"Press Store","storePhone":"+20...","whatsappPhone":"+20...","walletEgNumber":"01...","instaPayNumber":"01...","socialLinks":{},"version":1}
```

Success response:
```json
{"data":{"settings":{"storeName":"Press Store","storePhone":"+20...","whatsappPhone":"+20...","walletEgNumber":"01...","instaPayNumber":"01...","socialLinks":{},"version":2}}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `VALIDATION_FAILED` | 422 | Invalid field/URL | Show field errors |
| `EDIT_CONFLICT` | 409 | Stale version | Reload/reconcile |

### API-SET-002 — Public contact projection
| Field | Value |
|---|---|
| Method and path | `GET /api/v1/settings/public-contact` |
| Authentication | None |
| Permission | None |
| Idempotency | Safe read |

Request:
```json
{}
```

Success response:
```json
{"data":{"storeName":"Press Store","storePhone":"+20...","whatsappPhone":"+20...","socialLinks":{}}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `SETTINGS_UNAVAILABLE` | 503 | Singleton not provisioned | Hide optional footer contacts; operator fixes configuration |

## 4. Data Contracts

### StoreSettings (`owner: SET`)
| Field | Type | Required | Default | Constraints | Index/Relationship |
|---|---|---|---|---|---|
| canonical fields | see glossary | yes/optional | None. | singleton, validated phones/URLs | singleton key |
| version | integer | yes | 1 | increments atomically | conflict check |

Lifecycle: provision once, update versioned, never delete in normal V1 operation.  
Concurrency/transaction rule: compare expected version and update all fields atomically.

## 5. Events and Background Jobs

None.

## 6. Shared UI Contracts

None.

## 7. Permissions and Security

Full settings are admin-only. API-SET-002 omits payment numbers. READ-SET-001 returns exactly one requested configured payment destination to trusted ORD server code.

## 8. External Integrations

WhatsApp number is data only; ORD constructs the external link. Social links allow only approved HTTPS protocols/hosts as policy defines.

## 9. Configuration and Secrets

None of the StoreSettings fields are authentication secrets, but payment/contact numbers are redacted in logs. No gateway keys exist.

## 10. Error, Retry, and Recovery Behavior

Public reads may cache/retry briefly. Admin writes do not auto-retry conflicts. Required missing payment value blocks selecting that electronic method and tells admin to configure it.

## 11. Performance and Limits

Singleton reads are small; bounded short caching is allowed with invalidation after update. Text/URL collections are bounded.

## 12. Contract Change Rule

Adding a setting requires owner validation, projection/privacy decision, consumer updates, migration, and tests. Never expose the full singleton through a public endpoint.

## 13. Assumptions and TODOs

A-004 remains pending.
