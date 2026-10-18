# Project Overview

## 1. Product Summary

Press Store is a production-ready, maintainable clothing e-commerce web application. Registered customers browse and filter products, keep a persistent cart, place pickup orders, pay by cash, Wallet EG, or InstaPay, and review their own orders. One separately authenticated administrator manages the catalog, homepage, customers, orders, and store/payment settings.

## 2. Goals and Success Measures

- Deliver the complete customer pickup-shopping flow without shipping or enterprise scope.
- Let the single admin perform daily catalog, merchandising, customer, and order work simply.
- Preserve product and price history in orders while keeping variant availability boolean rather than quantity-based.
- Meet every requirement in `requirements-index.md` with observable evidence.
- Remain deployable as one Node/Express application on Hostinger without VPS or Docker.

## 3. Users and Stakeholders

- **Customer:** registered shopper with access only to their own account, cart, and orders.
- **Admin:** exactly one store operator with a separate login and all dashboard capabilities.
- **Store owner:** business stakeholder responsible for payment verification and operational policy.

## 4. Platforms and Environments

- Responsive web on desktop, tablet, and mobile.
- Local development, test, staging where available, and Hostinger production.
- One deployable Express process serves the React build and REST API under `/api`.

## 5. Core Business Model

Products belong to one category and one brand and expose purchasable color/size combinations without numeric inventory. A cart belongs to one customer. Checkout creates a store-pickup order whose immutable items snapshot product, variant, quantity, and money data. Cash orders expire after the approved pickup window; paid orders stay available until delivered.

## 6. System Context

The browser consumes the React application and same-origin `/api/v1` REST API. Express owns sessions, business rules, image upload access, and MySQL persistence. The admin manually verifies Wallet EG and InstaPay outside the application, then records the result. WhatsApp contact opens an external link using the stored customer phone number.

## 7. Documentation Map

Project truth is split among `00-PROJECT`, mandatory rules in `01-FOUNDATION`, feature-owned definitions in `02-FEATURES`, and delivery controls in `03-DELIVERY`.

## 8. Critical Constraints

- React, Tailwind CSS, Axios, Zustand, React Query, css-loader, and Swiper on the frontend.
- Node.js, Express, REST, and MySQL on the backend.
- Hostinger web-app hosting only; no VPS, Docker, microservices, Redis, or Elasticsearch.
- One admin, no role/permission administration, no numeric stock, no shipping.
- Secure MySQL-backed cookie sessions; local Hostinger image storage for v1.
- Simplicity is a design constraint, not permission to omit correctness or security.
