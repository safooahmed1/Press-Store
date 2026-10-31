# Change Log — Identity and Accounts

### 2026-10-31 — AUTH-004 frontend authentication screens

- Added feature-manifest routes for customer login, registration, Account, and separate admin login. The feature-owned API adapter targets the frozen real endpoints; fixture adapters live only under AUTH tests.
- Added Egyptian `01xxxxxxxxx`/`+201xxxxxxxxx` client normalization, safe canonical error handling, React Query session/mutation state, pending submit protection, focused validation, safe account unauthorized recovery, and customer logout cache clearing.
- Used the existing editorial Press Store tokens and primitives without changing shared UI or server code. Browser DOM QA recorded no horizontal overflow at 375, 768, and 1440px; the 375px mobile composition covers the constrained equivalent of a zoomed tablet layout.
- AUTH-004 is done as fixture-only FE work and `WS-AUTH-FE` is `ready-for-integration`; AUTH remains open until the real backend and AUTH-005 security gate pass.
