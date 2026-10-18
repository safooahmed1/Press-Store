# Roles and Permissions

## 1. Roles

| Role | Description | Provisioning | Authentication |
|---|---|---|---|
| Customer | Registered shopper | Public registration with unique normalized phone | Phone/password, customer session |
| Admin | The single store operator | Idempotent protected bootstrap from environment input | Separate admin login, admin session |
| Anonymous | Unauthenticated visitor, not an account type | None | None |

## 2. Permission Keys

Permission keys are fixed code contracts, not configurable RBAC.

| Permission | Meaning | Owner Feature |
|---|---|---|
| `catalog:read` | Read public catalog resources | CAT |
| `homepage:read` | Read public merchandising projection | HOME |
| `account:self:read` | Read the current customer's allowed profile fields | AUTH |
| `cart:self:read-write` | Manage the current customer's cart | CART |
| `orders:self:read-create` | Create and read the current customer's orders | ORD |
| `admin:catalog:manage` | Manage products, variants, categories, and brands | CAT |
| `admin:homepage:manage` | Manage homepage merchandising | HOME |
| `admin:orders:manage` | Read orders and perform payment/prepared/delivered actions | ORD |
| `admin:customers:read` | Read customer directory/detail projections | CUS |
| `admin:settings:manage` | Manage store and payment settings | SET |
| `admin:dashboard:read` | Read lightweight dashboard metrics | ADM |

## 3. Permission Matrix

| Permission | Customer | Admin | Anonymous | Conditions |
|---|---|---|---|---|
| `catalog:read` | yes | yes | yes | Only published/available public representation |
| `homepage:read` | yes | yes | yes | Only active public representation |
| `account:self:read` | yes | no | no | Actor ID must equal resource owner |
| `cart:self:read-write` | yes | no | no | Actor ID is derived from session, never request body |
| `orders:self:read-create` | yes | no | no | Actor owns cart and returned orders |
| `admin:catalog:manage` | no | yes | no | Admin session required |
| `admin:homepage:manage` | no | yes | no | Admin session required |
| `admin:orders:manage` | no | yes | no | Valid state transition required |
| `admin:customers:read` | no | yes | no | Read-only projection |
| `admin:settings:manage` | no | yes | no | Payment values never appear in logs |
| `admin:dashboard:read` | no | yes | no | Aggregates only; no analytics expansion |

## 4. Enforcement Rules

All private endpoints authenticate server-side and apply the fixed permission guard before data access. Customer IDs come from the session. Admin routes reject customer sessions. UI route guards improve experience but never replace API enforcement. Unauthorized callers receive stable `AUTH_REQUIRED` or `FORBIDDEN` errors without revealing resource existence.

## 5. Data Visibility Rules

Anonymous/catalog responses exclude customer, session, internal file, and payment-verification data. Customers see only their own account/cart/orders and the public store/payment number needed for the chosen checkout method. Admin sees customer contact and order/payment state needed for operations, but never password hashes or session material.

## 6. Escalation and Administrative Actions

There is no impersonation, permission editor, second-admin invitation, or public admin registration. Payment verification, prepared, delivered, and any manual cancellation are auditable admin actions with actor and timestamp. Adding another administrative capability requires a permission key and explicit scope approval even though the system has only one admin.
