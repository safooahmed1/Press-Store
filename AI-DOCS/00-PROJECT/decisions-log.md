# Project Decisions Log

| Decision ID | Status | Date | Decision | Rationale | Affected Docs |
|---|---|---|---|---|---|
| DEC-001 | approved | 2026-10-18 | Use MySQL-backed server sessions delivered in Secure HttpOnly same-origin cookies; bootstrap the single admin from environment-provided credentials and provide no admin registration. | User-confirmed secure, revocable authentication with clear admin separation. | architecture, auth-security-rules, AUTH contracts |
| DEC-002 | approved | 2026-10-18 | Wallet EG and InstaPay orders start payment-pending and remain unconfirmed until the admin verifies payment externally; Wallet stores only the entered sending wallet number and no receipt upload. | User requested a simple manual workflow without extra proof storage. | PAY and ORD contracts |
| DEC-003 | approved | 2026-10-18 | Paid orders never auto-expire and remain available for pickup until delivered; only unpaid Cash on Pickup orders expire. | User clarified pickup retention behavior. | ORD contracts, database rules |
| DEC-004 | approved | 2026-10-18 | Deploy one Express application that serves the built React client and `/api/v1`. | User selected the simplest Hostinger-compatible topology. | architecture, deployment-rules |
| DEC-005 | approved | 2026-10-18 | Store uploaded images on persistent Hostinger local storage for V1 behind a storage adapter boundary. | User approved local storage for now while preserving future migration. | FND/CAT/HOME contracts |
| DEC-006 | approved | 2026-10-18 | Preserve the existing JavaScript React/Vite repository rather than introducing TypeScript. | Avoid an unrequested stack change and retain the current scaffold. | source-tree-blueprint, coding-rules |
