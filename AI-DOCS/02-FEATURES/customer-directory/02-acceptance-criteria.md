# Acceptance Criteria — Customer Directory

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-CUS-001 — Admin list/detail is correct and bounded

- **Requirements:** `REQ-CUS-001`, `REQ-CUS-002`
- **Given:** customers with zero/multiple/cancelled orders
- **When:** admin pages and APIs paginate/list/open detail
- **Then:** required fields and accurate order counts/projections appear without N+1 queries
- **Negative/edge behavior:** missing customer is safe not-found and no write action is exposed
- **Evidence:** projection/API/UI tests and query inspection
- [ ] Passed

### AC-CUS-002 — CRM scope and privacy stay excluded

- **Requirements:** `REQ-CUS-003`, `REQ-SCOPE-007`
- **Given:** admin or unauthorized callers
- **When:** customer APIs/UI are inspected
- **Then:** only name, phone, order count/orders appear for admin and no loyalty/address/scoring/analytics behavior exists
- **Negative/edge behavior:** customer/anonymous requests fail without leaking directory data
- **Evidence:** authorization/schema/UI inspection tests
- [ ] Passed

## 3. Cross-Feature Scenarios

Counts/details match ORD's canonical admin-visible order projection; names/phones match AUTH; no direct table write occurs.

## 4. Security and Permission Scenarios

AUTH-AUTH-002 is mandatory, responses are bounded, and logs avoid full customer phone where unnecessary.

## 5. Failure and Recovery Scenarios

AUTH/ORD projection failure returns a safe retry state without partial misleading counts.

## 6. Accessibility and Responsive Scenarios

List becomes usable cards/rows on small screens; View actions, pagination, headings, and order list are keyboard accessible.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Integration | `npm run test:integration -- customers` | yes | projection/auth/pagination cases pass |
| UI | customer directory component/responsive tests | yes | Required states pass |
| Query sanity | Inspect representative list/detail query count/plan | yes | Bounded, indexed behavior |
| Lint/build | `npm run lint && npm run build` | yes | Exit 0 |
