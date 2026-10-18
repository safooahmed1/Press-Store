# Project Roadmap

## 1. Delivery Principles

Freeze foundation and cross-feature contracts before parallel feature work. Implement one authorized task at a time per workstream. Merge owners before consumers, verify after every merge, and keep all remote actions manual.

## 2. Ordered Features

| Order | Feature | Kind | Depends On | Parallel With | Exit Condition |
|---:|---|---|---|---|---|
| 1 | FND — Application Foundation | platform | None | None | Runtime, database, API/error, storage, test, and integration seams are frozen |
| 2 | UI — Design System and App Shell | shared | FND | AUTH core after FND contracts freeze | Responsive shell and shared visual primitives pass checks |
| 3 | AUTH — Identity and Accounts | shared | FND, UI contract | UI visual/primitives work | Customer/admin sessions and isolation pass security scenarios |
| 4 | CAT — Catalog and Discovery | business | FND, UI, AUTH admin guard | SET | Catalog CRUD, availability, product views, and filters pass |
| 5 | SET — Store Settings | shared | FND, AUTH | CAT | Store/contact/payment settings contracts pass |
| 6 | HOME — Homepage Merchandising | business | UI, CAT, AUTH | CART | Public sections and admin merchandising pass limits/order checks |
| 7 | CART — Persistent Cart | business | AUTH, CAT, UI | HOME | Account cart persists and rejects unavailable variants |
| 8 | ORD — Checkout, Payments, and Orders | business | CART, CAT, SET, AUTH, UI | Customer and admin sub-workstreams after order-core freeze | Quote, atomic creation, manual payment, history, operations, and expiry pass |
| 9 | CUS — Customer Directory | business | AUTH, ORD | None on canonical customer/order writes | Admin-only list/detail projections pass |
| 10 | ADM — Admin Dashboard | business | AUTH, CAT, ORD, CUS, UI | None during final composition | Sidebar, lightweight metrics, and final route composition pass |

## 3. Milestones

1. **Foundation freeze:** FND, UI, and AUTH contracts merge.
2. **Commerce core:** CAT, SET, HOME, and CART merge.
3. **Transaction flow:** ORD core and its customer/admin workstreams integrate and all checkout/payment/order scenarios pass.
4. **Operations:** CUS and ADM merge.
5. **Release candidate:** full build, responsive/security smoke tests, Hostinger runbook, and documentation validator pass.

## 4. Critical Path

`FND → AUTH + UI → CAT → CART → ORD → CUS → ADM → release gate`.

## 5. Release Gates

- All requirement rows have verified evidence.
- All features report `FEATURE <ID> COMPLETE — MERGE READY` before explicit merges.
- Database migration, authentication, payment, cancellation, responsive, and production build scenarios pass.
- Deployment credentials and Hostinger runtime compatibility are confirmed without exposing secrets.
- User explicitly authorizes merge, push/PR, and deployment actions.
