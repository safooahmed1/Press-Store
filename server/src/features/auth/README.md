# AUTH backend foundation

AUTH-001 provides identity/session persistence primitives. AUTH-002 mounts customer registration,
login/logout and Account APIs through the contextual FND manifest seam. Admin bootstrap/APIs and
the complete AUTH security/abuse/integration gate remain separate tasks.
See `AI-DOCS/02-FEATURES/identity-accounts/03-technical-contracts.md` and AUTH-DEC-003 for policy.

- `services/auth-validation.js`: exact local Egyptian / +20 normalization and password bounds.
- `services/passwords.js`: asynchronous fixed-parameter scrypt with fresh salts and strict encoding.
- `repositories/identities.js`: internal credential reads and explicit safe customer summaries.
- `server/src/platform/auth/`: session persistence, lifecycle and cookie primitives.

Call `createSessionService.create` only after the appropriate customer/admin credentials have been
verified. Return the token only as a cookie, never in JSON or logs. Database errors must fail closed.
Rotation revokes the supplied previous token in the same scope atomically with creation; it does not
sign out other devices. Lookup updates last-seen without extending absolute expiry.
Customer mutations enforce the configured production origin (request origin in development/test),
reject cross-site requests and use the FND-injected database/config. Register/login require JSON;
bodyless logout is supported. Full AUTH-005 browser/CSRF/abuse/rate-limit acceptance remains open.

The two forward migrations are discovered automatically by the existing **explicit** migration CLI.
They create only AUTH-owned tables. No schema operation occurs on application startup. Never edit
applied migration SQL, retry unresolved interruption markers or drop identity/session tables to
recover. Inspect actual partial DDL with the FND procedure; recovery needs a separately approved
plan. These migrations have no automatic down operation.

Local checks (no live database):

```sh
FND_DISPOSABLE_MYSQL_TESTS=0 node --test --test-isolation=none server/src/features/auth/repositories/auth-identities.test.js server/src/features/auth/services/auth-core.test.js server/src/features/auth/services/auth-core.integration.test.js server/src/platform/auth/auth-sessions.test.js
npm run test -- auth
FND_DISPOSABLE_MYSQL_TESTS=0 npm run test:integration -- auth
npm run lint
npm run build
```

The real MySQL suite is opt-in. It passed on 2026-11-02 against disposable MySQL 8.4.11,
including a new pool/service reading an existing session (verification-matrix §23). For later runs,
obtain separate explicit authorization; `FND_DISPOSABLE_MYSQL_TESTS=1 npm run test:integration -- auth` uses the existing
disposable MySQL helper and synthetic data; never load an application env file or reuse an existing
database. Verify fixture processes/directories are removed afterward. This suite checks migration
upgrade/rerun, phone uniqueness, singleton admin, actor FKs, persisted sessions, expiry and atomic
rollback. A fake repository cannot establish those database guarantees.


AUTH-002 routes: POST /api/v1/auth/customer/register, POST /api/v1/auth/customer/login,
POST /api/v1/auth/customer/logout and GET /api/v1/account. Registration creates the identity and
session in one database transaction; success returns the customer summary and a cookie. Account
uses only the session owner. Missing/incorrect credentials use a generic error, including a dummy
fixed-cost hash verification for absent identities. Private responses are no-store.

After explicit authorization, the API-specific isolated MySQL/HTTP check is:

```sh
FND_DISPOSABLE_MYSQL_TESTS=1 node --test --test-isolation=none server/src/features/auth/routes/auth-customer.integration.test.js
```

It exercises default manifest/startServer integration, duplicate registration/races, rollback when
session storage fails, login rotation, account isolation, actual app restart, expiry, idempotent
logout, origin/media/validation failures and storage outages. It does not replace the full INT gate.

## AUTH-003 admin backend

Explicit provisioning entry: `node scripts/bootstrap-admin.js`. Supply BOOTSTRAP_ADMIN_PHONE and
BOOTSTRAP_ADMIN_PASSWORD through the operator's protected process environment, together with the
existing MYSQL_* configuration. Never put a password in command arguments, shell examples, source,
logs or error output. The command accepts no arguments and loads no env file. It creates/closes its
own bounded operational pool using DB-FND-001, never runs migrations, and is never invoked on
application startup. The schema must already be provisioned through separately authorized migration
operations. This documentation authorizes no operation against an existing application database.

Same normalized phone and matching password reports Admin unchanged without changing credentials,
timestamps or sessions. A different phone/password fails with generic output and no overwrite.
Concurrent calls use the existing singleton constraint; only constraint conflicts are reconciled by
reading and verifying the winning identity. Other storage failures are not retried or reported as
success. Close failures also suppress success output. This is not a password-reset command.

POST /api/v1/auth/admin/login and GET /api/v1/auth/admin/session return only data.admin.adminId.
POST /api/v1/auth/admin/logout accepts no body and returns data: {}. Admin credentials/cookies
are scoped separately from customers. A valid admin session wins when both cookies exist;
current-session returns 401 AUTH_REQUIRED for absent/expired authentication and 403 FORBIDDEN
for valid customer-only authentication. Mutations share the existing origin/JSON boundary;
router responses are no-store. FND's earlier strict JSON parser still owns malformed/primitive JSON
rejection before feature middleware. No admin registration endpoint is exposed.

See AUTH-DEC-007/008, FND-DEC-010 and verification-matrix §26. AUTH-005 retains rate limiting,
reusable cross-feature guards and complete browser/security acceptance. AUTH-003 remains blocked
on original documentation validation. The failed sandbox fixture cleanup in §26 was resolved by
the observed host checks in §27; §27 also records the latest full test rerun.
No completion, commit or release readiness is claimed.
