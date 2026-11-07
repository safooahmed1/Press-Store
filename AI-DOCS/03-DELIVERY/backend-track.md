# Backend Track

## 1. Purpose and Source of Truth

This is the Backend developer entry point, not a second specification. Canonical behavior, API/data contracts, acceptance criteria, task status, and evidence remain in each feature's seven files. If this view conflicts with a feature contract or backlog, the owner document wins and this view must be corrected.

## 2. Lane Rules

- Select only a `BE` task whose named dependencies and contract-freeze prerequisite are satisfied.
- Own only `server/src/features/<feature>/**`, explicitly assigned platform/server paths, backend tests, migrations, and scripts named by the task.
- Do not edit `src/features/**`, frontend fixtures, pages, or components.
- Freeze request, response, error, auth, pagination, and concurrency behavior in the canonical technical contract before FE and BE proceed in parallel.
- A contract change after freeze requires a recorded owner decision, both lane owners' acknowledgement, named consumer updates, and a rerun of contract/integration checks.

## 3. Planned Backend Queue

| Order | Feature | Workstream | Tasks | Depends On | Branch | Owned Source | Current State |
|---:|---|---|---|---|---|---|---|
| 1 | AUTH | WS-AUTH-BE | AUTH-001–AUTH-003 | FND DB/HTTP contracts; A-005 | `work/AUTH-backend` | `server/src/features/auth/**`, `server/src/platform/auth/**`, bootstrap script | AUTH-001/002 remain blocked; AUTH-003 implemented under AUTH-DEC-007/008, blocked on original docs validator; full rerun and host cleanup passed, verification-matrix §27 |
| 2 | CAT | WS-CAT-BE | CAT-001–CAT-003 | AUTH guard; FND DB/storage/HTTP | `work/CAT-backend` | `server/src/features/catalog/**` | CAT-002/003 accepted done (CAT-DEC-007); checkpoint commit/push authorized CAT-DEC-008. CAT-002 checkpoint 43ebb11; CAT-003 pending execution record. CAT-001 blocked, validator/full gates open. |
| 3 | SET | WS-SET-BE | SET-001 | AUTH guard; FND DB/HTTP | `work/SET-backend` | `server/src/features/settings/**` | SET-001 checkpoint/push explicitly authorized SET-DEC-005. SET-001 remains done by user acceptance SET-DEC-004, feature 1/3, BE 1/1 accepted. Original docs validation/full feature gates remain open; no merge/deploy authorization. |
| 4 | HOME | WS-HOME-BE | HOME-001 | CAT admin/curation contract; FND storage | `work/HOME-backend` | `server/src/features/homepage/**` | HOME-001 checkpoint/push explicitly authorized HOME-DEC-003. HOME-001 remains formally blocked, feature 0/4; this does not accept or close the task. Original docs validation/full feature gates remain open; no merge/deploy authorization. |
| 5 | CART | WS-CART-BE | CART-001–CART-002 | AUTH and CAT read contracts | `work/CART-backend` | `server/src/features/cart/**` | CART-001/CART-002 backend implementations verified: full unit 179/179, mirror integration 129/129, lint/build/cleanup pass. Formal task gates/docs validator remain blocked; no completion commits, FE or ORD implementation. |
| 6 | ORD | WS-ORD-BE | ORD-001–ORD-003, ORD-006, ORD-009, ORD-011 | CART/CAT/SET/AUTH/FND contracts | `work/ORD-backend` | `server/src/features/orders/**` | ORD-001 and ORD-002 accepted for backend tracking under ORD-DEC-006 and ORD-DEC-011 (2/6). Formal integration and original docs validation are pending. |
| 7 | CUS | WS-CUS-BE | CUS-001 | AUTH and ORD read contracts | `work/CUS-backend` | `server/src/features/customers/**` | planned |
| 8 | ADM | WS-ADM-BE | ADM-004 | CAT/ORD/CUS read projections | `work/ADM-backend` | `server/src/features/admin-dashboard/**` | planned |

FND remains on its existing legacy feature branch and is not retroactively repartitioned. UI is frontend-only and remains on its existing feature branch.

## 4. Handoff to Integration

The BE workstream is `ready-for-integration` only when its tasks are `done`, backend checks pass, the canonical contract matches the implementation, and its completion commits are available on the documented branch. This state does not make the feature `merge-ready`.

## 5. Blockers and Next Work

When the current API is delayed, record the blocker in the feature backlog. Do not ask FE to wait or silently change its fixture shape. FE may continue against the frozen contract. The backend developer moves only after explicit authorization to the next BE task whose dependencies are complete.

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


## 2026-11-04 — CAT-001 current work

User authorized CAT backend and approved CAT-DEC-002/003. CAT-001 domain implementation is local to work/CAT-backend from published backend checkpoint 7e3ca00; formal task completion blocked by original missing docs validator. CAT-002/003 not started; no frontend or remote write. See CAT backlog and verification-matrix CAT-001 appendix.

## 2026-11-04 — Accepted CAT-002/CAT-003 task closeout

CAT-DEC-007 supersedes earlier blocked task-tracking status for CAT-002/003 only. They are accepted done, BE 2/3 and feature 2/6. CAT-001 remains blocked; implementation commits/source publication and full docs/feature/owner integration gates remain open. No next task or remote operation authorized.


## 2026-11-04 — Current checkpoint publication disposition

CAT-DEC-008 authorizes separate CAT-002/CAT-003 checkpoint commits and non-force push. CAT-002 checkpoint is 43ebb117945afe60babd86c12a55cd4091ea1514. CAT-003 planned subject is chore(CAT-003): checkpoint verified admin catalog management; resulting hash/push confirmation are reported from Git after execution, not invented in this record. Earlier local/uncommitted/no-authorization entries remain historical and are superseded for this publication only. Task accounting remains CAT-002/003 accepted done (2/6, BE 2/3); CAT-001 blocked. Original docs validation BLOCKED / NOT RUN; feature remains in-progress, all three Passed boxes unchecked. No new code tests run for publication, no PR/merge/deploy/next task.


## 2026-11-06 — User-accepted SET backend closeout

SET-DEC-004 supersedes earlier blocked task-accounting status for SET-001. SET backend is 1/1 accepted, feature 1/3. Original docs validation remains BLOCKED / NOT RUN; all feature acceptance criteria and FE/browser/consumer/privacy/hosting/recovery/integration gates remain open. Both feature Passed boxes stay unchecked and feature remains in-progress, not merge-ready or release-verified. Implementation/docs remain local and uncommitted; completion commit None. Documentation-only closeout, no new source/tests/packages, code checks, frontend, existing DB/env access, commit/push/merge/deploy or next task. Earlier observed verification/failure history and separate CAT/AUTH work remain preserved.


## 2026-11-06 — User-authorized SET-001 checkpoint publication

The user explicitly requested uploading SET and HOME to GitHub. SET-DEC-005 authorizes one preservation checkpoint for SET-001 and non-force push of work/SET-backend to origin, separately from the other worktree. Planned subject: `chore(SET-001): checkpoint verified store settings APIs`. SET-001 remains done by user acceptance SET-DEC-004, feature 1/3, BE 1/1 accepted. Original required docs validation remains BLOCKED / NOT RUN; all full feature/FE/INT/hosting/recovery/security/merge gates and unchecked acceptance boxes remain unchanged.

Existing observed verification: 169 unit / 104 isolated integration, lint/build/diff passed, no failed/cancelled/skipped tests. No new code checks claimed during this docs/Git-only publication. Include only this task's source/tests/approved shared-owner amendments/docs. Preserve original CAT/AUTH and the other feature's work; no frontend, DB/env access, PR/merge/deployment or next task. The resulting checkpoint hash and observed push result are reported after execution rather than invented in a self-referencing follow-up commit. Earlier local/uncommitted/no-publication statements remain historical, superseded only for this authorized publication.

## 2026-11-06 — User-authorized HOME-001 checkpoint publication

The user explicitly requested uploading SET and HOME to GitHub. HOME-DEC-003 authorizes one preservation checkpoint for HOME-001 and non-force push of work/HOME-backend to origin, separately from the other worktree. Planned subject: `chore(HOME-001): checkpoint verified homepage APIs`. HOME-001 remains formally blocked, feature 0/4; this does not accept or close the task. Original required docs validation remains BLOCKED / NOT RUN; all full feature/FE/INT/hosting/recovery/security/merge gates and unchecked acceptance boxes remain unchanged.

Existing observed verification: 168 unit / 105 isolated integration, lint/build/diff passed, no failed/cancelled/skipped tests. No new code checks claimed during this docs/Git-only publication. Include only this task's source/tests/approved shared-owner amendments/docs. Preserve original CAT/AUTH and the other feature's work; no frontend, DB/env access, PR/merge/deployment or next task. The resulting checkpoint hash and observed push result are reported after execution rather than invented in a self-referencing follow-up commit. Earlier local/uncommitted/no-publication statements remain historical, superseded only for this authorized publication.
