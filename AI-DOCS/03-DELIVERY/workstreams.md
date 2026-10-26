# Workstreams

## 1. Workstream Registry

| Workstream ID | Parent Feature | Objective | Task IDs | Allowed Paths | Forbidden Paths | Depends On | Parallel With | Branch | Merge Target | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| WS-FND-01 | FND | Freeze runtime, DB/HTTP/storage/test/deployment platform | FND-001, FND-002, FND-003, FND-004, FND-005, FND-006 | FND paths in blueprint; root build config; FND-002 exact bounded additions in FND contracts §2 | `src/features/**`, business feature server paths, `src/shared/ui/**` | None | None until contracts freeze | `feature/FND-application-foundation` | `main` | in-progress; FND-001 done; FND-002 in progress; FND-003 next after completion review |
| WS-UI-01 | UI | Deliver visual system and responsive shared shells | UI-001, UI-002, UI-003, UI-004 | `src/shared/ui/**`, `src/styles/**`, approved assets | server/business feature paths | FND-001/FND-003 | WS-AUTH-01 core after shared boundaries freeze | `feature/UI-design-system-app-shell` | `main` | planned |
| WS-AUTH-01 | AUTH | Deliver identities, sessions, auth UI, and guards | AUTH-001, AUTH-002, AUTH-003, AUTH-004, AUTH-005 | AUTH paths in blueprint | cart/order/catalog/settings paths | FND-002/FND-003; UI-002 for UI | WS-UI-01 non-overlapping work | `feature/AUTH-identity-accounts` | `main` | planned |
| WS-CAT-01 | CAT | Deliver canonical catalog, discovery, and admin CRUD | CAT-001, CAT-002, CAT-003, CAT-004, CAT-005, CAT-006 | CAT paths in blueprint | HOME/CART/ORD paths; platform internals | FND; AUTH guard; UI primitives | WS-SET-01 after AUTH guard | `feature/CAT-catalog-discovery` | `main` | planned |
| WS-SET-01 | SET | Deliver store/payment settings and projections | SET-001, SET-002, SET-003 | SET paths in blueprint | order/footer shared component/auth paths | FND; AUTH guard; UI | WS-CAT-01 | `feature/SET-store-settings` | `main` | planned |
| WS-HOME-01 | HOME | Deliver public/admin merchandising within limits | HOME-001, HOME-002, HOME-003, HOME-004 | HOME paths in blueprint | CAT files/tables; shared UI/storage internals | CAT contracts; FND storage; AUTH/UI | WS-CART-01 | `feature/HOME-homepage-merchandising` | `main` | planned |
| WS-CART-01 | CART | Deliver persistent customer cart and order handoff | CART-001, CART-002, CART-003, CART-004 | CART paths in blueprint only | CAT/ORD/AUTH tables and source | AUTH, CAT, UI; UI-CAT-001 and APP-FND-001 frozen | WS-HOME-01 | `feature/CART-persistent-cart` | `main` | planned |
| WS-ORD-01 | ORD | Freeze order/payment domain and atomic creation | ORD-001, ORD-002, ORD-003 | order core/checkout server paths and core tests | order customer/admin UI/jobs; dependency owner paths | CART, CAT, SET, AUTH, FND | None within ORD until merged | `work/WS-ORD-01-order-core` | `feature/ORD-checkout-payments-orders` | planned |
| WS-ORD-02 | ORD | Deliver checkout and customer order experiences | ORD-004, ORD-005 | order checkout/customer client paths and customer API paths/tests | admin order/job/core files | WS-ORD-01 merged; UI | WS-ORD-03 | `work/WS-ORD-02-customer-orders` | `feature/ORD-checkout-payments-orders` | planned |
| WS-ORD-03 | ORD | Deliver admin actions/UI, expiry, and full ORD verification | ORD-006, ORD-007, ORD-008 | order admin/job paths and disjoint admin/job tests | checkout/customer UI; core schema except approved transition fixes | WS-ORD-01 merged; UI/FND job | WS-ORD-02 | `work/WS-ORD-03-admin-operations` | `feature/ORD-checkout-payments-orders` | planned |
| WS-CUS-01 | CUS | Deliver read-only admin customer directory | CUS-001, CUS-002, CUS-003 | CUS paths in blueprint | AUTH/ORD source/tables | AUTH and READ-ORD-001 | None on canonical dependencies | `feature/CUS-customer-directory` | `main` | planned |
| WS-ADM-01 | ADM | Deliver admin navigation/dashboard and final admin gate | ADM-001, ADM-002, ADM-003 | ADM paths in blueprint | owner feature pages/tables; shared UI internals | AUTH, UI, CAT, ORD, CUS | None on final composition | `feature/ADM-admin-dashboard` | `main` | planned |

## 2. Contract Freeze Points

1. FND-003 freezes HTTP/error/manifest contracts; FND-002/FND-004 freeze DB/storage.
2. AUTH-005 freezes customer/admin guards and safe customer read.
3. CAT-006 freezes product/variant/price/availability, curation, and product-count reads.
4. SET-003 freezes selected payment/contact projections.
5. CART-002 freezes locked read/exact clear for ORD.
6. ORD-003 freezes create/quote; ORD-006 freezes admin/read projections before WS-ORD-02/03 consumers finish.
7. CUS-003 freezes customer-count projection before ADM-002.

## 3. Ownership Conflict Check

All normal feature workstreams have exclusive feature paths. UI and FND shared paths have single owners. ORD uses an integration branch: WS-ORD-01 writes core paths first; after merge, WS-ORD-02 and WS-ORD-03 receive disjoint client/server/test subpaths. CAT emits UI-CAT-001 through the FND-owned APP-FND-001 registry; CART registers its handler entirely within CART paths. HOME invokes CAT's curation command without CAT writes. No two listed parallel workstreams own the same writable file family.

## 4. Developer Assignment Notes

Assign one developer/agent per workstream. Refresh from the documented parent only at workstream start. Implement one ready task per user authorization, commit it, report, and stop. Do not treat a developer assignment as merge, push, PR, or deployment authorization.

### 2026-10-23 — Bounded FND-002 exception

FND-DEC-002 permits only FND-002 backend development against reviewed baseline `740c22b2fb3be6d1b5bd0080bbf42109e238c515`; FND-001 remains `blocked` and its frontend completion belongs to another developer. The current instruction is documentation only. No shared configuration, composition, tooling, or delivery file may be written concurrently. Existing branch/merge strategy, other dependency gates, and completion requirements remain unchanged; no completion commit is authorized.
