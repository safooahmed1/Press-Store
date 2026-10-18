# Acceptance Criteria — Catalog and Discovery

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-CAT-001 — Catalog data and availability are canonical

- **Requirements:** `REQ-CAT-001`, `REQ-CAT-002`, `REQ-CAT-003`, `REQ-CAT-004`, `REQ-CAT-005`, `REQ-CAT-006`
- **Given:** valid and invalid product/image/variant inputs
- **When:** admin CRUD and public reads execute
- **Then:** image limits, money, unique pairs, references, and boolean availability are enforced and public options are purchasable only
- **Negative/edge behavior:** no stock count or unavailable purchase option is exposed
- **Evidence:** schema/service/API tests
- [ ] Passed

### AC-CAT-002 — Shop and detail support required discovery only

- **Requirements:** `REQ-CAT-007` through `REQ-CAT-015`, `REQ-SCOPE-006`, `REQ-SCOPE-016`, `REQ-SCOPE-020`
- **Given:** a varied catalog
- **When:** users browse, combine each supported filter, and open details
- **Then:** correct paginated results, prices, gallery, selectors, quantity, and Add to Cart render responsively
- **Negative/edge behavior:** no Buy Now, global search, availability filter, sort, recommendation, or wishlist appears
- **Evidence:** API filter matrix and UI tests/manual responsive evidence
- [ ] Passed

### AC-CAT-003 — Admin CRUD is safe and complete

- **Requirements:** `REQ-CAT-016`, `REQ-CAT-017`, `REQ-CAT-018`, `REQ-CAT-019`, `REQ-CAT-020`
- **Given:** an authenticated admin
- **When:** products, variants, categories, and brands are created, updated, removed, or viewed
- **Then:** standard REST behavior, authorization, storage compensation, reference conflicts, and history preservation work
- **Negative/edge behavior:** customer/anonymous mutations fail and concurrent invalid updates do not partially persist
- **Evidence:** admin API/UI integration suite
- [ ] Passed

## 3. Cross-Feature Scenarios

HOME uses CAT projections/flags, CART uses read/price/availability contracts, and ORD revalidates/snapshots through CAT without direct table writes.

## 4. Security and Permission Scenarios

Public reads expose safe fields; all mutations require admin; upload attacks fail; arbitrary filters/SQL input are not accepted.

## 5. Failure and Recovery Scenarios

Database/storage failure, deleted deep link, stale edit conflict, referenced classification deletion, and unavailable variant all produce stable recovery behavior.

## 6. Accessibility and Responsive Scenarios

Gallery controls, filter drawer, selector labels/states, price semantics, admin forms, and mobile product grids are keyboard/responsive tested.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Unit | `npm run test -- catalog` | yes | money/variant/schema logic passes |
| Integration | `npm run test:integration -- catalog` | yes | public/admin/filter/upload cases pass |
| UI | catalog component tests plus responsive filter/gallery procedure | yes | Required states usable |
| Lint/build | `npm run lint && npm run build` | yes | Exit 0 |
