# Acceptance Criteria — Persistent Cart

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-CART-001 — Cart persists and remains self-owned

- **Requirements:** `REQ-CART-001`, `REQ-CART-002`, `REQ-CART-003`
- **Given:** two customers and an available variant
- **When:** one customer adds/updates, logs out/in, and reads the cart
- **Then:** their variant/quantity/current price persists and the other customer cannot access it
- **Negative/edge behavior:** invalid/duplicate quantities merge or reject deterministically without duplicate rows
- **Evidence:** API/database isolation and UI tests
- [ ] Passed

### AC-CART-002 — Availability is revalidated without stock mutation

- **Requirements:** `REQ-CART-004`, `REQ-CART-005`
- **Given:** a cart item whose variant or price changes
- **When:** cart/checkout readiness is requested
- **Then:** current price is shown, unavailable item is clearly blocked, and no stock value is read or decremented
- **Negative/edge behavior:** stale client price/availability never overrides CAT
- **Evidence:** CAT/CART integration tests
- [ ] Passed

## 3. Cross-Feature Scenarios

CAT price/availability changes update cart projection; ORD locks and consumes READ-CART-001/CMD-CART-001 transactionally.

## 4. Security and Permission Scenarios

Anonymous/admin/other customers cannot read or mutate a cart; customer ID always comes from session; CSRF applies to mutations.

## 5. Failure and Recovery Scenarios

Catalog unavailable, database conflict, network retry, and stale concurrent mutation preserve a consistent cart and show recovery action.

## 6. Accessibility and Responsive Scenarios

Quantity controls, remove confirmation, availability message, total, empty state, and checkout action work by keyboard and on mobile/tablet/desktop.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Unit | `npm run test -- cart` | yes | quantity/projection rules pass |
| Integration | `npm run test:integration -- cart` | yes | persistence/isolation/CAT cases pass |
| UI | cart component/responsive tests | yes | All required states pass |
| Lint/build | `npm run lint && npm run build` | yes | Exit 0 |
