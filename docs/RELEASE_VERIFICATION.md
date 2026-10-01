# Release verification and repository cleanup

Release target: `satvikp-coder/demo-group7`, branch `main`.
The existing repository was cloned separately from the verified local application;
upstream history was preserved from `24a87b6`. No force push or database reset is used.

## Scope and retention

- Source directories, frontend visual source, runtime backend, DSA implementations,
  approved CSVs, migrations and existing LICENSE are preserved.
- README, API/setup/testing documentation and repository map now describe the actual
  PostgreSQL-backed product. Historical academic documents retain their credits and
  are labeled as historical where necessary.
- Removed tracked `frontend/bun.lock` (npm lockfiles are authoritative),
  `frontend/scripts/.routing-cache.json` and `.translation-cache.json` (regenerable
  optional maintenance caches). Removed the obsolete one-time
  `backend/scripts/research-completion-categories.js` writer; its approved results
  are already in the normal guarded seed manifests. No runtime helper was removed.
- Large generated browser traces (up to 27 MB each), raw command logs, test screenshots,
  build output, dependencies, caches and private DB archives are excluded. Original
  local evidence remains in the preserved working application. Tests regenerate
  traces locally; CI uploads selected evidence as time-limited workflow artifacts.
- Retain compact readiness/provenance reports, academic experiments and required
  baseline/source fixtures. Research HTML/JSON/map/menu evidence remains under
  `data/research/` because imports and auditability depend on it. Source attribution
  is not a blanket redistribution license.
- Public `AGENTS.md` and a sanitized `CODEX_HANDOFF.md` preserve project continuity.
  The full private historical handoff stays in the original local application.
- Historical audit path keys are now relative; the corresponding audit resolves
  them from the repository root. Git attributes preserve pinned evidence and
  historical UI hash line endings across Windows/Linux checkouts.

The clean checkout exposed a test-only portability defect: the production browser
wrapper depended on `PORT` from a private developer environment. The production
test runner now supplies its known API port explicitly. The secondary browser
flow also waits for the profile exit, itinerary URL and budget heading before
asserting budget controls, avoiding checks against an exiting page. Runtime code
is unchanged. Migration bytes are explicitly preserved by Git attributes so an
existing checksum ledger remains compatible with a fresh checkout.

## Validation

Fresh release-checkout results, recorded 2026-10-01T09:11:26.199993+00:00 (UTC):

| Check | Actual result |
|---|---|
| `npm run local:up` | PASS; production nginx/API/PostgreSQL at `http://localhost:8080`; root and readiness HTTP 200. |
| `npm run test:all:local` | 18/18 unified gates PASS; completed 2026-10-01T09:11:11.604Z. |
| Backend unit/security | 28 tests passed, zero failures/skips. |
| Frontend assertions | 80 Trie / 33 reference-planner assertions and one owned-image regression passed. |
| HTTP auth / destinations / trips / admin | 17 / 106 / 45 / 101 exchanges passed. |
| Development and production browser | 63 groups in each passed, including tourist flow, all cities, budgets and operator CRUD. |
| API-client / research / platform | 12 / 3 / 4 checks or groups passed. |
| Typecheck, backend syntax, production build | PASS; production module audit excludes runtime reference catalog/planner modules. |
| npm security audits | Backend and frontend: zero vulnerabilities. |
| `npm run test:production` | 16/16 gates PASS; completed 2026-10-01T09:01:38.905Z. |
| `npm run test:local` | 4/4 gates PASS; completed 2026-10-01T09:04:08.205Z. |
| Successful local browser | 11 groups, 8 cities; zero page errors, console warnings/errors, failed requests or HTTP errors. |
| Recovery | Container restore returned the exact persisted two-day itinerary/budget; local restore matched saved rows. Restart, reseed preservation, outage recovery and exact-ID fixture cleanup passed. |
| Source preservation | All 147 protected files match the pre-cleanup local SHA256 baseline, including 89 frontend source/assets. A checkout of the staged index preserves these bytes and migration checksums. |

Current SQL catalog after fixture cleanup: **8 destinations / 25 attractions /
11 hotels / 12 restaurants / 131 routes**. Temporary users/trips/stops/budgets
were removed; the original catalog is preserved. Data counts do not independently
certify every tourism fact. The performance drill made 134 requests with zero
unexpected failures; it is a local sanity check, not a public capacity guarantee.

Compact evidence: [unified](../backend/reports/production/full-suite.json),
[containers](../backend/reports/production/container-suite.json),
[local acceptance](../backend/reports/local-final-suite.json),
[successful browser](../backend/reports/local-browser-success.json),
[source hashes](../backend/reports/release-source-preservation.json).

Initial attempts are not counted as passes: one unified run timed out at initial
browser navigation; a container run exposed the missing test `PORT`; another
stopped at a budget-page transition. The final runs above completed after the
test-environment/route-wait corrections. No application behavior or visual source
was changed to make the tests pass.

## Security, privacy and review

The final tracked-file review excludes real environments, credentials, JWTs,
private keys, database archives, dependencies/builds, browser-session data and
absolute local machine paths. Known private environment values were compared
without printing them; credential-pattern scans and sensitive JSON-field review
found no unredacted credentials. Historical Git objects were also scanned; no
credential-pattern finding was identified. This is a scoped scan, not a guarantee
against every possible secret format.

README and tracked Markdown file links were checked against committed paths.
All retained files have a documented source/test/data/documentation purpose.
Whitespace in hash-pinned migration/source evidence was deliberately preserved.
The existing LICENSE and team credits were retained; no contributor was invented.

## GitHub verification

This source release uses a normal fast-forward push based on existing `main`
history. The real [Production readiness workflow](https://github.com/satvikp-coder/demo-group7/actions/workflows/production.yml)
runs unified and container tests sequentially. Consult the run associated with the
release commit for the remote result; local tests alone do not certify CI.
The final observed commit, push and CI result are recorded in the local handoff
after GitHub verification, without publishing private session history.

## External deployment

Local production readiness does not imply public hosting. Public domain/DNS, HTTPS,
independent credentials, provider database/backups and monitoring remain external.
Follow [the production runbook](PRODUCTION.md).
