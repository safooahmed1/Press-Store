# Decisions — Identity and Accounts

## AUTH-DEC-001 — Database-backed cookie sessions

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Apply project DEC-001: MySQL-backed Secure HttpOnly sessions and environment-driven single-admin bootstrap.
- **Rationale:** User confirmed secure sessions and separate admin authentication without unnecessary infrastructure.
- **Alternatives:** Client-stored JWT, public admin registration, Redis sessions.
- **Consequences:** Session cleanup, cookie/CSRF verification, and database availability are required.
- **Affected contracts/tasks:** AUTH-001 through AUTH-005; API-AUTH-001/002; AUTH-AUTH-001/002.

## AUTH-DEC-002 — Egyptian phone input and AUTH contract freeze

- **Status:** `approved`
- **Date:** 2026-10-31
- **Decision:** V1 accepts Egyptian local `01xxxxxxxxx` and `+201xxxxxxxxx` phone input for customers and the single admin, then normalizes it to unique `+20` E.164. Non-Egyptian numbers are out of scope. The current AUTH technical contract is frozen for the independent BE and FE lanes.
- **Rationale:** User confirmation closes A-005 while preserving familiar local entry and one canonical stored identity.
- **Alternatives:** Local-only input; multi-country phone support.
- **Consequences:** AUTH-004 fixtures and client validation use only these formats. Any later phone geography or authentication contract change follows the critical contract-change rule.
- **Affected contracts/tasks:** A-005; AUTH-001 through AUTH-005; API-AUTH-001/002.

## AUTH-DEC-003 — Password policy and absolute session lifetimes

- **Status:** `approved`
- **Date:** 2026-11-02
- **Authorization:** User explicitly approved 15–128 characters without composition requirements, Node built-in scrypt (N=131072, r=8, p=1), seven-day customer and eight-hour admin fixed lifetimes, login rotation and current-session logout revocation.
- **Implementation:** Count well-formed Unicode code points; do not trim, normalize or truncate passwords. Use random 16-byte salts, 64-byte scrypt keys and a 256 MiB per-call memory ceiling. Encoded hash parameters are fixed and strictly parsed; arbitrary stored cost values never select work factors. No dependency is added.
- **Sessions:** Generate 32 random bytes, send only their opaque base64url value in a cookie and store only a SHA-256 digest. Expiry is absolute; last-seen updates never extend it. Rotate/delete-and-insert atomically in one DB-FND-001 transaction, touching only the matching prior scope. Other sessions remain valid. Missing/expired/wrong-scope sessions return no actor; database failure propagates and must fail closed at the future API boundary.
- **Cookie policy:** Separate customer/admin names, Path=/, HttpOnly and SameSite=Lax; production adds Secure and a __Host- prefix with no Domain. Development omits Secure for local HTTP and uses different names. Runtime environment is explicitly injected; no environment read outside server/src/config.
- **Source:** [Node scrypt](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback); [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Lifetimes and length bounds are user-approved product policy, not recommendations attributed to those sources.
- **Consumer handoff:** AUTH-004 owner must acknowledge the policy and reconcile validation/fixtures before live integration. Existing remote FE form checks only non-empty passwords and maps server field errors; no FE source was changed. AUTH-005 still owns live guards/CSRF/rate limits; the current primitives do not install routes or middleware.
- **Verification boundary:** Unit/fake-repository results are not actual MySQL constraints or session persistence evidence. Missing original validator remains BLOCKED / NOT RUN. No completion commit/push authorized.

## AUTH-DEC-004 — AUTH-002 development against verified AUTH-001 checkpoint

- **Status:** `approved`
- **Date:** 2026-11-02
- **Authorization:** User explicitly approved starting AUTH-002 as a development exception after AUTH-001's missing original validator was explained.
- **Decision:** AUTH-002 may develop against verified checkpoint 9b86081027641dcde163b0ffa6497e8ae63bbea5. This satisfies only its development dependency on AUTH-001.
- **Boundaries:** AUTH-001 remains blocked, original documentation validation stays BLOCKED / NOT RUN, and no acceptance requirement is changed. AUTH-003/005, completion commits, further checkpoint publication, merge and deployment are not authorized by this exception.

## AUTH-DEC-005 — Bounded runtime composition amendment for customer APIs

- **Status:** `approved by user 2026-11-02`
- **Date:** 2026-11-02
- **Problem:** API-AUTH-001 requires both /api/v1/auth/customer/* and /api/v1/account. The existing server manifest export permits one unique single-segment mount per feature. Its loader receives no database/runtime context; startServer retains the sole lifecycle-owned pool without passing it to feature routers. A second pool, import-time environment access, route relocation or registering routes by reaching outside the feature router would violate the current contracts.
- **Approved FND owner change:** Extend loadFeatureManifests(root, context) to accept an optional explicit runtime context from startServer and allow the named feature export to be either one existing descriptor or an array of descriptors. A descriptor may provide createRouter(context) instead of an already-created router. Normalize to the existing validated { id, path, router } registry before createApp; existing static manifests remain compatible.
- **Exact approved FND source paths:** server/src/app/feature-manifests.js; server/src/app/start-server.js; their colocated foundation-manifests/runtime integration tests. No database-interface, migration-runner, route-envelope or frontend contract changes.
- **Approved AUTH consumer:** server/src/features/auth/manifest.js exports two descriptors, auth at /auth and account at /account, whose factories consume the injected FND database/config. AUTH owns router/controller/service/repository implementations. Registration/login/logout/account URL and DTO contracts remain unchanged.
- **Ownership:** User explicitly approved the coordinated FND owner and AUTH consumer amendment after reviewing the bounded proposal. No FND source changed before approval. Future feature owners may use the optional factory seam; existing static consumers retain their behavior. See FND-DEC-009.
- **Verification after approval:** Existing static-manifest validation and atomic registration; new multiple-mount/factory/context tests; actual customer HTTP/database registration, duplicate race, login, rotation, logout and account isolation; foundation regressions, lint/build and original docs validation (retain missing-tool blocker). Do not infer actual API coverage from factory-only tests.
- **Alternative:** Do not mount AUTH-002 until an FND owner provides an approved injection/multiple-mount seam. No undocumented workaround is selected.

## AUTH-DEC-006 — Customer API implementation boundaries

- **Status:** `implementation within approved AUTH-002 scope`
- **Date:** 2026-11-02
- **Registration:** Hash outside the transaction, then insert the customer and rotate/create the session in one transaction. Join that transaction through the existing session repository rather than starting a nested FND transaction. Inspect duplicate-phone conflicts only after rollback. No address, city, actor ID or extra payload fields are accepted.
- **Login:** Verify an absent phone against a precomputed random dummy hash with the same approved scrypt parameters. Create the dummy hash during router construction before listening, not on the first credential failure. Return the same generic error for absent and wrong-password cases.
- **Customer boundary:** Account derives the actor only from the customer cookie/session. Logout is idempotent and affects only the customer session; an admin cookie is never treated as a customer credential. Return only the existing customer summary DTO. Private responses are no-store; no cookie is issued/cleared after storage failure.
- **Mutation boundary:** Enforce the documented same-origin policy for customer mutations. Production compares Origin with the FND-validated appOrigin and never trusts forwarded/Host headers for that decision. Local development/test compares with the actual request origin, preserving the existing Vite same-origin proxy. Missing/mismatched Origin and cross-site fetch metadata reject with FORBIDDEN. Register/login require JSON; bodyless logout remains compatible with the existing FE adapter.
- **Deferred gates:** This is not the complete AUTH-005 abuse/security gate. Login/registration rate limits and the full cross-feature security/CSRF/browser integration suite remain AUTH-005 release prerequisites; no production-readiness or feature-completion claim is made.
- **Name bound:** A-009 remains an explicitly labeled noncritical implementation assumption, using the existing 255-character storage limit. It is not a new PRD requirement or claimed user decision.
- **Authorization limits:** AUTH-DEC-004/005 authorize this task and its bounded FND integration only. Missing original validator and no-new-commit/no-push boundaries remain; the earlier AUTH-001 checkpoint publication does not authorize publishing later changes.

## AUTH-DEC-007 — Bounded AUTH-003 early start

- **Status:** `approved by user`
- **Date:** 2026-11-02
- **Decision:** AUTH-003 BE development may use verified AUTH-001 checkpoint 9b86081027641dcde163b0ffa6497e8ae63bbea5 and AUTH-002 checkpoint 7f3849fa333bf19c9b0381dad00a04662e7b5e0e while original documentation validation remains BLOCKED / NOT RUN. This satisfies development dependencies only; AUTH-001/002 are not completed and no acceptance requirement is waived.
- **Authorization:** After read-only preflight the user explicitly approved implementation, tests on newly created disposable MySQL fixtures, lint/build/diff checks, and the bounded shared changes in FND-DEC-010. No existing application DB, environment file, frontend implementation, dependency, migration, commit, push, merge or deployment is authorized.

## AUTH-DEC-008 — Protected single-admin bootstrap and admin API boundaries

- **Status:** `approved by user`
- **Date:** 2026-11-02
- **Bootstrap:** Explicit node scripts/bootstrap-admin.js only. Protected CLI-only BOOTSTRAP_ADMIN_PHONE / BOOTSTRAP_ADMIN_PASSWORD inputs enter through validated server/src/config code; no password arguments, logging, error interpolation, env-file loading, automatic bootstrap or migration execution. Reuse Egyptian phone validation and unchanged AUTH-DEC-003 password hashing.
- **Idempotency:** Same normalized phone and matching password returns unchanged without touching stored credentials, timestamps or sessions. Different phone/password fails closed. The existing singleton DB constraint arbitrates concurrent insertion; after a constraint conflict re-read and verify the winner without overwrite. Other storage failures propagate safely without automatic retry or claimed success.
- **API:** POST /api/v1/auth/admin/login, POST /api/v1/auth/admin/logout, GET /api/v1/auth/admin/session. Login/session return 200 with {data:{admin:{adminId}}}; logout returns 200 with {data:{}}. Strict phone/password body only, generic INVALID_CREDENTIALS with precomputed dummy hash for absent identities, same-origin mutation checks, JSON login, bodyless logout, no-store and safe storage errors. No public admin registration.
- **Sessions:** Reuse admin-only cookies, eight-hour absolute expiry, transactional current-session rotation and admin-only revocation. A valid admin session takes precedence. Current-session returns 401 AUTH_REQUIRED for absent/expired authentication, 403 FORBIDDEN for a valid customer-only session. Customer tokens under the admin cookie cannot authenticate an admin; logout is idempotent and leaves customer sessions intact.
- **Deferred:** AUTH-005 retains rate limits, reusable cross-feature guards and complete browser/security acceptance. AUTH-003 is not full security acceptance or production readiness. Frozen endpoints/DTOs are preserved; no FE fixture or source changes authorized.
