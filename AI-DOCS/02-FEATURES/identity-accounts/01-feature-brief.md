# Feature Brief — Identity and Accounts

## 1. Identity

- **Feature ID:** `AUTH`
- **Kind:** `shared`
- **Parent Feature:** `None`
- **Owner:** `WS-AUTH-BE`, `WS-AUTH-FE`, `WS-AUTH-INT`
- **Status:** `planned`

## 2. Summary

Provide separate secure customer and single-admin authentication, MySQL-backed cookie sessions, customer registration/account access, protected route guards, and strict customer data isolation.

## 3. Business Value

Makes persistent carts, private orders, and store administration possible without introducing configurable roles or client-side credentials.

## 4. Roles and Users

Customer, Admin, and Anonymous visitors entering authentication flows.

## 5. Requirement Coverage

| Requirement ID | Summary | PRD Location |
|---|---|---|
| REQ-AUTH-001, REQ-AUTH-002 | Two account types and required customer data | §5, §10 |
| REQ-AUTH-003, REQ-AUTH-004, REQ-AUTH-005 | Phone/password login, registration, and no address/city | §10 |
| REQ-AUTH-006, REQ-AUTH-007 | Separate authentication and exactly one admin with no roles | §5, §10, §29 |
| REQ-AUTH-008, REQ-AUTH-009 | Customer self-only and admin-only access | §29 |
| REQ-AUTH-010, REQ-AUTH-011 | Password hashing and logout | §29, §35 |
| REQ-AUTH-012, REQ-AUTH-013 | Secure database sessions and protected admin bootstrap | User decision |
| REQ-AUTH-014 | Authentication abuse controls | §35 |
| REQ-SCOPE-002 | No multiple admins or role system | §2, §37 |

## 6. In Scope

Customer/admin records, session store/guards, registration, separate logins/logout, current customer account view, admin bootstrap, route guards, normalization, rate limiting, and isolation/security tests.

## 7. Out of Scope

Password reset, email, social login, MFA, admin registration, multiple admins, role management, customer address/city, impersonation, or account deletion.

## 8. User Flows

### Flow 1 — Customer registration and session
1. Anonymous visitor submits first name, last name, phone, and password.
2. Server normalizes/validates phone, hashes password, and rejects duplicates safely.
3. Server creates/rotates a customer session and sets the secure cookie.
4. Customer can open Account and later log out.

Alternate flows:
- Existing customer logs in with phone/password.
- Expired session returns an authentication state and login action.

Exit states:
- Success: authenticated customer summary is returned.
- Cancelled: form remains safe and no account/session is created.
- Failure: field or generic credential error without existence leakage.

### Flow 2 — Admin login
1. Operator uses the separate admin login.
2. Server verifies the single bootstrapped admin.
3. Admin session grants fixed dashboard guards.

Alternate flows:
- Bootstrap command is idempotent and refuses an unsafe second admin.

Exit states:
- Success: protected admin shell is available.
- Cancelled: no session.
- Failure: generic credentials error or bootstrap configuration failure.

## 9. Screens and States

| Screen/View | Route/Entry | Purpose | Elements | Loading | Empty | Error | Unauthorized |
|---|---|---|---|---|---|---|---|
| Customer Login | `/login` | Start customer session | Phone, password, submit, register link | Pending submit | None. | Field/generic error | Redirect if already customer |
| Register | `/register` | Create customer | Names, phone, password, submit | Pending submit | None. | Field/duplicate-safe error | Redirect if already customer |
| Account | `/account` | Show current customer data | Name, phone, logout | Skeleton | None. | Retry | Login action |
| Admin Login | `/admin/login` | Start admin session | Phone, password, submit | Pending submit | None. | Generic error | Redirect if already admin |

## 10. Business Rules

Phone is the unique login identity under A-005. Password hashes and sessions never reach the client. Customer and admin sessions are distinct scopes. No endpoint creates an admin. Resource owners are always derived from the authenticated session.

## 11. Edge Cases

Duplicate normalized phones, weak/oversized passwords, brute-force attempts, session fixation, expired/revoked session, customer attempting admin routes, admin attempting customer-only data, concurrent bootstrap, and cookie/CSRF failure.

## 12. Dependencies

FND database/HTTP/config contracts and UI form/shell state contracts.

## 13. Assumptions and TODOs

> **ASSUMPTION A-005:** normalize unique customer/admin phone numbers to Egyptian `+20` E.164.  
> **TODO A-005:** confirm whether non-Egyptian numbers are required.
