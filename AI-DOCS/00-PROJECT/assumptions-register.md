# Assumptions Register

| Assumption ID | Status | Affected Doc | Assumption | Confirmation Needed |
|---|---|---|---|---|
| A-001 | Pending Confirmation | ORD contracts, checkout copy, cleanup job | “3–7 days” means an unpaid Cash on Pickup order auto-cancels at the maximum boundary: exactly 7 calendar days after creation; no automatic cancellation occurs on day 3. | Confirm the exact automatic cutoff or replace it with another deterministic rule. |
| A-002 | Pending Confirmation | database-rules, FND contracts | Use explicit SQL migrations and a small parameterized MySQL query layer; choose the concrete maintained driver during FND-002 rather than adding an ORM by default. | Confirm if a specific ORM or query builder is required. |
| A-003 | Pending Confirmation | UI and content contracts | Storefront/admin user-facing copy may use Arabic or English content as entered; V1 does not include a runtime language switch or translation system. | Confirm the single launch language before UI content implementation. |
| A-004 | Pending Confirmation | SET contracts, footer | Social links are optional settings and hidden when empty because the PRD does not name required networks. | Confirm required social networks, if any. |
| A-005 | Pending Confirmation | AUTH contracts | Customer phone numbers are normalized to Egyptian `+20` E.164 form and must be unique. | Confirm whether non-Egyptian customer numbers must be supported. |
| A-006 | Pending Confirmation | branch-plan, integration-plan | Use merge commits for local/remote feature integration so task commits remain visible; do not merge until the user explicitly authorizes it. | Confirm `merge`, `squash`, or `rebase` before the first merge. |
| A-007 | Pending Confirmation | UI feature and visual QA | The homepage reference screenshot mentioned by the PRD is not present in the repository; use the PRD's textual editorial-fashion direction and do not treat the existing 343×361 layered icon asset as that reference. | Attach or identify the intended screenshot if it should influence UI-001. |
