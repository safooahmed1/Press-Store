# Technical Contracts — Checkout, Payments, and Orders

## 1. Ownership

**Owns**
- Routes/screens: `/checkout`, `/orders`, `/orders/:id`, `/admin/orders`, `/admin/orders/:id`.
- Source paths: `src/features/orders/**`, `server/src/features/orders/**`, `tests/integration/orders/**`.
- API endpoints: checkout quote, order create/read, admin list/detail/actions.
- Entities/write authority: Order, OrderItem, payment/fulfillment state and timestamps.
- Jobs/events: unpaid cash expiry.
- Configuration: cash expiry cutoff, pickup guidance copy constants, order number/idempotency policy.

**Must Not Touch**
- AUTH customers/sessions, CAT product/variant/price, CART rows except CMD-CART-001, SET values, shared UI/FND internals.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| API-ORD-001 | API | Checkout quote and idempotent order creation | Checkout UI | §3 |
| API-ORD-002 | API | Customer own order list/detail | Customer order UI | §3 |
| API-ORD-003 | API | Admin order list/detail/actions | Admin order UI | §3 |
| READ-ORD-001 | service | Customer order summary/count projection | CUS | §4 |
| READ-ORD-002 | service | Recent/attention/count metrics | ADM | §4 |
| JOB-ORD-001 | job | Expire unpaid cash orders | FND job runner | §5 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| AUTH-AUTH-001, AUTH-AUTH-002, READ-AUTH-001 | AUTH | customer/admin APIs and snapshots | trusted actors/safe customer summary |
| READ-CART-001, CMD-CART-001 | CART | transactional order creation | lock/read and exact clear |
| READ-CAT-001 | CAT | current variant/product/price | one canonical availability/money projection |
| READ-SET-001, READ-SET-002 | SET | payment destination/WhatsApp | selected destination and contact |
| DB-FND-001, HTTP-FND-001, JOB-FND-001 | FND | transaction/API/job | standard contracts |
| UI-UI-001–UI-UI-004 | UI | all order UIs | shared controls/states/shells |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `server/src/features/orders/{migrations,domain,repositories}/**` | order/payment schema/state/snapshots | ORD-001 | Foreign table writes |
| `server/src/features/orders/checkout/**` | quote and atomic creation | ORD-002, ORD-003 | Client-only formatting |
| `src/features/orders/checkout/**` | checkout review/payment UI | ORD-004 | Server money authority |
| `server/src/features/orders/customer/**` | self-only list/detail API | ORD-009 | Admin operations or client rendering |
| `src/features/orders/customer/**` | responsive customer order history capability | ORD-010 | Admin operations or server persistence |
| `server/src/features/orders/admin/**` | admin projections/actions/WhatsApp data | ORD-006 | Customer/session writes |
| `src/features/orders/admin/**` | admin order UI | ORD-007 | Shared admin shell |
| `server/src/features/orders/jobs/**` | rerunnable unpaid-cash expiry | ORD-011 | Scheduler platform implementation or paid-order expiry |
| `tests/integration/orders/**` | customer-history composition and full live verification | ORD-005, ORD-008 | Feature implementation that belongs to BE or FE |

## 3. API Contracts

### API-ORD-001 — Quote and create pickup order
| Field | Value |
|---|---|
| Method and path | `POST /api/v1/checkout/quote`, `POST /api/v1/orders` |
| Authentication | Customer session |
| Permission | `orders:self:read-create` |
| Idempotency | order creation requires customer-scoped `Idempotency-Key`; same key/payload returns original, changed payload conflicts |

Request:
```json
{"paymentMethod":"cash|wallet_eg|instapay","walletSenderNumber":"required-only-for-wallet","acceptedQuoteVersion":"opaque"}
```

Success response:
```json
{"data":{"order":{"orderId":"1","orderNumber":"PS-...","items":[],"subtotalMinor":400000,"discountMinor":80000,"totalMinor":320000,"paymentMethod":"wallet_eg","paymentStatus":"payment_pending","fulfillmentStatus":"placed","pickup":{"preparationMinutes":{"min":10,"max":60,"typical":30},"cashCollectionNotice":null}}}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `CART_EMPTY` | 409 | No lines | Return to Shop/Cart |
| `VARIANT_UNAVAILABLE` | 409 | CAT revalidation fails | Return to Cart and remove/change item |
| `QUOTE_CHANGED` | 409 | Price/discount/cart changed | Refresh and require review |
| `PAYMENT_SETTINGS_UNAVAILABLE` | 409 | Selected number missing | Disable method; contact store/admin |
| `IDEMPOTENCY_CONFLICT` | 409 | Key reused with different request | Do not retry with same key |

### API-ORD-002 — Customer orders
| Field | Value |
|---|---|
| Method and path | `GET /api/v1/orders`, `GET /api/v1/orders/:id` |
| Authentication | Customer session |
| Permission | `orders:self:read-create` |
| Idempotency | Safe reads; list paginated and excludes cancelled |

Request:
```json
{"query":{"page":1,"pageSize":20}}
```

Success response:
```json
{"data":{"items":[{"orderNumber":"PS-...","createdAt":"ISO-8601","totalMinor":320000,"paymentMethod":"cash","paymentStatus":"unpaid","fulfillmentStatus":"placed"}]},"meta":{"page":1,"pageSize":20,"total":1}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `ORDER_NOT_FOUND` | 404 | Missing, cancelled, or other customer's order | Show safe not-found action |

### API-ORD-003 — Admin orders and actions
| Field | Value |
|---|---|
| Method and path | `GET /api/v1/admin/orders`, `GET /:id`, `POST /:id/verify-payment`, `POST /:id/prepare`, `POST /:id/deliver` |
| Authentication | Admin session |
| Permission | `admin:orders:manage` |
| Idempotency | Repeating an achieved action returns current state; incompatible transitions conflict |

Request:
```json
{"expectedVersion":2}
```

Success response:
```json
{"data":{"orderId":"1","paymentStatus":"paid","fulfillmentStatus":"prepared","version":3,"updatedAt":"ISO-8601"}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `INVALID_ORDER_TRANSITION` | 409 | State/method prerequisite fails | Refresh and explain current state |
| `ORDER_CONFLICT` | 409 | Stale version/race | Reload order |
| `ORDER_NOT_FOUND` | 404 | Missing order | Return to list |

## 4. Data Contracts

### Order and OrderItem (`owner: ORD`)
| Field | Type | Required | Default | Constraints | Index/Relationship |
|---|---|---|---|---|---|
| canonical fields | see glossary | yes/conditional | documented | money invariant; immutable owner/items | customer/date, state/date indexes |
| walletSenderNumber | varchar | wallet only | null | normalized; no proof/reference | protected display/log redaction |
| idempotencyKeyHash, requestHash | varchar | yes | generated | unique per customer/key | unique customer+key |
| version | integer | yes | 1 | increments per transition | conflict check |
| verifiedByAdminId | bigint | paid electronic only | null | admin FK | audit |

Lifecycle: cash `unpaid/placed` → optional prepared → delivered (and paid); electronic `payment_pending/placed` → `paid` → optional prepared → delivered. Direct placed-to-delivered is permitted when payment prerequisites hold. Only unpaid cash before delivery may auto-transition to cancelled at `cashExpiresAt`.  
Concurrency/transaction rule: create locks cart/variants, calculates and snapshots, inserts order/items/idempotency result, and clears exact cart in one transaction. Transitions update expected version and state atomically. Expiry selects/updates qualifying rows safely and is rerunnable.

## 5. Events and Background Jobs

| Contract ID | Event/Job | Producer | Consumers | Payload | Retry/Ordering/Deduplication |
|---|---|---|---|---|---|
| JOB-ORD-001 | `orders.expire-unpaid-cash` | ORD | customer/admin projections, operations logs | cutoff UTC, scanned/cancelled/skipped counts | database predicate makes reruns idempotent; state/version guard prevents race overwrite |

## 6. Shared UI Contracts

None. Feature owns checkout/order components and consumes UI primitives.

## 7. Permissions and Security

Customer ID comes only from AUTH-AUTH-001. Admin actions use AUTH-AUTH-002. All mutations use CSRF/version/idempotency rules. Payment/wallet data is minimized and redacted; order existence is not leaked across customers.

## 8. External Integrations

Wallet EG/InstaPay verification occurs outside the app with no API. WhatsApp action builds an encoded `https://wa.me/<normalized customer phone>` link; no automatic message send.

## 9. Configuration and Secrets

`CASH_PICKUP_EXPIRY_DAYS=7` remains A-001 pending confirmation; pickup copy constants are 10/60/30 minutes and 3–7 days. No gateway secret exists.

## 10. Error, Retry, and Recovery Behavior

Quote refreshes after CAT/cart changes. Order-create retries require the same idempotency key/request. Transactions fully roll back on failure. Admin conflicts reload. Job failures are logged and safely rerunnable; no paid order is selected.

## 11. Performance and Limits

Lists paginate (default 20, max 50), eager-load bounded item summaries, and index customer/date/state/expiry. Detail fetches items in one bounded query. Quote avoids N+1 CAT reads.

## 12. Contract Change Rule

Money, order snapshots, payment/fulfillment states, idempotency, expiry, or ownership changes are critical: stop, update ORD plus CART/CAT/SET/AUTH consumers, add migration/recovery plan, run full end-to-end tests, and obtain user approval.

## 13. Assumptions and TODOs

A-001 remains pending and must be confirmed or explicitly accepted at ORD-008 preflight.
