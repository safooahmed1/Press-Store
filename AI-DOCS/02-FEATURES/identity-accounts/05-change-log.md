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
