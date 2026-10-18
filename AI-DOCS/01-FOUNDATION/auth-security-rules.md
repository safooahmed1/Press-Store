# Auth Security Rules

## 1. Scope

Applies to customer/admin credentials, sessions, authorization, CSRF/CORS, abuse controls, customer isolation, secrets, uploads, and sensitive operational actions.

## 2. Required Patterns

- Hash passwords with a maintained adaptive password hash using safe cost parameters; never decrypt or return them.
- Store opaque sessions in MySQL and send only a high-entropy session ID in `HttpOnly`, `Secure` in production, `SameSite=Lax` or stricter cookies.
- Rotate the session on login and privilege change; invalidate it on logout and expiry.
- Separate customer and admin login endpoints/guards; bootstrap exactly one admin from protected environment input.
- Derive customer ownership from the session. Apply fixed permission keys from `roles-permissions.md` server-side.
- Protect cookie-authenticated state changes against CSRF and restrict production origin/CORS.
- Rate-limit login/registration, return generic credential failures, and record safe security events.
- Validate upload MIME, extension, size, decoded image characteristics, generated filename, and path containment.

## 3. Prohibited Patterns

- JWT or credentials in localStorage, plaintext/reversible passwords, public admin registration, configurable RBAC, user-supplied owner IDs, wildcard credentialed CORS, secrets in Vite variables, executable uploads, or logging session/payment secrets.

## 4. Conventions

Use `CUSTOMER_SESSION` and `ADMIN_SESSION` conceptual scopes even if one session table is used. Phone normalization follows A-005. Authentication errors do not reveal whether a phone exists. State-changing admin actions record timestamps and the admin actor.

## 5. Security and Failure Handling

Fail closed when session storage, configuration, or ownership checks fail. Revoke invalid/expired sessions. Treat payment verification, delivery, settings changes, and catalog deletion as sensitive actions. Do not leak another customer's resource existence.

## 6. Testing and Verification

Test login/logout/rotation/expiry, cookie attributes, CSRF, rate limits, brute-force response consistency, customer horizontal isolation, admin/customer separation, unauthorized UI/API states, upload attacks, and absence of secrets in client build/logs.

## 7. Exceptions and Change Gate

Authentication mechanism, cookie policy, admin provisioning, ownership rules, or sensitive-data handling changes are critical and require an approved project decision plus explicit user confirmation.
