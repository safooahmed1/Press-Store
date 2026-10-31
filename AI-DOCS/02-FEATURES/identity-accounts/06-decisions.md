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
