# Glossary and Domain Model

## 1. Terms

| Term | Definition | Source/Owner |
|---|---|---|
| Available Variant | A purchasable color/size combination; availability is existence/active state, not quantity. | CAT |
| Base Price | Product price before its per-product percentage discount. | CAT |
| Final Unit Price | Server-calculated base price less product discount, rounded under the money rule. | CAT |
| Cart Price | Current applicable price shown in cart; it is recalculated before order creation, not a historical guarantee. | CART |
| Order Snapshot | Immutable item identity, variant, and money facts captured when an order is created. | ORD |
| Cash on Pickup | Order is unpaid until store collection; it is subject to the 3–7-day message and seven-day assumed cutoff. | ORD / A-001 |
| Electronic Manual Payment | Wallet EG or InstaPay payment checked outside the app and recorded by admin. | ORD |
| Payment Pending | Electronic method selected but not yet verified by admin. | ORD |
| Paid | Admin verified the electronic transfer; the order no longer expires automatically. | ORD |
| Prepared | Store has marked the order ready for pickup. | ORD |
| Delivered | Customer collected the order; terminal successful state. | ORD |
| Cancelled | Order is no longer active, including expired unpaid cash orders. | ORD |

## 2. Canonical Entities

### Admin (`owner: AUTH`)

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| adminId | bigint | yes | single active row | Internal identity |
| phone | varchar | yes | normalized, unique | Login identity |
| passwordHash | varchar | yes | never returned | Bootstrapped securely |
| createdAt, updatedAt | datetime UTC | yes | server managed | Audit |

Relationships: creates sessions and performs auditable order/settings actions.  
Lifecycle: bootstrapped idempotently; no public CRUD.

### Customer (`owner: AUTH`)

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| customerId | bigint | yes | primary key | Internal identity |
| firstName, lastName | varchar | yes | trimmed bounded text | Display name |
| phone | varchar | yes | normalized, unique | Login/contact identity |
| passwordHash | varchar | yes | never returned | Secure hash |
| createdAt, updatedAt | datetime UTC | yes | server managed | Audit |

Relationships: owns one cart and many orders.  
Lifecycle: registered, active; deletion is outside V1.

### Product (`owner: CAT`)

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| productId | bigint | yes | primary key | Internal identity |
| name, description | text | yes | bounded | Catalog copy |
| brandId, categoryId | bigint | yes | valid foreign keys | Classification |
| priceMinor | bigint | yes | greater than zero, EGP minor units | No floating-point money |
| discountPercent | decimal | yes | 0 through 100 | Per product |
| bestSeller, newArrival | boolean | yes | default false | Catalog flags retained for compatibility; homepage selection is canonical merchandising |
| createdAt, updatedAt | datetime UTC | yes | server managed | Audit |

Relationships: has images and variants; referenced by cart and snapshotted into order items.  
Lifecycle: create/update/delete only when referential rules preserve history.

### ProductVariant (`owner: CAT`)

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| variantId | bigint | yes | primary key | Purchasable option |
| productId | bigint | yes | foreign key | Parent |
| color, size | varchar | yes | unique per product pair | Display values |
| isAvailable | boolean | yes | default true | No quantity field |

Relationships: belongs to Product; referenced by cart items and order snapshots.  
Lifecycle: deactivation/removal prevents new purchase but historical orders remain readable.

### Category and Brand (`owner: CAT`)

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| id | bigint | yes | primary key | Category or brand ID |
| name | varchar | yes | unique per entity | Filter label |
| imagePath | varchar | category yes; brand no | storage-managed | Category image only |

Relationships: products reference exactly one of each.  
Lifecycle: deletion is rejected while products reference the row unless a documented reassignment occurs.

### Cart and CartItem (`owner: CART`)

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| cartId, customerId | bigint | yes | one cart per customer | Ownership |
| cartItemId, variantId | bigint | yes | one row per variant per cart | Variant selection |
| quantity | integer | yes | positive bounded integer | No stock decrement |
| currentUnitPriceMinor | bigint | yes | refreshed by server | Current applicable price |

Relationships: Customer owns Cart; Cart has items; item references CAT variant.  
Lifecycle: persists across sessions; cleared transactionally after order creation.

### Order and OrderItem (`owner: ORD`)

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| orderId, orderNumber | bigint/varchar | yes | unique | Identity/display |
| customerId | bigint | yes | immutable owner | Customer snapshot relation |
| paymentMethod | enum | yes | cash, wallet_eg, instapay | Selected method |
| paymentStatus | enum | yes | unpaid, payment_pending, paid | Manual verification state |
| fulfillmentStatus | enum | yes | placed, prepared, delivered, cancelled | Simple internal lifecycle |
| subtotalMinor, discountMinor, totalMinor | bigint | yes | nonnegative invariant | EGP minor units |
| cashExpiresAt | datetime UTC | conditional | only unpaid cash | A-001 maximum cutoff |
| paidAt, preparedAt, deliveredAt, cancelledAt | datetime UTC | conditional | valid transitions | Audit |
| createdAt | datetime UTC | yes | immutable | Order time |

OrderItem stores orderId, product/variant IDs where retained, snapshot names/color/size, quantity, base/final unit prices, and discount.  
Relationships: Order belongs to Customer and has immutable items.  
Lifecycle: created atomically; electronic pending can become paid; placed can become prepared/delivered; only unpaid cash auto-cancels; paid never expires.

### HeroSlide and PromotionBanner (`owner: HOME`)

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| contentId | bigint | yes | primary key | Entity ID |
| imagePath | varchar | slide yes | storage-managed | No image for current banner design |
| title, subtitle, buttonText, buttonLink | varchar | slide yes | safe internal/allowed URL | Hero content |
| placement | enum | banner yes | banner_1 or banner_2 | Unique placement |
| text, isActive, displayOrder | mixed | yes | bounded/ordered | Presentation |

Relationships: homepage selections reference CAT entities.  
Lifecycle: admin CRUD with active-count and selection-limit constraints.

### StoreSettings (`owner: SET`)

| Field | Type | Required | Constraints | Notes |
|---|---|---|---|---|
| settingsId | bigint | yes | singleton | Store configuration |
| storeName, storePhone, whatsappPhone | varchar | yes | normalized/bounded | Contact data |
| walletEgNumber, instaPayNumber | varchar | yes | independent values | Payment display values |
| socialLinks | JSON | no | approved URLs only | A-004 optional |
| updatedAt | datetime UTC | yes | server managed | Audit |

Relationships: read by UI and ORD through projections.  
Lifecycle: singleton updated by admin; secrets are not stored here.
