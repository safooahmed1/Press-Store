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
| `feature/FND-application-foundation` | feature | `main` | WS-FND-01 | FND-001–FND-006 | `main` | FND full suite/build/docs validator; explicit merge instruction | User accepts 6/6 tasks for downstream development (FND-DEC-007/008); original validator BLOCKED / NOT RUN; not release-verified; no commit/push authorization. |
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
| `feature/FND-application-foundation` | legacy feature | `main` | WS-FND-01 | FND-001–FND-006 | `main` | FND full gate; explicit merge | User accepts 6/6 tasks for downstream development (FND-DEC-007/008); original validator BLOCKED / NOT RUN; not release-verified; no commit/push authorization. |
| `feature/UI-design-system-app-shell` | legacy feature | existing FND lineage | WS-UI-01 | UI-001–UI-004 | `main` after FND | UI full gate; explicit merge | existing; history preserved/reconciled on its branch |
| `feature/AUTH-integration` | integration | `715df78` updated `main` after FND/UI prerequisites | WS-AUTH-INT | AUTH-005 | `main` | BE+FE ready; live security/integration pass | active; AUTH contract frozen 2026-10-31 |
| `work/AUTH-backend` | backend | frozen AUTH integration commit | WS-AUTH-BE | AUTH-001–AUTH-003 | `feature/AUTH-integration` | backend suite and contract match; explicit merge | Created from frozen 4e92f8f; checkpoints 9b86081 / 7f3849f published. AUTH-003 uncommitted, verified under AUTH-DEC-007/008 but blocked on original validator; latest full rerun and cleanup pass (§27); no commit/push authorized. |
| `work/AUTH-frontend` | frontend | same frozen AUTH integration commit | WS-AUTH-FE | AUTH-004 | `feature/AUTH-integration` | component/a11y/build and fixture evidence; explicit merge | planned |
| `feature/CAT-integration` | integration | updated `main` after AUTH/UI/FND | WS-CAT-INT | CAT-006 | `main` | BE+FE ready; live CAT gate | planned |
| `work/CAT-backend` | backend | frozen CAT integration commit | WS-CAT-BE | CAT-001–CAT-003 | `feature/CAT-integration` | backend catalog suite; explicit merge | CAT-002 checkpoint 43ebb11; CAT-003 checkpoint/push authorized under CAT-DEC-008. No feature merge/release authorization; original docs validator blocked. |
| `work/CAT-frontend` | frontend | same frozen CAT integration commit | WS-CAT-FE | CAT-004–CAT-005 | `feature/CAT-integration` | client/a11y/responsive/build; explicit merge | planned |
| `feature/SET-integration` | integration | updated `main` after AUTH/UI/FND | WS-SET-INT | SET-003 | `main` | BE+FE ready; live privacy/consumer gate | planned |
| `work/SET-backend` | backend | frozen SET integration commit | WS-SET-BE | SET-001 | `feature/SET-integration` | backend settings suite; explicit merge | SET-001 checkpoint/push explicitly authorized SET-DEC-005. SET-001 remains done by user acceptance SET-DEC-004, feature 1/3, BE 1/1 accepted. Original docs validation/full feature gates remain open; no merge/deploy authorization. |
| `work/SET-frontend` | frontend | same frozen SET integration commit | WS-SET-FE | SET-002 | `feature/SET-integration` | form/a11y/build; explicit merge | planned |
| `feature/HOME-integration` | integration | updated `main` after CAT/AUTH/UI | WS-HOME-INT | HOME-004 | `main` | BE+FE ready; live HOME gate | planned |
| `work/HOME-backend` | backend | frozen HOME integration commit | WS-HOME-BE | HOME-001 | `feature/HOME-integration` | backend HOME suite; explicit merge | HOME-001 checkpoint/push explicitly authorized HOME-DEC-003. HOME-001 remains formally blocked, feature 0/4; this does not accept or close the task. Original docs validation/full feature gates remain open; no merge/deploy authorization. |
| `work/HOME-frontend` | frontend | same frozen HOME integration commit | WS-HOME-FE | HOME-002–HOME-003 | `feature/HOME-integration` | client/a11y/responsive/build; explicit merge | planned |
| `feature/CART-integration` | integration | updated `main` after CAT/AUTH/UI | WS-CART-INT | CART-004 | `main` | BE+FE ready; live CART gate | planned |
| `work/CART-backend` | backend | frozen CART integration commit | WS-CART-BE | CART-001–CART-002 | `feature/CART-integration` | backend cart suite; explicit merge | Local development baseline a6603ca under CART-DEC-002; task checkpoints/non-force branch publication authorized CART-DEC-006. Not merge-ready; exact integration target remains required. |
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

## 2026-11-02 — AUTH-003 current development disposition

AUTH-DEC-007/008 approve only the AUTH-003 early start and admin bootstrap/API policy;
FND-DEC-010 approves exact shared config/ESLint paths. Implementation and isolated verification
are recorded in verification-matrix §26. AUTH-003 is blocked on original documentation validation
and failed sandbox fixture cleanup. AUTH-001/002 remain blocked; AUTH is 0/5 and not ready for
integration. Current branch work/AUTH-backend remains at checkpoint 7f3849f with uncommitted
AUTH-003 changes. No commit, push, merge, deploy, FE change or next task is authorized. This current
entry supersedes earlier current-state references saying AUTH-003 is not started; history is retained.

### 2026-11-02 — Latest verification supersedes cleanup blocker

Verification-matrix §27 records requested full rerun (unit 140/140, integration 71/71, lint/build/
diff pass) and observed host cleanup. Earlier §26 cleanup blocker is resolved; original mandatory
documentation validation remains BLOCKED / NOT RUN. AUTH-003 still blocked, no commit or next task.


## 2026-11-04 — CAT-001 bounded baseline exception

CAT-DEC-002 overrides only CAT-001's development branch creation prerequisite: work/CAT-backend starts from 7e3ca00152afc3181a1ae2eaf3beff9f7888b6f1 in /home/tarek/projects/Press-Store-CAT-backend. The normally required feature/CAT-integration frozen baseline is not claimed or created. BE/FE common-baseline freeze, explicit merges and full integration remain required later. Original AUTH checkout changes/stashes are preserved; no AUTH changes are carried into this branch. No push/deploy authorization.

## 2026-11-04 — Accepted CAT-002/CAT-003 task closeout

CAT-DEC-007 supersedes earlier blocked task-tracking status for CAT-002/003 only. They are accepted done, BE 2/3 and feature 2/6. CAT-001 remains blocked; implementation commits/source publication and full docs/feature/owner integration gates remain open. No next task or remote operation authorized.


## 2026-11-04 — Current checkpoint publication disposition

CAT-DEC-008 authorizes separate CAT-002/CAT-003 checkpoint commits and non-force push. CAT-002 checkpoint is 43ebb117945afe60babd86c12a55cd4091ea1514. CAT-003 planned subject is chore(CAT-003): checkpoint verified admin catalog management; resulting hash/push confirmation are reported from Git after execution, not invented in this record. Earlier local/uncommitted/no-authorization entries remain historical and are superseded for this publication only. Task accounting remains CAT-002/003 accepted done (2/6, BE 2/3); CAT-001 blocked. Original docs validation BLOCKED / NOT RUN; feature remains in-progress, all three Passed boxes unchecked. No new code tests run for publication, no PR/merge/deploy/next task.


## 2026-11-06 — CART-001 approved isolated local-development baseline

CART-DEC-002 approves work/CART-backend from published CAT snapshot a6603ca5f2b5eb54b75e530906cee42821ec371e,
created in /home/tarek/.codex/worktrees/cart-backend/Press-Store. No frozen CART integration branch is
claimed or created. Original AUTH/CAT/SET/HOME worktrees and their uncommitted work remain untouched.
CART-DEC-003 limits this to independent backend development: no real CAT adapter, manifest, migration
activation, FE work, next task, completion commit, push, PR, merge or deployment.

### CART-001 real backend activation authorized — 2026-11-06

CART-DEC-004 supersedes only the earlier linking stop: continue the same work/CART-backend
and approved a6603ca baseline with CAT-DEC-012's bounded owner amendment. No new branch,
cross-worktree merge, remote operation or formal frozen integration baseline. CART-002/FE/INT
remain unauthorized; original documentation and completion gates remain required.


## 2026-11-06 — CART-002 approved early backend continuation

Continue work/CART-backend with its existing local verified CART-001 and CAT amendments intact.
CART-DEC-005 approves development only despite CART-001/CAT-006 formal gates. No branch creation,
freeze, cross-worktree transfer or merge. Planned subject: feat(CART-002): add transactional cart
checkout handoff. No completion commit until all task gates pass; no incomplete checkpoint authorized.


## 2026-11-06 — User-authorized CART checkpoint publication

CART-DEC-006 records the explicit request to save and upload CART backend work. Preserve CART-001
and CART-002 as two separate checkpoints on work/CART-backend, then non-force push that branch.
Planned subjects: chore(CART-001): checkpoint verified persistent cart APIs;
chore(CART-002): checkpoint verified transactional cart handoff.
This is preservation of blocked task work, not a completion/feature/validator pass. Existing observed
CART-001 171 unit/116 mirror integration and CART-002 179 unit/129 mirror integration evidence is
retained, not claimed rerun for publication. No frontend or unrelated worktree changes included.
PR-based remote integration still requires the documented feature/CART-integration baseline and
gates; no new integration branch, alternate merge target, merge, deployment or release is created.
Actual Git hashes and push confirmation follow execution, without a self-referencing follow-up commit.


## 2026-11-06 — ORD-001 approved local baseline

ORD-DEC-004 authorizes work/ORD-backend from published CART checkpoint
0e3937b753038db37491c23dfc8ae951a5be54da. Reuse the clean current checkout; no separate worktree
or feature/ORD-integration branch created. This is not the ordinary frozen integration baseline.
Only ORD-001 code/schema development is authorized, with SQL staged under ORD-DEC-005 and all
original completion/hosting/merge gates retained. Previous CART publication authorization does
not extend to ORD. No push/checkpoint, merge, deployment or next task authorized.

## 2026-11-07 — ORD-001 checkpoint publication

ORD-DEC-007 authorizes `chore(ORD-001): checkpoint verified order schema and domain` and a
non-force push of `work/ORD-backend` only. The remote head check found neither that branch
nor `feature/ORD-integration` before publication. A future integration pull request requires
the documented integration target. Report the resulting checkpoint hash and remote ref after Git verifies them.

## 2026-11-04 — SET-001-only early baseline exception

User approval SET-DEC-002 permits work/SET-backend in a separate worktree from published a6603ca5f2b5eb54b75e530906cee42821ec371e without the normally required frozen SET integration branch. FND/AUTH implementations are present; formal/hosting/validator gates are not waived. No merge/cherry-pick, frontend, remote write, release or next task. Original CAT/AUTH checkouts and stashes remain preserved; full normal owner/integration baseline and acceptance still required later.


## 2026-11-06 — User-accepted SET backend closeout

SET-DEC-004 supersedes earlier blocked task-accounting status for SET-001. SET backend is 1/1 accepted, feature 1/3. Original docs validation remains BLOCKED / NOT RUN; all feature acceptance criteria and FE/browser/consumer/privacy/hosting/recovery/integration gates remain open. Both feature Passed boxes stay unchecked and feature remains in-progress, not merge-ready or release-verified. Implementation/docs remain local and uncommitted; completion commit None. Documentation-only closeout, no new source/tests/packages, code checks, frontend, existing DB/env access, commit/push/merge/deploy or next task. Earlier observed verification/failure history and separate CAT/AUTH work remain preserved.


## 2026-11-06 — User-authorized SET-001 checkpoint publication

The user explicitly requested uploading SET and HOME to GitHub. SET-DEC-005 authorizes one preservation checkpoint for SET-001 and non-force push of work/SET-backend to origin, separately from the other worktree. Planned subject: `chore(SET-001): checkpoint verified store settings APIs`. SET-001 remains done by user acceptance SET-DEC-004, feature 1/3, BE 1/1 accepted. Original required docs validation remains BLOCKED / NOT RUN; all full feature/FE/INT/hosting/recovery/security/merge gates and unchecked acceptance boxes remain unchanged.

Existing observed verification: 169 unit / 104 isolated integration, lint/build/diff passed, no failed/cancelled/skipped tests. No new code checks claimed during this docs/Git-only publication. Include only this task's source/tests/approved shared-owner amendments/docs. Preserve original CAT/AUTH and the other feature's work; no frontend, DB/env access, PR/merge/deployment or next task. The resulting checkpoint hash and observed push result are reported after execution rather than invented in a self-referencing follow-up commit. Earlier local/uncommitted/no-publication statements remain historical, superseded only for this authorized publication.

## 2026-11-06 — HOME-001 approved early baseline

HOME-DEC-002 permits work/HOME-backend from published a6603ca5f2b5eb54b75e530906cee42821ec371e in /home/tarek/projects/Press-Store-HOME-backend without the normal frozen HOME integration baseline. Only four approved FND/CAT composition/fixture files are copied from SET; SET settings source/migration and all its uncommitted work remain separate, no merge/cherry-pick. CAT-DEC-011 owns the additional HOME consumer amendment. Existing CAT closeout/SET/AUTH worktrees and stashes preserved. No completion/validator waiver, frontend, commit/push/merge/deploy or next task.


## 2026-11-06 — User-authorized HOME-001 checkpoint publication

The user explicitly requested uploading SET and HOME to GitHub. HOME-DEC-003 authorizes one preservation checkpoint for HOME-001 and non-force push of work/HOME-backend to origin, separately from the other worktree. Planned subject: `chore(HOME-001): checkpoint verified homepage APIs`. HOME-001 remains formally blocked, feature 0/4; this does not accept or close the task. Original required docs validation remains BLOCKED / NOT RUN; all full feature/FE/INT/hosting/recovery/security/merge gates and unchecked acceptance boxes remain unchanged.

Existing observed verification: 168 unit / 105 isolated integration, lint/build/diff passed, no failed/cancelled/skipped tests. No new code checks claimed during this docs/Git-only publication. Include only this task's source/tests/approved shared-owner amendments/docs. Preserve original CAT/AUTH and the other feature's work; no frontend, DB/env access, PR/merge/deployment or next task. The resulting checkpoint hash and observed push result are reported after execution rather than invented in a self-referencing follow-up commit. Earlier local/uncommitted/no-publication statements remain historical, superseded only for this authorized publication.

## 2026-11-07 — ORD-002 local development exception

ORD-DEC-008 authorizes quote service development on `work/ORD-backend` from published
ORD-001 checkpoint 59861e6. The clean ORD worktree is separate from the local CART
closeout changes. The SET owner modules and published CART test fix are used in an
isolated test composition. The `feature/ORD-integration` baseline and its merge gates
remain required for runtime wiring.

## 2026-11-07 — ORD-002 local mount on the combined branch

ORD-DEC-010 records local quote activation on the user-requested `Back-end` branch from
merge commit aa2ff39. The named feature integration targets and acceptance gates remain
required for formal completion.

## 2026-11-07 — ORD-003 local development exception

ORD-DEC-012 permits development on `Back-end` at `d53f3fe` with the staged ORD schema
applied only in disposable verification. `work/ORD-backend` remains the assigned branch
and `feature/ORD-integration` remains the formal integration target.

## 2026-11-07 — ORD-003 activation on Back-end

ORD-DEC-013 records normal ORD migration discovery and creation routing on local Back-end
with fresh and forward-upgrade verification on disposable MySQL. Formal verification
continues to target `feature/ORD-integration`.

## 2026-11-07 — ORD-006 local backend baseline

ORD-DEC-015 records admin order implementation on combined `Back-end` at `8be8ea8`.
The assigned lane branch remains `work/ORD-backend` and formal integration continues
to target `feature/ORD-integration`.

## 2026-11-07 — ORD-009 local backend baseline

ORD-DEC-017 records customer order history implementation on combined `Back-end`
at `4f117f9`. The assigned lane branch remains `work/ORD-backend` and formal
integration continues to target `feature/ORD-integration`.
