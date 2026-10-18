# Decisions — Application Foundation

## FND-DEC-001 — Single deployable modular monolith

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Follow project decisions DEC-004 through DEC-006: one Express deployment serves React/API, local storage is adapter-backed, and the existing JavaScript/Vite base remains.
- **Rationale:** Matches user choices and the PRD's simplicity/Hostinger constraints.
- **Alternatives:** Separate frontend/backend deployments, object storage, Docker, TypeScript migration.
- **Consequences:** Same-origin security is simpler; upload persistence and Hostinger runtime must be verified.
- **Affected contracts/tasks:** FND-001, FND-004, FND-006; STO-FND-001.
