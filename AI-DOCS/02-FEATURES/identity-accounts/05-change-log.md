# Change Log — Identity and Accounts

No implementation activity recorded.

## 2026-11-02 — AUTH-001 identity and session primitives

- User authorized next backend task, reconfirmed Egyptian-only phones and approved AUTH-DEC-003.
- Added additive forward identity/session migrations, parameterized credential/safe-summary reads,
  fixed-parameter scrypt hashing, scoped hashed-token sessions and production-safe cookie helpers.
- Added focused phone/password/lifecycle/cookie/repository tests and opt-in real-MySQL migration,
  uniqueness, singleton-admin, actor-FK, rotation rollback, expiry and persistence checks.
- Real-MySQL suite is not executed; documentation validation stays BLOCKED / NOT RUN.
- AUTH-001 remains in-progress. No APIs, FE source, new dependencies, commit, push or later task.

## 2026-11-02 — AUTH-001 remaining database verification

- User authorized remaining AUTH-001 work, including isolated actual MySQL tests.
- Initial actual-DB run passed 2/2. Strengthened restart coverage by closing/recreating the pool
  as well as the service, then ran the combined suite: 13 passed, 0 failed, 0 skipped on MySQL 8.4.11.
- Confirmed migration upgrade/rerun, uniqueness/single-admin/actor constraints, scoped sessions,
  atomic failed-rotation rollback, expiry, idempotent revocation and persisted session lookup.
- Verified no remaining MySQL process/private fixture root. Lint passed after the test change.
- Original documentation validation remains BLOCKED / NOT RUN (missing script, invocation exit 2).
- AUTH-001 now blocked on that check. No new dependency, application database access, commit or push.

### 2026-11-02 — Authorized AUTH-001 preservation and push

- User explicitly authorizes one checkpoint commit of the current reviewed work and a non-force
  push to origin/work/AUTH-backend. Prior session-specific no-commit/no-push notes remain historical.
- Planned subject: `chore(AUTH-001): checkpoint verified identity and session foundation`.
- Includes AUTH-001 code/tests/docs and the current user's FND acceptance notes carried as dependencies.
- Existing 13/13 actual-MySQL/focused checks, lint/build and prior regression evidence retained;
  no application or live-DB checks rerun for Git-only preservation.
- Original docs validation remains BLOCKED / NOT RUN; AUTH-001 stays blocked, 0/5 complete.
- No completion commit, PR, merge, deployment or AUTH-002 work is authorized by this preservation step.

## 2026-11-02 — AUTH-002 development exception and composition preflight

- AUTH-DEC-004 records user approval to develop against the verified AUTH-001 checkpoint while its validator gate remains blocked.
- Reviewed the API-AUTH-001 contract, feature discovery, router registration and database startup lifecycle.
- Proposed bounded FND+AUTH composition amendment AUTH-DEC-005 to support two mounts and the existing lifecycle-owned database.
- Shared owner approval is required before source changes. No customer API implementation, test execution, dependency, database operation, commit or push.

## 2026-11-02 — AUTH-002 customer APIs and approved runtime composition

- User explicitly approved AUTH-DEC-005; FND-DEC-009 records the shared owner/consumer amendment.
- Added /auth customer register/login/logout plus /account using the existing FND-owned DB pool.
- Registration/customer session creation roll back together; duplicate normalized phone races
  return one success/one safe conflict. Login verifies absent identities against a precomputed dummy
  hash, rotates the current session and returns no credentials. Account/logout enforce customer scope.
- Kept bodyless FE logout compatible; mutations check Origin, register/login require JSON, and
  responses are no-store with safe canonical errors on validation, unauthorized and storage failure.
- Added factory/context/static compatibility tests, request validation and actual MySQL/HTTP cases.
- Observed full unit 136/136, final focused live AUTH 5/5, foundation non-live regression 50 reported
  checks, lint/build passes. Initial no-control-regex lint error was fixed without disabling the rule.
- Original documentation validation remains BLOCKED / NOT RUN. No acceptance checkbox promoted,
  new dependency, unrelated owner source, completion commit, push or next task.

## 2026-11-02 — Requested full test rerun

- Ran the entire unit suite (136/136) and entire integration suite with disposable MySQL enabled
  (66/66, no failures/skips), plus lint/build/whitespace checks; all code checks passed.
- Verified fixture cleanup; no existing application database, source or dependency change.
- Original docs validator remains absent, BLOCKED / NOT RUN. No completion/commit/push or next task.
- Exact commands and log locations are in verification-matrix §25.

### 2026-11-02 — Authorized AUTH-002 preservation commit and push

- User explicitly requested committing/pushing the verified AUTH-002 work and approved FND runtime amendment.
- Planned checkpoint subject: `chore(AUTH-002): checkpoint verified customer authentication APIs`.
- Existing full unit 136/136, full actual-MySQL integration 66/66 and lint/build/cleanup evidence
  remain in verification-matrix §25; no application test is rerun for Git-only preservation.
- Original documentation validation stays BLOCKED / NOT RUN; AUTH-002 is not marked done.
- Only checkpoint preservation/non-force branch push authorized; no PR, merge, deployment or next task.

## 2026-11-02 — AUTH-003 protected bootstrap and separate admin APIs

- Recorded user-approved early start AUTH-DEC-007, bootstrap/admin policy AUTH-DEC-008 and bounded
  FND config/tooling amendment FND-DEC-010 before implementation.
- Added explicit environment-only CLI, insert-only singleton bootstrap, safe conflict reconciliation,
  admin login/logout/session, strict validation, existing origin boundary, secure scoped sessions,
  safe DTOs/errors and no-store router responses. No dependencies, migrations or frontend changes.
- Focused 9/9; full unit 140/140; full integration with actual disposable MySQL 71/71, no skips;
  lint/build pass. Fixed a test expecting 422 for primitive JSON; FND correctly returns 400.
- Initial sandbox attempt failed (listen EPERM and MySQL initialization timeouts) and left four
  confined initializer children/roots. Unrestricted successful fixtures cleaned up, but normal
  host signaling was denied and sudo -n requires authentication. Cleanup remains blocked; unrelated
  system MySQL PID 1719 was not touched. Exact PIDs/paths and evidence are in §26.
- Original validator invocation exit 2, BLOCKED / NOT RUN. AUTH-003 blocked; completion remains
  0/5. No acceptance checkbox, completion commit, push, merge, deployment or later task.

### 2026-11-02 — Requested test rerun and host cleanup resolution

Full unit 140/140 and full actual-MySQL integration 71/71 pass without failures/skips; lint/build/
diff pass. Before rerun the four prior initializer PIDs were observed absent; removed only their
exact inactive temporary directories. Final host inventory: no disposable processes/roots, unrelated
system MySQL PID 1719 untouched. This resolves the prior cleanup blocker without rewriting failure
history. Original validator still exits 2, BLOCKED / NOT RUN; AUTH-003 remains blocked, AUTH 0/5.
No implementation change, independent review, commit, push, merge, deploy or next task. Exact
commands, logs and evidence: verification-matrix §27.

## 2026-11-02 — Independent review and authorized preservation commit/push

- Separate reviewer agent completed static read-only AUTH-003 review: PASS WITH WARNINGS, no
  confirmed actionable defects within approved scope. High residual login-abuse risk is the
  explicitly approved AUTH-005 deferral; original missing validator is not a code defect.
- User explicitly requested commit/push. Planned subject: `chore(AUTH-003): checkpoint reviewed admin authentication`.
- Preserve prior full unit 140/140, integration 71/71, lint/build and cleanup evidence (§27);
  no application test rerun for documentation/Git-only preservation. See §28 for review boundaries.
- Original validation remains BLOCKED / NOT RUN, AUTH-003 blocked, AUTH 0/5. No completion,
  PR, merge, deployment or later task. Existing stashes and unrelated artifacts preserved.


## 2026-11-04 — CAT-003 guard consumer handoff

CAT-DEC-006 approves transfer of the existing unmodified fixed-scope AUTH guard/test into work/CAT-backend, with SHA-256 equality observed against original AUTH files. CAT consumes existing cookie/session factories and Origin boundary. No original AUTH checkout edit, auth policy change, task acceptance change or full AUTH-005 merge/security completion claim.

## 2026-11-08 — Customer page and count consumer handoff

CUS-DEC-002 adds bounded paging and an aggregate count to READ-AUTH-001 on
`work/CUS-backend`. The customer summaries use the existing four identity fields.
