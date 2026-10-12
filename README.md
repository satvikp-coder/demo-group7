# Heritage Tourism Planner

A Gujarat heritage and tourism planning platform built for CSC210 Data Structures & Algorithms, Group 07, Ahmedabad University.

**Local application:** http://localhost:8080

**Source repositories:** [course repository](https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner) and [synchronized mirror](https://github.com/satvikp-coder/demo-group7). Both receive the same reviewed release commit.

## Latest verified local release — 12 October 2026

- 71 backend unit/security tests and 18/18 complete regression gates passed.
- 64 real-browser control checks, including PDF export, passed.
- 192 generation/save/refresh scenarios across all eight destinations passed.
- Dedicated hotel-price, deletion, private-link and admin-role checks passed at 1440px, 768px and 390px.
- Read-only local readiness: 7/7. Existing accounts, saved trips and catalog records were preserved.

See [teammate fixes and test evidence](reports/TEAMMATE_FIXES.md), [sightseeing repair](reports/SIGHTSEEING_QUALITY_REPAIR.md) and the [local university demonstration](docs/LOCAL_DEMO.md). Readiness remains conditional on the documented data/photo limitations. Local tests do not establish public deployment or remote CI success.

## Overview

The React application uses a real Express/PostgreSQL backend to search destinations and generate persisted itineraries. A trip covers one destination, with each day starting and ending at the selected hotel. The backend schedules eligible attractions and meals using stored road routes, time windows and the available budget. Saved stops and price snapshots remain available after login and restart.

## Key Features

- Destination and attraction search with backend Trie prefix matching; the shared academic Trie also includes tested Levenshtein fuzzy search.
- Destination details, attractions and hotels; restaurant data supports the API and meal scheduling.
- Hotel sorting by price, rating and value using the shared Merge Sort implementation.
- Two-stage Low Cost / Budget / Premium hotel selection, with clearly labeled straight-line proximity and stored price estimates.
- Synchronized distance/cost/rating priorities totaling 100%, with persisted scoring explanations for evaluated feasible candidates.
- Registration, login, authenticated trip discovery and persisted itinerary/budget retrieval.
- Permanent, confirmed **Delete Trip** through the owner-protected API; cancellation or a failed request preserves the record. Successful deletion clears its browser snapshots and stays deleted after refresh.
- **Copy private trip link** creates an owner-authenticated bookmark, not public recipient access. Budget links also identify the actual saved trip.
- Tourists do not see Admin Panel controls; direct admin navigation returns them to their profile, and the API independently enforces operator permissions.
- Route-aware, multi-day planning with selected-hotel retention and explicit incomplete-plan warnings.
- Known-cost budget breakdowns, strategy comparison, PDF export and an educational Dijkstra visualizer.
- Operator CRUD for destinations, attractions, hotels and restaurants, with server-side role and ownership checks.
- Wheelchair filtering where supported by recorded attraction data; unknown suitability is not treated as accessible.
- Production-like local Docker stack, health checks, guarded imports, backup/restore tools and GitHub Actions verification.

## Supported Destinations

Ahmedabad / Somnath / Dwarka / Modhera / Champaner / Gir National Park / Rann of Kutch / Saputara.

## Technology Stack

Versions below describe the manifests; exact resolved dependencies are pinned in the npm lockfiles.

| Area | Technologies |
|---|---|
| Frontend | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Motion, Lucide React |
| Export | jsPDF, html2canvas, dom-to-image-more |
| Backend | Node.js 22.18+, Express 5, JavaScript ES modules, shared TypeScript through tsx |
| Database | PostgreSQL 17, node-postgres, SQL migrations |
| Security | bcrypt, jsonwebtoken, Zod, Helmet, express-rate-limit, exact-origin CORS |
| Infrastructure | Docker Compose, nonroot nginx/API images, optional Caddy HTTPS, GitHub Actions |
| Testing | Node test runner, TypeScript assertion suites, Python Playwright with Google Chrome, real HTTP/PostgreSQL integration |

## System Architecture

```text
Browser
  -> React frontend (nginx in the local production stack)
  -> Shared API client (frontend/src/api/index.ts)
  -> Express REST API
  -> Services + shared DSA modules
  -> PostgreSQL (catalog, users, trips, stops, budgets)

Public deployment: HTTPS reverse proxy -> nginx -> private API -> private database
```

The runtime catalog and planner use PostgreSQL. Bundled reference data and the older client planner remain for academic comparisons; the production build audit verifies that they are excluded from the runtime module graph.

## Project Structure

```text
frontend/   React application, static assets and Vite/nginx configuration
backend/    REST API, services, ordered migrations, tooling, unit tests and reports
database/   Canonical schema and historical SQL examples
data/       Approved CSVs, researched supplements and source evidence
dsa/        Shared TypeScript algorithms and data structures
tests/      DSA assertions and real browser/integration harnesses
scripts/    Local operations and sequential verification runners
deploy/     PostgreSQL initialization and optional HTTPS configuration
docs/       Setup, deployment, academic design and research documentation
.github/    CI workflow
```

## Algorithms / Data Structures

| Implementation | Actual purpose |
|---|---|
| [Trie](dsa/trie/Trie.ts) | Runtime prefix search over database-derived names; the cache refreshes periodically. Levenshtein fuzzy search is preserved/tested in this module but is not enabled by the public search endpoint. |
| [Merge Sort](dsa/sorting/mergeSort.ts) | Stable hotel ordering through [hotelRanking.js](backend/services/hotelRanking.js). |
| [Dijkstra](dsa/dijkstra/dijkstra.ts), [Graph](dsa/graph/Graph.ts), [MinHeap](dsa/priorityQueue/MinHeap.ts) | Evidenced shortest-path fallback for missing direct hotel/restaurant/attraction pairs. Stored direct routes take precedence; unknown roads are not fabricated. |
| [Trip planner](backend/services/tripPlanner.js), [greedy helpers](dsa/greedy/) | Scores candidates and schedules visits, meals and hotel returns within time/budget constraints. This is a heuristic, not a global optimum guarantee. |
| [Trip model](backend/models/tripModel.js) | Transactional persistence, bounded serialization retries and stored cost snapshots. |
| [Hash table](dsa/hashTable/HashTable.ts) | Per-request route cache and visited-attraction tracking; see [DSA documentation](dsa/README.md). |

## Current Data

The enriched local catalog measured on 12 October 2026 contains **8 destinations, 44 attractions, 56 hotels, 12 restaurants and 497 route records**. There are **29 usable indicative hotel-price estimates**; the other 27 properties have no usable rate and are not priced starting-hotel choices. All eight destinations have a sourced priced option in each hotel category after the reviewed coverage import, including clearly identified nearby towns.

The latest image audit checked 120 entity references: **38 genuine-photo associations, 82 intentional fallbacks and zero broken references**. A fallback is not a recovered photograph; attribution remains in [Photo credits](frontend/public/image-credits.html).

These counts do not establish live rates, availability or complete factual coverage. Unknown fees/durations can exclude a recorded site from timed scheduling. Champaner currently has only one fully costed, timed attraction, so unsupported extra sightseeing days are disclosed rather than filled with invented activities. See [hotel coverage](reports/HOTEL_TIER_COVERAGE.md) and [current data quality](reports/PHASE3_DATA_QUALITY.md).

### Historical import stages

The following counts describe earlier import stages, not the current enriched catalog:

| Records | Base import | With reviewed 20261009 expansion |
|---|---:|---:|
| Destinations | 8 | 8 |
| Attractions | 25 | 33 |
| Hotels | 11 | 23 |
| Restaurants | 12 | 12 |
| Routes | 131 | 163 |

After backing up an existing installation, `npm run local:expand` adds the reviewed
Ahmedabad/Somnath records without overwriting originals. See
[dataset provenance and limitations](reports/DATABASE_EXPANSION_REPORT.md) and
[current itinerary acceptance](reports/FINAL_DEMO_READINESS.md). Unknown prices,
ratings and visit durations remain unknown; no live availability is claimed.
`npm run test:itinerary -- demo` runs the expanded API matrix and production-build
browser demonstration against a disposable PostgreSQL database.

These are catalog counts, not a claim that every tourism field is independently verified. The original CSVs cover only part of the catalog; researched JSON supplements supply the remaining destinations and road evidence. Simulated CSV routes are excluded from the approved import.

### Phase 2 university release

The additive `npm run local:enrich` import follows `local:expand` and produces
8 destinations, 44 attractions, 43 hotels, 12 restaurants and 322 routes. Back up
first; both imports preserve existing records. Most new hotels have unknown
current prices and are not assigned a price category. New attractions without
known fees/durations remain discovery records, not timed planner candidates.
See [Phase 2 coverage](reports/PHASE2_DATA_COVERAGE.md),
[feasibility](reports/PHASE2_ITINERARY_FEASIBILITY.md), and
[release evidence](reports/PHASE2_FINAL_READINESS.md).

New forms support explicit lodging nights and Gujarati for the existing dictionary;
English/Hindi remain available. Some newer controls remain English.
`npm run test:phase2:production:local` verifies the expanded catalog in an isolated
database and production frontend at desktop, tablet and mobile widths.

## Quick Start

For an existing local installation, `npm run local:up` starts the frontend,
backend and persistent PostgreSQL database together at `http://localhost:8080`.
`npm run local:demo:check` performs read-only environment checks before presenting.
Use `npm run test:demo:local` to rehearse the real workflow in an isolated database.
Current local repair evidence and limitations are recorded in
[Phase 3 test results](reports/PHASE3_FULL_TEST_RESULTS.md).

Install Node.js 22.18+ and Docker with Compose v2 (Linux containers), then:

```sh
git clone https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner.git
cd group-07-heritage-tourism-planner
npm run local:up
npm run local:demo:check
```

Open **http://localhost:8080**. Startup generates private credentials, builds the images, applies migrations and imports approved data only for a fresh database. Later starts preserve existing managed data.

An already enriched installation needs only `local:up`. A fresh base catalog requires the reviewed additive imports to reach the current counts. After a backup, run `local:expand`, `local:enrich`, `local:refine -- --dry-run`, `local:refine`, `local:hotel-coverage -- --dry-run`, then `local:hotel-coverage`. Do not reset or reseed existing user data to troubleshoot. See [the exact fresh-install sequence](docs/LOCAL_PRODUCTION.md#current-enriched-catalog-and-controls).

```sh
npm run local:status
npm run local:stop
```

Stop preserves the database volume. Keep the generated private environment file with that volume. See [Local Production](docs/LOCAL_PRODUCTION.md) for restart, operator approval, backup and restore.

## Development Setup

Use Node.js 22.18+, npm and a dedicated PostgreSQL database. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env.local`. Set your own database connection and random signing key; examples contain no working credentials.

```sh
npm ci --prefix backend
npm ci --prefix frontend
npm --prefix backend run db:migrate
npm --prefix backend run db:seed
npm --prefix backend run db:verify
```

Run these in separate terminals:

```sh
npm --prefix backend run dev
npm --prefix frontend run dev
```

Frontend: `http://localhost:3000`; API: `http://localhost:5000/api`. Match `CORS_ORIGIN` and `VITE_API_BASE_URL` to those origins. Use a dedicated development database and an owner connection for migrations. Public deployments use separate restricted runtime credentials.

## Environment Variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Backend PostgreSQL connection; runtime role in production. |
| `DATABASE_ADMIN_URL` | Maintenance-only owner connection for Compose. |
| `JWT_SECRET` | Private random signing key. |
| `PORT`, `NODE_ENV` | Backend listening port and runtime mode. |
| `CORS_ORIGIN` | Exact allowed frontend origin(s). |
| `VITE_API_BASE_URL` | Public frontend API root; never put secrets in Vite variables. |
| `POSTGRES_PASSWORD`, `POSTGRES_APP_PASSWORD` | Independent Compose owner/runtime credentials. |
| `DATABASE_SSL`, `DATABASE_SSL_CA_FILE` | Hosted PostgreSQL certificate validation. |
| `DB_POOL_MAX`, `DB_CONNECTION_TIMEOUT_MS`, `DB_IDLE_TIMEOUT_MS`, `DB_STATEMENT_TIMEOUT_MS`, `DB_TRANSACTION_IDLE_TIMEOUT_MS` | Connection and query limits. |
| `TRUST_PROXY`, `AUTH_RATE_LIMIT`, `GENERATION_RATE_LIMIT` | Trusted proxy and abuse limits. |
| `ALLOW_OPERATOR_REGISTRATION` | Development setting; production always forbids self-assignment. |
| `HTTP_PORT`, `PUBLIC_HOSTNAME` | Local edge port and optional public TLS hostname. |

See the [complete configuration reference](docs/PRODUCTION.md#environment-variables) and safe `.env.production.example`.

## Database Setup

`db:migrate` applies fresh schema and checksum-tracked ordered migrations. `db:seed` imports pinned approved CSVs, researched manifests and route evidence transactionally. Repeated imports preserve IDs, accounts and saved trips, and reject conflicting operator edits. `db:verify` checks approved records and relationships.

Use `npm run local:verify` and, after reviewing approved data changes, `npm run local:seed` for the local Docker stack. Never apply legacy reset/seed SQL to saved data. The [production runbook](docs/PRODUCTION.md#database-migrations-and-approved-data) explains backup, reviewed adoption and safe reseeding.

## Running Tests

Install backend/frontend dependencies as above, Python and Google Chrome, then:

```sh
python -m pip install -r requirements-tests.txt
npm run test:all:local
npm run test:scheduling:local
npm run test:demo:local
npm run test:production
npm run audit:images
```

Run suites sequentially. `test:all:local` and the expanded scheduling/demo adapters use disposable databases, preserve active records and restore private database networking. Container tests use an independent stack. **Do not run `test:local` against real user data:** that maintenance acceptance suite restarts/reseeds the active stack. Prefer the isolated wrappers above.

| Command | Coverage |
|---|---|
| `npm run test:unit` | Backend unit/security and frontend Trie/image/planner tests. |
| `npm run test:planner` | Academic reference planner assertions. |
| `npm run test:integration` | Auth, destination, trip, admin and DB constraints; requires configured test DB. |
| `npm run test:browser` | Real browser/API flows; requires running test API/frontend. |
| `npm run test:scheduling:local` | Isolated production-preview planning matrix, date/budget checks and teammate hotel-price/deletion/private-link/admin browser regressions. |
| `npm run test:demo:local` | Isolated authenticated university rehearsal; does not modify the installed account. |
| `npm run local:demo:check` | Seven read-only installed-environment checks. |
| `npm --prefix frontend run lint` | TypeScript checking. |
| `npm --prefix backend run build` | Backend JavaScript syntax checking. |
| `npm run audit:source` | Credential patterns and frontend preservation. |

The unified suite also builds production assets and runs both npm security audits. See [testing details](tests/README.md) for prerequisites and individual suite environments.

## Production-Like Local Verification

The repository includes the validated nginx/Express/PostgreSQL local stack, successful tourist/operator browser flows, persistence and recovery checks. Current release results are in [Release Verification](docs/RELEASE_VERIFICATION.md); earlier detailed readiness evidence is in [Local Final Readiness](backend/reports/LOCAL_FINAL_READINESS.md). These results do not claim public deployment.

## API Overview

All categories are under `/api`:

- `/auth`: registration, login and current account.
- `/destinations`: catalog, search, details, attractions, hotels and restaurants.
- `/trips`: authenticated owner trip discovery, creation, generation and persisted retrieval.
- `DELETE /trips/:id`: confirmed permanent owner-only deletion, including that trip's stops/budget. Returns 204 on success, 404 for foreign/missing IDs, 401 without a valid session and 400 for invalid requests.
- `/trips/:id/budget`: saved known-cost breakdown.
- `/admin`: operator-only catalog CRUD.

See [backend API documentation](backend/README.md) for contracts and permissions.

## Data Sources and Provenance

Data comes from researched public and official tourism/business sources, with source dates, archived evidence and field-level qualifications in [data/research](data/research/) and the [provenance report](backend/reports/data-provenance.md). [Research limitations](backend/reports/COMPLETION_RESEARCH.md) distinguish verified identity, historical quotes, derived values and unknowns.

Prices, opening hours and accessibility can change. Confirm them with the destination/provider before travel. Retained external image URLs are provenance, not redistribution licenses. The runtime uses verified local photographs where available and explicit fallback illustrations otherwise; see [image rights and validation](docs/IMAGES.md).

## Security

Implemented protections include bcrypt password hashing, expiring HS256 JWTs, current-account role checks, trip ownership, bound SQL, Zod request validation, rate limiting, security headers and restrictive CORS. Production operators require owner approval. Private environments and database archives are ignored; only safe environment templates are tracked. Public operation requires HTTPS, independent secrets and provider backups/monitoring.

## Documentation

- [Local setup and operations](docs/LOCAL_PRODUCTION.md)
- [Reproducible local university demonstration](docs/LOCAL_DEMO.md)
- [Current teammate fixes](reports/TEAMMATE_FIXES.md) and [sightseeing quality](reports/SIGHTSEEING_QUALITY_REPAIR.md)
- [Production deployment, backup and recovery](docs/PRODUCTION.md)
- [Release verification and repository cleanup](docs/RELEASE_VERIFICATION.md)
- [Testing](tests/README.md)
- [Backend API](backend/README.md) and [frontend integration](frontend/README.md)
- [Data provenance](backend/reports/data-provenance.md) and [data collection report](backend/reports/DATA_COMPLETION_REPORT.md)
- [Academic foundation](docs/foundation/) and [research experiments](docs/research/)
- [Repository map](docs/REPOSITORY_STRUCTURE.md)

Academic proposals and old experiment baselines are retained as historical design/research records. Current source, setup runbooks and release verification take precedence over their earlier scope/status claims.

## Known Limitations

- Dated tourism information can become stale; admission, duration, operating, rating and accessibility coverage is uneven. Some destinations cannot fill longer requested tours with supported timed visits.
- Transport fares are unavailable and excluded from known-cost totals. OSRM times are estimates, not live traffic.
- Planning is single-destination and heuristic. Dates, explicit nights and sourced operating/closure policies are supported, but unsupported holidays, reservations and live availability are not guaranteed.
- Unknown-price properties cannot be selected for priced stays. Insufficient accommodation budget is rejected with a useful explanation before trip creation; the selected hotel is not silently replaced. Historical saved rows keep their original meaning.
- User priorities rank comparable tours after feasible distinct-visit/day coverage. Global optimality is not proven. Without known closing data, an explicit 18:00 planning cutoff is used rather than invented opening facts.
- Public recipient sharing, account editing and password recovery are unavailable; owner links remain authenticated. Offline shell support does not make trip APIs available offline.
- Use one API instance until shared rate-limit storage is configured. Per-token revocation and large-scale capacity certification are outside this release.

## Deployment Status

**Locally demo-tested, with documented data/photo limitations.**
**Public deployment/hosting configuration remains external.**

The historical frontend demo is not a deployment of this backend/database release. Choose a host, configure protected secrets, database, domain/DNS, HTTPS, backups and monitoring using the production runbook.

## License

See the existing [LICENSE](LICENSE), preserved from the upstream repository. Source attribution does not independently clear third-party image/data rights.

## Contributors / Team

**Group 07, CSC210 / Ahmedabad University:** Satvik, Manya, Aryan and Sonam. Original responsibilities and academic credits are preserved in [Team Responsibilities](docs/TEAM_RESPONSIBILITIES.md).

### Hotel category coverage

After the existing expansion/enrichment/refinement imports, back up the local database with `npm run local:backup`, then run `npm run local:hotel-coverage -- --dry-run` and `npm run local:hotel-coverage`. This additive, repeatable import adds 13 sourced properties and cached road-route pairs without updating existing records. All eight destinations then have at least one priced choice in Low Cost, Budget and Premium, including clearly identified nearby towns. Published room rates are indicative snapshots; confirm current rates, taxes, occupancy and availability. Unknown ratings and photo rights remain unknown. See [hotel tier sources and validation](reports/HOTEL_TIER_COVERAGE.md).

### Itinerary scheduling and personal time

The scheduler balances known attractions over the remaining trip days without an arbitrary three/four-visit limit. Actual route times, admission budgets, opening windows and calendar restrictions still constrain visits. It resumes feasible sightseeing after meals through evidenced graph connections, returns promptly after the final visit, and does not manufacture meals-only days or six-hour dinner waits. Unsupported extra days show a clear advisory. Unused intervals of at least one hour exclude the evidenced transfer. Older saved plans are preserved; regenerate them to use the corrected scheduling logic.

Run `npm run test:scheduling:local` for isolated eight-destination planning/overlap tests and production-browser checks at desktop, tablet and mobile sizes. See [current sightseeing repair evidence](reports/SIGHTSEEING_QUALITY_REPAIR.md), [legacy gap handling](reports/SCHEDULE_GAP_REPAIR.md) and [teammate regressions](reports/TEAMMATE_FIXES.md).
