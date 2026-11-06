# Decisions — Catalog and Discovery

## CAT-DEC-012 — CART-001 bounded current-variant batch projection

- **Status:** `approved`
- **Date:** 2026-11-06
- **Decision:** The user's selection of item 1 explicitly resumes CART-001 real CAT linking,
  route registration and migration activation. Add READ-CAT-001 batch projection as defined
  in technical contracts, consumed by CART's manifest on the same DB-FND-001 transaction.
- **Owned amendment:** CAT service/repository and focused tests; the existing CAT admin
  migration-upgrade fixture must apply its complete ordered prefix before cat_004, then the
  full discovered list, so later CART migrations cannot precede the withheld cat_004 step.
  No applied migration, FND runner, CAT HTTP behavior or other worktree is changed.
- **Consequences:** Supersedes the earlier CART-DEC-003 linking stop only for CART-001.
  No CART-002, checkout/ORD consistency, FE work, CAT-006 completion, release, remote write or
  validator waiver. IDs 009–011 exist in separate owner worktrees and are not reassigned here.
- **Affected contracts/tasks:** READ-CAT-001, API-CART-001; CART-001. ORD remains a future consumer.

## CAT-DEC-001 — Boolean variant availability and historical-safe deletion

- **Status:** `approved`
- **Date:** 2026-10-18
- **Decision:** Represent each purchasable color/size pair as a unique variant with boolean availability and no quantity; remove products from purchase without destroying order snapshots.
- **Rationale:** Directly implements the PRD's no-stock rule and history requirement.
- **Alternatives:** Numeric stock, independent color/size lists, destructive order-linked deletes.
- **Consequences:** CART/ORD must always call READ-CAT-001 before checkout; public reads hide removed options.
- **Affected contracts/tasks:** CAT-001–CAT-006; READ-CAT-001; CART and ORD consumers.


## CAT-DEC-002 — Bounded CAT-001 backend development baseline

- **Status:** approved by user, 2026-11-04.
- **Decision:** Following the preflight proposal, the user approved creating `work/CAT-backend` in a separate worktree from backend checkpoint `7e3ca00152afc3181a1ae2eaf3beff9f7888b6f1`, rather than waiting for the normally required frozen CAT integration baseline. This exception authorizes CAT-001 only.
- **Dependencies:** FND-002/FND-004 implementation is present; user acceptance for downstream work is recorded in FND-DEC-007/008. No AUTH-005 guard is needed by this domain-only task. AUTH task-tracking acceptance is not full integration/release evidence.
- **Boundaries:** Original AUTH uncommitted changes and stashes stay in their existing checkout. No cherry-pick, merge, frontend modification, remote write or dependency installation. Full CAT API/consumer freeze and normal lane integration remain required before parallel FE work and integration. No completion/validator gate is waived.

## CAT-DEC-003 — Exact percentage precision and unit-price rounding

- **Status:** approved by user, 2026-11-04.
- **Decision:** Discount percentages support at most two decimal places in [0,100]. Compute the final unit price from integer EGP minor units, rounding half a minor unit upward once per unit. Use integer basis points and BigInt intermediates, never floating-point money multiplication.
- **Example:** 101 minor units at 50% gives 51; 400000 at 20% gives 320000. Zero and 100% discounts are valid.
- **Representation:** Existing JSON `priceMinor` numeric contract requires positive safe integers, capped at Number.MAX_SAFE_INTEGER. SQL uses BIGINT with the same bound; returned BIGINT identifiers remain strings. Percent input may be an ordinary number or canonical decimal string; internal persisted value is a two-place decimal string.
- **Consumers:** CAT owns the rule; HOME/CART/ORD must use canonical price/availability services as their tasks land. No existing consumer implementation or DTO changed in this task.


## CAT-DEC-004 — CAT-002-only early development exception

- **Status:** approved by user, 2026-11-04.
- **Decision:** The user approved beginning CAT-002 against verified/published CAT-001 checkpoint `2c6bb4fb5f18ab8cb278a7510b93a5f3641da829` despite original missing documentation validation. FND-003 HTTP runtime is present and accepted for downstream work. Continue only on work/CAT-backend.
- **Limits:** CAT-001 stays blocked; no acceptance/validator waiver or CAT-003 authorization. CAT-002 owns only CAT public read routes, query validation, repository/service, manifest, tests and documentation. No frontend, AUTH source, new dependency/migration, application database/env access, commit/push/merge/deployment is authorized. The earlier frozen-baseline exception remains bounded; no full BE/FE integration freeze is claimed.

## CAT-DEC-005 — Public price-filter implementation disposition

- **Status:** recorded implementation disposition after user-directed continuation, 2026-11-04; not a quoted PRD requirement or a claim that the user selected a price option explicitly.
- **Context:** PRD §9 names a price filter without specifying base versus final price. The assistant proposed final discounted unit price and asked for confirmation; the user's subsequent instruction was to execute the requested work. The assistant explicitly stated it would proceed with that proposal before implementation.
- **Implementation:** Inclusive minPriceMinor/maxPriceMinor apply to final discounted unit price using CAT-DEC-003 rounding. SQL uses exact DECIMAL/integer arithmetic matching the BigInt service calculation, including zero-price 100% discounts. No floating-point money computation. Base price remains priceMinor in the DTO.
- **Boundary:** This disposition is visible for owner review before CAT contract freeze/consumer integration; it is not attributed to the PRD or silently represented as a separately approved financial policy. Any owner-directed change must update the canonical predicate, tests and consumer references consistently. No existing consumer code is changed here.


## CAT-DEC-006 — CAT-003 early start and approved bounded shared amendments

- **Status:** approved by user, 2026-11-04.
- **Authorization:** User requested CAT-003, then approved the preflight proposal covering early development despite CAT-001's blocked validator gate, transfer of the existing AUTH admin guard, bounded FND storage-context wiring, one trusted multipart parser dependency, and an additional CAT coordination migration for concurrent max-eight merchandising updates.
- **Baseline:** work/CAT-backend at published CAT-001 checkpoint 2c6bb4fb5f18ab8cb278a7510b93a5f3641da829, preserving verified uncommitted CAT-002. CAT-001/CAT-002 formal statuses and missing validator are not waived. CAT-003 only; no frontend/next task or publication authorization.
- **AUTH transfer:** Copy existing server/src/platform/auth/guards.js and auth-guards.test.js byte-for-byte from the original AUTH working checkout; no changes to cookies, session lifetimes, identity or password policy. SHA-256 observed equal for source/copy. This transfers only fixed-scope guards, not the rest of uncommitted AUTH-005 abuse controls. No merge/cherry-pick or original AUTH source edit.
- **FND owner amendment:** FND-DEC-011 owns start-server/context and the new catalog-storage-config helper/tests plus one runtime regression assertion. Reuse lifecycle-owned DB/config; no second pool or .env loader.
- **Multipart choice:** Implementation selected/pinned busboy 1.6.0 after inspecting npm version/engines/dependency/integrity metadata; streamsearch 1.1.0 is its only added transitive lockfile package. Approved single-parser rationale: parse multipart without writing a bespoke protocol parser, then retain FND sharp validation/normalization. Package/lock changes add only these two packages; no opportunistic upgrades. node_modules symlink was replaced by a separate install in CAT so AUTH dependencies were not mutated. Installation reported six moderate graph advisories; runtime-only npm audit reports zero. No audit fix/upgrade applied.
- **Migration:** cat_004_create_curation_state.sql adds an internal singleton coordination row. All new product/admin curation writes lock it before counting/current-product locks; max-eight applies independently to each active flag. Deletes clear flags and retain products/variants/images for history. No existing migration edited; new migration ran only on new disposable databases, including upgrade/rerun tests.
- **Limits:** No existing application DB or server/.env access, no frontend, commit/push/PR/merge/deploy, feature completion or validator replacement. Host limits, full owner integration and original mandatory docs validation remain open.


## CAT-DEC-007 — User-accepted closeout of CAT-002 and CAT-003

- **Status:** explicitly accepted by user, 2026-11-04.
- **Context:** After the report that CAT-002/CAT-003 were implemented/tested locally and formal closure was blocked by the missing validator, the user requested their formal closeout. This records user acceptance as a task-tracking exception, analogous to prior user acceptance closeouts; it does not invent a validator pass.
- **Scope:** CAT-002 and CAT-003 become done by user acceptance only. CAT-001 remains blocked and its checkpoint 2c6bb4f is preserved. No acceptance of CAT-001, FE tasks CAT-004/005 or INT CAT-006 is inferred. Count is 2/6 CAT tasks, BE 2/3 accepted; all three BE implementations exist with their separately recorded evidence.
- **Exception:** Task-tracking completion may be recorded despite the unrun original docs validator, unresolved formal dependency completion and absence of completion commits. Requirements and acceptance criteria are unchanged; existing Passed checkboxes remain unchecked. Code/tests for CAT-002/CAT-003 remain local and uncommitted; no fabricated completion hash.
- **Evidence:** Latest actual full verification: 161/161 unit, 95/95 isolated integration, lint/build/diff passed, zero failed/skipped; CAT-003 appendix records exact commands and limitations. No new tests were run for this documentation-only closeout.
- **Remaining gates:** Original mandatory docs validation stays BLOCKED / NOT RUN. Original tooling, source publication, frozen owner integration, FE/browser/consumer/security/hosting/recovery acceptance remain open. Feature stays in-progress, not merge-ready/release-verified.
- **Authorization boundary:** Documentation closeout only; no source/test modification, commit/push/PR/merge/deploy, new task or frontend work. Prior blocked/historical evidence remains preserved and is superseded only for these two task statuses.


## CAT-DEC-008 — User-authorized CAT-002/CAT-003 checkpoint commits and push

- **Status:** explicitly authorized by user, 2026-11-04.
- **Scope:** Preserve CAT-002/CAT-003 in separate checkpoint commits on work/CAT-backend, then non-force push origin/work/CAT-backend. This supersedes earlier no-publication authorization only for these two checkpoints.
- **CAT-002:** Created checkpoint 43ebb117945afe60babd86c12a55cd4091ea1514, `chore(CAT-002): checkpoint verified public catalog APIs`. It contains public read implementation and its public-only manifest plus publication record.
- **CAT-003:** Planned subject `chore(CAT-003): checkpoint verified admin catalog management`, containing approved admin/shared changes and canonical implementation/acceptance records. Its resulting hash and observed push result are reported after execution rather than invented or followed by a self-referencing hash-only commit.
- **Status integrity:** CAT-002/CAT-003 remain done by explicit user acceptance (CAT-DEC-007), not by a fabricated validator pass. CAT-001 stays blocked; CAT is 2/6 accepted tasks. Original documentation validator remains BLOCKED / NOT RUN, and all feature/owner/FE/INT/security/hosting/recovery acceptance remains unchanged/open. No PR/merge/deployment or next task authorized.
