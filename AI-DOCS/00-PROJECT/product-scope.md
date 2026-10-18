# Product Scope

## 1. In Scope

- Responsive customer pages: Home, Shop, Product Details, Cart, Checkout, Login, Register, Your Orders, Order Details, and Account.
- Catalog products, images, categories, brands, color/size variants, per-product discounts, filters, and admin CRUD.
- Persistent authenticated carts and atomic pickup-order creation.
- Cash on Pickup, Wallet EG, and InstaPay with manual admin verification for non-cash methods.
- Customer order history and admin preparation, delivery, payment verification, cancellation, detail, and WhatsApp workflows.
- Admin dashboard, customer directory, homepage merchandising, and store/payment settings.
- Secure same-origin deployment on Hostinger with MySQL and local image storage.

## 2. Out of Scope

- Shipping, delivery tracking, addresses, cities, or numeric stock quantities.
- Multiple admins, admin roles, permission management, multi-vendor, or tenant isolation.
- AI, chatbot, recommendations, wishlist, reviews, ratings, coupons, loyalty, subscriptions.
- Advanced analytics, revenue charts, conversion/customer analytics, scoring, or business intelligence.
- Additional payment gateways, automated gateway verification, or complex notification infrastructure.
- Microservices, Docker, VPS, Redis, Elasticsearch, or infrastructure introduced only for scale.

## 3. Release Boundaries

V1 ends when all ten features are `merge-ready`, the ordered integration plan passes, the production build runs in the selected Hostinger shape, and no required acceptance criterion remains unchecked. Deployment itself requires a separate explicit user instruction.

## 4. Non-Goals

The project is not an enterprise commerce platform, marketplace, warehouse system, delivery platform, analytics product, or payment gateway. The current local image store is intentionally replaceable in a future approved scope change.

## 5. Scope Change Process

Any addition must receive a requirement ID, owner feature, contracts, acceptance criteria, tasks, verification, and a decision. Changes affecting architecture, security, money, inventory, or deployment require explicit user approval before implementation.
