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
