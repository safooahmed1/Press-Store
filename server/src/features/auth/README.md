# AUTH backend foundation

AUTH-001 provides identity/session persistence primitives. It does not mount authentication APIs,
bootstrap an admin, configure runtime middleware, or complete the AUTH security/integration gate.
See `AI-DOCS/02-FEATURES/identity-accounts/03-technical-contracts.md` and AUTH-DEC-003 for policy.

- `services/auth-validation.js`: exact local Egyptian / +20 normalization and password bounds.
- `services/passwords.js`: asynchronous fixed-parameter scrypt with fresh salts and strict encoding.
- `repositories/identities.js`: internal credential reads and explicit safe customer summaries.
- `server/src/platform/auth/`: session persistence, lifecycle and cookie primitives.

Call `createSessionService.create` only after the appropriate customer/admin credentials have been
verified. Return the token only as a cookie, never in JSON or logs. Database errors must fail closed.
Rotation revokes the supplied previous token in the same scope atomically with creation; it does not
sign out other devices. Lookup updates last-seen without extending absolute expiry.
The eventual route layer must add origin/CSRF, abuse controls and trusted configuration before use.

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
