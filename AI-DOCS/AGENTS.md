# AI-DOCS Maintenance Instructions

## Scope

These rules apply to every file under `AI-DOCS/` and supplement root `AGENTS.md`.

## Canonical Ownership

- Keep each fact in its owning document and reference it elsewhere.
- Keep requirement, feature, task, contract, permission, entity, and branch IDs stable.
- Never redefine an API, entity, event, permission, or shared component in a consumer document.
- Never remove historical decisions, change-log entries, commits, or verification evidence; supersede or append.

## Status Integrity

- Planned documents are not implementation evidence.
- Mark a task `done` only after passing verification and creating its completion commit.
- Mark a feature `merge-ready` only after every task and full feature verification pass.
- Mark a feature `complete` only after the documented merge and post-merge gate succeeds.
- Keep failures, skipped checks, limitations, and blockers visible.

## Change Procedure

1. Update the owner document first.
2. Update requirement and interface registries.
3. Update all named consumers in the same approved change.
4. Run `python3 /home/safooahmed/.codex/skills/prd-to-ai-project/scripts/validate_project_docs.py .`.
5. Record the change and observed evidence.

## Language and Format

- Preserve English filenames, required headings, IDs, statuses, branches, and code symbols.
- Write explanatory content in English, matching the PRD language.
- Keep tables parseable and use `None.` instead of deleting non-applicable headings.
