# Feature Brief — Catalog and Discovery

## 1. Identity

- **Feature ID:** `CAT`
- **Kind:** `business`
- **Parent Feature:** `None`
- **Owner:** `WS-CAT-01`
- **Status:** `planned`

## 2. Summary

Own products, images, color/size availability, categories, brands, discounts, public shop/detail/filter experiences, and the admin catalog CRUD surface.

## 3. Business Value

Provides the canonical purchasable assortment while keeping availability simple, historical orders safe, and catalog management practical.

## 4. Roles and Users

Anonymous/Customer browse; Admin manages all catalog resources.

## 5. Requirement Coverage

| Requirement ID | Summary | PRD Location |
|---|---|---|
| REQ-CAT-001, REQ-CAT-002 | Product fields and one-plus-three image rule | §8.1–8.2 |
| REQ-CAT-003, REQ-CAT-004, REQ-CAT-005 | Color/size combinations and boolean availability | §8.3 |
| REQ-CAT-006, REQ-CAT-007, REQ-CAT-008 | Discount and Product Details behavior; no Buy Now | §8.4–8.5 |
| REQ-CAT-009, REQ-CAT-010, REQ-CAT-011, REQ-CAT-012, REQ-CAT-013 | Category, brand, price, size, color filters | §9 |
| REQ-CAT-014, REQ-CAT-015 | No search, availability filter, or sorting | §9 |
| REQ-CAT-016, REQ-CAT-017, REQ-CAT-018 | Product, category, and brand admin CRUD | §17–19 |
| REQ-CAT-019, REQ-CAT-020 | REST resources and centralized availability | §28, §31 |
| REQ-SCOPE-006, REQ-SCOPE-008, REQ-SCOPE-009 | No recommendations, reviews, or ratings | §2, §37 |
| REQ-SCOPE-016, REQ-SCOPE-020 | No wishlist or Elasticsearch | §37 |

## 6. In Scope

Catalog schema, money/discount calculation, uploads through STO-FND-001, REST reads/CRUD, filtering, Shop/Product Details UI, admin list/forms, soft product removal/history rules, and availability service contract.

## 7. Out of Scope

Search, sort, wishlist, recommendations, ratings/reviews, numeric stock, ordering, homepage layout, or direct upload-platform implementation.

## 8. User Flows

### Flow 1 — Browse and filter
1. Visitor opens Shop.
2. Visitor combines supported filters.
3. Server returns a paginated public product projection.
4. Visitor opens Product Details and selects only an available color/size pair.

Alternate flows:
- No matches show an empty state and filter reset.
- A removed variant disappears on refresh.

Exit states:
- Success: valid variant can proceed to Add to Cart.
- Cancelled: filters may be cleared.
- Failure: safe retry state.

### Flow 2 — Admin manages catalog
1. Admin creates/edits categories and brands.
2. Admin creates/edits a product, images, discount, variants, and merchandising flags.
3. Server validates limits/references and persists atomically with storage compensation.

Alternate flows:
- Delete hides a product from purchase while order history remains.
- Referenced category/brand deletion is rejected.

Exit states:
- Success: public projections reflect the change.
- Cancelled: form changes are discarded.
- Failure: field/conflict/storage error with no partial record.

## 9. Screens and States

| Screen/View | Route/Entry | Purpose | Elements | Loading | Empty | Error | Unauthorized |
|---|---|---|---|---|---|---|---|
| Shop | `/products` | Browse/filter | Filter controls, grid, pagination | Grid skeleton | Reset filters | Retry | Public |
| Product Details | `/products/:id` | Select variant/add cart | Gallery, brand/name/prices, description, selectors, quantity | Detail skeleton | Not found | Retry | Public |
| Admin Products | `/admin/products` | Manage products | List/cards, CRUD actions | Skeleton | Add product | Retry | Admin login/forbidden |
| Product Form | `/admin/products/new|:id/edit` | Edit complete product | Fields, images, variants, flags | Form skeleton | None. | Field/conflict | Admin only |
| Admin Categories/Brands | `/admin/categories`, `/admin/brands` | Manage classifications | Lists/forms/actions | Skeleton | Add action | Retry/conflict | Admin only |

## 10. Business Rules

Money uses EGP minor units and deterministic percentage rounding. A variant is one unique product/color/size pair with no quantity. Public APIs omit unavailable/deleted purchase options. A product requires one main and at most three additional images. Category/brand references are valid. Product deletion preserves order history.

## 11. Edge Cases

100%/0% discount, invalid/duplicate variant pairs, last variant removed, referenced category deletion, concurrent admin edit, upload failure, filter combinations, zero results, deleted product deep link, and cart holding a now-unavailable variant.

## 12. Dependencies

FND DB/HTTP/storage; AUTH admin guard; UI states/components.

## 13. Assumptions and TODOs

None.
