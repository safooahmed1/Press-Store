# Change Log — Application Foundation

No implementation activity recorded.

## 2026-10-20 — FND-001 development, completion blocked

- Added client/server runtime composition, validated manifest discovery, runtime-only configuration validation, public health, and production API/static/SPA separation. Retained the original demo files without deleting or designing UI.
- Added approved Express dependency, Node test entry points, Vite API proxy, server lint globals, and recursive environment ignore rules. Existing `server/.env` was not read, loaded, staged, or modified.
- Recorded noncritical manifest convention assumption A-008 in the canonical contract and global register; FND-003 remains the freeze point.
- Observed 4 unit and 8 HTTP integration tests passing, lint/build passing, and successful dev/prod entry-point probes. Initial HTTP sandbox restrictions required an elevated rerun. Audit reports one moderate existing Vite advisory.
- Mandatory validator command fails because its script is absent. No substitute or waiver; task remains blocked, no acceptance checkbox marked passed, no commit created. See `08-FND-001-development-handoff.md` for exact evidence and limitations.

## 2026-10-21 — FND-001 backend review fixes

- FIX-001: explicitly require string server manifest IDs before the unchanged lowercase kebab-case regex; invalid registries fail composition before listening or attaching feature routes.
- FIX-002: classify one decoded production pathname before static serving; encoded API and hidden segments receive JSON 404, malformed encoding safely receives JSON 404, and missing encoded asset paths cannot fall through to SPA HTML. Original request URLs remain intact; no recursive decoding or path normalization introduced.
- Added 18 server manifest unit tests and 2 HTTP integration tests (10 total integration tests); temporary fixture directories now have teardown hooks, including existing runtime fixtures.
- Unit suite 22/22, integration 10/10, lint/build and 17 production smoke probes passed. Mandatory documentation validator still exits 2 because its script is absent. No typecheck script exists. Frontend files, dependencies, and environment files unchanged; no staging or commit. FND-001 remains blocked. See handoff addendum.

## 2026-10-21 — Backend Review Round 2

- Minimal routing change: reject `pathname.startsWith('//')` after the existing single decode, using safe JSON 404 before static files and SPA fallback. No URL mutation, normalization, or second decode.
- Added GET/HEAD integration groups with 16 request-target subtests covering all four confirmed examples, percent case, literal/encoded repeated separators, SPA and static targets; added controls for normal API/SPA/static/HEAD behavior, hidden paths, malformed encoding, and literal double encoding.
- Red/green evidence: all 16 new target/method subtests returned 200 before the fix and 404 afterward. Final backend unit 20/20; integration 28/28 including parents/subtests; lint/build and 36 production routing assertions passed. Fixtures cleaned up; environment metadata unchanged, ignored and untracked.
- Documentation validator remains unavailable; task remains blocked and uncommitted. No frontend or later-task changes. See handoff addendum.
