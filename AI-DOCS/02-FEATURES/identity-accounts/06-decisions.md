# Decisions — Identity and Accounts

## AUTH-DEC-001 — Database-backed cookie sessions

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Apply project DEC-001: MySQL-backed Secure HttpOnly sessions and environment-driven single-admin bootstrap.
- **Rationale:** User confirmed secure sessions and separate admin authentication without unnecessary infrastructure.
- **Alternatives:** Client-stored JWT, public admin registration, Redis sessions.
- **Consequences:** Session cleanup, cookie/CSRF verification, and database availability are required.
- **Affected contracts/tasks:** AUTH-001 through AUTH-005; API-AUTH-001/002; AUTH-AUTH-001/002.
