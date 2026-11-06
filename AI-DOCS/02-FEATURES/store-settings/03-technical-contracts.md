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

A-004 is confirmed by SET-DEC-003: optional Facebook/Instagram/TikTok links, no required network; full frontend/consumer integration remains open.


## 14. SET-001 approved backend implementation — 2026-11-04

SET-DEC-002 authorizes isolated early development on work/SET-backend from published a6603ca; full frozen SET integration baseline is not claimed. SET-DEC-003 approves first-write provisioning, Egyptian mobile policy and optional social allowlist. A-013 records noncritical bounds; A-004 is confirmed for this policy. FND-DEC-012/CAT-DEC-009 are the only shared source amendments, no frontend or AUTH changes.

- Additive set_001_create_store_settings.sql uses existing FND discovery/runner. store_settings has settings_id = 1 enforced by PK/CHECK, positive version, UTC timestamps, four canonical phone columns with independent payment fields and object JSON socials. No defaults/seed business values, secrets, numeric money or arbitrary settings keys. Explicit migrations only; no startup migration or automatic creation on reads.
- GET /api/v1/admin/settings returns {data:{settings:{storeName,storePhone,whatsappPhone,walletEgNumber,instaPayNumber,socialLinks,version}}}. Missing singleton is 503 SETTINGS_UNAVAILABLE for admin/public contact reads.
- PUT /api/v1/admin/settings uses the same envelope and numeric version. Version 0 creates initial version 1; later numeric current version replaces all validated fields in one transaction and increments version. Return 200, including first creation. Duplicate initial insert/stale update returns 409 EDIT_CONFLICT, preserving a concurrent winner. A nonzero expected version cannot provision missing settings (503). No POST/DELETE API exists.
- GET /api/v1/settings/public-contact returns the existing API-SET-002 contact/social shape only. Its SQL selects only those fields and DTO projects explicitly; no payment/version/ID/timestamps. Anonymous customers need no cookie; no auth cookies are issued or cleared. All private/public responses use Cache-Control: no-store, making successful updates visible without application caching.
- All admin settings requests use AUTH-AUTH-002; only valid admin session permits full read/write. Valid customer-only is 403, absent/expired auth 401. PUT additionally reuses the existing AUTH Origin boundary: production compares configured HTTPS origin, ignores forwarded headers and rejects cross-site fetch metadata; JSON required (415 otherwise). Unknown query/payload/actor fields, phone/URL/version errors yield canonical 422 with safe field errors and no supplied values. DB errors remain safe canonical 500; missing/malformed required persisted values are 503, without driver causes or payment/contact content.
- Phone input accepts strict 01xxxxxxxxx or +201xxxxxxxxx only, reusing existing normalization without changing AUTH; all four stored forms are canonical +20. Wallet/InstaPay are independently validated and may match or differ. InstaPay input is a mobile destination number in this approved policy, not an IPA account identifier.
- Optional socialLinks keys are facebook/instagram/tiktok; corresponding exact hosts are network.com or www.network.com over HTTPS, no credentials/custom ports. Empty/blank values omitted, canonicalized URL bounded to 2048 chars. Unknown networks, foreign/incorrect network hosts, lookalike suffixes, javascript/http/relative URLs rejected. No server-side fetch occurs.
- READ-SET-001: createSettingsService({repository}).payment(method), methods cash/wallet_eg/instapay. Returns {paymentMethod,number}; cash returns {paymentMethod:'cash',number:null} without DB access. Electronic read selects exactly the requested column; missing/invalid chosen destination yields SETTINGS_UNAVAILABLE and cannot accidentally fall back to the other number. Other missing fields do not block an independently valid selected destination. This is server-only; no public payment API.
- READ-SET-002: service.contact() returns exactly {storeName,storePhone,whatsappPhone}, using only contact SQL columns. No social/payment/version. ORD/CUS must use this owner service instead of writing/reading SET tables directly. Actual cross-feature/UI integration remains SET-003 work.
- Mutation validation lives in services/settings-input.js; safe read validation fails closed on manual DB corruption. Repository save uses parameterized insert or one version-qualified update plus read in a transaction; no read-then-write race or application singleton lock. SQL rows/timestamps/internal paths are not spread into responses/logs. FND logging remains unchanged and no settings payload is logged.
- Manifest mounts /settings and /admin/settings using one contextual service graph and the lifecycle-owned DB. CAT falls through for this unrelated admin resource; tests count one matching session lookup, not two. No new pool, dependency, configuration/environment reader or shared frontend route.

Verification: SET-001 appendix records actual unit/HTTP/MySQL/CAT/FND/build results and resolved test-fixture ordering issue. Original docs validator remains BLOCKED / NOT RUN. Migrations only exercised new disposable fixtures; on partial DDL retain FND marker/inspect actual state through separately approved recovery, never alter applied history/drop/retry automatically. No existing application DB or server/.env use; no FE, commit/push/merge/deploy or SET-002/003 completion. Full browser/consumer/privacy/hosting/release gates remain open.
