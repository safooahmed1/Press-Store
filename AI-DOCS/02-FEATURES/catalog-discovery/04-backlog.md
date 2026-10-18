# Backlog — Catalog and Discovery

## Task Status Values

`not-started` · `in-progress` · `blocked` · `done`

## Ordered Tasks

| Order | Task ID | Parent/Sub-feature | Workstream | Summary | Requirement IDs | Depends On | Owned Paths | Verification | Status | Branch | Commit Ref | Evidence |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CAT-001 | CAT/domain | WS-CAT-01 | Add catalog schema, money/discount, image, variant, and classification services | REQ-CAT-001, REQ-CAT-002, REQ-CAT-003, REQ-CAT-006, REQ-CAT-017, REQ-CAT-018 | FND-002, FND-004 | CAT server migrations/services | migration/unit tests | `not-started` | `feature/CAT-catalog-discovery` | — | — |
| 2 | CAT-002 | CAT/public-api | WS-CAT-01 | Implement paginated public list/detail/classification APIs and five filters | REQ-CAT-005, REQ-CAT-009, REQ-CAT-010, REQ-CAT-011, REQ-CAT-012, REQ-CAT-013, REQ-CAT-015, REQ-CAT-019 | CAT-001, FND-003 | CAT public routes/repos | filter/API tests | `not-started` | `feature/CAT-catalog-discovery` | — | — |
| 3 | CAT-003 | CAT/admin-api | WS-CAT-01 | Implement admin catalog CRUD, uploads, variants, flags, and safe deletion | REQ-CAT-004, REQ-CAT-016, REQ-CAT-017, REQ-CAT-018, REQ-CAT-019 | CAT-001, AUTH-AUTH-002, STO-FND-001 | CAT admin routes/services | admin/upload/conflict tests | `not-started` | `feature/CAT-catalog-discovery` | — | — |
| 4 | CAT-004 | CAT/storefront | WS-CAT-01 | Build Shop/Product Details with required filters, variants, gallery, and exclusions | REQ-CAT-007, REQ-CAT-008, REQ-CAT-009, REQ-CAT-010, REQ-CAT-011, REQ-CAT-012, REQ-CAT-013, REQ-CAT-014, REQ-SCOPE-006, REQ-SCOPE-008, REQ-SCOPE-009, REQ-SCOPE-016 | CAT-002, UI-002 | `src/features/catalog/shop/**`, `product/**` | component/responsive tests | `not-started` | `feature/CAT-catalog-discovery` | — | — |
| 5 | CAT-005 | CAT/admin-ui | WS-CAT-01 | Build responsive product/category/brand lists and forms | REQ-CAT-004, REQ-CAT-016, REQ-CAT-017, REQ-CAT-018 | CAT-003, UI-004 | `src/features/catalog/admin/**` | UI/admin form tests | `not-started` | `feature/CAT-catalog-discovery` | — | — |
| 6 | CAT-006 | CAT/integrity | WS-CAT-01 | Freeze availability contract and complete catalog cross-feature/security suite | REQ-CAT-020, REQ-FND-020, REQ-SCOPE-020 | CAT-002–CAT-005 | CAT tests/contracts | full catalog integration/build | `not-started` | `feature/CAT-catalog-discovery` | — | — |

## Blockers

| Task ID | Blocker | Owner/Decision Needed | Next Action |
|---|---|---|---|
| None. | None. | None. | None. |

## Completion Summary

- **Completed:** 0/6
- **Next ready task:** `CAT-001` after FND-002/FND-004
- **Feature status:** `planned`
