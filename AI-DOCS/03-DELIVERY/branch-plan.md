# Branch Plan

## 1. Repository Policy

| Setting | Value | Source |
|---|---|---|
| Repository URL | `git@github.com:safooahmed1/Press-Store.git` | Existing `origin` configuration |
| Default branch | `main` | Existing repository and workflow default |
| Repository topology | one monorepo; React client and Express server remain together | DEC-004 and DEC-008 |
| Remote sync | `manual` | PRD silent; safe default |
| Pull request required | `yes` for any remote integration | Delivery default; action still requires explicit user instruction |
| Merge strategy | `merge` pending confirmation A-006 | Preserve task/workstream history by default |
| Deployment on merge | `no` | No explicit PRD authorization |

## 2. Branch Registry

FND and UI are grandfathered existing feature branches. For AUTH and later features, create the integration branch only after feature dependencies are present, freeze the contract there, then create BE and FE branches from the exact same integration commit.

| Branch | Type | Parent/Created From | Owner Workstream | Task IDs | Merge Target | Merge Prerequisites | Status |
|---|---|---|---|---|---|---|---|
| `feature/FND-application-foundation` | feature | `main` | WS-FND-01 | FND-001–FND-006 | `main` | FND full suite/build/docs validator; explicit merge instruction | active; FND-001/FND-003/FND-004 done; FND-002 blocked (hosting unavailable); FND-005 blocked (FND-DEC-004); FND-006 local preparation blocked (FND-DEC-005) |
| `feature/UI-design-system-app-shell` | feature | `aa61d3f` FND checkpoint under UI-DEC-002 | WS-UI-01 | UI-001–UI-004 | `main` | UI visual/a11y/responsive suite; FND present in main; explicit merge instruction | active; UI-003 responsive remediation verified; UI-004 correction awaits separate authorization; no push/merge authorized |
| `feature/AUTH-identity-accounts` | feature | `main` after FND | WS-AUTH-01 | AUTH-001–AUTH-005 | `main` | AUTH security suite; explicit merge instruction | planned |
| `feature/CAT-catalog-discovery` | feature | `main` after FND/AUTH/UI | WS-CAT-01 | CAT-001–CAT-006 | `main` | catalog suite/contracts; explicit merge instruction | planned |
| `feature/SET-store-settings` | feature | `main` after FND/AUTH/UI | WS-SET-01 | SET-001–SET-003 | `main` | settings/privacy suite; explicit merge instruction | planned |
| `feature/HOME-homepage-merchandising` | feature | `main` after CAT/UI/AUTH | WS-HOME-01 | HOME-001–HOME-004 | `main` | homepage/CAT/UI suite; explicit merge instruction | planned |
| `feature/CART-persistent-cart` | feature | `main` after CAT/AUTH/UI | WS-CART-01 | CART-001–CART-004 | `main` | cart persistence/integrity suite; explicit merge instruction | planned |
| `feature/ORD-checkout-payments-orders` | feature integration | `main` after CART/SET | ORD parent | None; receives WS-ORD branches | `main` | all three workstreams merge-ready; full ORD E2E; explicit merge instruction | planned |
| `work/WS-ORD-01-order-core` | workstream | `feature/ORD-checkout-payments-orders` | WS-ORD-01 | ORD-001–ORD-003 | `feature/ORD-checkout-payments-orders` | core transaction/idempotency suite; explicit merge instruction | planned |
| `work/WS-ORD-02-customer-orders` | workstream | ORD integration after WS-ORD-01 | WS-ORD-02 | ORD-004–ORD-005 | `feature/ORD-checkout-payments-orders` | customer checkout/history suite; explicit merge instruction | planned |
| `work/WS-ORD-03-admin-operations` | workstream | ORD integration after WS-ORD-01 | WS-ORD-03 | ORD-006–ORD-008 | `feature/ORD-checkout-payments-orders` | admin/expiry suite; A-001 resolved; explicit merge instruction | planned |
| `feature/CUS-customer-directory` | feature | `main` after ORD/AUTH | WS-CUS-01 | CUS-001–CUS-003 | `main` | directory/privacy/query suite; explicit merge instruction | planned |
| `feature/ADM-admin-dashboard` | feature | `main` after CAT/ORD/CUS/UI/AUTH | WS-ADM-01 | ADM-001–ADM-003 | `main` | admin E2E/build/docs validator; explicit merge instruction | planned |
| `feature/FND-application-foundation` | legacy feature | `main` | WS-FND-01 | FND-001–FND-006 | `main` | FND full gate; explicit merge | active; history preserved |
| `feature/UI-design-system-app-shell` | legacy feature | existing FND lineage | WS-UI-01 | UI-001–UI-004 | `main` after FND | UI full gate; explicit merge | existing; history preserved/reconciled on its branch |
| `feature/AUTH-integration` | integration | `715df78` updated `main` after FND/UI prerequisites | WS-AUTH-INT | AUTH-005 | `main` | BE+FE ready; live security/integration pass | active; AUTH contract frozen 2026-10-31 |
| `work/AUTH-backend` | backend | frozen AUTH integration commit | WS-AUTH-BE | AUTH-001–AUTH-003 | `feature/AUTH-integration` | backend suite and contract match; explicit merge | planned |
| `work/AUTH-frontend` | frontend | same frozen AUTH integration commit | WS-AUTH-FE | AUTH-004 | `feature/AUTH-integration` | component/a11y/build and fixture evidence; explicit merge | planned |
| `feature/CAT-integration` | integration | updated `main` after AUTH/UI/FND | WS-CAT-INT | CAT-006 | `main` | BE+FE ready; live CAT gate | planned |
| `work/CAT-backend` | backend | frozen CAT integration commit | WS-CAT-BE | CAT-001–CAT-003 | `feature/CAT-integration` | backend catalog suite; explicit merge | planned |
| `work/CAT-frontend` | frontend | same frozen CAT integration commit | WS-CAT-FE | CAT-004–CAT-005 | `feature/CAT-integration` | client/a11y/responsive/build; explicit merge | planned |
| `feature/SET-integration` | integration | updated `main` after AUTH/UI/FND | WS-SET-INT | SET-003 | `main` | BE+FE ready; live privacy/consumer gate | planned |
| `work/SET-backend` | backend | frozen SET integration commit | WS-SET-BE | SET-001 | `feature/SET-integration` | backend settings suite; explicit merge | planned |
| `work/SET-frontend` | frontend | same frozen SET integration commit | WS-SET-FE | SET-002 | `feature/SET-integration` | form/a11y/build; explicit merge | planned |
| `feature/HOME-integration` | integration | updated `main` after CAT/AUTH/UI | WS-HOME-INT | HOME-004 | `main` | BE+FE ready; live HOME gate | planned |
| `work/HOME-backend` | backend | frozen HOME integration commit | WS-HOME-BE | HOME-001 | `feature/HOME-integration` | backend HOME suite; explicit merge | planned |
| `work/HOME-frontend` | frontend | same frozen HOME integration commit | WS-HOME-FE | HOME-002–HOME-003 | `feature/HOME-integration` | client/a11y/responsive/build; explicit merge | planned |
| `feature/CART-integration` | integration | updated `main` after CAT/AUTH/UI | WS-CART-INT | CART-004 | `main` | BE+FE ready; live CART gate | planned |
| `work/CART-backend` | backend | frozen CART integration commit | WS-CART-BE | CART-001–CART-002 | `feature/CART-integration` | backend cart suite; explicit merge | planned |
| `work/CART-frontend` | frontend | same frozen CART integration commit | WS-CART-FE | CART-003 | `feature/CART-integration` | client/responsive/build; explicit merge | planned |
| `feature/ORD-integration` | integration | updated `main` after CART/SET | WS-ORD-INT | ORD-005, ORD-008 | `main` | BE+FE ready; live order E2E; A-001 | planned |
| `work/ORD-backend` | backend | frozen ORD integration commit | WS-ORD-BE | ORD-001–ORD-003, ORD-006, ORD-009, ORD-011 | `feature/ORD-integration` | backend order/payment/job suite; explicit merge | planned |
| `work/ORD-frontend` | frontend | same frozen ORD integration commit | WS-ORD-FE | ORD-004, ORD-007, ORD-010 | `feature/ORD-integration` | checkout/customer/admin UI suite; explicit merge | planned |
| `feature/CUS-integration` | integration | updated `main` after ORD/AUTH/UI | WS-CUS-INT | CUS-003 | `main` | BE+FE ready; live privacy/query gate | planned |
| `work/CUS-backend` | backend | frozen CUS integration commit | WS-CUS-BE | CUS-001 | `feature/CUS-integration` | backend projection suite; explicit merge | planned |
| `work/CUS-frontend` | frontend | same frozen CUS integration commit | WS-CUS-FE | CUS-002 | `feature/CUS-integration` | client/responsive/build; explicit merge | planned |
| `feature/ADM-integration` | integration | updated `main` after CAT/ORD/CUS/AUTH/UI | WS-ADM-INT | ADM-002–ADM-003 | `main` | BE+FE ready; full admin E2E | planned |
| `work/ADM-backend` | backend | frozen ADM integration commit | WS-ADM-BE | ADM-004 | `feature/ADM-integration` | dashboard projection suite; explicit merge | planned |
| `work/ADM-frontend` | frontend | same frozen ADM integration commit | WS-ADM-FE | ADM-001, ADM-005 | `feature/ADM-integration` | navigation/dashboard client suite; explicit merge | planned |

## 3. Task-to-Branch Map

| Task IDs | Lane / Workstream | Branch | Planned Commit Pattern |
|---|---|---|---|
| FND-001–FND-006 | legacy / WS-FND-01 | `feature/FND-application-foundation` | existing planned subjects remain authoritative |
| UI-001–UI-004 | legacy FE / WS-UI-01 | `feature/UI-design-system-app-shell` | existing planned subjects remain authoritative |
| AUTH-001–AUTH-003 | BE / WS-AUTH-BE | `work/AUTH-backend` | existing per-task subjects |
| AUTH-004 | FE / WS-AUTH-FE | `work/AUTH-frontend` | `feat(AUTH-004): build authentication screens` |
| AUTH-005 | INT / WS-AUTH-INT | `feature/AUTH-integration` | `test(AUTH-005): enforce authentication security` |
| CAT-001–CAT-003 | BE / WS-CAT-BE | `work/CAT-backend` | existing per-task subjects |
| CAT-004–CAT-005 | FE / WS-CAT-FE | `work/CAT-frontend` | existing per-task subjects |
| CAT-006 | INT / WS-CAT-INT | `feature/CAT-integration` | `test(CAT-006): verify catalog integrity contracts` |
| SET-001 | BE / WS-SET-BE | `work/SET-backend` | `feat(SET-001): add store settings contracts` |
| SET-002 | FE / WS-SET-FE | `work/SET-frontend` | `feat(SET-002): build admin settings UI` |
| SET-003 | INT / WS-SET-INT | `feature/SET-integration` | `test(SET-003): verify settings projections` |
| HOME-001 | BE / WS-HOME-BE | `work/HOME-backend` | `feat(HOME-001): add homepage content API` |
| HOME-002–HOME-003 | FE / WS-HOME-FE | `work/HOME-frontend` | existing per-task subjects |
| HOME-004 | INT / WS-HOME-INT | `feature/HOME-integration` | `test(HOME-004): verify homepage limits and ordering` |
| CART-001–CART-002 | BE / WS-CART-BE | `work/CART-backend` | existing per-task subjects |
| CART-003 | FE / WS-CART-FE | `work/CART-frontend` | `feat(CART-003): build cart experience` |
| CART-004 | INT / WS-CART-INT | `feature/CART-integration` | `test(CART-004): verify cart persistence and isolation` |
| ORD-001–ORD-003, ORD-006, ORD-009, ORD-011 | BE / WS-ORD-BE | `work/ORD-backend` | existing subjects; new: `feat(ORD-009): add customer order reads`, `feat(ORD-011): add unpaid cash expiry job` |
| ORD-004, ORD-007, ORD-010 | FE / WS-ORD-FE | `work/ORD-frontend` | existing subjects; new: `feat(ORD-010): build customer order history` |
| ORD-005, ORD-008 | INT / WS-ORD-INT | `feature/ORD-integration` | `test(ORD-005): integrate customer order history`; `test(ORD-008): verify expiry and order E2E` |
| CUS-001 | BE / WS-CUS-BE | `work/CUS-backend` | `feat(CUS-001): add customer directory API` |
| CUS-002 | FE / WS-CUS-FE | `work/CUS-frontend` | `feat(CUS-002): build customer directory UI` |
| CUS-003 | INT / WS-CUS-INT | `feature/CUS-integration` | `test(CUS-003): verify directory scope and privacy` |
| ADM-004 | BE / WS-ADM-BE | `work/ADM-backend` | `feat(ADM-004): add dashboard projections` |
| ADM-001, ADM-005 | FE / WS-ADM-FE | `work/ADM-frontend` | `feat(ADM-001): compose admin navigation`; `feat(ADM-005): build lightweight dashboard` |
| ADM-002–ADM-003 | INT / WS-ADM-INT | `feature/ADM-integration` | `test(ADM-002): integrate dashboard projections`; `test(ADM-003): verify admin integration` |

## 4. Merge Order

1. Complete and explicitly merge the grandfathered FND and UI branches in their documented dependency order.
2. For each later feature: create integration → freeze contracts → create BE and FE from the same commit → complete lane tasks independently → explicitly merge each ready lane into integration → run INT task → declare feature `merge-ready` → wait for explicit merge to `main`.
3. Cross-feature order remains AUTH; CAT and SET; HOME and CART; ORD; CUS; ADM. The two features in each named pair may progress in parallel when their path/dependency checks pass.
4. A finished FE branch may wait as `ready-for-integration` while its developer moves, after authorization, to the next ready FE capability. It does not bypass the INT gate.

### Exact Task Coverage

The registry and task map cover these exact IDs (ranges elsewhere are descriptive): FND-001, FND-002, FND-003, FND-004, FND-005, FND-006; UI-001, UI-002, UI-003, UI-004; AUTH-001, AUTH-002, AUTH-003, AUTH-004, AUTH-005; CAT-001, CAT-002, CAT-003, CAT-004, CAT-005, CAT-006; SET-001, SET-002, SET-003; HOME-001, HOME-002, HOME-003, HOME-004; CART-001, CART-002, CART-003, CART-004; ORD-001, ORD-002, ORD-003, ORD-004, ORD-005, ORD-006, ORD-007, ORD-008, ORD-009, ORD-010, ORD-011; CUS-001, CUS-002, CUS-003; ADM-001, ADM-002, ADM-003, ADM-004, ADM-005.

## 5. Remote Actions Policy

Do not push, open a pull request, merge remotely, create repositories, deploy, or release without explicit user authorization for that action. Existing `origin` is configuration, not authorization. When authorized, a pull request is required; deployment does not happen automatically on merge.

## 6. Conflict Rules

Stop when a conflict touches another owner's canonical path or contract. BE never resolves FE source conflicts and FE never resolves BE source conflicts. Contract conflicts return to the integration owner and require both consumers to be reconciled. Never discard user or unrelated work.

## 7. Historical Branch Exceptions

The 2026-10-21 FND checkpoint authorization and all later FND/UI evidence remain historical and unchanged on their owning branches. DEC-008 introduces no retroactive branch rename, merge, push, completion, or release authorization.
