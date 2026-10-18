# Requirements Index

## Status Values

`planned` · `in-progress` · `implemented` · `verified` · `blocked`

## Requirements

| Requirement ID | PRD Location | Type | Summary | Owner Feature | Task IDs | Status |
|---|---|---|---|---|---|---|
| REQ-FND-001 | §1 Project Overview | constraint | The application is simple to understand and maintain. | FND | FND-001, FND-003 | planned |
| REQ-FND-002 | §1 Project Overview | constraint | The core can accept future features without a rewrite. | FND | FND-001 | planned |
| REQ-FND-003 | §3 Frontend | constraint | The client uses React. | FND | FND-001 | planned |
| REQ-FND-004 | §3 Frontend | constraint | Styling uses Tailwind CSS. | UI | UI-001 | planned |
| REQ-FND-005 | §3 Frontend | constraint | HTTP calls use Axios. | FND | FND-003 | planned |
| REQ-FND-006 | §3 Frontend | constraint | Client-local state uses Zustand. | FND | FND-001 | planned |
| REQ-FND-007 | §3 Frontend | constraint | Server-state fetching uses React Query. | FND | FND-003 | planned |
| REQ-FND-008 | §3 Frontend | constraint | css-loader remains available where CSS modules/imports require it. | UI | UI-001 | planned |
| REQ-FND-009 | §3 Frontend | constraint | Hero carousel behavior uses Swiper. | HOME | HOME-002 | planned |
| REQ-FND-010 | §3 Backend | constraint | The backend uses Node.js and Express.js. | FND | FND-001, FND-003 | planned |
| REQ-FND-011 | §3 Backend and §28 | constraint | The backend exposes a clean REST API. | FND | FND-003 | planned |
| REQ-FND-012 | §3 Database | constraint | Persistent relational data uses MySQL. | FND | FND-002 | planned |
| REQ-FND-013 | §3 Hosting and §36 | operational | Production runs on Hostinger web-app hosting without a VPS. | FND | FND-006 | planned |
| REQ-FND-014 | §32 Code Organization | constraint | Responsibilities remain separated without unnecessary abstractions or dependencies. | FND | FND-001, FND-003 | planned |
| REQ-FND-015 | §32 Components | constraint | Components remain small and focused, using 20–30 lines as an ideal and about 50 as a review guideline. | UI | UI-002 | planned |
| REQ-FND-016 | §32 Pages | constraint | Page modules primarily compose sections and routing concerns rather than business logic. | UI | UI-003, UI-004 | planned |
| REQ-FND-017 | §32 Pages | constraint | Business logic lives in focused hooks, services, or utilities. | FND | FND-001 | planned |
| REQ-FND-018 | §34 Performance | operational | Images and asset sizes are optimized. | FND | FND-004, FND-006 | planned |
| REQ-FND-019 | §34 Performance | operational | The client avoids unnecessary rendering and data loading. | FND | FND-005 | planned |
| REQ-FND-020 | §34 Performance | operational | Database access uses efficient bounded queries and indexes. | FND | FND-002, FND-005 | planned |
| REQ-FND-021 | §30 Validation | security | Required fields and domain values are validated by the backend independently of the frontend. | FND | FND-003 | planned |
| REQ-FND-022 | §30 Error Handling | UX | Errors use consistent safe shapes and do not expose implementation details. | FND | FND-003 | planned |
| REQ-FND-023 | §35 Security Basics | security | Database operations use safe parameterized queries. | FND | FND-002 | planned |
| REQ-FND-024 | §35 Security Basics | security | Sensitive server configuration is never exposed to the client. | FND | FND-003, FND-006 | planned |
| REQ-FND-025 | User decision 2026-10-18 | constraint | Express serves the built React application and a same-origin `/api/v1` API as one deployable service. | FND | FND-001, FND-006 | planned |
| REQ-FND-026 | User decision 2026-10-18 | data | V1 uploads persist on Hostinger local storage behind a replaceable adapter. | FND | FND-004 | planned |
| REQ-FND-027 | §27 Database Requirements | data | Relational entities preserve required relationships and avoid duplicated mutable data. | FND | FND-002 | planned |
| REQ-FND-028 | §34 Performance | operational | No infrastructure is introduced solely for speculative optimization. | FND | FND-003 | planned |
| REQ-FND-029 | §38 Quality | operational | The repository remains modular, readable, and deployable on the selected Hostinger plan. | FND | FND-005, FND-006 | planned |
| REQ-FND-030 | §39 Implementation Principle | constraint | Every solution is the simplest correct solution with a clear reason to exist. | FND | FND-001, FND-003 | planned |
| REQ-UI-001 | §4 Visual Direction | UX | The storefront uses a modern minimal editorial fashion aesthetic with grid-based presentation and strong typography. | UI | UI-001, UI-002 | planned |
| REQ-UI-002 | §4 Brand Colors | UX | White is the primary background, black the structural/text color, and red the accent. | UI | UI-001 | planned |
| REQ-UI-003 | §4 Frontend Design | constraint | Visual implementation invokes `frontend-design` while preserving requirements, sections, colors, and responsiveness. | UI | UI-001, UI-004 | planned |
| REQ-UI-004 | §7.1 Navbar | functional | The navbar exposes primary store, account, and cart navigation. | UI | UI-003 | planned |
| REQ-UI-005 | §7.7 Footer | functional | The footer displays configured store contact and social information. | UI | UI-003 | planned |
| REQ-UI-006 | §33 Responsive Requirements | UX | Customer and admin layouts work on desktop, tablet, and mobile rather than shrinking desktop layouts. | UI | UI-004 | planned |
| REQ-UI-007 | §33 Responsive Requirements | UX | Product grids, navigation, filters, cart, checkout, dashboard, and forms have appropriate responsive compositions. | UI | UI-004 | planned |
| REQ-AUTH-001 | §5 User Types | security | The only account types are Customer and one Admin. | AUTH | AUTH-001, AUTH-003 | planned |
| REQ-AUTH-002 | §10 Customer Account | data | Customer records require first name, last name, phone number, and password credentials. | AUTH | AUTH-001, AUTH-002 | planned |
| REQ-AUTH-003 | §10 Login | functional | Customers log in with phone number and password. | AUTH | AUTH-002, AUTH-004 | planned |
| REQ-AUTH-004 | §10 Registration | functional | Customers register with first name, last name, phone number, and password. | AUTH | AUTH-002, AUTH-004 | planned |
| REQ-AUTH-005 | §10 Customer Account | non-goal | Customer registration and checkout do not require address or city data. | AUTH | AUTH-001, AUTH-004 | planned |
| REQ-AUTH-006 | §10 and §29 | security | Customer and admin authentication flows are separate. | AUTH | AUTH-002, AUTH-003 | planned |
| REQ-AUTH-007 | §5 Admin | security | Exactly one admin exists and no admin role or permission-management system is added. | AUTH | AUTH-003, AUTH-005 | planned |
| REQ-AUTH-008 | §29 Customer | security | A customer can access only their own account, cart, and orders. | AUTH | AUTH-005 | planned |
| REQ-AUTH-009 | §29 Admin | security | Dashboard routes and admin API operations require the admin session. | AUTH | AUTH-005 | planned |
| REQ-AUTH-010 | §35 Security Basics | security | Passwords use secure one-way hashing. | AUTH | AUTH-001, AUTH-005 | planned |
| REQ-AUTH-011 | §29 Authentication | functional | Customer and admin logout invalidates the active session. | AUTH | AUTH-002, AUTH-003 | planned |
| REQ-AUTH-012 | User decision 2026-10-18 | security | Authentication uses MySQL-backed sessions in Secure HttpOnly cookies. | AUTH | AUTH-001, AUTH-002, AUTH-003 | planned |
| REQ-AUTH-013 | User decision 2026-10-18 | security | The single admin is provisioned from protected environment input and has no public registration route. | AUTH | AUTH-003 | planned |
| REQ-AUTH-014 | §35 Security Basics | security | Authentication endpoints receive abuse controls and credentials are handled securely. | AUTH | AUTH-005 | planned |
| REQ-CAT-001 | §8.1 Product Information | data | A product stores name, brand, category, description, base price, discount percentage, images, flags, and available variants. | CAT | CAT-001, CAT-003 | planned |
| REQ-CAT-002 | §8.2 Product Images | data | Every product has one main image and zero to three additional images. | CAT | CAT-001, CAT-003 | planned |
| REQ-CAT-003 | §8.3 Product Variants | data | Product variants represent available color/size combinations without numeric stock quantities. | CAT | CAT-001 | planned |
| REQ-CAT-004 | §8.3 Product Variants | functional | Admin availability changes add or remove explicit color/size options. | CAT | CAT-003, CAT-005 | planned |
| REQ-CAT-005 | §8.3 Product Variants | UX | Customers see only currently available color/size purchase options and never a remaining quantity. | CAT | CAT-002, CAT-004 | planned |
| REQ-CAT-006 | §8.4 Product Discount | functional | Final product price is calculated from base price and per-product discount percentage. | CAT | CAT-001, CAT-002 | planned |
| REQ-CAT-007 | §8.5 Product Details | functional | Product details show gallery, brand, name, prices, description, selectors, quantity, and Add to Cart. | CAT | CAT-004 | planned |
| REQ-CAT-008 | §8.5 Product Details | non-goal | Product details do not expose a Buy Now action. | CAT | CAT-004 | planned |
| REQ-CAT-009 | §9 Filtering | functional | Shop filters products by category. | CAT | CAT-002, CAT-004 | planned |
| REQ-CAT-010 | §9 Filtering | functional | Shop filters products by brand. | CAT | CAT-002, CAT-004 | planned |
| REQ-CAT-011 | §9 Filtering | functional | Shop filters products by price. | CAT | CAT-002, CAT-004 | planned |
| REQ-CAT-012 | §9 Filtering | functional | Shop filters products by size. | CAT | CAT-002, CAT-004 | planned |
| REQ-CAT-013 | §9 Filtering | functional | Shop filters products by color. | CAT | CAT-002, CAT-004 | planned |
| REQ-CAT-014 | §9 Browsing | non-goal | V1 provides no global product search. | CAT | CAT-004 | planned |
| REQ-CAT-015 | §9 Browsing | non-goal | V1 provides no availability filter or sorting. | CAT | CAT-002, CAT-004 | planned |
| REQ-CAT-016 | §17 Admin Products | functional | Admin can list, create, edit, and delete products with the specified catalog fields. | CAT | CAT-003, CAT-005 | planned |
| REQ-CAT-017 | §18 Categories | functional | Admin can create, edit, and delete categories containing name and image. | CAT | CAT-001, CAT-003, CAT-005 | planned |
| REQ-CAT-018 | §19 Brands | functional | Admin can create, edit, and delete first-class brands assigned to products. | CAT | CAT-001, CAT-003, CAT-005 | planned |
| REQ-CAT-019 | §28 API Requirements | integration | Product, category, and brand resources expose standard REST operations where appropriate. | CAT | CAT-002, CAT-003 | planned |
| REQ-CAT-020 | §31 Order Integrity | security | Availability checking is centralized and rejects removed variants. | CAT | CAT-006 | planned |
| REQ-HOME-001 | §7 Home Page | UX | The homepage order is Navbar, Hero, Best Sellers, Banner 1, Categories, optional Banner 2, New Arrivals, Footer. | HOME | HOME-002 | planned |
| REQ-HOME-002 | §7.2 Hero | functional | The homepage presents one to three active hero slides in a carousel. | HOME | HOME-001, HOME-002 | planned |
| REQ-HOME-003 | §7.2 Hero | data | Each hero slide stores image, title, subtitle, button text, and button link. | HOME | HOME-001, HOME-003 | planned |
| REQ-HOME-004 | §23.1 Hero Slides | functional | Admin can create, edit, delete, and activate hero slides while preserving at least one and at most three active slides. | HOME | HOME-001, HOME-003 | planned |
| REQ-HOME-005 | §7.3 and §23.2 | functional | Admin manually selects at most eight Best Sellers and the section links to Shop. | HOME | HOME-001, HOME-002, HOME-003 | planned |
| REQ-HOME-006 | §7.4 Categories | functional | Homepage displays existing categories and links each to filtered products without duplicate category management. | HOME | HOME-002, HOME-003 | planned |
| REQ-HOME-007 | §7.5 and §23.5 | functional | Admin controls text and active state for at most two fixed promotion banner placements. | HOME | HOME-001, HOME-003 | planned |
| REQ-HOME-008 | §7.5 Promotion Banners | UX | Promotion banners initially use a red fixed-background visual direction. | HOME | HOME-002 | planned |
| REQ-HOME-009 | §7.6 and §23.3 | functional | Admin manually selects at most eight New Arrivals and the section links to Shop. | HOME | HOME-001, HOME-002, HOME-003 | planned |
| REQ-HOME-010 | §23 Admin Homepage | functional | Admin manages hero slides, selections, category use, and banners from one Homepage area. | HOME | HOME-003, HOME-004 | planned |
| REQ-CART-001 | §11 Cart | functional | An authenticated customer adds a product with selected color, size, and quantity to their cart. | CART | CART-001, CART-003 | planned |
| REQ-CART-002 | §11 Cart | data | The cart persists against the customer account across logout and return. | CART | CART-001, CART-004 | planned |
| REQ-CART-003 | §11 Cart | data | Cart items preserve product, selected variant, quantity, and current applicable price. | CART | CART-001, CART-002 | planned |
| REQ-CART-004 | §11 and §31 | security | Checkout revalidates every selected color/size combination against current availability. | CART | CART-002, CART-004 | planned |
| REQ-CART-005 | §31 Order Integrity | functional | No numeric inventory is decremented when a cart becomes an order. | CART | CART-002 | planned |
| REQ-PAY-001 | §12 Checkout | functional | Checkout creates store-pickup orders only and contains no shipping workflow. | ORD | ORD-002, ORD-003, ORD-004 | planned |
| REQ-PAY-002 | §12 Checkout | UX | Checkout uses stored account information and does not ask for the customer phone again. | ORD | ORD-004 | planned |
| REQ-PAY-003 | §12 Checkout | functional | Checkout review shows products, variants, quantities, discounts, total, and payment method. | ORD | ORD-002, ORD-004 | planned |
| REQ-PAY-004 | §12 Checkout | UX | Checkout communicates a 10–60 minute preparation window and approximately 30-minute readiness expectation. | ORD | ORD-004 | planned |
| REQ-PAY-005 | §12 Checkout | UX | Only Cash on Pickup displays the 3–7 day collection/cancellation notice. | ORD | ORD-004 | planned |
| REQ-PAY-006 | §13 Payment | functional | Payment choices are Cash on Pickup, Wallet EG, and InstaPay. | ORD | ORD-002, ORD-004 | planned |
| REQ-PAY-007 | §13 Payment | functional | Checkout displays the separately configured Wallet EG or InstaPay store number for the selected method. | ORD | ORD-002, ORD-004 | planned |
| REQ-PAY-008 | §13 Payment | data | Wallet EG checkout requires the customer to re-enter the sending wallet number. | ORD | ORD-002, ORD-004 | planned |
| REQ-PAY-009 | §13 Payment | data | The selected payment method is stored with the order and visible to admin. | ORD | ORD-001, ORD-006, ORD-007 | planned |
| REQ-PAY-010 | User decision 2026-10-18 | functional | Wallet EG and InstaPay orders stay payment-pending until manual admin verification. | ORD | ORD-001, ORD-003, ORD-006 | planned |
| REQ-PAY-011 | User decision 2026-10-18 | non-goal | Manual electronic payment requires no receipt upload or transaction reference; Wallet records only the sending wallet number. | ORD | ORD-002, ORD-003 | planned |
| REQ-PAY-012 | User decision 2026-10-18 | data | A verified paid order has no automatic pickup expiry and remains until delivered. | ORD | ORD-001, ORD-008 | planned |
| REQ-ORD-001 | §14.1 Customer Orders | functional | Customers can list and open only their own orders. | ORD | ORD-005 | planned |
| REQ-ORD-002 | §14.1 Customer Orders | data | Customer order detail shows number, items, variants, quantities, prices, discount, total, payment method, time, and pickup information. | ORD | ORD-001, ORD-005 | planned |
| REQ-ORD-003 | §14.1 Customer Orders | UX | Customer order views avoid a complex status workflow. | ORD | ORD-005 | planned |
| REQ-ORD-004 | §14.2 Pickup Rule and user decision | functional | Uncollected unpaid Cash on Pickup orders auto-cancel after the deterministic maximum collection window. | ORD | ORD-008 | planned |
| REQ-ORD-005 | §14.2 Pickup Rule | functional | Auto-cancelled orders are removed from the customer's active Your Orders list. | ORD | ORD-005, ORD-008 | planned |
| REQ-ORD-006 | §14.2 Pickup Rule | operational | Order expiry/archival uses the simplest reliable backend mechanism. | ORD | ORD-008 | planned |
| REQ-ORD-007 | §20 Admin Orders | functional | Admin order list shows number, customer name/phone, product count, and total. | ORD | ORD-006, ORD-007 | planned |
| REQ-ORD-008 | §20 Admin Orders | functional | Admin can mark an order prepared. | ORD | ORD-006, ORD-007 | planned |
| REQ-ORD-009 | §20 Admin Orders | functional | Admin can mark an order delivered/picked up. | ORD | ORD-006, ORD-007 | planned |
| REQ-ORD-010 | §20 Admin Orders | UX | Admin order list does not expose a complex status column. | ORD | ORD-007 | planned |
| REQ-ORD-011 | §21 Admin Order Details | data | Admin order detail shows customer, item, financial, payment, order, and pickup information. | ORD | ORD-006, ORD-007 | planned |
| REQ-ORD-012 | §21 WhatsApp | integration | Admin WhatsApp contact uses the stored customer phone without re-entry. | ORD | ORD-006, ORD-007 | planned |
| REQ-ORD-013 | §27 Database Requirements | data | Order items snapshot historical product, variant, quantity, and price/discount information. | ORD | ORD-001, ORD-003 | planned |
| REQ-ORD-014 | §31 Order Integrity | data | Order creation atomically revalidates variants and records the final server-calculated totals. | ORD | ORD-003 | planned |
| REQ-ORD-015 | §20–21 | security | Order state actions reject invalid transitions and preserve an audit timestamp. | ORD | ORD-001, ORD-006 | planned |
| REQ-CUS-001 | §22 Admin Customers | functional | Admin customer list shows name, phone, order count, and a view action. | CUS | CUS-001, CUS-002 | planned |
| REQ-CUS-002 | §22 Admin Customers | functional | Admin customer details show customer name, phone, and their orders. | CUS | CUS-001, CUS-002 | planned |
| REQ-CUS-003 | §22 Admin Customers | non-goal | Customer administration excludes addresses, shipping, loyalty, scoring, and advanced analytics. | CUS | CUS-002, CUS-003 | planned |
| REQ-SET-001 | §24 Store Information | data | Admin manages store name, store phone, and WhatsApp/contact information. | SET | SET-001, SET-002 | planned |
| REQ-SET-002 | §24 Payment Information | data | Admin manages independent Wallet EG and InstaPay numbers. | SET | SET-001, SET-002 | planned |
| REQ-SET-003 | §24 Payment Information | security | Public consumers receive only the contact/payment values required for the selected UI context. | SET | SET-001, SET-003 | planned |
| REQ-SET-004 | §7.7 Footer | functional | Configured store/contact/social values feed the footer while empty optional social links stay hidden. | SET | SET-003 | planned |
| REQ-ADM-001 | §15 Sidebar | functional | Admin navigation includes Dashboard, Products, Categories, Brands, Orders, Customers, Homepage, Settings, and Logout. | ADM | ADM-001 | planned |
| REQ-ADM-002 | §16 Dashboard | functional | Dashboard may show total products, total orders, total customers, attention orders, and recent orders. | ADM | ADM-002 | planned |
| REQ-ADM-003 | §16 Dashboard | non-goal | Dashboard excludes revenue charts, advanced reports, conversion/customer analytics, and business intelligence. | ADM | ADM-002 | planned |
| REQ-ADM-004 | §33 Responsive Requirements | UX | Admin dashboard remains usable on smaller screens. | ADM | ADM-001, ADM-003 | planned |
| REQ-SCOPE-001 | §2 and §37 | non-goal | Shipping is not implemented. | FND | FND-003 | planned |
| REQ-SCOPE-002 | §2 and §37 | non-goal | Multiple admins and admin roles are not implemented. | AUTH | AUTH-003, AUTH-005 | planned |
| REQ-SCOPE-003 | §2 and §37 | non-goal | Multi-vendor behavior is not implemented. | FND | FND-003 | planned |
| REQ-SCOPE-004 | §2 and §37 | non-goal | AI features are not implemented. | FND | FND-003 | planned |
| REQ-SCOPE-005 | §2 and §37 | non-goal | Chatbots are not implemented. | FND | FND-003 | planned |
| REQ-SCOPE-006 | §2 and §37 | non-goal | Product recommendations are not implemented. | CAT | CAT-004 | planned |
| REQ-SCOPE-007 | §2 and §37 | non-goal | Loyalty points are not implemented. | CUS | CUS-003 | planned |
| REQ-SCOPE-008 | §2 and §37 | non-goal | Product reviews are not implemented. | CAT | CAT-004 | planned |
| REQ-SCOPE-009 | §2 and §37 | non-goal | Product ratings are not implemented. | CAT | CAT-004 | planned |
| REQ-SCOPE-010 | §2 and §37 | non-goal | Coupons are not implemented. | ORD | ORD-002 | planned |
| REQ-SCOPE-011 | §2 and §37 | non-goal | Advanced analytics are not implemented. | ADM | ADM-002 | planned |
| REQ-SCOPE-012 | §2 and §37 | non-goal | Complex notification infrastructure is not implemented. | FND | FND-003 | planned |
| REQ-SCOPE-013 | §2 and §37 | non-goal | Additional payment gateways are not implemented. | ORD | ORD-002 | planned |
| REQ-SCOPE-014 | §2 and §37 | non-goal | Microservices are not implemented. | FND | FND-001 | planned |
| REQ-SCOPE-015 | §2 and §37 | non-goal | Docker is not implemented. | FND | FND-006 | planned |
| REQ-SCOPE-016 | §37 | non-goal | Wishlist is not implemented. | CAT | CAT-004 | planned |
| REQ-SCOPE-017 | §37 | non-goal | Delivery tracking is not implemented. | ORD | ORD-005 | planned |
| REQ-SCOPE-018 | §37 | non-goal | Subscriptions are not implemented. | FND | FND-003 | planned |
| REQ-SCOPE-019 | §37 | non-goal | Redis is not introduced. | FND | FND-003 | planned |
| REQ-SCOPE-020 | §37 | non-goal | Elasticsearch is not introduced. | CAT | CAT-002 | planned |
| REQ-SCOPE-021 | §37 | non-goal | Revenue dashboards are not implemented. | ADM | ADM-002 | planned |

## Coverage Summary

| Metric | Count |
|---|---:|
| Atomic requirements and explicit non-goals | 145 |
| Requirements with exactly one owner | 145 |
| Requirements mapped to one or more tasks | 145 |
| Initial status `planned` | 145 |
