# Heritage Tourism Planner

A Gujarat heritage and tourism planning platform built for CSC210 Data Structures & Algorithms, Group 07, Ahmedabad University.

## Overview

The React application uses a real Express/PostgreSQL backend to search destinations and generate persisted itineraries. A trip covers one destination, with each day starting and ending at the selected hotel. The backend schedules eligible attractions and meals using stored road routes, time windows and the available budget. Saved stops and price snapshots remain available after login and restart.

## Key Features

- Destination and attraction search with backend Trie prefix matching; the shared academic Trie also includes tested Levenshtein fuzzy search.
- Destination details, attractions and hotels; restaurant data supports the API and meal scheduling.
- Hotel sorting by price, rating and value using the shared Merge Sort implementation.
- Registration, login, authenticated trip discovery and persisted itinerary/budget retrieval.
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
| [Dijkstra](dsa/dijkstra/dijkstra.ts), [Graph](dsa/graph/Graph.ts), [MinHeap](dsa/priorityQueue/MinHeap.ts) | Shortest-path fallback for eligible missing-direct attraction pairs. Stored direct routes take precedence. |
| [Trip planner](backend/services/tripPlanner.js), [greedy helpers](dsa/greedy/) | Scores candidates and schedules visits, meals and hotel returns within time/budget constraints. This is a heuristic, not a global optimum guarantee. |
| [Trip model](backend/models/tripModel.js) | Transactional persistence, bounded serialization retries and stored cost snapshots. |
| [Hash table](dsa/hashTable/HashTable.ts) | Preserved standalone academic implementation; see [DSA documentation](dsa/README.md). |

## Current Data

The approved catalog is verified during release acceptance; see [release verification](docs/RELEASE_VERIFICATION.md) for the dated measured result.

| Records | Count |
|---|---:|
| Destinations | 8 |
| Attractions | 25 |
| Hotels | 11 |
| Restaurants | 12 |
| Routes | 131 |

These are catalog counts, not a claim that every tourism field is independently verified. The original CSVs cover only part of the catalog; researched JSON supplements supply the remaining destinations and road evidence. Simulated CSV routes are excluded from the approved import.

## Quick Start

Install Node.js 22.18+ and Docker with Compose v2 (Linux containers), then:

```sh
git clone https://github.com/satvikp-coder/demo-group7.git
cd demo-group7
npm run local:up
```

Open **http://localhost:8080**. Startup generates private credentials, builds the images, applies migrations and imports approved data only for a fresh database. Later starts preserve existing managed data.

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
npm run test:production
npm run test:local
```

Run suites sequentially. `test:all:local` adapts the unified `npm run test:all` to the local Docker database; the unified suite creates and removes an isolated test database. Container tests use an independent stack. Local acceptance checks the persistent stack and cleans exact fixture IDs.

| Command | Coverage |
|---|---|
| `npm run test:unit` | Backend unit/security and frontend Trie/image/planner tests. |
| `npm run test:planner` | Academic reference planner assertions. |
| `npm run test:integration` | Auth, destination, trip, admin and DB constraints; requires configured test DB. |
| `npm run test:browser` | Real browser/API flows; requires running test API/frontend. |
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
- `/trips/:id/budget`: saved known-cost breakdown.
- `/admin`: operator-only catalog CRUD.

See [backend API documentation](backend/README.md) for contracts and permissions.

## Data Sources and Provenance

Data comes from researched public and official tourism/business sources, with source dates, archived evidence and field-level qualifications in [data/research](data/research/) and the [provenance report](backend/reports/data-provenance.md). [Research limitations](backend/reports/COMPLETION_RESEARCH.md) distinguish verified identity, historical quotes, derived values and unknowns.

Prices, opening hours and accessibility can change. Confirm them with the destination/provider before travel. Retained external image URLs are provenance, not redistribution licenses; the runtime catalog uses existing local fallback graphics.

## Security

Implemented protections include bcrypt password hashing, expiring HS256 JWTs, current-account role checks, trip ownership, bound SQL, Zod request validation, rate limiting, security headers and restrictive CORS. Production operators require owner approval. Private environments and database archives are ignored; only safe environment templates are tracked. Public operation requires HTTPS, independent secrets and provider backups/monitoring.

## Documentation

- [Local setup and operations](docs/LOCAL_PRODUCTION.md)
- [Production deployment, backup and recovery](docs/PRODUCTION.md)
- [Release verification and repository cleanup](docs/RELEASE_VERIFICATION.md)
- [Testing](tests/README.md)
- [Backend API](backend/README.md) and [frontend integration](frontend/README.md)
- [Data provenance](backend/reports/data-provenance.md) and [data collection report](backend/reports/DATA_COMPLETION_REPORT.md)
- [Academic foundation](docs/foundation/) and [research experiments](docs/research/)
- [Repository map](docs/REPOSITORY_STRUCTURE.md)

Academic proposals and old experiment baselines are retained as historical design/research records. Current source, setup runbooks and release verification take precedence over their earlier scope/status claims.

## Known Limitations

- Dated tourism information can become stale; 23 attraction accessibility values and two admission prices remain unknown in the approved dataset.
- Transport fares are unavailable and excluded from known-cost totals. OSRM times are estimates, not live traffic.
- Planning is single-destination and date-free, with one opening interval; it cannot guarantee seasonal calendars, reservations or live availability. Some meal windows/routes remain incomplete.
- A selected hotel that exceeds the budget stays selected and produces an explicit incomplete result.
- Public recipient sharing, account editing and password recovery are unavailable; owner links remain authenticated. Offline shell support does not make trip APIs available offline.
- Use one API instance until shared rate-limit storage is configured. Per-token revocation and large-scale capacity certification are outside this release.

## Deployment Status

**Locally production-ready.**
**Public deployment/hosting configuration remains external.**

The historical frontend demo is not a deployment of this backend/database release. Choose a host, configure protected secrets, database, domain/DNS, HTTPS, backups and monitoring using the production runbook.

## License

See the existing [LICENSE](LICENSE), preserved from the upstream repository. Source attribution does not independently clear third-party image/data rights.

## Contributors / Team

**Group 07, CSC210 / Ahmedabad University:** Satvik, Manya, Aryan and Sonam. Original responsibilities and academic credits are preserved in [Team Responsibilities](docs/TEAM_RESPONSIBILITIES.md).
