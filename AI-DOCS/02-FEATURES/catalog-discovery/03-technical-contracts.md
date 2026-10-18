# Technical Contracts — Catalog and Discovery

## 1. Ownership

**Owns**
- Routes/screens: `/products`, `/products/:id`, `/admin/products`, `/admin/categories`, `/admin/brands` and forms.
- Source paths: `src/features/catalog/**`, `server/src/features/catalog/**`, `tests/integration/catalog/**`.
- API endpoints: public/admin products, categories, brands.
- Entities/write authority: Product, ProductImage, ProductVariant, Category, Brand.
- Jobs/events: None.
- Configuration: image count/dimensions, filter/page bounds.

**Must Not Touch**
- Homepage hero/banner records; carts/orders; FND storage internals; AUTH/UI paths.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| API-CAT-001 | API | Public catalog list/detail/classifications | Shop, HOME | §3 |
| API-CAT-002 | API | Admin catalog CRUD | catalog admin UI | §3 |
| READ-CAT-001 | service | Current product/variant/price/availability | CART, ORD | §4 |
| READ-CAT-002 | service | Category and curated product projections | HOME | §4 |
| CMD-CAT-001 | service | Set Best Seller/New Arrival flags under max-8 rule | HOME | §4 |
| READ-CAT-003 | service | Active/admin product count projection | ADM | §4 |
| UI-CAT-001 | UI intent | Add selected available variant to cart | CART | §6 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| DB-FND-001 | FND | repositories/migrations | transactions/parameterized access |
| STO-FND-001 | FND | product/category images | validated put/delete/url |
| AUTH-AUTH-002 | AUTH | admin routes | fixed admin guard |
| UI-UI-001, UI-UI-002, UI-UI-004 | UI | public/admin UI | shared controls/states/layout |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `server/src/features/catalog/migrations/**` | catalog schema/indexes | CAT-001 | Cart/order/home tables |
| `server/src/features/catalog/{repositories,services}/**` | money, availability, CRUD/filter logic | CAT-001–CAT-003 | Checkout/order writes |
| `server/src/features/catalog/routes/**` | public/admin REST adapters | CAT-002, CAT-003 | Auth implementation |
| `src/features/catalog/shop/**`, `product/**` | public pages/components | CAT-004 | Cart persistence logic |
| `src/features/catalog/admin/**` | admin lists/forms | CAT-005 | Shared admin shell |
| `tests/integration/catalog/**` | catalog evidence | CAT-006 | Other feature table writes |

## 3. API Contracts

### API-CAT-001 — Public catalog
| Field | Value |
|---|---|
| Method and path | `GET /api/v1/products`, `GET /products/:id`, `GET /categories`, `GET /brands` |
| Authentication | None |
| Permission | `catalog:read` |
| Idempotency | Safe reads; bounded pagination |

Request:
```json
{"query":{"categoryId":"?","brandId":"?","minPriceMinor":"?","maxPriceMinor":"?","size":"?","color":"?","page":1,"pageSize":24}}
```

Success response:
```json
{"data":{"items":[{"productId":"1","name":"Jacket","priceMinor":400000,"discountPercent":20,"finalPriceMinor":320000,"mainImageUrl":"/uploads/x","availableVariants":[{"variantId":"7","color":"Black","size":"M"}]}]},"meta":{"page":1,"pageSize":24,"total":1}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `VALIDATION_FAILED` | 422 | Invalid filter/range | Mark/reset invalid filter |
| `PRODUCT_NOT_FOUND` | 404 | Deleted/missing product | Show not-found action |

### API-CAT-002 — Admin catalog CRUD
| Field | Value |
|---|---|
| Method and path | CRUD `/api/v1/admin/products`, `/categories`, `/brands`; multipart where images change |
| Authentication | Admin session |
| Permission | `admin:catalog:manage` |
| Idempotency | Resource update uses version/updatedAt conflict check |

Request:
```json
{"name":"Jacket","brandId":"2","categoryId":"3","description":"...","priceMinor":400000,"discountPercent":20,"variants":[{"color":"Black","size":"M","isAvailable":true}],"bestSeller":false,"newArrival":true}
```

Success response:
```json
{"data":{"productId":"1","updatedAt":"ISO-8601"}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `IMAGE_LIMIT_EXCEEDED` | 422 | Main/additional image rule fails | Show image-field error |
| `DUPLICATE_VARIANT` | 422 | Repeated color/size pair | Mark variants |
| `RESOURCE_IN_USE` | 409 | Referenced category/brand delete | Explain reassignment required |
| `EDIT_CONFLICT` | 409 | Stale admin edit | Reload and reconcile |

## 4. Data Contracts

### Product, ProductImage, ProductVariant, Category, Brand (`owner: CAT`)
| Field | Type | Required | Default | Constraints | Index/Relationship |
|---|---|---|---|---|---|
| canonical fields | see glossary | yes/conditional | documented | no float money; unique variant pair | catalog filter indexes/FKs |
| productImages.role/order | enum/int | yes | additional/order | exactly one main; maximum three additional | product FK/order index |
| products.deletedAt | datetime UTC | no | null | non-null hides from purchase | public query index |
| products.version | integer | yes | 1 | increment on admin update | conflict check |

Lifecycle: product delete is soft/removal from public purchase; classification delete is rejected while referenced; unavailable variants remain addressable for historical snapshots but are not purchasable.  
Concurrency/transaction rule: product plus images/variants commits atomically; file writes compensate on rollback; CMD-CAT-001 locks/counts before setting at most eight flags of each type.

READ-CAT-003 returns one bounded count from the canonical Product store, with its active/admin interpretation named in the response contract and no product rows.

## 5. Events and Background Jobs

None.

## 6. Shared UI Contracts

| Contract ID | Component | Props/Input | States | Consumers | Accessibility |
|---|---|---|---|---|---|
| UI-CAT-001 | `catalog.add-to-cart` intent | `{ variantId, quantity }` emitted only after a valid color/size selection | unavailable handler, pending, success, validation/error | CART registers the handler through APP-FND-001 | Product Details keeps focus, announces result, and links to login/cart recovery |

## 7. Permissions and Security

Public DTOs exclude storage internals/deleted rows. Admin mutation applies AUTH-AUTH-002, CSRF, validation, safe uploads, and version conflicts.

## 8. External Integrations

STO-FND-001 only. CAT stores returned relative paths and coordinates compensation/deletion after a successful replacement transaction.

## 9. Configuration and Secrets

Public page-size maximum, image count (1 main + 0–3 additional), image validation limits, and allowed image types. No feature secret.

## 10. Error, Retry, and Recovery Behavior

Safe reads can retry through React Query. Mutations never automatically retry ambiguous file/database writes. Stale edits conflict. Removed variants return `VARIANT_UNAVAILABLE` through READ-CAT-001 consumers.

## 11. Performance and Limits

Default page 24, maximum 48. Indexed category/brand/price and variant color/size filters. List DTOs omit descriptions/additional gallery unless needed. Images use responsive sizes and lazy loading below fold.

## 12. Contract Change Rule

Money, availability, variant identity, flags, image limits, or public DTO changes require CAT approval, CART/HOME/ORD consumer updates, integration tests, and user approval when business behavior changes.

## 13. Assumptions and TODOs

None.
