# Acceptance Criteria — Application Foundation

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-FND-001 — Modular runtime boots

- **Requirements:** `REQ-FND-001`, `REQ-FND-002`, `REQ-FND-010`, `REQ-FND-025`
- **Given:** valid local configuration
- **When:** client development and server production modes start
- **Then:** feature manifests load, `/api/v1/health` responds, and non-API production routes serve the React application
- **Negative/edge behavior:** invalid configuration fails startup before traffic
- **Evidence:** focused startup/integration tests and production-mode smoke command
- [ ] Passed

### AC-FND-002 — Persistence and errors are safe

- **Requirements:** `REQ-FND-012`, `REQ-FND-021`, `REQ-FND-022`, `REQ-FND-023`, `REQ-FND-027`
- **Given:** empty and upgraded test databases
- **When:** migrations, transaction tests, invalid requests, and constraint failures run
- **Then:** schema is deterministic, transactions roll back, queries are parameterized, and errors use the canonical envelope
- **Negative/edge behavior:** raw SQL/internal errors never reach clients
- **Evidence:** migration and API integration test output
- [ ] Passed

### AC-FND-003 — Upload storage is bounded

- **Requirements:** `REQ-FND-018`, `REQ-FND-026`
- **Given:** valid and malicious image fixtures
- **When:** the storage adapter receives them
- **Then:** valid images get generated safe paths and invalid/oversized/path-traversal input is rejected
- **Negative/edge behavior:** compensation removes orphaned newly written files
- **Evidence:** storage adapter tests
- [ ] Passed

### AC-FND-004 — Release shape is Hostinger-compatible

- **Requirements:** `REQ-FND-013`, `REQ-FND-024`, `REQ-FND-029`
- **Given:** a clean checkout and production-like configuration
- **When:** install, lint, tests, build, and start run
- **Then:** one Express process serves the build/API without Docker/VPS assumptions or client secrets
- **Negative/edge behavior:** missing database/session/upload configuration stops release
- **Evidence:** commands, build output summary, and runbook smoke evidence
- [ ] Passed

## 3. Cross-Feature Scenarios

Every feature router is discoverable without editing another feature; transport and database errors retain the same shape across owners.

## 4. Security and Permission Scenarios

Body limits, origin/CSRF hooks, safe errors, config isolation, parameterized query interface, upload validation, and secret-free client bundle are verified.

## 5. Failure and Recovery Scenarios

Database outage, migration failure, upload failure, invalid configuration, and unhandled route failure all fail safely with documented recovery.

## 6. Accessibility and Responsive Scenarios

None. Foundation exposes no end-user UI beyond error infrastructure; UI owns presentation.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Lint | `npm run lint` | yes | Exit 0 |
| Unit tests | `npm run test -- foundation` | yes | Exit 0 |
| Integration | `npm run test:integration -- foundation` | yes | Empty/upgraded DB and HTTP cases pass |
| Build | `npm run build` | yes | Client and server production artifacts build |
| Production smoke | Documented local production-mode start plus health/SPA/API probes | yes | One process serves all expected paths |
