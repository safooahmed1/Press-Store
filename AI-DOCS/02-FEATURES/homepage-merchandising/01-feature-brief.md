# Feature Brief — Homepage Merchandising

## 1. Identity

- **Feature ID:** `HOME`
- **Kind:** `business`
- **Parent Feature:** `None`
- **Owner:** `WS-HOME-BE`, `WS-HOME-FE`, `WS-HOME-INT`
- **Status:** `planned`

## 2. Summary

Deliver the ordered public homepage and one admin Homepage area for hero slides, promotion banners, existing categories, and manually curated Best Sellers/New Arrivals.

## 3. Business Value

Lets the store refresh its primary marketing surface without code changes while enforcing strict content and selection limits.

## 4. Roles and Users

Anonymous/Customer view; Admin manages.

## 5. Requirement Coverage

| Requirement ID | Summary | PRD Location |
|---|---|---|
| REQ-FND-009 | Hero uses Swiper | §3, §7.2 |
| REQ-HOME-001 | Required homepage section order | §7 |
| REQ-HOME-002, REQ-HOME-003, REQ-HOME-004 | One-to-three hero slides and admin fields/CRUD | §7.2, §23.1 |
| REQ-HOME-005 | At most eight manually selected Best Sellers with See More | §7.3, §23.2 |
| REQ-HOME-006 | Existing categories link to filtered Shop | §7.4, §23.4 |
| REQ-HOME-007, REQ-HOME-008 | Two text/active banner placements with red direction | §7.5, §23.5 |
| REQ-HOME-009 | At most eight manually selected New Arrivals with See More | §7.6, §23.3 |
| REQ-HOME-010 | One admin Homepage area | §23 |

## 6. In Scope

Hero/banner schema and APIs, CAT merchandising-flag commands/projections, public homepage projection/UI, admin content management UI, section/limit enforcement, Swiper, and responsive/state tests.

## 7. Out of Scope

Duplicate category CRUD, product CRUD, recommendation algorithms, banner images, more than two banner slots, or unbounded carousel/curated lists.

## 8. User Flows

### Flow 1 — View homepage
1. Visitor loads the public homepage projection.
2. Sections render in the fixed order.
3. Hero controls expose one to three active slides.
4. Category/product actions lead to filtered Shop/detail routes.

Alternate flows:
- Banner 2 is absent when inactive.
- Empty curated section shows a deliberate empty/hide policy without breaking order.

Exit states:
- Success: navigation reaches the intended catalog view.
- Cancelled: carousel interaction stops safely.
- Failure: shell and retry state remain usable.

### Flow 2 — Admin merchandises homepage
1. Admin opens Homepage.
2. Admin edits hero/banner records and toggles CAT product flags.
3. Server enforces active/selection limits atomically.

Alternate flows:
- Attempt to deactivate the last hero is rejected.

Exit states:
- Success: public projection updates.
- Cancelled: unsaved edits are discarded.
- Failure: clear limit/conflict/storage error.

## 9. Screens and States

| Screen/View | Route/Entry | Purpose | Elements | Loading | Empty | Error | Unauthorized |
|---|---|---|---|---|---|---|---|
| Home | `/` | Marketing/discovery | Hero, curated products, banners, categories | Section skeletons | Safe section policy | Retry while shell stays | Public |
| Admin Homepage | `/admin/homepage` | Manage all homepage content | Slide/banner editors, product/category selectors | Skeleton | Add/select actions | Field/limit/retry | Admin only |

## 10. Business Rules

Exactly one to three active hero slides; up to eight Best Sellers and eight New Arrivals; exactly two named banner placements at most; Banner 2 renders only when active; categories are read from CAT; section order never changes in V1.

## 11. Edge Cases

Last active hero deletion, fourth active slide, ninth product flag, deleted/hidden curated product, inactive Banner 2, invalid CTA URL, image replacement failure, one-slide carousel, and concurrent admin edits.

## 12. Dependencies

CAT projections/flag command and category/product routes; FND storage; AUTH admin guard; UI shell/components.

## 13. Assumptions and TODOs

None.
