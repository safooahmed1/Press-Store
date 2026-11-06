# Acceptance Criteria — Store Settings

## 1. Completion Rule

The feature is not complete until every required criterion passes and has evidence.

## 2. Criteria

### AC-SET-001 — Admin manages valid singleton settings

- **Requirements:** `REQ-SET-001`, `REQ-SET-002`
- **Given:** an authenticated admin and current settings version
- **When:** store/contact/payment values are saved
- **Then:** valid independent values persist atomically and reload
- **Negative/edge behavior:** invalid/stale/unauthorized writes fail without partial changes
- **Evidence:** API integration and form tests
- [ ] Passed

### AC-SET-002 — Consumers receive minimum projections

- **Requirements:** `REQ-SET-003`, `REQ-SET-004`
- **Given:** configured or optional-empty values
- **When:** footer and checkout consumers request their contracts
- **Then:** footer receives contact/social only and checkout receives only the chosen method's number
- **Negative/edge behavior:** secrets/unselected payment numbers do not appear in public responses or logs
- **Evidence:** projection/privacy tests and response inspection
- [ ] Passed

## 3. Cross-Feature Scenarios

UI footer consumes API-SET-002; ORD consumes READ-SET-001 for payment display and WhatsApp contact without writing SET tables.

## 4. Security and Permission Scenarios

Only admin can read full/edit settings; customer/anonymous receive public projection; mutation is CSRF protected and safely logged.

## 5. Failure and Recovery Scenarios

Missing singleton, validation failure, stale version, and database outage preserve prior configuration and block checkout only when required payment data is unavailable.

## 6. Accessibility and Responsive Scenarios

Settings form labels/errors/pending state and mobile layout pass UI contracts.

## 7. Feature Verification Commands

| Check | Command/Procedure | Required | Expected Result |
|---|---|---|---|
| Unit | `npm run test -- settings` | yes | normalization/projections pass |
| Integration | `npm run test:integration -- settings` | yes | admin/public/privacy/conflict cases pass |
| UI | settings form and footer state tests | yes | Required states pass |
| Lint/build | `npm run lint && npm run build` | yes | Exit 0 |


## 2026-11-04 — SET-001 backend evidence boundary

Backend migration/admin/public/privacy/version/restart/Origin tests are recorded in SET-001 verification appendix. Required form/browser/live footer/ORD/CUS consumer integration remains separately owned and unrun; neither feature Passed checkbox is checked. Original mandatory docs validator remains BLOCKED / NOT RUN; implementation is not feature completion.


## 2026-11-06 — User-accepted SET backend closeout

SET-DEC-004 supersedes earlier blocked task-accounting status for SET-001. SET backend is 1/1 accepted, feature 1/3. Original docs validation remains BLOCKED / NOT RUN; all feature acceptance criteria and FE/browser/consumer/privacy/hosting/recovery/integration gates remain open. Both feature Passed boxes stay unchecked and feature remains in-progress, not merge-ready or release-verified. Implementation/docs remain local and uncommitted; completion commit None. Documentation-only closeout, no new source/tests/packages, code checks, frontend, existing DB/env access, commit/push/merge/deploy or next task. Earlier observed verification/failure history and separate CAT/AUTH work remain preserved.
