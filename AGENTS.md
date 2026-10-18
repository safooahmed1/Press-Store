# Repository Agent Instructions

## 1. Mission and Source of Truth

- Treat `AI-DOCS/` as the implementation specification.
- Treat chat as task authorization and clarification, not as a replacement specification.
- Do not invent requirements or silently change documented contracts.
- Preserve user changes and unrelated worktree changes.

## 2. Instruction and Documentation Order

1. Read every applicable `AGENTS.md` from the repository root to the working directory.
2. Read `AI-DOCS/00-PROJECT/project-overview.md` and `source-tree-blueprint.md`.
3. Read the seven files for the requested feature.
4. Read only dependency contracts named by that feature.
5. Read the applicable workstream, branch, and verification records under `AI-DOCS/03-DELIVERY/`.

Do not read the whole documentation tree unless the task genuinely spans it.

## 3. User-Gated Task Loop

- Interpret the user's requested feature or workstream as the active scope.
- Select only the earliest `not-started` task whose dependencies are complete.
- If the user says `next`, continue with only the next ready task in that same scope.
- Implement exactly one task per user authorization.
- After implementation, verification, documentation, and the task commit, report and stop.
- Never start the next task automatically or move to another feature without explicit direction.

## 4. Preflight

Before editing:

1. State the selected task ID and acceptance criteria.
2. Confirm dependencies are complete.
3. Confirm the expected and current branches.
4. Inspect the worktree and preserve unrelated changes.
5. List owned and forbidden paths.
6. Identify exact verification commands or procedures.

If the expected branch is missing, create it according to `branch-plan.md`. Do not create a remote repository.

## 5. Ownership and Scope

- Modify only paths owned by the selected task/workstream.
- Do not edit another feature's source paths, entities, APIs, screens, or contracts.
- Use documented interfaces across feature boundaries.
- Stop and request approval when a shared contract needs owner and consumer changes.
- Do not run two workstreams in parallel when they write the same canonical file; follow the integration plan.

## 6. Missing or Conflicting Requirements

- Stop for architecture, authentication, authorization, database, money, security, compliance, or central business-rule ambiguity.
- For a small noncritical gap, add one global `A-###` assumption in the affected document and `assumptions-register.md`.
- Never present an assumption as a PRD requirement.

## 7. Implementation Rules

- Follow the approved stack, source-tree blueprint, foundation rules, and technical contracts.
- Do not add dependencies, change architecture, or replace approved technology without a documented decision and user approval.
- Implement loading, empty, error, unauthorized, validation, and relevant edge states.
- Add or update tests required by the selected task.
- Do not expose secrets, credentials, production data, or sensitive configuration.
- For visual implementation, invoke the `frontend-design` skill as required by the PRD.

## 8. Mandatory Verification and Second Pass

After implementation:

1. Re-read the task and linked acceptance criteria.
2. Review the complete diff for correctness, security, regressions, debug artifacts, and scope drift.
3. Run focused tests.
4. Run lint and typecheck when available.
5. Run broader tests or a build when required by the verification matrix or when changing architecture, configuration, database, contracts, or integrations.
6. Perform documented smoke/manual checks where automation is insufficient.
7. Record exact observed evidence; never claim an unrun check.

If a required check fails, keep the task `in-progress` or `blocked`, report evidence, and do not create a completion commit.

## 9. Documentation Update

For a passing task, update in the same change:

- feature backlog status, planned commit reference, and evidence;
- feature change log;
- decisions and assumptions when applicable;
- `AI-DOCS/03-DELIVERY/build-log.md`;
- verification matrix if evidence or commands changed.

Never rewrite historical evidence.

## 10. Commit Policy

- A local completion commit is pre-authorized only for a user-requested task that passed its completion gate.
- Create one commit per completed task on its assigned branch.
- Include only task-owned code, tests, and documentation; never include unrelated user changes.
- Use `<type>(<TASK-ID>): <summary>` unless an approved decision changes the convention.
- Record the task ID and planned subject before committing, then report the resulting hash. Do not create a circular follow-up commit just to store its own hash.
- Do not commit incomplete work unless the user explicitly asks for a checkpoint.
- A local commit does not authorize push, pull request, merge, repository creation, deployment, or release.

## 11. Task Completion Report and Stop

After the commit, report:

```text
TASK <ID> COMPLETE
Branch: <branch>
Commit: <hash>
Verification: <checks and results>
Completed: <done>/<total>
Remaining: <count>
Next ready task: <ID or None>
Blockers: <None or details>
```

Then stop and wait for the user.

## 12. Feature Completion and Merge Gate

After the final task in a feature/workstream:

1. Run the full feature verification suite and cross-feature scenarios.
2. Confirm every task is `done` with evidence and a commit.
3. Confirm no required acceptance criterion is unchecked.
4. Update feature and delivery status to `merge-ready`.
5. Report `FEATURE <ID> COMPLETE — MERGE READY` and stop.

Merge only after explicit user instruction. Use the exact target in `branch-plan.md`, resolve conflicts only within owned scope, and run post-merge verification. Remote writes remain manual unless explicitly authorized.

## 13. Prohibited Actions

- Do not start the next task automatically.
- Do not mark work complete without observed evidence.
- Do not bypass ownership or contract-change rules.
- Do not delete or overwrite user work to make a task pass.
- Do not push, open a PR, merge, deploy, or create remote resources without required explicit authorization.
