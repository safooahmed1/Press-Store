# Store settings — SET-001 backend

Canonical contracts: AI-DOCS/02-FEATURES/store-settings/03-technical-contracts.md §14, SET-DEC-002/003. Backend-only singleton settings, protected GET/PUT /api/v1/admin/settings and anonymous GET /api/v1/settings/public-contact. First PUT version 0 creates version 1; all later saves replace validated values with the current numeric version. Missing singleton is 503, stale version 409. No automatic seed or migration.

Payment numbers are independent canonical Egyptian mobile destinations. Public SQL/DTO omits payment and version. Server-only service.payment(method) returns only the chosen destination, cash skips DB; contact() returns store/pickup contact only. No full public settings/payment endpoint. Optional Facebook/Instagram/TikTok links use approved corresponding HTTPS hosts. No input/log/error reveals payment/contact values outside approved DTOs.

Use existing explicit FND migrations with approval; never run against an existing DB without authorization. New set_001 is additive; inspect partial DDL/FND marker before approved recovery, never auto-drop/retry/alter history. Tests create only disposable MySQL, no application env files. No new dependencies. FND validates nested mounts, CAT middleware is resource-scoped; actual CAT resources retain their guard/Origin policy.

Formal completion remains blocked on original missing docs validator; no commit/push or FE/INT/merge-readiness claimed. User authorization covers only SET-001, not frontend or live consumer integration.


## 2026-11-06 — User-accepted SET backend closeout

SET-DEC-004 supersedes earlier blocked task-accounting status for SET-001. SET backend is 1/1 accepted, feature 1/3. Original docs validation remains BLOCKED / NOT RUN; all feature acceptance criteria and FE/browser/consumer/privacy/hosting/recovery/integration gates remain open. Both feature Passed boxes stay unchecked and feature remains in-progress, not merge-ready or release-verified. Implementation/docs remain local and uncommitted; completion commit None. Documentation-only closeout, no new source/tests/packages, code checks, frontend, existing DB/env access, commit/push/merge/deploy or next task. Earlier observed verification/failure history and separate CAT/AUTH work remain preserved.


## 2026-11-06 — User-authorized SET-001 checkpoint publication

The user explicitly requested uploading SET and HOME to GitHub. SET-DEC-005 authorizes one preservation checkpoint for SET-001 and non-force push of work/SET-backend to origin, separately from the other worktree. Planned subject: `chore(SET-001): checkpoint verified store settings APIs`. SET-001 remains done by user acceptance SET-DEC-004, feature 1/3, BE 1/1 accepted. Original required docs validation remains BLOCKED / NOT RUN; all full feature/FE/INT/hosting/recovery/security/merge gates and unchecked acceptance boxes remain unchanged.

Existing observed verification: 169 unit / 104 isolated integration, lint/build/diff passed, no failed/cancelled/skipped tests. No new code checks claimed during this docs/Git-only publication. Include only this task's source/tests/approved shared-owner amendments/docs. Preserve original CAT/AUTH and the other feature's work; no frontend, DB/env access, PR/merge/deployment or next task. The resulting checkpoint hash and observed push result are reported after execution rather than invented in a self-referencing follow-up commit. Earlier local/uncommitted/no-publication statements remain historical, superseded only for this authorized publication.
