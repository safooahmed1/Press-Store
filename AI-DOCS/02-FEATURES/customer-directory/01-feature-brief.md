# Feature Brief — Customer Directory

## 1. Identity

- **Feature ID:** `CUS`
- **Kind:** `business`
- **Parent Feature:** `None`
- **Owner:** `WS-CUS-BE`, `WS-CUS-FE`, `WS-CUS-INT`
- **Status:** `planned`

## 2. Summary

Provide an admin-only, read-only customer list and customer detail projection showing name, phone, order count, and orders without adding CRM/analytics scope.

## 3. Business Value

Gives the store enough context to support customers and review order history while preserving canonical AUTH/ORD ownership.

## 4. Roles and Users

Admin only.

## 5. Requirement Coverage

| Requirement ID | Summary | PRD Location |
|---|---|---|
| REQ-CUS-001 | Customer list fields and view action | §22 |
| REQ-CUS-002 | Customer detail with their orders | §22 |
| REQ-CUS-003 | No address/shipping/loyalty/scoring/advanced analytics | §22 |
| REQ-SCOPE-007 | No loyalty points | §2, §37 |

## 6. In Scope

Paginated admin read projections, responsive list/detail pages, empty/error/unauthorized states, query/index verification, and strict read-only use of AUTH/ORD contracts.

## 7. Out of Scope

Customer writes, deletion, impersonation, addresses, shipping, loyalty, scoring, segmentation, exports, messaging, or analytics.

## 8. User Flows

### Flow 1 — View customer and orders
1. Admin opens Customers.
2. List shows name, phone, order count, and View.
3. Admin opens a customer detail.
4. Detail shows name, phone, and that customer's order projections.

Alternate flows:
- No customers/orders show bounded empty states.

Exit states:
- Success: read-only operational context displayed.
- Cancelled: return to list.
- Failure: retry/not-found/unauthorized.

## 9. Screens and States

| Screen/View | Route/Entry | Purpose | Elements | Loading | Empty | Error | Unauthorized |
|---|---|---|---|---|---|---|---|
| Customers | `/admin/customers` | List customers | Name, phone, order count, View, pagination | Skeleton | No customers | Retry | Admin only |
| Customer Detail | `/admin/customers/:id` | Show identity and orders | Name, phone, order list | Skeleton | No orders | Retry/not found | Admin only |

## 10. Business Rules

CUS owns projection/query/API/UI, not Customer or Order data. It calls READ-AUTH-001 and READ-ORD-001 and performs no foreign writes. Only fields required by the PRD are exposed.

## 11. Edge Cases

Customer with zero/many orders, cancelled orders in admin projection, deleted/absent customer, pagination boundary, duplicate display names, and unauthorized probing.

## 12. Dependencies

AUTH admin guard and customer summary; ORD customer order projection; UI admin layout; FND HTTP.

## 13. Assumptions and TODOs

None.
