# Decisions — Homepage Merchandising

## HOME-DEC-001 — Catalog owns product merchandising flags

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** HOME owns the curation workflow/UI but changes Best Seller/New Arrival through CAT's CMD-CAT-001; no duplicate selection table is introduced.
- **Rationale:** The PRD defines flags on Product and asks for manual homepage selection; one canonical representation avoids duplication.
- **Alternatives:** HOME-owned join tables duplicating product flag state.
- **Consequences:** CAT contract must freeze before HOME-001 and enforce max-eight atomically.
- **Affected contracts/tasks:** HOME-001–HOME-004; CMD-CAT-001.


## HOME-DEC-002 — Approved HOME-001 early start and CAT consumer amendment

- Status: explicitly approved by user, 2026-11-06 after preflight.
- Create work/HOME-backend separately from published a6603ca; preserve all existing CAT/SET/AUTH work. Reuse only the already approved FND nested-mount / CAT owned-resource guard changes from SET, including their regression/fixture prefix changes, not SET implementation or its uncommitted business state.
- Approve CAT-owned READ-CAT-002 bounded category/curated projections and atomic versioned replacement of each flag selection list, using the CAT curation lock and an additive revision migration; existing single-product flag writers must participate in revision updates. No HOME-owned product writes/duplicate selection tables.
- First hero is active; thereafter 1–3 active slides, max-eight products each list. Public homepage unavailable before valid hero setup. Both banners may be disabled/absent and return null; this explicitly updates banner1 nullability.
- Hero CTA links are internal product/detail/filter routes only. Existing max-eight/ownership/image/session policies remain intact. No frontend, new dependency, existing DB/env access, commit/push/merge/deploy or next task. Original docs validator BLOCKED / NOT RUN, no completion waiver.


## HOME-DEC-003 — User-authorized HOME-001 checkpoint and push

- Status: explicitly authorized by user, 2026-11-06.
- Preserve HOME-001 with its approved shared changes in one checkpoint on work/HOME-backend, planned subject chore(HOME-001): checkpoint verified homepage APIs; non-force push origin/work/HOME-backend.
- HOME-001 remains formally blocked, feature 0/4; this does not accept or close the task. Original docs validator BLOCKED / NOT RUN; no fabricated acceptance/completion/merge/release pass.
- Existing observed checks: 168 unit / 105 isolated integration, lint/build/diff passed. No new tests claimed for publication-only work.
- Resulting hash/push evidence will be reported after execution, no hash-only follow-up commit. No frontend, original-worktree overwrite, existing DB/env access, PR/merge/deploy or next task authorization.
