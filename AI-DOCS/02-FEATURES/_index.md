# Feature Index

| Feature ID | Feature | Kind | Parent | Owner Scope | Depends On | Status |
|---|---|---|---|---|---|---|
| FND | Application Foundation | platform | None | Runtime, database/API/storage primitives, build, test harness | None | planned |
| UI | Design System and App Shell | shared | None | Visual tokens, reusable UI, customer/admin shell primitives | FND | planned |
| AUTH | Identity and Accounts | shared | None | Customer/admin identity, sessions, account UI, fixed guards | FND, UI | planned |
| CAT | Catalog and Discovery | business | None | Products, variants, images, categories, brands, shop/admin catalog | FND, UI, AUTH | planned |
| SET | Store Settings | shared | None | Store/contact/payment settings and public projections | FND, AUTH | planned |
| HOME | Homepage Merchandising | business | None | Hero, banners, curated products, category projection, admin homepage | UI, CAT, AUTH | planned |
| CART | Persistent Cart | business | None | Customer cart, cart items, variant/price validation, cart UI | AUTH, CAT, UI | planned |
| ORD | Checkout, Payments, and Orders | business | None | Checkout, order/payment state, customer/admin order operations, expiry | CART, CAT, SET, AUTH, UI | planned |
| CUS | Customer Directory | business | None | Admin-only customer list/detail projections | AUTH, ORD, UI | planned |
| ADM | Admin Dashboard | business | None | Admin navigation, lightweight metrics, operational overview | AUTH, CAT, ORD, CUS, UI | planned |

Each feature owns exactly the routes, tables/write authority, source paths, and contracts in its `03-technical-contracts.md`. Cross-feature consumers use only named exposed contracts.
