# Branch Plan

## 1. Repository Policy

| Setting | Value | Source |
|---|---|---|
| Repository URL | `git@github.com:safooahmed1/Press-Store.git` | Existing `origin` configuration |
| Default branch | `main` | Existing repository and workflow default |
| Remote sync | `manual` | PRD silent; safe default |
| Pull request required | `yes` for any remote integration | Delivery default; action still requires explicit user instruction |
| Merge strategy | `merge` pending confirmation A-006 | Preserve task/workstream history by default |
| Deployment on merge | `no` | No explicit PRD authorization |

## 2. Branch Registry

| Branch | Type | Parent/Created From | Owner Workstream | Task IDs | Merge Target | Merge Prerequisites | Status |
|---|---|---|---|---|---|---|---|
| `feature/FND-application-foundation` | feature | `main` | WS-FND-01 | FND-001–FND-006 | `main` | FND full suite/build/docs validator; explicit merge instruction | active; FND-001/FND-003/FND-004 done; FND-002 blocked (hosting unavailable); FND-005 blocked (FND-DEC-004); FND-006 local preparation blocked (FND-DEC-005) |
| `feature/UI-design-system-app-shell` | feature | `aa61d3f` FND checkpoint under UI-DEC-002 | WS-UI-01 | UI-001–UI-004 | `main` | UI visual/a11y/responsive suite; FND present in main; explicit merge instruction | active; UI-001/UI-002/UI-003 done, UI-004 not-started; no push/merge authorized |
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

## 3. Task-to-Branch Map

| Task ID | Workstream | Branch | Planned Commit Subject |
|---|---|---|---|
| FND-001 | WS-FND-01 | `feature/FND-application-foundation` | `feat(FND-001): establish modular runtime seams` |
| FND-002 | WS-FND-01 | `feature/FND-application-foundation` | `feat(FND-002): add MySQL persistence foundation` |
| FND-003 | WS-FND-01 | `feature/FND-application-foundation` | `feat(FND-003): add REST validation and errors` |
| FND-004 | WS-FND-01 | `feature/FND-application-foundation` | `feat(FND-004): add local image storage adapter` |
| FND-005 | WS-FND-01 | `feature/FND-application-foundation` | `test(FND-005): establish quality and observability harness` |
| FND-006 | WS-FND-01 | `feature/FND-application-foundation` | `chore(FND-006): add Hostinger production shape` |
| UI-001 | WS-UI-01 | `feature/UI-design-system-app-shell` | `feat(UI-001): establish fashion design system` |
| UI-002 | WS-UI-01 | `feature/UI-design-system-app-shell` | `feat(UI-002): add accessible UI primitives` |
| UI-003 | WS-UI-01 | `feature/UI-design-system-app-shell` | `feat(UI-003): add customer app shell` |
| UI-004 | WS-UI-01 | `feature/UI-design-system-app-shell` | `feat(UI-004): add responsive admin layout primitives` |
| AUTH-001 | WS-AUTH-01 | `feature/AUTH-identity-accounts` | `feat(AUTH-001): add identities and secure sessions` |
| AUTH-002 | WS-AUTH-01 | `feature/AUTH-identity-accounts` | `feat(AUTH-002): add customer authentication API` |
| AUTH-003 | WS-AUTH-01 | `feature/AUTH-identity-accounts` | `feat(AUTH-003): add single-admin authentication` |
| AUTH-004 | WS-AUTH-01 | `feature/AUTH-identity-accounts` | `feat(AUTH-004): build authentication screens` |
| AUTH-005 | WS-AUTH-01 | `feature/AUTH-identity-accounts` | `test(AUTH-005): enforce authentication security` |
| CAT-001 | WS-CAT-01 | `feature/CAT-catalog-discovery` | `feat(CAT-001): add catalog domain` |
| CAT-002 | WS-CAT-01 | `feature/CAT-catalog-discovery` | `feat(CAT-002): add public catalog API` |
| CAT-003 | WS-CAT-01 | `feature/CAT-catalog-discovery` | `feat(CAT-003): add admin catalog API` |
| CAT-004 | WS-CAT-01 | `feature/CAT-catalog-discovery` | `feat(CAT-004): build shop and product details` |
| CAT-005 | WS-CAT-01 | `feature/CAT-catalog-discovery` | `feat(CAT-005): build admin catalog UI` |
| CAT-006 | WS-CAT-01 | `feature/CAT-catalog-discovery` | `test(CAT-006): verify catalog integrity contracts` |
| SET-001 | WS-SET-01 | `feature/SET-store-settings` | `feat(SET-001): add store settings contracts` |
| SET-002 | WS-SET-01 | `feature/SET-store-settings` | `feat(SET-002): build admin settings UI` |
| SET-003 | WS-SET-01 | `feature/SET-store-settings` | `test(SET-003): verify settings projections` |
| HOME-001 | WS-HOME-01 | `feature/HOME-homepage-merchandising` | `feat(HOME-001): add homepage content API` |
| HOME-002 | WS-HOME-01 | `feature/HOME-homepage-merchandising` | `feat(HOME-002): build public homepage` |
| HOME-003 | WS-HOME-01 | `feature/HOME-homepage-merchandising` | `feat(HOME-003): build admin homepage UI` |
| HOME-004 | WS-HOME-01 | `feature/HOME-homepage-merchandising` | `test(HOME-004): verify homepage limits and ordering` |
| CART-001 | WS-CART-01 | `feature/CART-persistent-cart` | `feat(CART-001): add persistent cart API` |
| CART-002 | WS-CART-01 | `feature/CART-persistent-cart` | `feat(CART-002): enforce cart readiness` |
| CART-003 | WS-CART-01 | `feature/CART-persistent-cart` | `feat(CART-003): build cart experience` |
| CART-004 | WS-CART-01 | `feature/CART-persistent-cart` | `test(CART-004): verify cart persistence and isolation` |
| ORD-001 | WS-ORD-01 | `work/WS-ORD-01-order-core` | `feat(ORD-001): add order and payment domain` |
| ORD-002 | WS-ORD-01 | `work/WS-ORD-01-order-core` | `feat(ORD-002): add checkout quote rules` |
| ORD-003 | WS-ORD-01 | `work/WS-ORD-01-order-core` | `feat(ORD-003): create orders atomically` |
| ORD-004 | WS-ORD-02 | `work/WS-ORD-02-customer-orders` | `feat(ORD-004): build checkout experience` |
| ORD-005 | WS-ORD-02 | `work/WS-ORD-02-customer-orders` | `feat(ORD-005): build customer order history` |
| ORD-006 | WS-ORD-03 | `work/WS-ORD-03-admin-operations` | `feat(ORD-006): add admin order operations` |
| ORD-007 | WS-ORD-03 | `work/WS-ORD-03-admin-operations` | `feat(ORD-007): build admin orders UI` |
| ORD-008 | WS-ORD-03 | `work/WS-ORD-03-admin-operations` | `test(ORD-008): add expiry and order E2E` |
| CUS-001 | WS-CUS-01 | `feature/CUS-customer-directory` | `feat(CUS-001): add customer directory API` |
| CUS-002 | WS-CUS-01 | `feature/CUS-customer-directory` | `feat(CUS-002): build customer directory UI` |
| CUS-003 | WS-CUS-01 | `feature/CUS-customer-directory` | `test(CUS-003): verify directory scope and privacy` |
| ADM-001 | WS-ADM-01 | `feature/ADM-admin-dashboard` | `feat(ADM-001): compose admin navigation` |
| ADM-002 | WS-ADM-01 | `feature/ADM-admin-dashboard` | `feat(ADM-002): add lightweight dashboard` |
| ADM-003 | WS-ADM-01 | `feature/ADM-admin-dashboard` | `test(ADM-003): verify admin integration` |

## 4. Merge Order

1. FND → `main`.
2. UI and AUTH may run in parallel; merge UI then AUTH after both dependency checks.
3. CAT and SET may run in parallel; merge CAT then SET.
4. HOME and CART may run in parallel; merge HOME then CART.
5. Create ORD integration from updated `main`; merge WS-ORD-01, then run WS-ORD-02 and WS-ORD-03 in parallel and merge them in that order; full ORD gate; explicit merge to `main`.
6. CUS → `main`.
7. ADM → `main`, then project release verification.

Every merge step requires explicit user instruction even when its prerequisites pass.

## 5. Remote Actions Policy

Do not push, open a pull request, merge remotely, create repositories, deploy, or release without explicit user authorization for that action. Existing `origin` is configuration, not authorization. When authorized, a pull request is required; deployment does not happen automatically on merge.

## 6. Conflict Rules

Stop when a conflict touches another owner's canonical path or contract. The owner resolves it with the consumer updates in one approved change. ORD workstreams resolve only their disjoint owned paths; order-core conflicts return to WS-ORD-01/ORD owner. Never discard user/unrelated changes.

## 7. 2026-10-21 — FND-001 WIP Publication Authorization

Explicit user authorization permits one preservation commit, `chore(FND-001): WIP checkpoint of application foundation`, on the existing FND branch and a non-force push of that branch only to `origin`. This is a checkpoint exception, not the planned FND-001 completion commit or remote integration. No PR, merge into `main`, deployment, task completion, or later-task work is authorized. Stop if the remote branch has unexpected commits or publication requires overwriting history. FND-001 stays `blocked`, 0/6 complete; documentation validation remains unavailable.
