# Observability Rules

## 1. Scope

Applies to application logs, request correlation, health signals, operational job evidence, security events, error reporting, and data retention.

## 2. Required Patterns

- Emit structured server logs with timestamp, level, environment, request ID, route template, status, duration, and stable error code.
- Propagate/request a correlation ID and return it in safe error responses.
- Record startup, migration, admin bootstrap outcome, authentication anomalies, payment verification, prepared/delivered/cancelled transitions, and expiry-job summary.
- Expose minimal liveness/readiness health without secrets or detailed internals.
- Keep client logging minimal; surface actionable messages and send only approved diagnostics if a future sink is added.

## 3. Prohibited Patterns

- Passwords, hashes, cookies, session IDs, environment secrets, full payment numbers, full request bodies, uncontrolled customer PII, raw SQL, or stack traces in client responses. No analytics platform or external telemetry service is added in V1.

## 4. Conventions

Use stable event names such as `auth.login.failed`, `order.payment.verified`, and `order.expiry.completed`. Redact phone values except a minimal masked suffix when operationally necessary. Define retention using Hostinger capabilities before production.

## 5. Security and Failure Handling

Logging failure must not expose data or corrupt a transaction. Sensitive admin actions need enough audit context to investigate without storing credentials. Repeated job failures must be visible through process logs and operational checks.

## 6. Testing and Verification

Test request ID propagation, safe error logging, sensitive-value redaction, health behavior during database failure, and one representative log per critical order transition/job. Inspect production build/config for absent external analytics.

## 7. Exceptions and Change Gate

Adding external monitoring, analytics, tracing, or alerting is a scope and privacy decision requiring owner documentation and explicit approval.
