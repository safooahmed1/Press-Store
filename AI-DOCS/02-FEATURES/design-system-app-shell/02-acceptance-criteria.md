# Acceptance Criteria — Design System and App Shell

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-UI-001 — Visual system is distinctive and consistent

- **Requirements:** `REQ-UI-001`, `REQ-UI-002`, `REQ-UI-003`, `REQ-FND-004`
- **Given:** the frontend-design workflow and approved requirements
- **When:** shared tokens/primitives render representative pages
- **Then:** the UI expresses a deliberate editorial fashion direction with white/black/red hierarchy and strong typography
- **Negative/edge behavior:** it does not copy the reference literally or fall back to generic template defaults
- **Evidence:** visual QA captures and token/component tests
- [ ] Passed

### AC-UI-002 — Shell navigation and states are accessible

- **Requirements:** `REQ-UI-004`, `REQ-UI-005`, `REQ-FND-015`, `REQ-FND-016`
- **Given:** desktop/mobile widths and keyboard input
- **When:** navbar, footer, forms, and collection states are used
- **Then:** destinations, focus, labels, feedback, and optional content behave consistently
- **Negative/edge behavior:** empty/error/unauthorized states do not render blank or leak private content
- **Evidence:** component, keyboard, and accessibility checks
- [ ] Passed

### AC-UI-003 — Responsive layouts recompose

- **Requirements:** `REQ-UI-006`, `REQ-UI-007`
- **Given:** representative mobile, tablet, and desktop viewports
- **When:** grids, filters, cart, checkout, admin shell, and forms use shared primitives
- **Then:** layouts reflow without horizontal overflow or inaccessible controls
- **Negative/edge behavior:** navigation and actions remain usable at 200% zoom and with long content
- **Evidence:** viewport matrix screenshots/manual notes and automated checks
- [ ] Passed

## 3. Cross-Feature Scenarios

AUTH forms, CAT grids/filters, CART/ORD forms, and ADM shell consume shared contracts without modifying UI-owned files.

## 4. Security and Permission Scenarios

UI route states reflect but do not replace server authorization. URLs/content are safely rendered and destructive admin actions can request confirmation.

## 5. Failure and Recovery Scenarios

Image failure, network retry, route error boundary, empty settings, and expired session render explicit recoverable states.

## 6. Accessibility and Responsive Scenarios

Keyboard/focus, labels/errors, contrast, reduced motion, carousel-control compatibility, mobile menu, RTL-tolerant text, and representative viewport coverage are mandatory.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Lint | `npm run lint` | yes | Exit 0 |
| Components | `npm run test -- ui` | yes | All shared states/interactions pass |
| Accessibility | Automated accessibility checks plus keyboard procedure | yes | No critical violations |
| Responsive visual QA | Documented mobile/tablet/desktop matrix | yes | No overflow; intended recomposition |
| Build | `npm run build` | yes | Exit 0 |
