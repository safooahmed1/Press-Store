# Acceptance Criteria — Admin Dashboard

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-ADM-001 — Admin shell exposes exactly the required areas

- **Requirements:** `REQ-ADM-001`, `REQ-ADM-004`
- **Given:** authenticated admin at desktop/tablet/mobile widths
- **When:** navigation, nested routes, mobile drawer, and logout are used
- **Then:** every required destination/current state/logout works accessibly and protected
- **Negative/edge behavior:** customer/anonymous access fails and no extra role/analytics destination appears
- **Evidence:** route/navigation/auth/responsive tests
- [ ] Passed

### AC-ADM-002 — Dashboard remains lightweight and truthful

- **Requirements:** `REQ-ADM-002`, `REQ-ADM-003`, `REQ-SCOPE-011`, `REQ-SCOPE-021`
- **Given:** empty and populated fixtures
- **When:** the dashboard loads
- **Then:** total products/orders/customers, ORD-defined attention, and bounded recent orders show accurate current values
- **Negative/edge behavior:** no revenue, charts, advanced reports, conversion/customer analytics, or invented partial values appear
- **Evidence:** projection/API/UI and scope inspection tests
- [ ] Passed

## 3. Cross-Feature Scenarios

Every sidebar route reaches its owner without ADM editing owner files; counts match CAT/ORD/CUS contracts; session expiry clears protected view.

## 4. Security and Permission Scenarios

All routes/API require admin, no private dashboard data remains visible after logout/session expiry, and responses exclude unnecessary detail.

## 5. Failure and Recovery Scenarios

Dependency/API failure gives explicit retry/unavailable state; empty data shows zeros/empty lists; logout failure does not pretend the server session ended.

## 6. Accessibility and Responsive Scenarios

Drawer focus/escape/return, current-page semantics, card/list reading order, touch targets, keyboard navigation, and no small-screen overflow pass.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Integration | `npm run test:integration -- admin-dashboard` | yes | metrics/auth/dependency cases pass |
| UI | dashboard/nav component/a11y/responsive tests | yes | Required states pass |
| Scope inspection | Verify no revenue/chart/analytics code or endpoint | yes | None found |
| Lint/build | `npm run lint && npm run build` | yes | Exit 0 |
