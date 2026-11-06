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


## 14. CAT-001 backend domain implementation — 2026-11-04

CAT-DEC-002 approves an isolated early-development baseline only; this is not the full CAT API freeze. CAT-DEC-003 defines two-place percentage precision and exact half-up final-unit rounding. A-010 records bounded text/variant choices without attributing them to the PRD.

- Additive `cat_001`/`cat_002`/`cat_003` migrations use DB-FND-001 discovery. Classification uniqueness, product classification FKs, positive safe-integer money, discount range, boolean fields, unique variant pairs and bounded image slots are enforced in MySQL.
- `product_images.slot = 0` represents main role; slots 1–3 represent additional role/order. The service requires one to four uploads and creates the mandatory main image in the same product transaction. SQL enforces at most one image in each slot; it does not assert main-image existence across tables. All application writes must go through the CAT service. No numeric inventory or cascading history deletion.
- `createCatalogService({repository,storage})` provides server-internal createProduct/createCategory/createBrand, classification rename/delete and requireAvailableVariant. No HTTP routes, manifest, admin guard wiring, product-update API, homepage flag command or public list/filter endpoints are added by CAT-001. New product flags default false; max-eight curation remains CAT-003/CMD-CAT-001 work.
- IDs/version inputs are canonical positive unsigned BIGINT strings. Classification rename uses optimistic version comparison; delete locks the classification and rejects any referencing product, including soft-deleted rows. FKs also protect races. Missing/stale classification mutation yields EDIT_CONFLICT.
- All uploaded images pass through STO-FND-001. New files wrap the database transaction with compensation; validation/late-upload/insert failures unwind new files. Committed category deletion attempts old-file cleanup afterwards; a cleanup failure returns server-internal `{deleted:true,cleanupPending:path}` for explicit reconciliation, never an HTTP DTO or claim of rollback. CAT-003 must handle this outcome and must not expose paths or exception causes.
- `requireAvailableVariant` rejects unknown/inactive variants and soft-deleted products with VARIANT_UNAVAILABLE, returning current exact price on success. This is the domain primitive; consumer transaction consistency and full READ-CAT-001 acceptance remain CAT-006/consumer tasks.
- DB constraint errors retain the safe FND DB_CONSTRAINT_FAILED code; CAT-003 transport mapping must not inspect/expose raw driver errors. A lost commit acknowledgement is an ambiguous outcome: do not auto-retry or assume file/DB atomicity across a process crash. File/DB crash reconciliation and full mutation acceptance remain visible integration work.
- Migrations are explicit operational commands only; no startup migration. MySQL DDL may partially commit. On interruption, preserve the execution marker and inspect schema through a separately approved recovery procedure; never automatically drop/retry/mark-applied. No migration was applied to an existing application database.


## 15. CAT-002 public read implementation — 2026-11-04

Development authorization: CAT-DEC-004 against checkpoint 2c6bb4f. Price-filter disposition: CAT-DEC-005. Pagination/presentation choices: A-011. This documents the implemented CAT-owned public surface; full CAT/consumer/BE-FE contract freeze and integration remain open.

| Endpoint | Success data | Query |
|---|---|---|
| GET /api/v1/products | Existing API-CAT-001 summary items and page/pageSize/total meta | categoryId, brandId, minPriceMinor, maxPriceMinor, size, color, page, pageSize only |
| GET /api/v1/products/:id | One summary plus description, category `{categoryId,name}`, brand `{brandId,name}`, images `[{role,order,imageUrl}]` | None |
| GET /api/v1/categories | `{items:[{categoryId,name,imageUrl}]}` plus page/pageSize/total meta | page, pageSize only |
| GET /api/v1/brands | `{items:[{brandId,name}]}` plus page/pageSize/total meta | page, pageSize only |

All paths use the /api/v1 prefix. Public reads are anonymous and ignore session cookies; they never set cookies. Responses use the FND sendData/sendError envelope. List summary shape remains API-CAT-001: productId/name/priceMinor/discountPercent/finalPriceMinor/mainImageUrl/availableVariants. IDs are strings; money is safe integer minor units, percentage is a JSON number. List omits descriptions and additional gallery. Detail images are ordered by slot (0 main, 1–3 additional); only active variant options are exposed. Soft-deleted products are absent from counts, list and detail. Existing products with no active variants remain visible with an empty option array; no availability filter is added.

All filters combine with AND. Color and size share one correlated EXISTS over an active variant; they cannot match unrelated pairs. Category/brand IDs are canonical positive unsigned BIGINT strings. Price bounds are canonical nonnegative safe-integer strings in minor units, inclusive, and min <= max. SQL final-price expression is `FLOOR((price_minor * (10000 - discount_percent * 100) + 5000) / 10000)` using exact DECIMAL arithmetic; CAT-DEC-005 records why the implementation uses final price. Query duplicates/arrays/objects, unknown fields and unsupported search/sort/availability are 422 VALIDATION_FAILED before database work. Malformed detail IDs are 422; missing/deleted valid IDs are 404 PRODUCT_NOT_FOUND. A valid empty result/out-of-range page returns 200 with items [] and the matching total.

Repository reads are parameterized and transactional, with fixed ID ordering. A nonempty product page performs three domain queries (count, bounded page, active variants for those IDs), not one query per product. Empty pages skip the variant query. Classification pages use two queries; detail uses three. Snapshot consistency relies on the approved MySQL deployment transaction isolation; tests exercise the multi-query reads on a disposable MySQL instance; concurrent snapshot behavior and production isolation are not separately verified here. No runtime pool or DB interface is added. Existing category/brand/variant indexes are eligible; final discounted-price expressions are computed and have no new index. Production-scale filtered-query benchmarking and future approved indexing remain separate verification work, not a claimed performance pass.

The manifest exposes three contextual mounts through APP-FND-001's existing server seam, using the lifecycle-owned database. STO-FND-001 urlFor validates and renders opaque paths; only that pure method is retained from a storage adapter constructed with an explicitly unused absolute root. No put/delete/storageRoot method is called, no filesystem root is created, and no environment is read. Production upload-file serving stays FND-owned. Bad persisted image metadata fails safely rather than exposing paths or partial DTOs. All public router responses use Cache-Control: no-store to avoid stale availability; storage/database/internal exceptions use canonical safe 500 responses without driver messages, SQL, paths or cookies.

No POST/PATCH/DELETE endpoint, admin auth wiring, migrations, dependencies, frontend or future-feature writes are added. CAT-003 and CAT-006 retain admin/consumer/security acceptance. Original mandatory documentation validation remains BLOCKED / NOT RUN.


## 16. CAT-003 protected admin catalog implementation — 2026-11-04

Authorization and shared ownership: CAT-DEC-006 / FND-DEC-011. Transport choices: A-012. The existing contextual manifest now additionally mounts /admin with products/categories/brands child resources. CAT-only backend implementation; no frontend, full consumer freeze or integration acceptance implied.

| Resource under /api/v1/admin | Methods | Input / result |
|---|---|---|
| /products, /products/:id | GET list/detail, POST create, PUT update, DELETE soft remove | Full product fields, explicit variants/flags; update/delete require version. Creation requires 1 main + up to 3 additional uploads. Mutation result productId/version/updatedAt/cleanupPending; delete returns cleanupPending. |
| /categories, /categories/:id | GET list/detail, POST create, PUT update, DELETE | name and image on create; update name/version with optional replacement image; delete version. Safe DTO categoryId/name/version/updatedAt/imageUrl, mutations include cleanupPending. |
| /brands, /brands/:id | GET list/detail, POST create, PUT update, DELETE | name; version on update/delete; no image. Safe DTO brandId/name/version/updatedAt, mutations include cleanupPending. |

Lists accept page/pageSize only and return data.items with page/pageSize/total meta. Product list includes main image, name, brand/category names and IDs, prices, active variant options, flags and version. Detail additionally includes description, full ordered gallery with imageId and all retained variant IDs/states. The admin can submit the desired explicit options; omitted pairs become unavailable, not destructively deleted. Readding an identical canonical pair restores its stable variantId. Color/size changes create a new pair while old identity remains unavailable for history. Soft-deleted products disappear from public/admin active reads and all their variants become unavailable; product/variant/image rows and files remain for historical references.

All admin paths first require AUTH-AUTH-002 (401 absent/expired, 403 valid customer-only, valid admin wins). Mutations additionally require the existing AUTH Origin boundary; production compares configured HTTPS appOrigin, ignores forwarded headers, and rejects cross-site fetch metadata. Authentication/origin precede multipart parsing and all file writes. JSON uses FND parsers; multipart uses pinned busboy and one data JSON field, images file fields. Files are buffered within explicit bounds, then decoded/normalized with STO-FND-001; original filenames are never used as storage paths. Path separators/unknown file fields, duplicate metadata, excessive file/field/part counts, malformed framing and >5 MiB files are rejected. Exactly 5 MiB and four uploads are supported; total byte ceiling is 4*5 MiB+128 KiB, metadata 64 KiB. No new upload protocol or client-supplied disk path. Existing FND type/dimension/animation validation remains authoritative.

Product create/update/delete and CMD-CAT-001 use the singleton catalog_curation_states row lock before product locks/counts, held through commit. Max eight is enforced separately for active Best Seller/New Arrival flags, excluding the product being updated from each count. Existing flagged products may remain flagged at the limit; concurrent ninth insertion/update fails with CURATION_LIMIT_EXCEEDED (409), rolling back new records and compensating staged files. CMD-CAT-001 is createAdminCatalogService(...).setFlags(productId,{version,bestSeller,newArrival}); it returns productId/version/updatedAt/cleanupPending without performing file work and uses the same repository transaction. No HOME writes or consumer implementation added.

Product plus images/variants update atomically with version compare under row lock. Existing gallery IDs may be kept/reordered, new uploads referenced by zero-based uploadIndex; all referenced existing image IDs must belong to that product and all uploaded files must be used once. Main slot is first, total 1–4; omitting the image manifest preserves the current gallery and forbids new uploads. Newly staged files wrap the transaction in FND compensation. Old obsolete files are removed only after commit and after new-file compensation scopes return. Post-commit old-file deletion failure returns cleanupPending:true without exposing paths or deleting committed new files; it is not a rollback. Explicit owner-approved inventory/reconciliation is needed for remaining orphan files; no background deletion job or crash-atomicity promise is introduced. Lost commit acknowledgement/process-crash recovery remains a documented ambiguity, without automatic write retries.

Classification names remain unique; referenced deletion is rejected even if referencing products are soft-deleted. Classification mutations use version conflict checks; replacement images follow the same staged-new/commit/delete-old ordering. Unknown/malformed IDs/query/payload fields are safe validation errors. PRODUCT_NOT_FOUND/CATEGORY_NOT_FOUND/BRAND_NOT_FOUND are 404, EDIT_CONFLICT/RESOURCE_IN_USE/NAME_UNAVAILABLE/CURATION_LIMIT_EXCEEDED are 409, invalid inputs/variants/images 422, oversized upload 413 and unsupported media 415. DB failures remain safe 500 without raw SQL, causes, filesystem paths or secrets; constraints map only through operation-owned safe codes. Every admin response is no-store and never issues or clears auth cookies.

FND owns validated storageConfig and the one lifecycle database. Production read/write root is the same validated production upload root; tests must explicitly inject temporary storage. Missing test storage cannot fall back to writing application uploads (file mutation fails 503). The FND production upload server remains unchanged; dev-browser upload serving/proxy and full FE integration are not claimed verified here. cat_004 is additive and forward-only, discovered by existing migration runner; no startup migration or existing application database use. On partial DDL, retain FND marker and inspect schema via a separately approved recovery plan, never auto-drop/retry. Hosting decode-memory/request concurrency and full release/security checks remain open. Full AUTH-005 abuse controls are not transferred with the guard.


## 17. HOME-001 CAT read/command amendment — 2026-11-06

CAT-DEC-011, approved with HOME-DEC-002, owns all added merchandising data work. createMerchandisingService({database,imageUrl}) is the named HOME consumer seam:

- read(): {version,bestSellerProductIds,newArrivalProductIds,bestSellers,newArrivals,categories}. Numeric version is shared by both selection lists; selected IDs are canonical strings. Up to eight flags each, first 48 categories by ID. Product summaries match API-CAT-001 money/image/active-variant shape. Public purchase displays exclude deleted products and products without an available variant, while admin selection IDs retain temporarily unavailable choices.
- replace(kind,{productIds,version}): atomic desired-set replacement, kind best-sellers/new-arrivals. Strict complete input, max eight unique canonical IDs, positive numeric current version. Invalid/duplicate IDs rejected, missing/deleted targets PRODUCT_NOT_FOUND, ninth CURATION_LIMIT_EXCEEDED, stale EDIT_CONFLICT. Returns {resourceId:kind,version:next}. Desired set order is not persisted; public ordering is fixed product ID, canonical facts remain Product flags.
- Existing createAdminCatalogService.setFlags remains unchanged externally. Product create/update/delete/setFlags advances global list revision only when active membership changes, in the same curation-locked transaction. Replacing a list advances it and increments versions only on products whose flag changes. Product update/default/unavailable behavior otherwise unchanged.
- The additive revision migration is cat_005_add_curation_revision.sql. It adds one positive revision column to existing coordination state, no duplicate selection model. Existing applied SQL files/checksums are unchanged. Explicit FND runner only, no application startup or existing DB migration in this task.
- SQL remains in CAT repositories, validation/projection in CAT services. HOME does not import repositories or directly access tables. Existing CAT publicQuery validator and bounded multipart catalogBody are reused for internal CTA query syntax and data/images transport, without changing their existing behavior; HOME enforces one image per slide before file writes.

Existing public/product/classification API contracts are unchanged. Full owner/FE fixture acknowledgement, load/production isolation/migration/consumer verification and ordinary integration baseline remain open; not a full CAT-006 pass.
