# Technical Contracts — Persistent Cart

## 1. Ownership

**Owns**
- Routes/screens: `/cart`; customer cart API.
- Source paths: `src/features/cart/**`, `server/src/features/cart/**`, `tests/integration/cart/**`.
- API endpoints: current cart, add/update/remove/clear.
- Entities/write authority: Cart, CartItem.
- Jobs/events: None.
- Configuration: maximum item quantity and cart line count.

**Must Not Touch**
- CAT product/variant/price records; ORD records; AUTH/UI/FND paths.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| API-CART-001 | API | Current customer's cart CRUD | Cart/Product Details UI | §3 |
| READ-CART-001 | service | Lock and read checkout-ready customer cart | ORD | §4 |
| CMD-CART-001 | service | Clear exact cart version after order creation | ORD | §4 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| AUTH-AUTH-001 | AUTH | all APIs | derive customer ID |
| READ-CAT-001 | CAT | add/read/readiness | current product/variant/price/availability |
| DB-FND-001, HTTP-FND-001 | FND | persistence/API | standard contracts |
| UI-UI-001–UI-UI-003 | UI | Cart UI | controls/states/customer shell |
| APP-FND-001 | FND | add-to-cart handler registration | one handler and visible unavailable/failure behavior |
| UI-CAT-001 | CAT | Product Details add intent | stable variantId/quantity payload |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `server/src/features/cart/**` | schema, repository, service, routes | CART-001, CART-002 | Catalog/order writes |
| `src/features/cart/**` | Cart page/components/API hooks | CART-003 | Checkout/payment logic |
| `tests/integration/cart/**` | persistence/isolation/integration evidence | CART-004 | Production data |

## 3. API Contracts

### API-CART-001 — Customer cart
| Field | Value |
|---|---|
| Method and path | `GET /api/v1/cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart` |
| Authentication | Customer session |
| Permission | `cart:self:read-write` |
| Idempotency | Add merges same variant; delete/clear are idempotent; patch uses cart version |

Request:
```json
{"variantId":"7","quantity":2,"expectedCartVersion":3}
```

Success response:
```json
{"data":{"cartId":"1","version":4,"items":[{"cartItemId":"9","productId":"1","variantId":"7","color":"Black","size":"M","quantity":2,"currentUnitPriceMinor":320000,"isAvailable":true}],"totalMinor":640000}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `VARIANT_UNAVAILABLE` | 409 | Add/update targets unavailable variant | Refresh item/options |
| `CART_CONFLICT` | 409 | Stale concurrent version | Reload cart |
| `VALIDATION_FAILED` | 422 | Quantity/limit invalid | Show field/item error |

## 4. Data Contracts

### Cart and CartItem (`owner: CART`)
| Field | Type | Required | Default | Constraints | Index/Relationship |
|---|---|---|---|---|---|
| canonical fields | see glossary | yes | documented | one cart/customer; one item/variant | unique customer and cart+variant |
| carts.version | integer | yes | 1 | increments per mutation | conflict check |
| updatedAt | datetime UTC | yes | current UTC | server managed | optional freshness index |

Lifecycle: lazily create one cart, persist across sessions, mutate items, clear exact version after successful order.  
Concurrency/transaction rule: mutations lock/version the cart; READ-CART-001 locks cart/items inside ORD's transaction, and CMD-CART-001 clears only that locked/versioned cart.

## 5. Events and Background Jobs

None.

## 6. Shared UI Contracts

CAT owns and emits UI-CAT-001 from Product Details. CART-003 registers the handler through APP-FND-001, authenticates the user experience, calls API-CART-001, and returns pending/success/error state without editing CAT-owned files.

## 7. Permissions and Security

Customer ID is session-derived. No arbitrary customer/cart ID endpoint. API applies CSRF and never returns another customer's cart.

## 8. External Integrations

None.

## 9. Configuration and Secrets

Bound maximum line count and per-line quantity. No secret.

## 10. Error, Retry, and Recovery Behavior

GET may retry; version conflicts reload. Mutations are not blindly retried except idempotent delete/clear. Unavailable items stay visible with removal action but block checkout readiness.

## 11. Performance and Limits

Cart reads are bounded by maximum line count and batch-fetch CAT projections. Avoid N+1 catalog queries. Totals are server-calculated.

## 12. Contract Change Rule

Variant identity, persistence, version, current-price, or order handoff changes require CART/CAT/ORD coordination and integration evidence.

## 13. Assumptions and TODOs

None.
