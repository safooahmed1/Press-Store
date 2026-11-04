# Technical Contracts — Identity and Accounts

## 1. Ownership

**Owns**
- Routes/screens: `/login`, `/register`, `/account`, `/admin/login`; auth/account APIs.
- Source paths: `src/features/auth/**`, `server/src/features/auth/**`, `server/src/platform/auth/**`, `scripts/bootstrap-admin*`.
- API endpoints: customer/admin registration/login/logout, current customer/admin session.
- Entities/write authority: Admin, Customer, Session.
- Jobs/events: expired-session cleanup if needed.
- Configuration: cookie name/options, session duration, password-hash parameters, bootstrap input.

**Must Not Touch**
- Cart/order/catalog/settings tables and feature paths.
- FND database/HTTP/config implementations; consume their interfaces.
- UI shared primitives.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| API-AUTH-001 | API | Customer register/login/logout/current account | customer UI, CART, ORD | §3 |
| API-AUTH-002 | API | Admin login/logout/current session | admin shell/features | §3 |
| AUTH-AUTH-001 | service | Require customer and derive customer ID | CART, ORD | §7 |
| AUTH-AUTH-002 | service | Require admin | CAT, HOME, ORD, CUS, SET, ADM | §7 |
| READ-AUTH-001 | service | Read safe customer summary by ID | ORD, CUS | §4 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| DB-FND-001 | FND | identity/session repositories | transactions and parameterized access |
| HTTP-FND-001 | FND | all endpoints | stable error envelope/CSRF hook |
| UI-UI-001, UI-UI-002 | UI | forms/account states | accessible form and async states |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `server/src/features/auth/{migrations,repositories,services}/**` | identities, hashing, normalization | AUTH-001 | Feature-owned carts/orders |
| `server/src/platform/auth/**` | session store/cookies/guards | AUTH-001, AUTH-005 | Configurable RBAC |
| `server/src/features/auth/routes/**` | customer/admin auth APIs | AUTH-002, AUTH-003 | Business feature endpoints |
| `scripts/bootstrap-admin*` | idempotent single-admin bootstrap | AUTH-003 | Embedded credentials |
| `src/features/auth/**` | customer/admin forms and Account | AUTH-004 | Shared UI redefinitions |
| `tests/integration/auth/**` | auth/isolation/security evidence | AUTH-005 | Production data |

## 3. API Contracts

### API-AUTH-001 — Customer authentication and account
| Field | Value |
|---|---|
| Method and path | `POST /api/v1/auth/customer/register`, `POST /login`, `POST /logout`, `GET /api/v1/account` |
| Authentication | register/login public; logout/account customer session |
| Permission | `account:self:read` for account |
| Idempotency | logout is idempotent; registration conflicts on normalized phone |

Request:
```json
{"firstName":"Amina","lastName":"Ali","phone":"01...","password":"secret-input"}
```

Success response:
```json
{"data":{"customer":{"customerId":"opaque","firstName":"Amina","lastName":"Ali","phone":"+20..."}}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `VALIDATION_FAILED` | 422 | Invalid fields | Show field messages |
| `PHONE_UNAVAILABLE` | 409 | Registration phone already used | Show safe phone conflict |
| `INVALID_CREDENTIALS` | 401 | Login fails | Generic message |
| `AUTH_REQUIRED` | 401 | Missing/expired session | Clear private cache and show login |

### API-AUTH-002 — Admin authentication
| Field | Value |
|---|---|
| Method and path | `POST /api/v1/auth/admin/login`, `POST /logout`, `GET /session` |
| Authentication | login public with rate limit; others admin session |
| Permission | fixed admin boundary |
| Idempotency | logout is idempotent |

Request:
```json
{"phone":"+20...","password":"secret-input"}
```

Success response:
```json
{"data":{"admin":{"adminId":"opaque"}}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `INVALID_CREDENTIALS` | 401 | Login fails | Generic message |
| `RATE_LIMITED` | 429 | Too many attempts | Respect retry time |
| `FORBIDDEN` | 403 | Customer session on admin route | Show unauthorized state |

## 4. Data Contracts

### Admin, Customer, Session (`owner: AUTH`)
| Field | Type | Required | Default | Constraints | Index/Relationship |
|---|---|---|---|---|---|
| admin/customer identity fields | see glossary | yes | None. | unique normalized phone; secure hash | unique phone |
| sessionIdHash | binary/varchar | yes | generated | high entropy; cookie holds opaque raw ID only | primary/unique |
| actorType, actorId | enum/bigint | yes | None. | customer or admin; matching FK logic | indexed |
| expiresAt, createdAt, lastSeenAt | datetime UTC | yes | server time | expiry enforced | expiry index |

Lifecycle: create/rotate, use, revoke/logout, expire/delete.  
Concurrency/transaction rule: unique phone and single-admin constraints are database-enforced; login rotation invalidates the prior session as defined by policy.

## 5. Events and Background Jobs

| Contract ID | Event/Job | Producer | Consumers | Payload | Retry/Ordering/Deduplication |
|---|---|---|---|---|---|
| JOB-AUTH-001 | expired session cleanup | AUTH | operations | cutoff, deleted count | safe to rerun; delete only expired rows |

## 6. Shared UI Contracts

None. AUTH consumes UI contracts.

## 7. Permissions and Security

AUTH-AUTH-001 and AUTH-AUTH-002 return a trusted actor or stop request processing. Fixed permissions in `roles-permissions.md` are enforced after the appropriate guard. Cookie and CSRF rules follow `auth-security-rules.md`.

## 8. External Integrations

None.

## 9. Configuration and Secrets

Server-only bootstrap admin phone/password input, `SESSION_SECRET`, cookie names/durations, password cost, and auth rate limits. Bootstrap password is never logged or stored outside the hash.

## 10. Error, Retry, and Recovery Behavior

Credential failures are generic. Duplicate registration returns a safe conflict. Session-store failure fails closed. Bootstrap is idempotent for the same admin and refuses a second identity.

## 11. Performance and Limits

Bound auth bodies and names/phone/password lengths. Index normalized phones and session expiry/actor. Rate-limit login and registration by safe keys.

## 12. Contract Change Rule

Authentication, session, cookie, admin provisioning, actor type, or ownership changes are critical: stop, record a project decision, update every guard consumer, run full security tests, and obtain user approval.

## 13. Assumptions and TODOs

**CONFIRMED A-005 — 2026-10-31:** customer and admin forms accept Egyptian local `01xxxxxxxxx` and `+201xxxxxxxxx` input, normalize to unique `+20` E.164, and reject non-Egyptian numbers in V1.

## 14. AUTH-001 implementation policy — AUTH-DEC-003

- `services/auth-validation.js`: exact Egyptian local/international input normalizes to +20; invalid types, lengths, whitespace, non-ASCII digits and non-Egyptian formats reject. Password bounds and hashing follow AUTH-DEC-003.
- `services/passwords.js`: asynchronous built-in scrypt with versioned, fixed-parameter encoding and constant-time key comparison. Hash verification does not choose work factors from untrusted stored text.
- `repositories/identities.js`: internal credential lookups and an explicit safe customer summary through DB-FND-001. No registration or bootstrap workflow is installed in AUTH-001.
- `auth_001_create_identities.sql`: AUTH-owned customers/admins with BIGINT identities, unique canonical phones, bounded name columns (A-009) and a CHECK restricting admin_id to 1. Migration is additive and forward-only; no production reset or automatic recovery.
- `auth_002_create_sessions.sql`: sessions have a BINARY(32) primary digest, actor_type, nullable customer_id/admin_id foreign keys and an exclusive-scope CHECK. The conceptual actorId is the matching non-null FK, not a separate unconstrained polymorphic FK. Expiry and actor indexes support lookup/cleanup. Timestamps are UTC; no cascading history deletion.
- `createSessionRepository(database)` owns atomic rotation, scoped active lookup/last-seen update and scoped revocation. SQL values are parameterized; raw session tokens never cross this boundary.
- `createSessionService({ repository, clock })` exposes create({ actorType, actorId, previousToken? }), find(token, actorType) and revoke(token, actorType). Callers must already have verified credentials before create. It returns the new token only after the rotation transaction succeeds. Actor IDs are exact positive BIGINT decimal strings; adminId is 1.
- `createSessionCookies({ production })` exposes issue(scope, session), clear(scope), read(scope, cookieHeader). Production names are __Host-press-customer and __Host-press-admin; development names omit __Host-. Duplicate, malformed or oversized cookie headers produce no token. This does not replace CSRF/origin guards.
- AUTH-002/AUTH-003 own endpoint orchestration, configuration wiring and credential-failure handling; AUTH-005 owns the complete live security gate. Frozen API envelopes/routes are unchanged. AUTH-004 needs owner acknowledgement/reconciliation of the newly approved password policy before INT.

## 15. AUTH-002 customer API implementation

- Approved dependency exception: AUTH-DEC-004. Shared FND owner/consumer amendment: AUTH-DEC-005 / FND-DEC-009. Exact runtime implementation policy: AUTH-DEC-006.
- Manifest descriptors mount /auth and /account using the FND-injected existing database/config/appOrigin. Both mounts share one AUTH graph for that context; no import-time pool or environment access.
- Exact customer routes: POST /api/v1/auth/customer/register (201), POST /api/v1/auth/customer/login (200), POST /api/v1/auth/customer/logout (200), GET /api/v1/account (200). Account/register/login retain `{data:{customer:{customerId,firstName,lastName,phone}}}`; logout returns `{data:{}}`. No raw cookie token, hash or actor override is accepted/returned in JSON.
- Request validation rejects extra fields, unknown actors/roles/addresses/cities, malformed phone/password/name values and unbounded strings. Names use trimmed non-empty 1–255 well-formed Unicode code points with no control characters under assumption A-009; the approved password policy is unchanged.
- Registration/session creation are atomic. Duplicate normalized phones return 409 PHONE_UNAVAILABLE with no new cookie. Missing/wrong credentials return the same 401 INVALID_CREDENTIALS message. Missing/expired/wrong-scope account sessions return 401 AUTH_REQUIRED. Storage failure fails closed through the canonical safe 500 envelope and never returns a new/cleared cookie prematurely.
- Mutations reject missing/mismatched Origin or cross-site fetch metadata with 403 FORBIDDEN. Register/login additionally reject non-JSON bodies with 415 UNSUPPORTED_MEDIA_TYPE. Logout accepts an empty body for the existing Axios adapter. Private success/error responses within the routers are no-store. Production cookie flags/names remain AUTH-DEC-003.
- AUTH-005 retains full CSRF/origin/browser integration, abuse rate limits, cross-feature guards and security acceptance. These customer scenarios alone do not satisfy AC-AUTH-003 or feature completion. AUTH-003 admin APIs/bootstrap and AUTH-004 FE implementation are outside this task.

## 16. AUTH-003 approved implementation policy

AUTH-DEC-007 authorizes the bounded early start; AUTH-DEC-008 owns bootstrap/admin behavior.
FND-DEC-010 approves exactly the CLI configuration reader/tests and ESLint pattern amendment.
Bootstrap uses BOOTSTRAP_ADMIN_PHONE and BOOTSTRAP_ADMIN_PASSWORD only through the explicit CLI;
existing DB-FND-001 config/pool lifecycle is reused and closed on success/failure. No migrations,
password arguments, credential output, automatic provisioning or credential replacement.
The admin endpoints preserve API-AUTH-002's URLs and safe adminId-only DTO. Missing/expired
current-session authentication returns AUTH_REQUIRED (401); valid customer-only authentication
returns FORBIDDEN (403); valid admin authentication wins when both cookies are supplied. Logout
is idempotent and scoped. Rate limiting and reusable guards remain AUTH-005, not a passed gate.


## 2026-11-04 — CAT-003 fixed guard consumer handoff

Under user-approved CAT-DEC-006, the existing AUTH-005 fixed-scope guard and its regression test are copied unchanged into the CAT development branch; original AUTH working files are untouched. createAuthGuards({sessions,cookies}) exposes requireAdmin/requireCustomer Express middleware. Matching scoped session is authoritative and wins when both valid cookies exist; an opposite-scope-only valid cookie is 403, no valid authentication is 401, storage errors fail closed. req.auth is a frozen actor derived only from the session. CAT also reuses the existing exported mutationBoundary from AUTH customer-routes for the unchanged Origin policy. No cookie/password/session policy or full AUTH-005 security/abuse gate is changed or newly claimed passed by this consumer handoff.
