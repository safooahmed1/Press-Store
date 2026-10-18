# Verification Matrix

## 1. Task Verification

| Task ID | Requirement IDs | Acceptance Criteria | Focused Checks | Broader Checks | Manual Evidence | Required for Done |
|---|---|---|---|---|---|---|
| FND-001 | REQ-FND-001/002/003/010/025 | AC-FND-001 | runtime/manifest tests | lint | dev/prod route smoke | yes |
| FND-002 | REQ-FND-012/020/023/027 | AC-FND-002 | migration/transaction tests | DB integration | query/upgrade notes | yes |
| FND-003 | REQ-FND-005/011/014/021/022/024/028 | AC-FND-001/002 | HTTP/error/validation tests | lint/integration | response inspection | yes |
| FND-004 | REQ-FND-018/026 | AC-FND-003 | storage/security tests | integration | file path/compensation inspection | yes |
| FND-005 | REQ-FND-019/020/029 | AC-FND-002 | harness/redaction tests | platform suite | representative logs/query plans | yes |
| FND-006 | REQ-FND-013/024/025/029 | AC-FND-004 | build/start tests | full FND/build | Hostinger-mode runbook smoke | yes |
| UI-001 | REQ-FND-004/008, REQ-UI-001/002/003 | AC-UI-001 | token/style tests | build | frontend-design visual evidence | yes |
| UI-002 | REQ-FND-015, REQ-UI-001 | AC-UI-002 | component/a11y tests | UI suite | keyboard/contrast | yes |
| UI-003 | REQ-FND-016, REQ-UI-004/005 | AC-UI-002 | shell/navigation tests | UI+SET integration | mobile nav/footer | yes |
| UI-004 | REQ-FND-016, REQ-UI-006/007 | AC-UI-003 | layout/a11y tests | build | viewport/zoom matrix | yes |
| AUTH-001 | REQ-AUTH-001/002/010/012 | AC-AUTH-003 | schema/hash/session tests | migration | cookie/config inspection | yes |
| AUTH-002 | REQ-AUTH-003/004/005/011 | AC-AUTH-001 | customer API tests | auth integration | response/cookie flow | yes |
| AUTH-003 | REQ-AUTH-006/007/013, REQ-SCOPE-002 | AC-AUTH-002 | bootstrap/admin API tests | auth integration | no registration/secret check | yes |
| AUTH-004 | REQ-AUTH-003/004/005 | AC-AUTH-001 | UI/form tests | build | mobile/keyboard forms | yes |
| AUTH-005 | REQ-AUTH-008/009/014 | AC-AUTH-002/003 | isolation/CSRF/rate tests | full auth suite | security inspection | yes |
| CAT-001 | REQ-CAT-001/002/003/006/017/018 | AC-CAT-001 | schema/money/variant tests | migration | data invariant review | yes |
| CAT-002 | REQ-CAT-005/009–013/015/019 | AC-CAT-002 | API/filter matrix | catalog integration | pagination/query plan | yes |
| CAT-003 | REQ-CAT-004/016–019 | AC-CAT-001/003 | admin/upload/conflict tests | auth/storage integration | admin response inspection | yes |
| CAT-004 | REQ-CAT-007–015, REQ-SCOPE-006/008/009/016 | AC-CAT-002 | UI/filter/gallery tests | build | responsive/keyboard/no-scope check | yes |
| CAT-005 | REQ-CAT-004/016–018 | AC-CAT-003 | admin UI/form tests | catalog suite | responsive CRUD flow | yes |
| CAT-006 | REQ-CAT-020, REQ-FND-020, REQ-SCOPE-020 | AC-CAT-001/003 | availability/consumer tests | full CAT/build | contract/query review | yes |
| SET-001 | REQ-SET-001/002/003 | AC-SET-001/002 | schema/API/projection tests | auth integration | response/privacy inspection | yes |
| SET-002 | REQ-SET-001/002 | AC-SET-001 | form/conflict tests | build | mobile/keyboard form | yes |
| SET-003 | REQ-SET-003/004 | AC-SET-002 | consumer/privacy tests | UI/ORD contract checks | log/response inspection | yes |
| HOME-001 | REQ-HOME-002–005/007/009 | AC-HOME-002 | schema/API/limit tests | CAT/storage integration | admin invariant review | yes |
| HOME-002 | REQ-FND-009, REQ-HOME-001/002/005/006/008/009 | AC-HOME-001 | public UI/carousel tests | build | section/viewport/a11y evidence | yes |
| HOME-003 | REQ-HOME-003–007/009/010 | AC-HOME-002 | admin UI/form tests | HOME/CAT integration | responsive admin flow | yes |
| HOME-004 | REQ-HOME-010 | AC-HOME-001/002 | full HOME regression | build | order/limit visual review | yes |
| CART-001 | REQ-CART-001/002/003 | AC-CART-001 | schema/API/isolation tests | AUTH/CAT integration | persistence flow | yes |
| CART-002 | REQ-CART-003/004/005 | AC-CART-002 | price/availability/concurrency tests | CAT contract suite | stale-item review | yes |
| CART-003 | REQ-CART-001/003/004 | AC-CART-001/002 | UI/quantity/state tests | build | responsive/keyboard cart | yes |
| CART-004 | REQ-CART-002/004 | AC-CART-001/002 | full persistence/isolation tests | CART feature suite | logout/return scenario | yes |
| ORD-001 | REQ-PAY-009/010/012, REQ-ORD-002/013/015 | AC-ORD-002 | migration/state/snapshot tests | DB integration | lifecycle review | yes |
| ORD-002 | REQ-PAY-001/003–008/011, REQ-SCOPE-010/013 | AC-ORD-001 | quote/payment matrix | CAT/CART/SET integration | copy/data inspection | yes |
| ORD-003 | REQ-PAY-001/010/011, REQ-ORD-013/014 | AC-ORD-001 | transaction/idempotency/race tests | order integration | duplicate-response recovery | yes |
| ORD-004 | REQ-PAY-001–008 | AC-ORD-001 | checkout UI/a11y tests | E2E/build | payment/copy/viewport flow | yes |
| ORD-005 | REQ-ORD-001/002/003/005, REQ-SCOPE-017 | AC-ORD-003 | API isolation/UI tests | order integration | active/cancelled visibility | yes |
| ORD-006 | REQ-PAY-009/010, REQ-ORD-007/008/009/011/012/015 | AC-ORD-002/004 | admin action/state/link tests | auth/order integration | manual verification flow | yes |
| ORD-007 | REQ-ORD-007–012 | AC-ORD-004 | admin UI/action tests | build | daily mobile/desktop flow | yes |
| ORD-008 | REQ-PAY-012, REQ-ORD-004/005/006 | AC-ORD-005 | clock/job/race tests | full ORD E2E/build | rerun/log/visibility review | yes |
| CUS-001 | REQ-CUS-001/002 | AC-CUS-001 | API/projection/auth tests | AUTH/ORD integration | query count/plan | yes |
| CUS-002 | REQ-CUS-001/002/003 | AC-CUS-001/002 | UI/pagination tests | build | responsive list/detail | yes |
| CUS-003 | REQ-CUS-003, REQ-SCOPE-007 | AC-CUS-002 | privacy/no-write/scope tests | full CUS suite | source/response inspection | yes |
| ADM-001 | REQ-ADM-001/004 | AC-ADM-001 | route/nav/auth tests | admin integration | drawer/keyboard/viewport | yes |
| ADM-002 | REQ-ADM-002/003, REQ-SCOPE-011/021 | AC-ADM-002 | projection/UI/scope tests | owner-contract integration | no-chart/revenue inspection | yes |
| ADM-003 | REQ-ADM-004 | AC-ADM-001/002 | admin E2E | lint/build/full admin | complete navigation matrix | yes |

## 2. Feature Verification

| Feature | Full Suite | Integration Scenarios | Build Required | Merge-Ready Evidence |
|---|---|---|---|---|
| FND | platform/migration/storage/error suite | one-process runtime and failure recovery | yes | AC-FND-001–004 plus runbook |
| UI | component/a11y/responsive suite | representative feature consumers | yes | AC-UI-001–003 plus visual matrix |
| AUTH | auth/security/isolation suite | CART/ORD/admin guards | yes | AC-AUTH-001–003 |
| CAT | catalog/filter/admin/upload suite | HOME/CART/ORD contracts | yes | AC-CAT-001–003 |
| SET | settings/privacy suite | footer/checkout/WhatsApp projections | yes | AC-SET-001–002 |
| HOME | public/admin/limit suite | CAT navigation/flags and UI shell | yes | AC-HOME-001–002 |
| CART | persistence/readiness/isolation suite | CAT changes and ORD handoff | yes | AC-CART-001–002 |
| ORD | order/payment/state/job/E2E suite | all eight scenarios in integration plan | yes | AC-ORD-001–005 |
| CUS | projection/privacy/query suite | AUTH/ORD read contracts | yes | AC-CUS-001–002 |
| ADM | route/metric/admin E2E suite | all admin owner routes/contracts | yes | AC-ADM-001–002 |

## 3. Project and Release Verification

Run clean install, lint, all unit/component/integration/E2E tests, migrations on empty and prior schema, production build/start, health/SPA/API probes, responsive/accessibility/security smoke matrices, upload/session persistence checks, backup/rollback review, and the documentation validator. Confirm the source tree contains no accidental generated scaffold from planning work.

## 4. Unavailable Checks and Required Blockers

No check is assumed available until its FND task creates the command. A task requiring a missing command remains `blocked` or `in-progress`; it cannot be marked done. Hostinger deployment smoke and production backups require credentials/environment and explicit user authorization. A-001 through A-007 must be confirmed or explicitly accepted before the task that depends on each.
