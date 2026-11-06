# Technical Contracts — Homepage Merchandising

## 1. Ownership

**Owns**
- Routes/screens: `/`, `/admin/homepage`; public/admin homepage APIs.
- Source paths: `src/features/homepage/**`, `server/src/features/homepage/**`, `tests/integration/homepage/**`.
- API endpoints: homepage projection and hero/banner admin resources.
- Entities/write authority: HeroSlide, PromotionBanner. Product flags remain CAT-owned.
- Jobs/events: None.
- Configuration: active slide, curated list, and banner placement limits.

**Must Not Touch**
- CAT tables/files except through READ-CAT-002/CMD-CAT-001; shared UI/storage/AUTH internals.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| API-HOME-001 | API | Public ordered homepage projection | Home UI | §3 |
| API-HOME-002 | API | Admin hero/banner/curation operations | admin Homepage UI | §3 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| READ-CAT-002 | CAT | public/category/curated projections | excludes deleted/unavailable purchase display |
| CMD-CAT-001 | CAT | max-eight Best Seller/New Arrival flags | atomic limit enforcement |
| STO-FND-001 | FND | hero images | validated storage |
| AUTH-AUTH-002 | AUTH | admin API | fixed admin guard |
| UI-UI-001–UI-UI-004 | UI | public/admin UI | shared controls/states/shells |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `server/src/features/homepage/**` | hero/banner data, projection, admin API | HOME-001 | Product/category writes |
| `src/features/homepage/public/**` | ordered Home/sections | HOME-002 | Product business rules |
| `src/features/homepage/admin/**` | unified admin Homepage UI | HOME-003 | Duplicate catalog forms |
| `tests/integration/homepage/**` | limits/order/consumer evidence | HOME-004 | Other feature writes |

## 3. API Contracts

### API-HOME-001 — Public homepage projection
| Field | Value |
|---|---|
| Method and path | `GET /api/v1/homepage` |
| Authentication | None |
| Permission | `homepage:read` |
| Idempotency | Safe read; bounded cache permitted |

Request:
```json
{}
```

Success response:
```json
{"data":{"heroSlides":[],"bestSellers":[],"banner1":{"text":"..."},"categories":[],"banner2":null,"newArrivals":[]}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `HOMEPAGE_UNAVAILABLE` | 503 | Required projection cannot load | Show safe retry state |

### API-HOME-002 — Admin homepage operations
| Field | Value |
|---|---|
| Method and path | CRUD `/api/v1/admin/homepage/hero-slides`, PUT banner slots, PUT curated product ID lists |
| Authentication | Admin session |
| Permission | `admin:homepage:manage` |
| Idempotency | PUT replaces a versioned slot/list; slide updates use version |

Request:
```json
{"title":"New Drop","subtitle":"...","buttonText":"Shop","buttonLink":"/products","isActive":true,"displayOrder":1,"version":1}
```

Success response:
```json
{"data":{"resourceId":"1","version":2}}
```

| Error Code | HTTP/Transport Status | Condition | Client Behavior |
|---|---:|---|---|
| `HERO_ACTIVE_LIMIT` | 409 | Active count would leave 0 or exceed 3 | Explain required range |
| `CURATED_LIMIT` | 409 | More than 8 selected | Keep prior selection |
| `EDIT_CONFLICT` | 409 | Stale content edit | Reload/reconcile |

## 4. Data Contracts

### HeroSlide and PromotionBanner (`owner: HOME`)
| Field | Type | Required | Default | Constraints | Index/Relationship |
|---|---|---|---|---|---|
| canonical fields | see glossary | yes/conditional | documented | 1–3 active slides; two unique banner slots | active/order and unique placement |
| version | integer | yes | 1 | increments | conflict check |

Lifecycle: slide/banner CRUD retains valid active limits; public projection includes active data only. Product curation is stored canonically as CAT flags through CMD-CAT-001.  
Concurrency/transaction rule: active/curated limit checks lock relevant rows and commit atomically; image replacement compensates safely.

## 5. Events and Background Jobs

None.

## 6. Shared UI Contracts

None. HOME owns section components and consumes UI primitives.

## 7. Permissions and Security

Public data is active/safe only. Admin mutations require AUTH-AUTH-002, CSRF, URL allowlisting, safe image validation, and version checks.

## 8. External Integrations

Swiper is a client library, not a service. Hero image storage uses STO-FND-001.

## 9. Configuration and Secrets

Hard limits: 1–3 active slides, 0–8 per curated flag, two banner placements. No secrets.

## 10. Error, Retry, and Recovery Behavior

Public read may retry/cache. Admin mutation conflicts do not auto-retry. Storage/DB compensation preserves the prior valid slide. If Banner 2 is inactive it is `null`, not an error.

## 11. Performance and Limits

One bounded projection request, responsive images, below-fold lazy loading, and no unbounded relations. Swiper loads only active slides.

## 12. Contract Change Rule

Section order, limits, CTA safety, curation ownership, or projection shape changes require HOME/CAT/UI coordination and user approval for business-scope changes.

## 13. Assumptions and TODOs

None.


## 14. HOME-001 approved backend implementation — 2026-11-06

Authorization: HOME-DEC-002, CAT-DEC-011, reused FND-DEC-012/CAT-DEC-009. Isolated work/HOME-backend starts from published a6603ca and reuses only four approved FND/CAT composition/fixture files from SET. SET feature/work remains separate. A-014 records noncritical transport/order bounds. No full frozen integration baseline or feature acceptance is implied.

| API under /api/v1 | Methods / input | Result |
|---|---|---|
| /homepage | GET, no query | Ordered safe projection heroSlides,bestSellers,banner1,categories,banner2,newArrivals |
| /admin/homepage | GET page/pageSize | Paginated heroSlides, banner1/banner2 or null, selections plus meta |
| /admin/homepage/hero-slides | GET pagination, POST multipart data JSON + one images file | List; POST 201 resourceId/version/cleanupPending |
| /admin/homepage/hero-slides/:id | GET; PUT full metadata/current numeric version with optional replacement image; DELETE JSON {version} | Safe row, mutation resourceId/version/cleanupPending or delete cleanupPending |
| /admin/homepage/banners | GET | items with placement,text,isActive,version |
| /admin/homepage/banners/:placement | PUT {text,isActive,version}, banner_1/banner_2 only | resourceId/version, 200; version 0 provisions missing slot |
| /admin/homepage/curation | GET | version,bestSellerProductIds,newArrivalProductIds |
| /admin/homepage/curation/:kind | PUT {productIds,version}, best-sellers/new-arrivals | resourceId/version from atomic CAT command, 200 |

IDs are canonical positive unsigned BIGINT strings, versions numeric. PUT replaces editable metadata; no body image path, actor/role or stock field accepted. Unknown queries/payloads/URLs are 422; unsupported media 415; oversized transport retains FND/CAT 413. Missing slide/product 404, stale EDIT_CONFLICT 409, hero count outside 1–3 HERO_ACTIVE_LIMIT 409, ninth selection CURATED_LIMIT 409. Public failure of any required owner projection or initial zero hero is 503 HOMEPAGE_UNAVAILABLE, without partial response/driver/path details. All responses no-store; no endpoint sets/clears auth cookies.

Hero POST must first create one active slide; all subsequent writes lock HOME singleton before row/count checks and retain 1–3 active slides. Inactive slides may exist and are only in paginated admin reads. Public selects at most four to detect invalid over-limit data, emits at most three active ordered slide DTOs {slideId,imageUrl,title,subtitle,buttonText,buttonLink,displayOrder}; no inactive/version/internal path fields. Metadata is revalidated before public projection. CTA whitelist is /products or canonical /products/:id; list filters reuse CAT public-query validation, no duplicate keys, unknown filters, fragments, external/protocol-relative/admin/encoded-traversal routes or literal controls. Encoded output also fits storage bound.

Banners are fixed two CHECK/PK placements with versioned first PUT/update. Both disabled/absent slots return null, explicitly including banner1 under HOME-DEC-002; active DTO is {text}. No banner image or extra placement, and fixed section keys/order remain unchanged. SQL has no seeded marketing content; initial admin state is empty until explicit protected configuration.

HOME public service independently loads HOME snapshot and CAT-owned projection through named service, builds exactly the fixed public shape and fails safely if required read fails. CAT provides max-eight available curated purchase summaries and bounded existing categories; no duplicate category/product CRUD. Temporarily unavailable flagged product IDs remain selected privately but disappear from public purchase displays; deleted products cannot be selected and CAT delete updates revision. No cross-owner globally atomic read instant/production isolation guarantee is claimed, only owner transactions and safe projection assembly.

CAT replacement holds existing curation singleton through CAS/target validation/whole-set flag updates/product-version increments/revision commit. Both lists share a global numeric revision. Existing single-product flag writers participate, preventing stale HOME list replacement from overwriting intervening CAT choices. No HOME repository product/category queries or writes, nor duplicate selection table. Existing individual setFlags API is additive-compatible; required cat_005 migration is explicit before new code writes.

Admin scope and mutation Origin checks precede multipart/file work. Reuse AUTH guard/cookies/session and configured production origin, ignoring forwarded hosts; absent/expired 401, customer-only 403, valid admin precedence. One hero image required on create, at most one replacement, normalized by FND. Existing bounded CAT multipart parser is reused without protocol duplication; it may buffer up to its existing four-file envelope, but HOME rejects multiple files before storage. No new dependency/env reader/pool.

New files wrap DB transaction in FND compensation; old images are deleted only after commit and successful exit from new-file compensation scope. Cleanup failure returns cleanupPending:true without leaking paths or deleting committed new data. This is not a distributed crash-atomic transaction; lost commit acknowledgement/process crashes and orphan inventory need explicit approved reconciliation, no blind retries/job. Hard hero deletion has no order references; product history remains CAT-owned.

Additive home_001 creates homepage_states, hero_slides and promotion_banners. cat_005 adds CAT revision only. Existing migration SQL/checksums are unchanged and no startup migrations run. MySQL partial DDL retains FND interruption/recovery rules; only disposable fixtures were migrated. Full HOME-004 FE/browser/consumer/security/visual/hosting/recovery/load checks and original docs validator remain open. No implementation acceptance checkbox is passed for the whole feature.
