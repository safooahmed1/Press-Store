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


## 14. CART-001 independent backend development — 2026-11-06

CART-DEC-002 approves the published CAT baseline, bounds and version policy. CART-DEC-003
records the user's explicit instruction to implement only the independent portion and stop real CAT
wiring. This is not a full contract freeze, production adapter, API availability or acceptance pass.

- Branch `work/CART-backend`, isolated from checkpoint `a6603ca5f2b5eb54b75e530906cee42821ec371e`.
  Existing FND/AUTH accepted dependency decisions and CAT backend checkpoints support local development;
  no CAT-006, feature merge/readiness, original validator or release gate is waived.
- Per-line quantity is numeric integer 1–99 and maximum distinct variants is 100. Adds merge the same
  variant; merged quantities above 99 reject without changing data. Session-derived ownership only.
- Every mutation requires numeric `expectedCartVersion` (1–4294967295). Add takes variantId/quantity/version,
  patch takes quantity/version, remove and clear take a JSON body containing only expectedCartVersion.
  PATCH/DELETE item IDs are canonical positive unsigned BIGINT decimal strings. All paths are under
  `/api/v1/cart`; queries and extra body fields, prices, availability and owner overrides are rejected.
  Success returns the canonical full cart envelope with numeric version and safe integer money; HTTP 200.
  GET returns a lazily created empty cart at version 1. No automatic mutation retries.
- The cart's unique customer key serializes lazy creation, then cart/item row locks serialize operations
  within DB-FND-001. Selection changes increment version; no-op patch, missing-item delete and empty clear
  preserve it. Every request still compares versions first, so stale retries return CART_CONFLICT.
  Version exhaustion conflicts and rolls back the selection change. Wrong-owner PATCH returns generic
  NOT_FOUND (404); wrong-owner DELETE has the same no-op behavior as an absent item, without disclosure.
- Prices are obtained through one injected bounded batch inside that same transaction; GET refreshes
  cached prices without advancing the selection version. BigInt arithmetic rejects unsafe JSON totals
  with VALIDATION_FAILED, rolling back any mutation. Unavailable retained rows stay visible at supplied
  current prices; totalMinor sums displayed rows and is not a checkout-ready total. CART-002 readiness
  and READ-CART-001/CMD-CART-001 transactional order handoff are not implemented.
- `createCartRouter({database,config,appOrigin,readVariants})` consumes unchanged AUTH guard/Origin and
  HTTP-FND-001. Authentication is customer-only, opposite-scope 403, absent/expired 401; private responses
  are no-store. Mutation Origin/CSRF policy is unchanged, including configured production HTTPS origin.
  Unknown internal/provider/storage exceptions remain safe INTERNAL_ERROR. Incomplete/invalid injected
  catalog projections return provisional CATALOG_UNAVAILABLE (503), not a stale-price fallback.
- `readVariants(ids, tx)` is a CART consumer injection seam only, NOT an implemented/frozen CAT export.
  Proposed return rows are `{variantId,productId,color,size,finalPriceMinor,isAvailable}` for each existing
  ID, including unavailable/deleted-product variants. Missing newly added ID is VARIANT_UNAVAILABLE;
  missing already persisted IDs fail closed. Real CAT owner work remains unapproved and unimplemented.
  Tests inject deterministic projection fixtures only. No direct CAT SQL exists in CART production source.
- No `manifest.js` is supplied; the production application has no CART route registration or mock data.
  The SQL is staged at `server/src/features/cart/schemas/persistent-cart_001_create_carts.sql`, outside
  automatic migration discovery. Tests explicitly append it to loadMigrations() before runMigrations().
  Its canonical feature-name prefix sorts after CAT migrations, supporting customer/variant restrictive
  FKs without changing FND ordering or immutable history. Moving it to `migrations/` and reconciling the
  CAT admin upgrade fixture's fixed prefix require a later authorized integration change.
- Schema: carts has BIGINT cart/customer IDs, unique customer, positive unsigned INT version and UTC
  timestamps. cart_items has BIGINT IDs/cart/variant/cache price, quantity CHECK 1–99, safe nonnegative
  price CHECK, unique cart+variant, restrictive cart/variant FKs and variant index. The 100-line limit
  is enforced under the cart lock. No stock column, stock update, cascade or cross-owner write.
  Forward-only additive SQL; no production application, automatic DOWN or partial-DDL recovery authorized.

Original API examples remain illustrative. The approved per-operation version policy above supersedes
the earlier PATCH-only wording for local backend development. No frontend implementation is authorized.

## 15. CART-001 real backend activation — CART-DEC-004, 2026-11-06

This section supersedes §14's independent-only/no-manifest/staged-SQL disposition; earlier evidence
and decisions remain historical. CAT-DEC-012 now owns the implemented READ-CAT-001 batch shape
and validation policy in catalog-discovery/03-technical-contracts.md. CART's manifest creates that
CAT service using the existing lifecycle-owned database and supplies its readVariants method to
createCartRouter. CART passes its active DB-FND-001 transaction to the service. There is no
production fixture, separate catalog pool, direct CAT SQL or fallback to cached unavailable data.

The existing FND discovery seam now mounts `/api/v1/cart` and its documented CRUD children.
The unchanged SQL content is registered at
`server/src/features/cart/migrations/persistent-cart_001_create_carts.sql`; normal discovery finds
it exactly once after AUTH/CAT. SHA256 of the unchanged staged content is
`5e138e7a5c07866c02244e2f1dc29121654020fe99afa72e1f7ca687c8c9a192`.
Its staging comments describe the earlier hold. No applied owner migration/history is edited.
The CAT admin test now applies the complete prefix preceding cat_004 before testing its upgrade,
preserving FND out-of-order protection with this later feature migration. No runner change.

Live backend tests use discovered manifests, actual auth sessions, owner CAT admin APIs and
new disposable MySQL databases. Real prices, inactive variants, soft deletion, duplicate add,
version conflicts, isolation, logout/login and process/pool restart are exercised without catalog
projection fixtures in that suite. Existing independent fault-injection tests remain labeled as such.
No migration is run on application startup or against an existing application database.

The quantity/version/response/error rules from §14 remain effective. Checkout readiness and ORD
transactional handoff still belong to CART-002; no FE/browser/full-feature or CAT-006 pass is claimed.
Original mandatory documentation validation remains an open completion gate.
