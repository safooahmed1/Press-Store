# Acceptance Criteria — Identity and Accounts

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-AUTH-001 — Customer can register, log in, view account, and log out

- **Requirements:** `REQ-AUTH-002`, `REQ-AUTH-003`, `REQ-AUTH-004`, `REQ-AUTH-005`, `REQ-AUTH-011`
- **Given:** valid unique details or an existing customer
- **When:** the customer uses the corresponding form
- **Then:** a secure customer session is created, Account returns only name/phone, and logout invalidates it
- **Negative/edge behavior:** duplicate/invalid/incorrect input returns safe field or generic errors and stores no address/city
- **Evidence:** API integration plus UI interaction tests
- [ ] Passed

### AC-AUTH-002 — Admin is separate and singular

- **Requirements:** `REQ-AUTH-001`, `REQ-AUTH-006`, `REQ-AUTH-007`, `REQ-AUTH-013`, `REQ-SCOPE-002`
- **Given:** protected bootstrap configuration
- **When:** bootstrap and admin login execute
- **Then:** exactly one admin exists, no registration endpoint exists, and customer credentials cannot enter admin routes
- **Negative/edge behavior:** second-admin bootstrap is refused/idempotent without exposing secrets
- **Evidence:** bootstrap and admin route integration tests
- [ ] Passed

### AC-AUTH-003 — Sessions and isolation are secure

- **Requirements:** `REQ-AUTH-008`, `REQ-AUTH-009`, `REQ-AUTH-010`, `REQ-AUTH-012`, `REQ-AUTH-014`
- **Given:** two customers, one admin, and anonymous requests
- **When:** sessions rotate, expire, log out, and attempt cross-owner/role access
- **Then:** database-backed cookies have required attributes and every unauthorized attempt is rejected safely
- **Negative/edge behavior:** brute-force/rate-limit and CSRF cases fail closed without user enumeration
- **Evidence:** security integration suite and cookie inspection
- [ ] Passed

## 3. Cross-Feature Scenarios

Customer session owns CART/ORD access; admin session unlocks CAT/HOME/ORD/CUS/SET/ADM. Expiry produces UI unauthorized states without leaking cached private data.

## 4. Security and Permission Scenarios

Hash safety, session fixation/rotation, cookie flags, CSRF, rate limits, generic credential failure, horizontal isolation, and fixed role separation are mandatory.

## 5. Failure and Recovery Scenarios

Session-store outage, duplicate phone race, bootstrap misconfiguration, expired session, and logout retry fail without ambiguous authentication state.

## 6. Accessibility and Responsive Scenarios

Forms expose labels, field errors, focus placement, pending state, keyboard submit, and mobile layout using UI contracts.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Unit | `npm run test -- auth` | yes | normalization/validation/guards pass |
| Integration | `npm run test:integration -- auth` | yes | registration, login, isolation, bootstrap, cookies pass |
| Security manual | Inspect cookie attributes and absence of admin registration/client credentials | yes | Policy satisfied |
| Lint/build | `npm run lint && npm run build` | yes | Exit 0 |
