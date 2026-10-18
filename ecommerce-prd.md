# E-Commerce Store — Product Requirements Document

## 1. Project Overview

A simple, production-ready e-commerce web application for a clothing store.

The goal is to build a real, usable online store with the minimum set of features required for a good shopping experience and store management, without unnecessary features, over-engineering, or unfamiliar technologies.

The project should be:
- Simple to understand and maintain.
- Responsive on desktop and mobile.
- Easy for the store admin to manage.
- Built with standard, well-known technologies.
- Structured so future features can be added without rewriting the core system.

The provided homepage screenshot is a visual reference for the overall direction and layout. It should not be copied literally.

---

## 2. Project Goals

### Primary Goals

- Allow customers to browse clothing products.
- Allow customers to filter products.
- Allow customers to create accounts.
- Allow customers to add products to a persistent cart.
- Allow customers to place orders for pickup from the store.
- Support payment by cash at pickup, Wallet EG, and InstaPay.
- Allow the admin to manage products, categories, brands, homepage content, customers, and orders.
- Keep the implementation simple, readable, and maintainable.

### Non-Goals

This version is intentionally not a full enterprise e-commerce platform.

The following are out of scope:
- Shipping system.
- Multiple admin roles.
- Multiple admins.
- Multi-vendor functionality.
- AI features.
- Chatbots.
- Recommendation engines.
- Loyalty points.
- Reviews and ratings.
- Coupons.
- Advanced analytics.
- Complex notification systems.
- Multiple payment gateways.
- Microservices.
- Docker.
- Unnecessary infrastructure or unfamiliar technologies.

---

## 3. Technology Stack

### Frontend

- React
- Tailwind CSS
- Axios
- Zustand
- React Query
- css-loader
- Swiper

### Backend

- Node.js
- Express.js
- REST API

### Database

- MySQL

MySQL is selected because it is a standard relational database suitable for products, variants, users, orders, categories, brands, and homepage content without adding unnecessary complexity.

### Hosting

- Hostinger web app hosting.
- No VPS.
- No Docker.

The final implementation should remain compatible with the selected Hostinger hosting plan.

---

## 4. UI / UX Requirements

### Visual Direction

The visual direction is based on the provided fashion e-commerce reference.

The design should feel like a:

- Modern fashion e-commerce store.
- Minimal editorial fashion layout.
- Clean grid-based product presentation.
- Strong typography.
- Clear borders and spacing.
- Modern streetwear/fashion aesthetic.

The reference image is inspiration for layout and visual direction, not a requirement to reproduce the design exactly.

### Brand Colors

Primary colors:

- Red
- Black
- White

Recommended usage:
- White: primary background.
- Black: primary text and structural elements.
- Red: primary accent, buttons, prices, active states, and promotional elements.

### Frontend Design

The `frontend-design` skill is responsible for creating the UI.

It should have freedom to improve the visual design while respecting:
- The project requirements.
- The red / black / white color direction.
- The defined pages and sections.
- Responsive behavior.
- The overall fashion-store visual direction.

---

## 5. User Types

There are only two account types.

### Customer

A registered store customer who can:
- Browse products.
- Filter products.
- View product details.
- Add products to cart.
- Keep a persistent cart.
- Checkout.
- Place orders.
- View their own orders.

### Admin

There is exactly one admin account.

There are:
- No admin roles.
- No permission system.
- No multiple admins.

The admin can manage the store and its orders.

---

# 6. Customer Application

## 6.1 Customer Pages

The customer-facing application should contain:

```text
Home
Products / Shop
Product Details
Cart
Checkout
Login
Register
Your Orders
Order Details
Account
```

The exact URL structure can be decided during implementation, but the page responsibilities must remain clear.

---

# 7. Home Page

The homepage should contain the following main sections:

```text
Navbar
Hero
Best Sellers
Promotion Banner 1
Categories
Promotion Banner 2 (if active)
New Arrivals
Footer
```

## 7.1 Navbar

The navbar should provide access to the main store areas and account/cart functionality.

The final visual arrangement is handled by `frontend-design`.

## 7.2 Hero

The hero is a Swiper/carousel.

The admin can create between:

```text
1–3 slides
```

Each slide contains:

- Image
- Title
- Subtitle
- Button text
- Button link

The admin controls the hero content from the dashboard.

## 7.3 Best Sellers

The section is named:

**Best Sellers**

Products are selected manually by the admin.

Maximum:

**8 products**

The homepage shows the selected products and provides a `See More` action that leads to the product/shop experience.

## 7.4 Categories

Categories are created and managed by the admin.

The homepage displays the available categories.

The category section should allow customers to navigate to the relevant products.

## 7.5 Promotion Banners

There are up to two promotion banner placements.

Current design:
- Text on a fixed background.
- Red is the initial background direction.

The admin controls the banner text and whether a banner is active.

Placement:

```text
Hero
Best Sellers
Banner 1
Categories
Banner 2 (if active)
New Arrivals
```

## 7.6 New Arrivals

Products are selected manually by the admin.

Maximum:

**8 products**

The homepage provides a `See More` action leading to the product/shop experience.

## 7.7 Footer

The footer should contain the store's basic information and contact/social links as required by the final UI.

---

# 8. Product System

## 8.1 Product Information

Each product should support:

- Product name.
- Brand.
- Category.
- Description.
- Price.
- Discount percentage.
- Main image.
- 1–3 optional additional images.
- Colors.
- Sizes.
- Best Seller flag.
- New Arrival flag.

## 8.2 Product Images

Each product has:

- One main image.
- Up to three additional images.

Additional images are optional.

## 8.3 Product Variants

Each product can have multiple colors and sizes. There is no stock quantity system in the application.

The admin controls which colors and sizes are currently available for each product. When a specific size or color is no longer available, the admin removes that option from the product.

Customers only see the currently available color/size options. The customer is never shown remaining quantities such as “3 left”.

The admin also does not manage numeric stock quantities. Availability is managed simply by adding or removing the available color/size options.

## 8.4 Product Discount

Discounts are controlled per product.

The admin enters:

```text
Price
Discount %
```

The system calculates the final price.

Example:

```text
Price: 4000 EGP
Discount: 20%

Final price: 3200 EGP
```

Discounts are not global. Each product can have its own discount.

## 8.5 Product Details Page

The product details page should contain:

- Product image gallery.
- Brand.
- Product name.
- Current price.
- Original price when discounted.
- Description.
- Color selection.
- Size selection.
- Quantity selection.
- Add to Cart.

There is no `Buy Now` button.

---

# 9. Product Browsing and Filtering

There is no global product search requirement for this version.

The Products/Shop page should provide filters:

- Category.
- Brand.
- Price.
- Size.
- Color.

There is no availability filter.

Products/variants that cannot be purchased should not be presented as available purchase options.

Sorting is not required for the initial version.

---

# 10. Customer Account

Customers must create an account.

Required customer information:

- First name.
- Last name.
- Phone number.
- Password.

No customer address is required.

No city or shipping address is required.

### Login

Login uses:

- Phone number.
- Password.

### Registration

Registration uses:

- First name.
- Last name.
- Phone number.
- Password.

Customer accounts and admin authentication are separate.

---

# 11. Cart

Customers can add products and selected variants to the cart.

The cart must persist for the customer's account.

If the customer leaves the website and returns later after logging in, their cart should still be available.

Cart items must preserve:

- Product.
- Selected color.
- Selected size.
- Quantity.
- Current applicable price.

The system must validate that the selected product color/size combination is still available before allowing checkout/order creation.

---

# 12. Checkout

There is no shipping.

All orders are for pickup from the physical store.

The checkout should use the customer's existing account information and must not ask the customer to enter their phone number again.

The customer reviews:

- Products.
- Selected variants.
- Quantities.
- Discount.
- Total.
- Payment method.

Before confirming the order, the customer should see a clear note that:

- The order is expected to be ready for pickup within a minimum of 10 minutes and a maximum of 60 minutes.
- If the customer selected Cash on Pickup, the order must be collected within 3–7 days or it will be cancelled. This cancellation note must not be shown for orders that have already been paid.

---

# 13. Payment

Supported payment methods:

1. Cash on pickup.
2. Wallet EG.
3. InstaPay.

The store's payment information is controlled by the admin.

The admin configures two separate payment numbers in Settings:

- Wallet EG number.
- InstaPay number.

These numbers do not have to be the same.

For Wallet EG and InstaPay, the customer sees the corresponding store payment number during checkout.

For Wallet EG payment, the customer must enter their wallet number again in the payment section as a confirmation of the wallet number used for the payment.

The customer's account phone number remains stored in their account and should not be requested again as general customer information.

The selected payment method must be stored with the order and clearly visible to the admin when reviewing/confirming the order.

The exact payment verification workflow should remain simple and suitable for manual store administration.

---

# 14. Orders

## 14.1 Customer Orders

After placing an order, the customer can see it in `Your Orders`.

The customer can open an order to view its details.

Order details include:

- Order number.
- Products.
- Variants.
- Quantities.
- Prices.
- Discount.
- Total.
- Payment method.
- Order date/time.
- Pickup information.

There is no complex customer-facing status workflow.

## 14.2 Order Pickup Rule

The customer is informed that the order should be ready after approximately 30 minutes.

If the order is not collected within two weeks, it is cancelled and removed from the customer's `Your Orders` list.

The exact backend cleanup/archival behavior can be implemented in the simplest reliable way.

---

# 15. Admin Dashboard

The admin dashboard should be intentionally simple.

There is only one admin.

### Sidebar

```text
Dashboard
Products
Categories
Brands
Orders
Customers
Homepage
Settings
Logout
```

---

# 16. Admin Dashboard — Dashboard

The main dashboard is a lightweight overview.

It can show:

- Total products.
- Total orders.
- Total customers.
- Orders requiring attention.
- Recent orders.

It should not become an analytics platform.

Do not add:
- Revenue charts.
- Advanced reports.
- Conversion analytics.
- Customer analytics.
- Complex business intelligence.

---

# 17. Admin — Products

The Products page manages the complete product catalog.

### Product List

Each product should provide:

- Main image.
- Product name.
- Brand.
- Category.
- Price.
- Available color/size variant information.
- Edit action.
- Delete action.

### Add / Edit Product

The admin can manage:

```text
Name
Brand
Category
Description
Price
Discount %
Main Image
Additional Images
Colors
Sizes
Best Seller
New Arrival
```

The admin can:
- Create a product.
- Edit a product.
- Delete a product.
- Manage available color/size variants.
- Remove individual unavailable color/size options.

---

# 18. Admin — Categories

The admin can:

- Add category.
- Edit category.
- Delete category.

A category contains:

- Name.
- Image.

Categories are used by products and the homepage.

---

# 19. Admin — Brands

Brands are a first-class catalog entity.

The admin can:

- Add brand.
- Edit brand.
- Delete brand.

A product is assigned to a brand.

Brand is also available as a product filter.

---

# 20. Admin — Orders

The Orders page is optimized for daily store use.

Each order card/list item should show:

```text
Order number
Customer name
Customer phone
Number of products
Total
```

Actions:

```text
تم التحضير
تم التسليم
View Details
WhatsApp
```

The Orders list should not expose a complex status column.

## Order Actions

### تم التحضير

Marks the order as prepared for pickup.

### تم التسليم

Marks the order as delivered/picked up.

These actions should be clear and easy to use.

---

# 21. Admin — Order Details

Order Details contains:

### Customer

- Customer name.
- Customer phone.

### Products

For every item:

- Product.
- Color.
- Size.
- Quantity.
- Unit price.

### Financial Information

- Subtotal.
- Discount.
- Total.

### Payment

- Payment method.

### Order Information

- Order number.
- Creation date/time.
- Pickup information.

### Actions

- تم التحضير.
- تم التسليم.
- Contact customer on WhatsApp.

The WhatsApp action should use the customer's stored phone number automatically.

The admin should not have to manually re-enter the customer's phone number.

---

# 22. Admin — Customers

The Customers page provides a simple customer list.

Each customer can show:

- Name.
- Phone.
- Number of orders.
- View action.

Customer details should show:

- Customer name.
- Phone.
- Their orders.

The admin does not manage:
- Addresses.
- Shipping information.
- Loyalty data.
- Customer scoring.
- Advanced customer analytics.

---

# 23. Admin — Homepage

Homepage is the central place for managing homepage content.

It contains:

```text
Hero Slides
Best Sellers
Categories
Promotion Banners
New Arrivals
```

## 23.1 Hero Slides

The admin can create/edit/delete hero slides.

Maximum:

**3 slides**

Minimum:

**1 active slide**

Each slide:

- Image.
- Title.
- Subtitle.
- Button text.
- Button link.

The frontend displays them using a Swiper/carousel.

## 23.2 Best Sellers

The admin manually selects products.

Maximum:

**8 products**

The admin can add/remove products from the section.

## 23.3 New Arrivals

The admin manually selects products.

Maximum:

**8 products**

The admin can add/remove products from the section.

## 23.4 Categories

Categories themselves are managed from the Categories page.

The homepage can use the existing categories without requiring another duplicate category-management system.

## 23.5 Promotion Banners

There are two possible banner placements.

Each banner currently contains:

- Text.
- Active/inactive state.

The initial visual direction is a red fixed background.

---

# 24. Admin — Settings

Settings should remain small.

## Store Information

- Store name.
- Store phone.
- WhatsApp/contact information as required.

## Payment Information

The admin manages two separate payment numbers:

- Wallet EG number.
- InstaPay number.

The two numbers are independent and do not have to be the same.

These values are shown to customers during checkout when the corresponding payment method is selected.
The selected payment method is also stored with the order so the admin knows whether the customer chose Cash on Pickup, Wallet EG, or InstaPay.

---

# 25. Customer Flow

The main customer flow:

```text
Home
  ↓
Products
  ↓
Filter
  ↓
Product Details
  ↓
Select Color
  ↓
Select Size
  ↓
Add to Cart
  ↓
Cart
  ↓
Checkout
  ↓
Select Payment Method
  ↓
Review Order
  ↓
Confirm Order
  ↓
Order Created
  ↓
Pickup from Store
```

For an existing customer:

```text
Login
  ↓
Shop
  ↓
Cart
  ↓
Checkout
```

The cart remains associated with the customer's account.

---

# 26. Admin Flow

The main admin workflow:

```text
Admin Login
    ↓
Dashboard
    │
    ├── Products
    │     ├── Add
    │     ├── Edit
    │     └── Delete
    │
    ├── Categories
    │
    ├── Brands
    │
    ├── Orders
    │     └── Order Details
    │            ├── تم التحضير
    │            ├── تم التسليم
    │            └── WhatsApp
    │
    ├── Customers
    │     └── Customer Details
    │
    ├── Homepage
    │     ├── Hero Slides
    │     ├── Best Sellers
    │     ├── New Arrivals
    │     └── Promotion Banners
    │
    └── Settings
          ├── Store Information
          └── Payment Information
```

---

# 27. Database Requirements

The database should use a relational structure appropriate for MySQL.

The implementation should cover the necessary entities, including at minimum:

```text
Admin
Customer
Product
ProductVariant
Category
Brand
Order
OrderItem
Cart
CartItem
HeroSlide
PromotionBanner
StoreSettings
```

The final schema should avoid duplicated data where possible and should preserve relationships between products, variants, categories, brands, customers, carts, and orders.

Product variants must represent the available color/size combinations. No numeric stock quantity is stored or managed in the application.

Order items should preserve the relevant product/variant information required to display historical orders correctly.

---

# 28. API Requirements

The backend should expose a clean REST API.

The API should be organized around the application's main resources, such as:

```text
/auth
/products
/categories
/brands
/cart
/orders
/customers
/homepage
/settings
```

The exact endpoint names and HTTP methods should follow standard REST conventions.

Example operations:

```text
GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id
```

Similar CRUD patterns should be used where appropriate.

The API must enforce authentication and authorization for admin-only operations.

Customers must only be able to access their own account, cart, and orders.

---

# 29. Authentication and Authorization

### Customer

- Register.
- Login.
- Logout.
- Access own account.
- Access own cart.
- Access own orders.

### Admin

- Separate admin login.
- Exactly one admin.
- Admin-only dashboard access.
- No role/permission system.

Authentication implementation should use standard, secure practices without introducing unnecessary infrastructure.

---

# 30. Validation and Error Handling

The system must validate:

- Required fields.
- Product prices.
- Discount values.
- Product variants.
- Quantity.
- Availability of the selected color/size combination.
- Account information.
- Order information.

The frontend should provide clear user-facing validation messages.

The backend must independently validate requests and must not trust frontend validation.

Errors should be handled consistently and should not expose sensitive implementation details.

---

# 31. Product Availability and Order Integrity

Before an order is created, the backend must verify that the selected product color/size combination is still available.

The system must prevent ordering a color/size option that the admin has removed as unavailable.

There is no numeric inventory or stock quantity to update when an order is created.

The implementation should keep availability checks simple and reliable while avoiding duplicated business logic.

---

# 32. Code Organization Requirements

Code quality and maintainability are a core project requirement.

### General Rules

- Keep the code simple.
- Avoid over-engineering.
- Avoid unnecessary abstractions.
- Avoid unfamiliar technologies.
- Avoid unnecessary dependencies.
- Prefer standard solutions.
- Keep responsibilities separated.

### Components

Components should be small and focused.

Target guideline:

- Ideal: around 20–30 lines.
- Approximately 50 lines should be an upper guideline unless there is a clear reason.

The goal is readable organization, not blindly enforcing line counts.

### Pages

Pages should primarily compose sections/components.

A page should not contain large amounts of business logic.

Example concept:

```text
Page
 ├── Section
 ├── Section
 ├── Section
 └── Section
```

Business logic should live in appropriate hooks, services, utilities, or other focused modules rather than being embedded directly into large page components.

### Page Aggregation

The project should have a clear page-level organization where page files are responsible for assembling the page from reusable components/sections.

A page should primarily be responsible for composition and routing-level concerns.

---

# 33. Responsive Requirements

The application must work properly on:

- Desktop.
- Tablet.
- Mobile.

The UI should not simply shrink the desktop design.

Product grids, navigation, filters, cart, checkout, dashboard, and forms should have appropriate responsive layouts.

The admin dashboard should also remain usable on smaller screens.

---

# 34. Performance Requirements

The project should prioritize good performance without introducing unnecessary optimization systems.

Requirements:

- Optimize images appropriately.
- Avoid unnecessarily large assets.
- Avoid unnecessary client-side rendering work.
- Keep components focused.
- Avoid unnecessary dependencies.
- Use efficient database queries.
- Avoid loading data that is not needed.

Do not introduce Redis, Elasticsearch, microservices, or other infrastructure solely for performance.

---

# 35. Security Basics

The application should implement standard web security practices.

At minimum:

- Secure password storage.
- Authentication protection.
- Admin route protection.
- Customer data isolation.
- Backend authorization.
- Input validation.
- Safe database queries.
- Secure handling of authentication credentials.
- Do not expose sensitive server-side configuration to the client.

---

# 36. Deployment

Target deployment:

```text
Hostinger
```

Requirements:

- Compatible with the selected Hostinger web app hosting plan.
- No VPS.
- No Docker.

The deployment architecture should remain as simple as possible while supporting the React frontend, Node/Express backend, and MySQL database.

---

# 37. Out of Scope

The following should not be implemented unless the project scope is explicitly changed:

```text
AI
Chatbot
Product recommendations
Reviews
Ratings
Wishlist
Coupons
Loyalty points
Shipping
Delivery tracking
Multiple payment gateways
Multiple admins
Admin roles
Advanced analytics
Revenue dashboards
Multi-vendor
Subscriptions
Microservices
Redis
Elasticsearch
Docker
Complex notification infrastructure
```

---

# 38. Acceptance Criteria

The project is considered complete for this version when:

### Customer

- A customer can register and log in.
- A customer can browse products.
- A customer can filter products.
- A customer can view product details.
- A customer can select a valid color/size combination.
- A customer cannot purchase a color/size combination that is no longer available.
- A customer can add products to the cart.
- The cart persists for the customer account.
- A customer can checkout.
- A customer can choose Cash, Wallet EG, or InstaPay.
- The configured store payment information is displayed when required.
- A customer can place an order for store pickup.
- A customer can view their orders.
- The 10–60 minute pickup preparation guidance is communicated.
- Cash-on-pickup orders show the 3–7 day collection rule, while already-paid orders do not show that cancellation note.

### Admin

- The single admin can log in securely.
- The admin can manage products.
- The admin can manage available product color/size variants.
- The admin can manage categories.
- The admin can manage brands.
- The admin can manually select Best Sellers.
- The admin can manually select New Arrivals.
- The admin can manage 1–3 Hero slides.
- The admin can manage the two promotion banner placements.
- The admin can view customers.
- The admin can view customer orders.
- The admin can view order details.
- The admin can mark an order as prepared.
- The admin can mark an order as delivered.
- The admin can contact the customer through WhatsApp.
- The admin can configure store/payment information.

### Quality

- The application is responsive.
- The frontend follows the red/black/white visual direction.
- The UI is clean and appropriate for a fashion e-commerce store.
- The codebase remains modular and readable.
- Pages primarily compose components.
- No unnecessary technologies or architecture are introduced.
- The application can be deployed on the selected Hostinger plan.

---

# 39. Implementation Principle

The guiding principle for the entire project is:

> **Build the simplest correct solution, not the simplest possible solution and not the most sophisticated solution.**

Every feature and technology should have a clear reason to exist.

The project should be easy to understand, easy to maintain, and strong enough to operate as a real clothing e-commerce store.
