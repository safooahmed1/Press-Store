# Testing Rules

## 1. Scope

Applies to unit, component, integration, end-to-end, security, performance sanity, manual, and documentation validation.

## 2. Required Patterns

- Unit-test pure money, discount, phone, state-transition, expiry, and validation logic at its owner.
- Component-test observable UI states and interactions without re-testing implementation details.
- Integration-test Express routes with an isolated MySQL database and real constraints/transactions.
- Keep deterministic fixtures owned by features; use unique phones/order numbers and controlled UTC time.
- Add cross-feature scenarios for auth isolation, catalog-to-cart availability, cart-to-order transaction, settings-to-checkout payment display, payment verification, and expiry.
- Each task records exact commands and observed results; skipped/unavailable checks remain visible blockers when required.

## 3. Prohibited Patterns

- Mocking away the rule under test, shared mutable production-like data, tests depending on execution order, false success evidence, snapshots for complex business behavior, or marking `done` with a failing required check.

## 4. Conventions

Repository scripts should converge on `npm run lint`, `npm run test`, `npm run test:integration`, and `npm run build`; exact scripts are established by FND tasks. Test names use Given/When/Then intent. One task may add the minimum tests needed for its acceptance criteria.

## 5. Security and Failure Handling

Use test-only secrets/databases/uploads. Never point automated tests at production. Assert authorization failures, data isolation, safe errors, CSRF/session behavior, SQL injection resistance through parameterization, and malicious upload rejection.

## 6. Testing and Verification

Task completion requires focused checks plus lint and any matrix-required broader checks. Feature completion requires the feature suite and named cross-feature scenarios. Release requires all integration scenarios, production build, migration dry run, responsive/security smoke checks, and the documentation validator.

## 7. Exceptions and Change Gate

If automation is impossible, document why, exact manual procedure, result artifact, and residual risk. Waiving a required release check requires explicit user approval and remains a visible limitation.
