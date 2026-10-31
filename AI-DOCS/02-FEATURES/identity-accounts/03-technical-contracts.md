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
