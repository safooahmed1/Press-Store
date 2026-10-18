# API Rules

## 1. Scope

Applies to every `/api/v1` endpoint, feature router, request schema, DTO, and external link integration.

## 2. Required Patterns

- Use plural REST resources, standard methods/statuses, JSON except validated multipart image upload, and explicit request/response schemas.
- Success envelope: `{ "data": ..., "meta": ... }`; omit `meta` when unused.
- Error envelope: `{ "error": { "code": "STABLE_CODE", "message": "safe message", "fieldErrors": {}, "requestId": "..." } }`.
- Pagination uses bounded `page` and `pageSize` with total metadata. Filtering uses documented query keys and server-side allowlists.
- Mutation authentication, authorization, CSRF protection, validation, and transaction boundaries execute server-side.
- Use an `Idempotency-Key` for order creation; replay returns the original order for the same customer/payload.
- Return ETags/version checks or conflict errors where simultaneous admin edits can overwrite critical state.

## 3. Prohibited Patterns

- Unversioned endpoints, request-provided customer ownership, stack traces, raw SQL errors, mass assignment, arbitrary filter/sort fields, unbounded lists, or duplicate endpoint definitions in consumers.

## 4. Conventions

Resource IDs use path parameters; filtering/pagination use query parameters. Timestamps are ISO 8601 UTC. Money is integer EGP minor units in transport fields ending `Minor`. Stable error codes include `VALIDATION_FAILED`, `AUTH_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VARIANT_UNAVAILABLE`, and feature-specific documented codes.

## 5. Security and Failure Handling

Same-origin is the production default. Restrict CORS/origins, require credentials intentionally, apply CSRF to cookie-authenticated mutations, rate-limit auth endpoints, cap bodies/uploads, sanitize URLs, and return 404/403 without leaking private resource existence.

## 6. Testing and Verification

Contract tests cover success, validation, unauthorized, forbidden, not-found, conflict, retry/idempotency, and pagination boundaries. Verify API error envelopes and no sensitive fields in representative responses.

## 7. Exceptions and Change Gate

Breaking contract changes require an owner decision, all named consumer updates, compatibility/migration plan, and user approval. Additive changes still require contract and verification-matrix updates.
