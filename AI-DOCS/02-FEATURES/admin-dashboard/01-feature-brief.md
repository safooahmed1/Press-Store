# Feature Brief — Admin Dashboard

## 1. Identity

- **Feature ID:** `ADM`
- **Kind:** `business`
- **Parent Feature:** `None`
- **Owner:** `WS-ADM-01`
- **Status:** `planned`

## 2. Summary

Provide the protected responsive admin navigation and a lightweight operational dashboard with only the approved counts, attention orders, and recent orders.

## 3. Business Value

Gives the single admin a clear daily starting point and access to every management area without becoming an analytics product.

## 4. Roles and Users

Admin only.

## 5. Requirement Coverage

| Requirement ID | Summary | PRD Location |
|---|---|---|
| REQ-ADM-001 | Required sidebar destinations and Logout | §15 |
| REQ-ADM-002 | Lightweight counts, attention, and recent orders | §16 |
| REQ-ADM-003 | No revenue/advanced/conversion/customer analytics | §16 |
| REQ-ADM-004 | Admin dashboard usable on small screens | §33 |
| REQ-SCOPE-011, REQ-SCOPE-021 | No advanced analytics or revenue dashboard | §2, §37 |

## 6. In Scope

Admin route/navigation composition, logout entry, dashboard read projection, counts/recent/attention cards/list, responsive layout, and integration verification.

## 7. Out of Scope

Revenue, charts, reports, conversion/customer analytics, business intelligence, configurable widgets, duplicated feature pages, or background analytics pipelines.

## 8. User Flows

### Flow 1 — Start daily administration
1. Admin logs in and reaches Dashboard.
2. Dashboard loads approved counts, attention orders, and recent orders.
3. Sidebar/drawer opens the requested feature area or logs out.

Alternate flows:
- Individual metric dependency failure produces a safe bounded retry state, not invented data.

Exit states:
- Success: destination opens in protected admin shell.
- Cancelled: mobile drawer closes with focus restored.
- Failure: retry/session-expired state.

## 9. Screens and States

| Screen/View | Route/Entry | Purpose | Elements | Loading | Empty | Error | Unauthorized |
|---|---|---|---|---|---|---|---|
| Admin Dashboard | `/admin` | Operational overview | Three totals, attention orders, recent orders | Card/list skeletons | Zero values/no orders | Retry | Admin login/forbidden |
| Admin navigation | all `/admin/**` | Access management areas | Required links, current state, logout | Session shell | None. | Session error | Admin login |

## 10. Business Rules

Metrics are current bounded projections from owners, not a warehouse. Attention criteria are defined by ORD (pending electronic payment and actionable pickup states). Navigation destinations are fixed to the PRD list. No chart/revenue computation exists.

## 11. Edge Cases

Zero counts, many recent orders, partial dependency failure, expired session, mobile drawer, long labels/RTL content, and current-route highlighting on nested detail pages.

## 12. Dependencies

AUTH admin session/logout; CAT product count; ORD order count/recent/attention; CUS customer count; UI admin layout.

## 13. Assumptions and TODOs

None.
