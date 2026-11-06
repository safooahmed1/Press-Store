# Change Log — Homepage Merchandising

No implementation activity recorded.


## 2026-11-06 — HOME-001 backend content and CAT curation orchestration

Added HOME singleton/hero/banner schema and guarded versioned CRUD/slots, ordered active public projection, image compensation and post-commit cleanup; implemented CAT-owned bounded projections and atomic versioned set replacement with legacy flag-writer coordination and additive revision migration. Reused approved FND nested mounts/CAT scoped guards from SET without importing SET implementation or changing its worktree. Approved HOME-DEC-002/CAT-DEC-011, bounds A-014. Regression tests include CTA canonicalization/encoded length and noncanonical IDs, transactions/limits/storage/scope/Origin/restart. Code evidence in HOME-001 verification appendix. No existing migration edits, dependency, FE, application DB/env access, commit/push/merge/deploy; original docs validator BLOCKED / NOT RUN.


## 2026-11-06 — User-authorized HOME-001 checkpoint publication

The user explicitly requested uploading SET and HOME to GitHub. HOME-DEC-003 authorizes one preservation checkpoint for HOME-001 and non-force push of work/HOME-backend to origin, separately from the other worktree. Planned subject: `chore(HOME-001): checkpoint verified homepage APIs`. HOME-001 remains formally blocked, feature 0/4; this does not accept or close the task. Original required docs validation remains BLOCKED / NOT RUN; all full feature/FE/INT/hosting/recovery/security/merge gates and unchecked acceptance boxes remain unchanged.

Existing observed verification: 168 unit / 105 isolated integration, lint/build/diff passed, no failed/cancelled/skipped tests. No new code checks claimed during this docs/Git-only publication. Include only this task's source/tests/approved shared-owner amendments/docs. Preserve original CAT/AUTH and the other feature's work; no frontend, DB/env access, PR/merge/deployment or next task. The resulting checkpoint hash and observed push result are reported after execution rather than invented in a self-referencing follow-up commit. Earlier local/uncommitted/no-publication statements remain historical, superseded only for this authorized publication.
