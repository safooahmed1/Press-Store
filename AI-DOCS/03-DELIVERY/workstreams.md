# Workstreams

## 1. Workstream Registry

FND and UI preserve their existing branches and history. AUTH and every later planned feature use three lanes: Backend (`BE`), Frontend (`FE`), and live Integration (`INT`).

| Workstream ID | Parent Feature | Objective | Task IDs | Allowed Paths | Forbidden Paths | Depends On | Parallel With | Branch | Merge Target | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| WS-FND-01 | FND | Freeze runtime, DB/HTTP/storage/test/deployment platform | FND-001, FND-002, FND-003, FND-004, FND-005, FND-006 | FND paths in blueprint; root build config; FND-002 exact bounded additions in FND contracts §2 | `src/features/**`, business feature server paths, `src/shared/ui/**` | None | None until contracts freeze | `feature/FND-application-foundation` | `main` | in-progress; FND-001/FND-003/FND-004 done; FND-002 blocked (hosting unavailable); FND-005 blocked after FND-DEC-004; FND-006 local preparation blocked under FND-DEC-005; no later task ready |
| WS-UI-01 | UI | Deliver visual system and responsive shared shells | UI-001, UI-002, UI-003, UI-004 | `src/shared/ui/**`, `src/styles/**`, approved assets | server/business feature paths | FND-001/FND-003 | WS-AUTH-01 core after shared boundaries freeze | `feature/UI-design-system-app-shell` | `main` | in-progress; UI-003 remediation verified, UI-004 correction awaits separate authorization; no merge until FND is present in `main` |
| WS-AUTH-01 | AUTH | Deliver identities, sessions, auth UI, and guards | AUTH-001, AUTH-002, AUTH-003, AUTH-004, AUTH-005 | AUTH paths in blueprint | cart/order/catalog/settings paths | FND-002/FND-003; UI-002 for UI | WS-UI-01 non-overlapping work | `feature/AUTH-identity-accounts` | `main` | planned |
| WS-CAT-01 | CAT | Deliver canonical catalog, discovery, and admin CRUD | CAT-001, CAT-002, CAT-003, CAT-004, CAT-005, CAT-006 | CAT paths in blueprint | HOME/CART/ORD paths; platform internals | FND; AUTH guard; UI primitives | WS-SET-01 after AUTH guard | `feature/CAT-catalog-discovery` | `main` | planned |
| WS-SET-01 | SET | Deliver store/payment settings and projections | SET-001, SET-002, SET-003 | SET paths in blueprint | order/footer shared component/auth paths | FND; AUTH guard; UI | WS-CAT-01 | `feature/SET-store-settings` | `main` | planned |
| WS-HOME-01 | HOME | Deliver public/admin merchandising within limits | HOME-001, HOME-002, HOME-003, HOME-004 | HOME paths in blueprint | CAT files/tables; shared UI/storage internals | CAT contracts; FND storage; AUTH/UI | WS-CART-01 | `feature/HOME-homepage-merchandising` | `main` | planned |
| WS-CART-01 | CART | Deliver persistent customer cart and order handoff | CART-001, CART-002, CART-003, CART-004 | CART paths in blueprint only | CAT/ORD/AUTH tables and source | AUTH, CAT, UI; UI-CAT-001 and APP-FND-001 frozen | WS-HOME-01 | `feature/CART-persistent-cart` | `main` | planned |
| WS-ORD-01 | ORD | Freeze order/payment domain and atomic creation | ORD-001, ORD-002, ORD-003 | order core/checkout server paths and core tests | order customer/admin UI/jobs; dependency owner paths | CART, CAT, SET, AUTH, FND | None within ORD until merged | `work/WS-ORD-01-order-core` | `feature/ORD-checkout-payments-orders` | planned |
| WS-ORD-02 | ORD | Deliver checkout and customer order experiences | ORD-004, ORD-005 | order checkout/customer client paths and customer API paths/tests | admin order/job/core files | WS-ORD-01 merged; UI | WS-ORD-03 | `work/WS-ORD-02-customer-orders` | `feature/ORD-checkout-payments-orders` | planned |
| WS-ORD-03 | ORD | Deliver admin actions/UI, expiry, and full ORD verification | ORD-006, ORD-007, ORD-008 | order admin/job paths and disjoint admin/job tests | checkout/customer UI; core schema except approved transition fixes | WS-ORD-01 merged; UI/FND job | WS-ORD-02 | `work/WS-ORD-03-admin-operations` | `feature/ORD-checkout-payments-orders` | planned |
| WS-CUS-01 | CUS | Deliver read-only admin customer directory | CUS-001, CUS-002, CUS-003 | CUS paths in blueprint | AUTH/ORD source/tables | AUTH and READ-ORD-001 | None on canonical dependencies | `feature/CUS-customer-directory` | `main` | planned |
| WS-ADM-01 | ADM | Deliver admin navigation/dashboard and final admin gate | ADM-001, ADM-002, ADM-003 | ADM paths in blueprint | owner feature pages/tables; shared UI internals | AUTH, UI, CAT, ORD, CUS | None on final composition | `feature/ADM-admin-dashboard` | `main` | planned |
| WS-FND-01 | FND | Preserve and complete the existing platform workstream | FND-001–FND-006 | Existing FND contract paths | Business feature and shared UI paths | None | None on shared composition | `feature/FND-application-foundation` | `main` | in-progress; legacy branch retained |
| WS-UI-01 | UI | Preserve the existing design-system/app-shell workstream | UI-001–UI-004 | `src/shared/ui/**`, styles/assets | Server/business paths | FND contracts | Backend work with disjoint paths | `feature/UI-design-system-app-shell` | `main` | existing branch retained; history reconciled there |
| WS-AUTH-BE | AUTH | Identity, sessions, customer/admin APIs | AUTH-001–AUTH-003 | AUTH server/platform paths, bootstrap script, backend tests | `src/**`, other feature server paths | FND DB/HTTP; A-005 | WS-AUTH-FE after contract freeze | `work/AUTH-backend` | `feature/AUTH-integration` | planned |
| WS-AUTH-FE | AUTH | Customer/admin authentication and account experience | AUTH-004 | `src/features/auth/**`, client tests/fixtures | `server/**` | UI-002; frozen AUTH contract | WS-AUTH-BE | `work/AUTH-frontend` | `feature/AUTH-integration` | planned |
| WS-AUTH-INT | AUTH | Prove live auth/security and lane compatibility | AUTH-005 | AUTH integration/E2E tests and evidence; approved composition only | Unfinished BE/FE feature implementation | AUTH-BE and AUTH-FE ready | None on AUTH integration paths | `feature/AUTH-integration` | `main` | planned |
| WS-CAT-BE | CAT | Catalog domain and public/admin APIs | CAT-001–CAT-003 | `server/src/features/catalog/**`, backend catalog tests | `src/**`, HOME/CART/ORD source | FND, AUTH guard | WS-CAT-FE after contract freeze; SET lanes | `work/CAT-backend` | `feature/CAT-integration` | planned |
| WS-CAT-FE | CAT | Shop/product and admin catalog capabilities | CAT-004–CAT-005 | `src/features/catalog/**`, client tests/fixtures | `server/**` | UI; frozen CAT contract | WS-CAT-BE; SET-FE | `work/CAT-frontend` | `feature/CAT-integration` | planned |
| WS-CAT-INT | CAT | Freeze consumer reads and verify live catalog | CAT-006 | Catalog integration/contract/E2E evidence | Unfinished BE/FE implementation | CAT-BE and CAT-FE ready | None on CAT integration paths | `feature/CAT-integration` | `main` | planned |
| WS-SET-BE | SET | Settings schema, API, and bounded projections | SET-001 | `server/src/features/settings/**`, backend settings tests | `src/**`, other feature source | FND, AUTH guard | CAT-BE; SET-FE after freeze | `work/SET-backend` | `feature/SET-integration` | planned |
| WS-SET-FE | SET | Responsive admin settings capability | SET-002 | `src/features/settings/**`, client tests/fixtures | `server/**` | UI; frozen SET contract | CAT-FE; SET-BE | `work/SET-frontend` | `feature/SET-integration` | planned |
| WS-SET-INT | SET | Verify live projections and privacy | SET-003 | Settings integration/contract evidence | Unfinished BE/FE implementation | SET-BE and SET-FE ready | None on SET integration paths | `feature/SET-integration` | `main` | planned |
| WS-HOME-BE | HOME | Homepage schema, API, and CAT orchestration | HOME-001 | `server/src/features/homepage/**`, backend tests | `src/**`, CAT-owned source | CAT contracts, FND storage, AUTH | HOME-FE after freeze; CART-BE | `work/HOME-backend` | `feature/HOME-integration` | planned |
| WS-HOME-FE | HOME | Public and admin homepage capabilities | HOME-002–HOME-003 | `src/features/homepage/**`, client tests/fixtures | `server/**`, CAT source | UI; frozen HOME/CAT contracts | HOME-BE; CART-FE | `work/HOME-frontend` | `feature/HOME-integration` | planned |
| WS-HOME-INT | HOME | Verify live order/limits/navigation/security | HOME-004 | HOME integration/E2E evidence | Unfinished BE/FE implementation | HOME-BE and HOME-FE ready | None on HOME integration paths | `feature/HOME-integration` | `main` | planned |
| WS-CART-BE | CART | Persistent cart and transactional handoff | CART-001–CART-002 | `server/src/features/cart/**`, backend tests | `src/**`, CAT/ORD/AUTH source | AUTH, CAT contracts | CART-FE after freeze; HOME-BE | `work/CART-backend` | `feature/CART-integration` | planned |
| WS-CART-FE | CART | Responsive cart and add-to-cart adapter | CART-003 | `src/features/cart/**`, client tests/fixtures | `server/**`, CAT source | UI/CAT extension; frozen CART contract | CART-BE; HOME-FE | `work/CART-frontend` | `feature/CART-integration` | planned |
| WS-CART-INT | CART | Verify live persistence/readiness/isolation | CART-004 | CART integration/E2E evidence | Unfinished BE/FE implementation | CART-BE and CART-FE ready | None on CART integration paths | `feature/CART-integration` | `main` | planned |
| WS-ORD-BE | ORD | Order/payment domain, APIs, admin actions, customer reads, expiry | ORD-001–ORD-003, ORD-006, ORD-009, ORD-011 | `server/src/features/orders/**`, order backend tests | `src/**`, dependency-owner paths | CART, CAT, SET, AUTH, FND | WS-ORD-FE after contract freeze | `work/ORD-backend` | `feature/ORD-integration` | planned |
| WS-ORD-FE | ORD | Checkout, customer history, and admin orders capabilities | ORD-004, ORD-007, ORD-010 | `src/features/orders/**`, client tests/fixtures | `server/**` | UI; frozen ORD contracts | WS-ORD-BE | `work/ORD-frontend` | `feature/ORD-integration` | planned |
| WS-ORD-INT | ORD | Customer-history composition and full order/payment E2E | ORD-005, ORD-008 | ORD integration/E2E evidence and approved composition | Unfinished BE/FE implementation | ORD-BE and ORD-FE ready; A-001 | None on ORD integration paths | `feature/ORD-integration` | `main` | planned |
| WS-CUS-BE | CUS | Admin-only customer/order projection API | CUS-001 | `server/src/features/customers/**`, backend tests | `src/**`, AUTH/ORD source | AUTH and ORD reads | WS-CUS-FE after freeze | `work/CUS-backend` | `feature/CUS-integration` | planned |
| WS-CUS-FE | CUS | Responsive customer list/detail capability | CUS-002 | `src/features/customers/**`, client tests/fixtures | `server/**` | UI; frozen CUS contract | WS-CUS-BE | `work/CUS-frontend` | `feature/CUS-integration` | planned |
| WS-CUS-INT | CUS | Verify live privacy, scope, and bounded queries | CUS-003 | CUS integration/E2E evidence | Unfinished BE/FE implementation | CUS-BE and CUS-FE ready | None on CUS integration paths | `feature/CUS-integration` | `main` | planned |
| WS-ADM-BE | ADM | Compose bounded dashboard projections | ADM-004 | `server/src/features/admin-dashboard/**`, backend tests | `src/**`, owner feature source | CAT/ORD/CUS reads | WS-ADM-FE after freeze | `work/ADM-backend` | `feature/ADM-integration` | planned |
| WS-ADM-FE | ADM | Admin navigation and dashboard capability | ADM-001, ADM-005 | `src/features/admin-dashboard/**`, client tests/fixtures | `server/**`, owner feature pages | UI/AUTH; frozen ADM contract | WS-ADM-BE | `work/ADM-frontend` | `feature/ADM-integration` | planned |
| WS-ADM-INT | ADM | Compose live dashboard and run final admin gate | ADM-002–ADM-003 | ADM integration/E2E evidence and approved composition | Unfinished BE/FE implementation | ADM-BE and ADM-FE ready | None on ADM integration paths | `feature/ADM-integration` | `main` | planned |

## 2. Contract Freeze Points

1. FND and UI retain their existing freeze/evidence history.
2. For each later feature, its technical contract is frozen on the integration branch before BE/FE branches are created from the same commit.
3. FE may use fixtures only after the request, response, error, auth, and state behavior it consumes is canonical.
4. A post-freeze breaking change stops both lanes until the owner decision, consumer list, fixture update, and compatibility plan are recorded.
5. The INT task starts only when both lanes are `ready-for-integration`; it runs against the real API and cannot be satisfied by fixtures.

## 3. Ownership Conflict Check

BE owns feature server paths; FE owns feature client paths; INT owns integration/E2E evidence and only explicitly approved composition. No parallel BE and FE row owns the same writable source family. Canonical feature docs are updated by one active task at a time and are never concurrently edited across the two workstream branches.

## 4. Developer Assignment Notes

- Use `backend-track.md` or `frontend-track.md` as navigation, then use the feature backlog/contracts as truth.
- Keep one task `in-progress` per developer lane. A completed lane waiting for the API is `ready-for-integration`, not blocked and not feature-complete.
- After explicit authorization, a developer whose lane is ready may move to the next dependency-ready capability in that lane.
- Every task still follows the one-task authorization, verification, documentation, commit, report, and stop loop.

## 5. Machine-Checkable Task Coverage

Ranges above are descriptive only. Exact workstream coverage is:

| Feature | Exact Task IDs |
|---|---|
| FND | FND-001, FND-002, FND-003, FND-004, FND-005, FND-006 |
| UI | UI-001, UI-002, UI-003, UI-004 |
| AUTH | AUTH-001, AUTH-002, AUTH-003, AUTH-004, AUTH-005 |
| CAT | CAT-001, CAT-002, CAT-003, CAT-004, CAT-005, CAT-006 |
| SET | SET-001, SET-002, SET-003 |
| HOME | HOME-001, HOME-002, HOME-003, HOME-004 |
| CART | CART-001, CART-002, CART-003, CART-004 |
| ORD | ORD-001, ORD-002, ORD-003, ORD-004, ORD-005, ORD-006, ORD-007, ORD-008, ORD-009, ORD-010, ORD-011 |
| CUS | CUS-001, CUS-002, CUS-003 |
| ADM | ADM-001, ADM-002, ADM-003, ADM-004, ADM-005 |

### 2026-10-30 — Migration boundary

DEC-008 applies the three-lane model to AUTH and later planned features. Existing FND/UI branches and all historical evidence remain intact; they are not renamed or rewritten. The documentation migration itself does not authorize any feature branch creation, merge, push, PR, deployment, or application implementation.
