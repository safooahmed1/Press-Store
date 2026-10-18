# Coding Rules

## 1. Scope

Applies to all JavaScript, JSX, configuration, scripts, and tests. Preserve the existing JavaScript React/Vite base and the modular-monolith boundaries.

## 2. Required Patterns

- Organize by feature, then layer inside each feature.
- Keep routes/controllers thin; business rules live in services and SQL in repositories.
- Keep React pages compositional; move server state to React Query, client-only state to Zustand only when shared, and focused logic to hooks.
- Return explicit results or throw stable application errors; handle async failures at boundaries.
- Read server environment values only through validated `server/src/config/`.
- Use feature manifests/exports so parallel features do not edit central registries.
- Keep components focused; use 20–30 lines as a target and review components around 50 lines for extraction without splitting blindly.

## 3. Prohibited Patterns

- Cross-feature repository/table access, circular imports, business rules in JSX/controllers, secret literals, debug logs, duplicate money/availability rules, speculative abstractions, or barrel files that hide cycles.
- New frameworks, TypeScript migration, ORMs, global stores, or overlapping utility libraries without an approved decision.
- Editing build output, runtime uploads, or generated coverage as source.

## 4. Conventions

Use `camelCase` values/functions, `PascalCase` React components/classes, `UPPER_SNAKE_CASE` constants, and names from the glossary. Prefer named exports for feature contracts. Format/lint with repository scripts. Comments explain decisions and invariants, not obvious syntax.

## 5. Security and Failure Handling

Never log credentials, cookies, password hashes, full sensitive payment inputs, or raw internal exceptions. Validate at every trust boundary, fail closed on authorization, and keep cleanup/compensation explicit for database plus file operations.

## 6. Testing and Verification

Every business rule receives unit or integration coverage at its owner. Run focused tests, `npm run lint`, and the relevant broader test/build gate. Review the entire diff for cross-owner imports and stale debug code.

## 7. Exceptions and Change Gate

Document an exception in the owner feature's `06-decisions.md` with rationale, alternatives, scope, and user approval when it changes architecture or an approved technology.
