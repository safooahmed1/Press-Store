# Decisions — Store Settings

## SET-DEC-001 — Singleton with minimized projections

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Store business-editable contact/payment values in one versioned singleton and expose separate minimum public/internal projections.
- **Rationale:** Keeps Settings small and prevents unnecessary payment-data exposure.
- **Alternatives:** Arbitrary key/value store or one public full-settings endpoint.
- **Consequences:** New fields require explicit projection/privacy handling.
- **Affected contracts/tasks:** SET-001–SET-003; API-SET-001/002; READ-SET-001/002.


## SET-DEC-002 — Bounded SET-001 development baseline and shared composition

- Status: explicitly approved by user, 2026-11-04, after preflight.
- Create work/SET-backend in a separate worktree from published backend checkpoint a6603ca5f2b5eb54b75e530906cee42821ec371e. This is an early-development exception to the normal frozen SET integration baseline, not a merge, source completion, validator or release waiver.
- Approve narrow FND support for validated multi-segment mounts and CAT resource-scoped guards so /admin/settings composes independently without traversing CAT authentication. FND-DEC-012 and CAT-DEC-009 document owner/consumer boundaries.
- SET-001 only: settings schema/repository/service/routes/tests/docs. No frontend, AUTH policy edits, new dependency, server/.env or existing application DB use, commit/push/merge/deploy or next task. Original documentation validator remains BLOCKED / NOT RUN.

## SET-DEC-003 — Singleton provisioning, phone and social policy

- Status: explicitly approved by user, 2026-11-04.
- The first protected PUT with numeric version 0 inserts singleton settings at version 1; subsequent PUT uses current numeric version, replaces all validated editable values atomically and advances version. Concurrent initial inserts/updates do not overwrite a winner; stale version is EDIT_CONFLICT. Missing singleton is SETTINGS_UNAVAILABLE, no automatic seed/startup provisioning.
- Store/WhatsApp/Wallet EG/InstaPay numbers are Egyptian mobile input only, accepting strict local 01xxxxxxxxx or +201xxxxxxxxx, normalized to +20. Payment numbers are independent, can be equal or different, and are both required on admin save. This policy is explicitly approved for SET, not silently inferred from AUTH.
- Social links are optional. Supported keys: facebook, instagram, tiktok; URLs must use HTTPS with the corresponding facebook.com/instagram.com/tiktok.com or www host, without credentials or custom ports. Empty values are omitted. No required network, no server-side fetch and no arbitrary URL host. This confirms A-004 for SET-001; it does not claim FE completion.
- Public projection contains contact/social only. Internal payment read returns exactly the requested method/destination; cash requires no destination and no settings read. Internal contact read omits social/payment/version. No payment/contact value in logs or error text.


## SET-DEC-004 — User-accepted SET-001 backend closeout

- Status: explicitly accepted by user, 2026-11-06.
- Context: After SET-001 implementation/testing and missing original validator were explained, the user instructed closing the task. This records a task-tracking acceptance exception, not an invented validator pass.
- SET-001 becomes done by user acceptance. SET backend is 1/1 accepted, feature 1/3. SET-002 FE and SET-003 INT remain not-started/separately owned; no next task authorization.
- Actual prior evidence remains 169/169 unit and 104/104 isolated integration, lint/build/diff passed, no failed/cancelled/skipped; exact commands and earlier fixture failure history remain preserved. No new code tests/lint/build run for this documentation-only closeout.
- The exception permits task accounting despite original docs validation and absent completion commit. Requirements and the two feature Passed checkboxes are unchanged. Original docs validation remains BLOCKED / NOT RUN, not waived for full feature/merge/release acceptance. Feature stays in-progress, not merge-ready or release/security verified.
- SET-001 implementation, approved FND/CAT changes and documentation remain local/uncommitted on work/SET-backend, completion commit None. No source/package/test modification, server/.env/existing DB/frontend access, commit/push/merge/deploy or new work authorized. CAT/AUTH worktrees and stashes preserved. Earlier blocked statements are superseded only for current task accounting.


## SET-DEC-005 — User-authorized SET-001 checkpoint and push

- Status: explicitly authorized by user, 2026-11-06.
- Preserve SET-001 with its approved shared changes in one checkpoint on work/SET-backend, planned subject chore(SET-001): checkpoint verified store settings APIs; non-force push origin/work/SET-backend.
- SET-001 remains done by user acceptance SET-DEC-004, feature 1/3, BE 1/1 accepted. Original docs validator BLOCKED / NOT RUN; no fabricated acceptance/completion/merge/release pass.
- Existing observed checks: 169 unit / 104 isolated integration, lint/build/diff passed. No new tests claimed for publication-only work.
- Resulting hash/push evidence will be reported after execution, no hash-only follow-up commit. No frontend, original-worktree overwrite, existing DB/env access, PR/merge/deploy or next task authorization.
