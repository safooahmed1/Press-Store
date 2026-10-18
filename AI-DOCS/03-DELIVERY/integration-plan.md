# Integration Plan

## 1. Integration Principles

Merge owner contracts before consumers, never redefine an interface, preserve task commits/evidence, run post-merge checks, and stop for explicit merge authorization. Feature completion is `merge-ready`, not merged or released.

## 2. Ordered Merge Plan

| Order | Source | Target | Preconditions | Post-Merge Verification |
|---:|---|---|---|---|
| 1 | FND feature | `main` | FND-001–006 done; platform suite/build/doc validator | startup, migration, error, storage, build smoke |
| 2 | UI feature | `main` | UI-001–004 done; FND present | visual/a11y/responsive/build |
| 3 | AUTH feature | `main` | AUTH-001–005 done; UI/FND contracts present | auth security/isolation/build |
| 4 | CAT feature | `main` | CAT-001–006 done; owner contracts frozen | catalog filters/admin/upload/CAT contracts |
| 5 | SET feature | `main` | SET-001–003 done | settings privacy/consumer projections |
| 6 | HOME feature | `main` | HOME-001–004 done; CAT/UI contracts present | section order/limits/navigation/build |
| 7 | CART feature | `main` | CART-001–004 done; CAT/AUTH contracts present | persistence/isolation/readiness |
| 8 | WS-ORD-01 | ORD integration | ORD-001–003 done | migration, quote, atomic/idempotent creation |
| 9 | WS-ORD-02 | ORD integration | core merged; ORD-004–005 done | customer checkout/history/isolation |
| 10 | WS-ORD-03 | ORD integration | core merged; ORD-006–008 done; A-001 resolved | admin actions, expiry, full ORD E2E |
| 11 | ORD integration | `main` | all ORD workstreams and feature gate merge-ready | full checkout/payment/order regression |
| 12 | CUS feature | `main` | CUS-001–003 done; ORD/AUTH projections present | directory/privacy/query checks |
| 13 | ADM feature | `main` | ADM-001–003 done; all admin routes/projections present | admin navigation/dashboard E2E and production build |

## 3. Interface Registry

| Contract ID | Owner | Consumers | Definition Location | Compatibility Rule |
|---|---|---|---|---|
| HTTP-FND-001, DB-FND-001, STO-FND-001, JOB-FND-001, CFG-FND-001, APP-FND-001 | FND | all named features | FND `03-technical-contracts.md` | owner-first; breaking change requires all consumers/full suite |
| UI-UI-001–UI-UI-004 | UI | all client features | UI contracts | breaking props/tokens require visual/a11y consumer updates |
| API-AUTH-001/002, AUTH-AUTH-001/002, READ-AUTH-001 | AUTH | customer/admin features | AUTH contracts | auth/security changes require critical user approval |
| API-CAT-001/002, READ-CAT-001/002/003, CMD-CAT-001, UI-CAT-001 | CAT | HOME, CART, ORD, ADM | CAT contracts | money/availability/curation/intent changes require consumer integration |
| API-SET-001/002, READ-SET-001/002 | SET | UI, ORD | SET contracts | projection privacy must never broaden silently |
| API-HOME-001/002 | HOME | HOME UIs | HOME contracts | limits/order changes require scope approval |
| API-CART-001, READ-CART-001, CMD-CART-001 | CART | Cart UI, ORD | CART contracts | transactional/version semantics frozen before ORD |
| API-ORD-001/002/003, READ-ORD-001/002, JOB-ORD-001 | ORD | customer/admin UIs, CUS, ADM | ORD contracts | money/state/expiry changes are critical |
| API-CUS-001, READ-CUS-001 | CUS | CUS UI, ADM | CUS contracts | remains read-only/bounded |
| API-ADM-001, NAV-ADM-001 | ADM | admin dashboard/shell | ADM contracts | new metric/destination needs owner requirement |

## 4. Cross-Feature Scenarios

1. Customer registers → browses/filter catalog → selects available variant → persistent cart survives logout/login.
2. Admin removes a variant → Cart marks it unavailable → Checkout refuses it without partial order.
3. Admin changes discount → Cart/quote show current price → Customer reviews changed quote → order snapshots correct money.
4. SET independent numbers → Wallet/InstaPay selection shows only matching number → Wallet requires sender number.
5. Order create loses response → same idempotency key returns one order and cart remains cleared once.
6. Electronic order pending → admin verifies → prepare/deliver → paid order never expires.
7. Unpaid cash exceeds confirmed cutoff → job cancels → customer list hides it → admin retains it.
8. Admin dashboard counts/recent/attention match CAT/ORD/CUS; navigation reaches every protected feature.

## 5. Contract Change Process

Owner records the decision and version/compatibility impact, updates canonical contract and requirement/task mappings, names every consumer, obtains approval where required, updates owner and consumers in sequenced non-parallel work, runs focused and cross-feature checks, then reruns the docs validator.

## 6. Rollback and Recovery

Before merge, retain the source branch and verify a clean target. After merge failure, prefer a documented revert commit rather than history destruction. Database migrations need forward recovery or tested rollback compatible with the previous app. Upload/database backups precede production. Never reset or discard unrelated user work.

## 7. Release Gate

All features are merged with post-merge evidence; all 145 requirements are verified or explicitly disposed; migrations pass empty/upgrade cases; lint, integration, E2E, production build/start, responsive/accessibility/security smokes, Hostinger runbook, backups, and documentation validator pass; unresolved assumptions are confirmed or accepted; user explicitly authorizes deployment.
