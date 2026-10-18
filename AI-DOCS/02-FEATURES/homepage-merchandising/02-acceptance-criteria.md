# Acceptance Criteria — Homepage Merchandising

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-HOME-001 — Public homepage follows required order and limits

- **Requirements:** `REQ-FND-009`, `REQ-HOME-001`, `REQ-HOME-002`, `REQ-HOME-005`, `REQ-HOME-006`, `REQ-HOME-007`, `REQ-HOME-008`, `REQ-HOME-009`
- **Given:** configured active content
- **When:** a visitor opens Home at each target viewport
- **Then:** ordered sections, controlled Swiper, at-most-eight curated rows, category links, conditional Banner 2, and See More links behave as specified
- **Negative/edge behavior:** inactive/deleted content and unavailable products do not render as purchasable
- **Evidence:** projection/API, UI, responsive, and carousel tests
- [ ] Passed

### AC-HOME-002 — Admin management enforces content invariants

- **Requirements:** `REQ-HOME-003`, `REQ-HOME-004`, `REQ-HOME-005`, `REQ-HOME-007`, `REQ-HOME-009`, `REQ-HOME-010`
- **Given:** authenticated admin
- **When:** slides, banners, and curated selections change
- **Then:** fields persist, one-to-three active slides and max-eight lists are enforced, and category management is not duplicated
- **Negative/edge behavior:** unauthorized, stale, invalid URL/image, fourth-slide, last-active removal, and ninth-selection attempts fail safely
- **Evidence:** admin API/UI integration suite
- [ ] Passed

## 3. Cross-Feature Scenarios

CAT deleted/unavailable products disappear from curated purchase displays; category/See More routes open CAT filters; UI navbar/footer wrap the fixed section order.

## 4. Security and Permission Scenarios

Public projection contains active safe content only; all mutations require admin, CSRF, URL validation, and safe image storage.

## 5. Failure and Recovery Scenarios

Partial section failure, image replacement failure, stale edit, and CAT service conflict preserve prior valid content and expose retry/field feedback.

## 6. Accessibility and Responsive Scenarios

Hero controls/announcements, pause/reduced motion, image alt text, section headings, focusable cards/links, and mobile/tablet grids pass.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Unit | `npm run test -- homepage` | yes | limits/order/projection pass |
| Integration | `npm run test:integration -- homepage` | yes | public/admin/CAT/storage cases pass |
| UI/accessibility | homepage tests plus carousel/viewport procedure | yes | Required states pass |
| Lint/build | `npm run lint && npm run build` | yes | Exit 0 |
