# Testing

Use the root [local setup](../docs/LOCAL_PRODUCTION.md) and install backend/frontend
npm dependencies, Python requirements and Google Chrome before browser tests.

```sh
npm ci --prefix backend
npm ci --prefix frontend
python -m pip install -r requirements-tests.txt
npm run local:up
npm run test:all:local
npm run test:scheduling:local
npm run test:demo:local
npm run test:production
```

Run suites sequentially because catalog fixtures and evidence writers are shared.
The unified adapter creates an isolated database and removes it afterward. The
container suite owns an isolated Compose stack; local acceptance exercises the
persistent stack and removes only its exact temporary records.
The maintenance `test:local` suite restarts/reseeds that persistent stack; do not
run it against real user data. Use the isolated adapters above instead.

## Actual suites

| Command | Scope |
|---|---|
| `npm run test:all` | Unified units, types, syntax, build/module audit, disposable migrations/reseed, HTTP integration, development browser, API-client/research regressions, dependency/source audits. Requires a dedicated owner `DATABASE_URL` with CREATE DATABASE capability. |
| `npm run test:all:local` | Same unified suite using generated local credentials and a temporary loopback DB port. |
| `npm run test:scheduling:local` | Expanded disposable catalog,192city/category/day/weight API plans, date/admission checks, production-preview scheduling and teammate regressions at1440/768/390. |
| `npm run test:demo:local` | Isolated university rehearsal; does not modify installed users. |
| `npm run local:demo:check` | Seven read-only environment checks; creates no accounts or trips. |
| `npm run test:production` | Independent Docker images, built browser, roles, load/concurrency, rollback/outages, TLS configuration and backup/restore. |
| `npm run test:local` | Persistent local stack, eight cities, clean browser console, restart, fresh-login retrieval and recovery. |
| `npm run test:unit` | Backend Node test runner plus frontend Trie/image/reference-planner tests. |
| `npm run test:integration` | Actual curl/Express/PostgreSQL auth, destinations, trips, admin and constraints. Configure an isolated test database. |
| `npm --prefix frontend run lint` | TypeScript checking (the project lint command). |
| `npm --prefix backend run build` | JavaScript syntax validation. |

`backend/tests/` contains backend unit/security suites. `tests/dsa/trie.test.ts`
uses measured assertions; `tests/frontend/planner.test.ts` covers the academic
reference planner. Production scheduling is verified by backend/API tests.
`tests/frontend/*.py` uses Playwright/Chrome, not Vitest or Jest.

For an individual browser run, provide `FRONTEND_TEST_URL`, `API_TEST_URL` and the
matching isolated database connection, then run `npm run test:browser`. The shared
API-client regression requires Vite and runs with
`python tests/frontend/api_client_browser.py`. Prefer the unified runner, which
sets these environments and cleans up its servers automatically.

Reports are generated under `backend/reports/`. Large traces, screenshots, raw
logs, private archives and caches stay untracked; compact release summaries and
required hash fixtures are retained. See [release results](../docs/RELEASE_VERIFICATION.md).

## Teammate regression coverage

`tests/frontend/teammate_fixes.py` requires the isolated API on port5310 and is
invoked by the expanded scheduling runner. It checks that an inconsistent
unknown-price snapshot blocks creation, tourist admin hiding/redirect/API403,
private-link ownership, deletion cancellation and503 failure retention, owner204
then refresh404, and offline cleanup. Response faults are test-only; production
responses are not mocked.

`backend/scripts/test-trips-http.js` checks missing-token401, foreign-owner404,
invalid request400, owner204, repeat404, actual stop/budget FK cascades,
other-trip preservation and unknown-price422 before insertion against PostgreSQL.

Latest evidence: [teammate fixes](../reports/TEAMMATE_FIXES.md) and
[sightseeing quality](../reports/SIGHTSEEING_QUALITY_REPAIR.md). Historical reports
keep their original dates; only commands actually executed count as passes.
