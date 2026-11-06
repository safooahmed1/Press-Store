# Homepage backend — HOME-001

Canonical owner contracts: HOME technical contracts §14, HOME-DEC-002, CAT-DEC-011 and A-014. Public GET /api/v1/homepage returns fixed ordered active content and CAT projections. Admin /api/v1/admin/homepage provides summary, hero-slides CRUD, versioned banner slots and curation list replacement. One to three active heroes retained atomically; max eight each curated set. Both banners nullable when absent/disabled; first valid hero config required for public 200. CTA internal product/detail/filter URLs only.

HOME writes only its own content; createMerchandisingService is CAT's READ-CAT-002/CMD-CAT-001 facade. Global list revision participates with individual CAT flag writers, whole-set replacement is atomic and does not overwrite prices/content. Existing product versions remain strings, content/list versions numeric. New cat_005/home_001 migrations are additive/explicit, never startup; preserve FND interruption marker and inspect partial DDL before separately approved recovery. No old migration/history modifications or existing DB use.

Image persistence/validation/compensation uses existing FND and bounded CAT multipart transport. Old images deleted only after commit; cleanupPending warns without deleting committed new files/leaking paths. Filesystem/DB crash or lost commit acknowledgement requires explicit reconciliation, no blind retries/job.

Work/HOME-backend is based on a6603ca; only approved FND/CAT mount seams copied from SET, not SET source. Tests use fresh disposable MySQL and image roots only. No frontend, dependency, env-file access, commit/push/merge/deploy. Formal completion remains blocked by original missing docs validator; full FE/INT/hosting/visual/recovery gates remain unrun.


## 2026-11-06 — User-authorized HOME-001 checkpoint publication

The user explicitly requested uploading SET and HOME to GitHub. HOME-DEC-003 authorizes one preservation checkpoint for HOME-001 and non-force push of work/HOME-backend to origin, separately from the other worktree. Planned subject: `chore(HOME-001): checkpoint verified homepage APIs`. HOME-001 remains formally blocked, feature 0/4; this does not accept or close the task. Original required docs validation remains BLOCKED / NOT RUN; all full feature/FE/INT/hosting/recovery/security/merge gates and unchecked acceptance boxes remain unchanged.

Existing observed verification: 168 unit / 105 isolated integration, lint/build/diff passed, no failed/cancelled/skipped tests. No new code checks claimed during this docs/Git-only publication. Include only this task's source/tests/approved shared-owner amendments/docs. Preserve original CAT/AUTH and the other feature's work; no frontend, DB/env access, PR/merge/deployment or next task. The resulting checkpoint hash and observed push result are reported after execution rather than invented in a self-referencing follow-up commit. Earlier local/uncommitted/no-publication statements remain historical, superseded only for this authorized publication.
