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
