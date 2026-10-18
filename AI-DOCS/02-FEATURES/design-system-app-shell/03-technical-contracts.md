# Technical Contracts — Design System and App Shell

## 1. Ownership

**Owns**
- Routes/screens: customer shell surrounding all customer/public routes; no business route.
- Source paths: `src/shared/ui/**`, `src/styles/**`, approved `src/assets/**`, `public/**` brand assets.
- API endpoints: None.
- Entities/write authority: None.
- Jobs/events: None.
- Configuration: Tailwind/theme tokens and responsive breakpoints.

**Must Not Touch**
- `src/features/**` — business owners.
- `server/**` — FND and server feature owners.
- Root application route composition — FND.

**Exposes**
| Contract ID | Type | Name | Consumers | Canonical Section |
|---|---|---|---|---|
| UI-UI-001 | UI | Core controls and form primitives | all client features | §6 |
| UI-UI-002 | UI | Async collection/page states | all client features | §6 |
| UI-UI-003 | UI | Responsive customer shell | AUTH, CAT, HOME, CART, ORD | §6 |
| UI-UI-004 | UI | Responsive admin layout primitives | CAT, HOME, ORD, CUS, SET, ADM | §6 |

**Consumes**
| Contract ID | Owner Feature | Used By | Required Version/Behavior |
|---|---|---|---|
| HTTP-FND-001 | FND | route/error states | stable error/request ID |
| API-SET-002 | SET | footer contact projection | optional social links omitted/empty safely |

## 2. Source Tree Contract

| Planned Path/File | Responsibility | Created By Task | Must Not Contain |
|---|---|---|---|
| `src/styles/**`, Tailwind config | tokens, global/base styles | UI-001 | Feature CSS/business state |
| `src/shared/ui/primitives/**` | buttons, inputs, dialog, feedback | UI-002 | Feature API calls |
| `src/shared/ui/states/**` | loading/empty/error/unauthorized | UI-002 | Owner-specific decisions |
| `src/shared/ui/shell/**` | navbar/footer/layout primitives | UI-003 | Admin metric queries |
| `src/shared/ui/**/*.test.js` | UI contract tests | UI-002–UI-004 | Server integration tests |

## 3. API Contracts

None.

## 4. Data Contracts

None.

## 5. Events and Background Jobs

None.

## 6. Shared UI Contracts

| Contract ID | Component | Props/Input | States | Consumers | Accessibility |
|---|---|---|---|---|---|
| UI-UI-001 | `Button`, `Field`, `Dialog`, `Price`, `Image` primitives | documented semantic props; no domain DTOs | default, hover, focus, disabled, pending, error | all | semantic elements, focus, labels, contrast |
| UI-UI-002 | `AsyncBoundary`, `CollectionState` | status, safe error, retry, empty action | loading, empty, error, unauthorized, success | all | live region without noisy repeats; focusable recovery |
| UI-UI-003 | `CustomerShell` | session summary, cart count, contact projection, content | desktop/mobile nav, loading contact, signed-in/out | customer features | landmarks, menu focus trap/return, skip link |
| UI-UI-004 | `AdminLayout` | nav items, current item, content | expanded/collapsed/mobile drawer | admin features | keyboard drawer, current-page semantics |

## 7. Permissions and Security

Components accept already-authorized state and never infer permission from hidden controls. Links are allowlisted/sanitized; raw HTML is not accepted.

## 8. External Integrations

None. Footer URLs may open configured external contact/social links through safe protocols.

## 9. Configuration and Secrets

Theme tokens and public asset paths contain no secrets. No client environment secret is introduced.

## 10. Error, Retry, and Recovery Behavior

HTTP-FND-001 drives generic safe messages plus request ID. Owner features supply recovery actions. Error boundaries preserve shell navigation when safe.

## 11. Performance and Limits

Avoid duplicate icon/font payloads, lazy-load route-owned content, size images responsively, and respect reduced motion. Shared primitives must not trigger network calls.

## 12. Contract Change Rule

Breaking prop/token/state changes require UI owner approval, named consumer updates, visual/accessibility regression evidence, and no parallel write overlap.

## 13. Assumptions and TODOs

A-003, A-004, and A-007 remain pending in `assumptions-register.md`.
