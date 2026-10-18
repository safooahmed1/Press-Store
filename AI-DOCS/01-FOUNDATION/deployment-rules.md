# Deployment Rules

## 1. Scope

Applies to Hostinger build/runtime shape, environments, configuration, migrations, uploads, health checks, rollback, backup, and release authorization.

## 2. Required Patterns

- Build React with Vite and serve `dist/` from the same Express process that exposes `/api/v1`.
- Use a Hostinger-supported maintained Node LTS and MySQL version; bind the provider-supplied port.
- Validate required environment configuration at startup and fail before accepting traffic when invalid.
- Run reviewed migrations as an explicit release step before switching traffic; never auto-mutate schema silently on ordinary startup.
- Persist uploads outside build output and confirm Hostinger persistence/backup behavior.
- Expose a non-sensitive health/readiness endpoint covering process and safe database readiness.
- Back up database and uploads before risky release/migration; document rollback compatible with schema changes.

## 3. Prohibited Patterns

- Docker, VPS assumptions, process-local sessions, ephemeral upload paths, secrets in source/client, serving directory indexes, deploy-on-merge without explicit policy, or unreviewed production migrations.

## 4. Conventions

Environments are local, test, optional staging, and production. Remote sync is manual. Default branch is `main`; feature/work branches follow `branch-plan.md`. Build and start commands are owned by FND-006 and must be recorded in the runbook.

## 5. Security and Failure Handling

Require HTTPS, Secure cookies, production origin allowlist, least-privilege MySQL credentials, protected upload directory, and sanitized startup logs. On failed migration/build/health check, stop release and restore the prior app/schema-compatible version.

## 6. Testing and Verification

Verify clean install, lint/tests, production build, local production-mode start, SPA fallback excluding `/api`, health endpoint, migrations from empty and prior schema, upload persistence/read, session persistence across restart, and documented backup/rollback.

## 7. Exceptions and Change Gate

Deployment, push, PR, merge, DNS, production database, or release actions require explicit user authorization. Hosting topology or external storage changes require a project decision.
