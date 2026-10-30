# Integration Plan

## 1. Integration Principles

Merge owner contracts before consumers, never redefine an interface, preserve task commits/evidence, run post-merge checks, and stop for explicit merge authorization. For AUTH and later features, BE and FE start from the same frozen integration commit. Either lane may become `ready-for-integration` first; feature completion is impossible until the real API INT gate passes. Feature completion is `merge-ready`, not merged or released.

## 2. Ordered Merge Plan

| Order | Source | Target | Preconditions | Post-Merge Verification |
|---:|---|---|---|---|
| 1 | FND feature | `main` | FND-001–006 done; platform suite/build/doc validator | startup, migration, error, storage, build smoke |
| 2 | UI feature | `main` | UI-001–004 done; FND present | visual/a11y/responsive/build |
| 3 | AUTH BE and FE | AUTH integration | frozen contract; each lane's focused gate passes | contract compatibility, auth component/build |
| 4 | AUTH integration | `main` | AUTH-001–005 done; real security/isolation gate | live auth/security/build |
| 5 | CAT BE/FE, SET BE/FE | their integration branches | feature contract frozen; lane gates pass | focused server/client checks |
| 6 | CAT and SET integrations | `main` in dependency order | each INT task done; live consumer/privacy gates | catalog/settings cross-contract checks |
| 7 | HOME BE/FE, CART BE/FE | their integration branches | CAT/AUTH/UI contracts present; lane gates pass | focused server/client checks |
| 8 | HOME and CART integrations | `main` in dependency order | each INT task done against live APIs | HOME/CART cross-feature gates |
| 9 | ORD BE and FE | ORD integration | frozen ORD contracts; ORD-009/010/011 included; lane gates pass | backend transaction/job and client capability suites |
| 10 | ORD integration | `main` | ORD-001–ORD-011 done as applicable; A-001; real E2E | full checkout/payment/order regression |
| 11 | CUS BE and FE | CUS integration | AUTH/ORD reads frozen; lane gates pass | projection and client checks |
| 12 | CUS integration | `main` | CUS-001–003 done; real privacy/query gate | directory/privacy/query checks |
| 13 | ADM BE and FE | ADM integration | owner projections frozen; lane gates pass | projection/navigation/dashboard checks |
| 14 | ADM integration | `main` | ADM-001–ADM-005 done; live admin gate | admin E2E and production build |

## 3. Interface Registry

| Contract ID | Owner | Consumers | Definition Location | Compatibility Rule |
|---|---|---|---|---|
| HTTP-FND-001, DB-FND-001, STO-FND-001, JOB-FND-001, CFG-FND-001, APP-FND-001 | FND | all named features | FND `03-technical-contracts.md` | owner-first; breaking change requires all consumers/full suite |
| UI-UI-001–UI-UI-004 | UI | all client features | UI contracts | breaking props/tokens require visual/a11y consumer updates |
| UI-UI-005 | UI | all client features | UI contracts §6 | token names/values and breakpoint changes require visual regression review |
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

Owner records the decision and version/compatibility impact, updates canonical contract and requirement/task mappings, names every consumer, and obtains both BE and FE owner acknowledgement. Pause affected lane work, update owner and consumers in sequenced non-parallel work, update FE fixtures, run focused and cross-feature checks against both fixtures and the live API, then rerun the docs validator.

## 5.1 API-Delayed Frontend Procedure

1. Confirm the canonical API contract is frozen even though the implementation is unavailable.
2. Implement the complete FE capability against contract fixtures, including success and all required loading/empty/error/unauthorized/validation states.
3. Keep the production adapter pointed at the real endpoint; fixtures remain test/development-only.
4. After FE verification and its task commit, mark only the FE workstream `ready-for-integration` and stop.
5. On later user authorization, move to the next dependency-ready FE task; do not reopen completed waiting work without a contract decision.
6. When BE is ready, merge both lanes into integration and rerun the same scenarios against the real API. Any mismatch fails INT and prevents `merge-ready`.

## 6. Rollback and Recovery

Before merge, retain the source branch and verify a clean target. After merge failure, prefer a documented revert commit rather than history destruction. Database migrations need forward recovery or tested rollback compatible with the previous app. Upload/database backups precede production. Never reset or discard unrelated user work.

## 7. Release Gate

All features are merged with post-merge evidence; all 145 requirements are verified or explicitly disposed; migrations pass empty/upgrade cases; lint, integration, E2E, production build/start, responsive/accessibility/security smokes, Hostinger runbook, backups, and documentation validator pass; unresolved assumptions are confirmed or accepted; user explicitly authorizes deployment.
