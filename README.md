# Gujarat Heritage Tourism Planner

CSC210 Data Structures & Algorithms, Monsoon 2026 ? Group 7, Ahmedabad University.

## Overview

A React, Express and PostgreSQL application for exploring Gujarat heritage destinations and planning single-destination trips. The planner builds hotel-to-attractions-to-hotel daily schedules from recorded routes, visit durations, opening information and budget constraints. Authenticated users can save, reopen and delete their own trips.

## Supported destinations

Ahmedabad, Somnath, Dwarka, Modhera, Champaner, Gir National Park, Rann of Kutch and Saputara.

## Key functionality

- Destination and attraction discovery through runtime prefix search.
- Hotel selection, restaurant-supported meal scheduling, distance/cost/rating priorities and strategy comparison.
- Multi-day itineraries, known-cost budgets, interactive route maps, PDF export and a Dijkstra visualizer.
- JWT login, owner-protected saved trips, private trip bookmarks and cached offline trip viewing.
- Operator-only catalog administration and the grounded Heritage Guide chatbot.
- English, Gujarati and Hindi interface support, with incomplete translations and accessibility data disclosed below.

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Motion, Lucide React |
| Maps / export | Leaflet, OpenStreetMap, optional OSRM geometry, jsPDF, html2canvas |
| Backend | Node.js 22.18+, Express 5, JavaScript ES modules, shared TypeScript through tsx |
| Database | PostgreSQL 17, node-postgres, ordered SQL migrations |
| Security / testing | bcrypt, JWT, Zod, Helmet, rate limits, Node test runner, Python Playwright and Chrome |

Exact versions are pinned in the backend and frontend npm lockfiles.

## Architecture

```text
Browser -> React -> shared API client -> Express routes/services -> PostgreSQL
                                          |
                                     shared dsa/ modules
Authenticated chat -> allowlisted read-only tools -> database facts -> Groq reply
```

`frontend/` contains the application; `backend/` contains the API and tests; `dsa/` contains shared algorithms; `data/` and `database/` contain approved inputs and schema. `tests/`, `scripts/`, `docs/` and `reports/` hold verification tooling and evidence. Production requires protected backend/database configuration and an HTTPS reverse proxy.

## Data Structures and Algorithms

| Structure / algorithm | Implementation | Actual runtime use |
|---|---|---|
| Graph | [Graph.ts](dsa/graph/Graph.ts) | Evidenced route adjacency in the trip planner |
| Dijkstra | [dijkstra.ts](dsa/dijkstra/dijkstra.ts) | Shortest-path fallback when a direct route is missing; stored direct routes take precedence |
| MinHeap | [MinHeap.ts](dsa/priorityQueue/MinHeap.ts) | Dijkstra queue and planner candidate/route ordering |
| Greedy route scoring | [routeBuilder.ts](dsa/greedy/routeBuilder.ts) | Distance/cost/rating candidate scoring |
| Greedy day splitting | [daySplitter.ts](dsa/greedy/daySplitter.ts) | Visit quotas and meal-window helpers |
| Greedy budget filtering | [budgetAllocator.ts](dsa/greedy/budgetAllocator.ts) | Admission-budget eligibility filtering |
| Trie | [Trie.ts](dsa/trie/Trie.ts) | Prefix lookup over names indexed from PostgreSQL |
| HashTable | [HashTable.ts](dsa/hashTable/HashTable.ts) | Attraction membership, directional route cache and visited tracking |
| Merge Sort | [mergeSort.ts](dsa/sorting/mergeSort.ts) | Stable hotel ranking |

Runtime call sites: [tripPlanner.js](backend/services/tripPlanner.js), [destinationSearchCache.js](backend/services/destinationSearchCache.js) and [hotelRanking.js](backend/services/hotelRanking.js). Planning is a bounded heuristic, not a global optimum guarantee. The academic Trie has fuzzy-search tests, but the public endpoint does not implement typo tolerance. See the [tested DSA mapping](docs/FINAL_BUG_LOG.md#runtime-dsa-mapping).

## Prerequisites and installation

Install Node.js 22.18+ with npm, Git and PostgreSQL 17. Docker Desktop with Linux containers and Compose v2 is optional for the documented container stack. Browser tests additionally require Python, Google Chrome and the pinned Playwright package.

```sh
git clone https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner.git
cd group-07-heritage-tourism-planner
npm ci --prefix backend
npm ci --prefix frontend
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

The copy commands use Git Bash/POSIX syntax; PowerShell users can use `Copy-Item`. Create a dedicated PostgreSQL database and role. Configure ignored `backend/.env` with your own `DATABASE_URL`, a private random `JWT_SECRET`, `PORT=5000` and `CORS_ORIGIN=http://localhost:3000`. Hosted database connections require certificate verification. Set `frontend/.env.local` to `VITE_API_BASE_URL=http://localhost:5000/api`. Never put secrets in `VITE_` variables.

For a **new empty database only**:

```sh
npm --prefix backend run db:migrate
npm --prefix backend run db:seed
npm --prefix backend run db:verify
```

Do not reset/reseed an existing database or run historical attraction imports to reproduce the submission catalog. Back up existing installations before maintenance. See the [production runbook](docs/PRODUCTION.md).

## Local startup and Docker

Run in separate terminals:

```sh
npm --prefix backend start
npm --prefix frontend run dev
```

Frontend: `http://localhost:3000`; API: `http://localhost:5000/api`. `/health` reports liveness; `/ready` checks database readiness. Production operator self-registration is prohibited; operators require owner approval.

The optional Docker stack uses port 8080; instructions, PostgreSQL volume preservation and backup procedures are in [Local Production](docs/LOCAL_PRODUCTION.md). Its protected `.env.local-production` is separate from `backend/.env`; configure server-only Groq variables there when using Compose. Do not copy database credentials between installations.

Production frontend build in Git Bash/POSIX shells:

```sh
MSYS_NO_PATHCONV=1 VITE_API_BASE_URL=/api npm --prefix frontend run build
```

`MSYS_NO_PATHCONV=1` preserves `/api` on Windows Git Bash. In PowerShell set `$env:VITE_API_BASE_URL='/api'`, then run `npm --prefix frontend run build`. Serve the build with a same-origin `/api` proxy.

## Groq Heritage Guide

Set `GROQ_API_KEY` in ignored `backend/.env`; obtain a key from [Groq Console](https://console.groq.com/keys). Optional `GROQ_MODEL` defaults to `openai/gpt-oss-20b`. GPT-OSS requests use `reasoning_effort: low`. Restart the backend after configuration changes.

`POST /api/chat` requires authentication. The backend calls Groq, executes only validated read-only database tools and asks for a grounded final reply. JWT/account checks, owner-scoped trip tools, encrypted history, input limits, IP/user quotas, concurrency limits and a **15-second total deadline** remain enforced. Explicit database-only mode makes no model request and remains available when inference fails. Relevant messages/facts are sent to Groq; credentials remain backend-only.

Previous live verification passed **9/9 authenticated requests** over three rounds of destination, Somnath and Modhera questions, with meaningful grounded replies and valid history tokens. Request times were **1.044?3.646 seconds**, with provider-quota backoff between questions. This is recorded evidence, not an availability guarantee. Rapid traffic can return a friendly 429; there are no automatic retries or alternate-provider fallback. The [final bug log](docs/FINAL_BUG_LOG.md) retains exact results and the superseded NVIDIA investigation.

## Database and seed data

The submission seed contains **8 destinations, 25 attractions, 11 hotels, 12 restaurants and 131 routes**. CSVs and researched supplements are validated before import; simulated route records are excluded. Tourism information remains dated source snapshots.

Historical enrichment reports describe separate 44- and 100-attraction datasets. Those totals do not describe the submission seed, and their imports are not required for setup. See [provenance](backend/reports/data-provenance.md) and [research limitations](backend/reports/COMPLETION_RESEARCH.md).

## Authentication and API routes

| Route | Purpose |
|---|---|
| `/api/auth` | Registration, login and current account |
| `/api/destinations` | Catalog, prefix search, details, attractions, hotels and restaurants |
| `/api/trips` | Authenticated owner trip creation, discovery and retrieval |
| `/api/trips/:id/generate-itinerary` | Generate and persist the selected trip's itinerary |
| `/api/trips/:id/budget` | Recorded known-cost breakdown |
| `DELETE /api/trips/:id` | Delete only the owner's trip and dependent records |
| `POST /api/chat` | Grounded chat or explicitly selected database-only lookup |
| `/api/admin` | Operator-only catalog CRUD |

See [backend contracts and permissions](backend/README.md).

## Testing and verification

```sh
npm run test:backend
npm run test:chat
npm run test:frontend
npm --prefix frontend run lint
npm --prefix backend run build
npm run audit:source
node scripts/test-source-approval.js
python -m pip install -r requirements-tests.txt
```

Frontend tests include the Trie and reference-planner suites; backend tests exercise runtime Graph/Dijkstra/heap/hash/greedy integration. Source approval uses reviewed exact hashes and rejects subsequent unapproved changes.

For browser checks, finish the production build first and keep the backend on 5000. Inside `frontend/`, start preview on 3000, stopping the development server first if necessary:

```sh
node --input-type=module -e "import {preview} from 'vite'; await preview({preview:{host:'127.0.0.1',port:3000,strictPort:true,proxy:{'/api':'http://localhost:5000'}}});"
```

From the repository root in Git Bash/POSIX shells:

```sh
FRONTEND_TEST_URL=http://localhost:3000 API_TEST_URL=http://localhost:3000/api npm --prefix backend run test:frontend
```

PowerShell users can set those target variables through `$env:` before the npm command. They select test URLs, not CORS policy. Run catalog-mutating suites sequentially and do not rebuild during browser tests. The wrapper cleans recorded fixture IDs and verifies catalog preservation. Additional configured-test-database checks are available through `npm run test:integration`; see [testing details](tests/README.md).

Previous completed verification: **123 backend tests (including 28 mocked chat tests), 56 frontend tests, 80 Trie assertions, 33 planner assertions and 64 browser checks**; TypeScript, syntax, production build and source audit passed. A secret-free fresh clone passed lockfile installation, tests, types and builds. The [final bug log](docs/FINAL_BUG_LOG.md) records evidence and qualifications; historical reports do not represent new executions.

## Security

Protections include bcrypt, expiring HS256 JWTs, current-account/role checks, trip ownership, bound SQL, Zod validation, read-only chatbot tools, restrictive CORS, Helmet, rate limits and sanitized failures. Production requires HTTPS, restricted runtime database credentials and protected secrets. Safe environment templates are tracked; private environments, dependencies, builds and database archives are ignored. Use one API instance until rate-limit storage is shared. Never commit keys or tokens.

## Known limitations

- Modhera, Champaner, Gir National Park, Rann of Kutch and Saputara retain provisional/unverified seeded data. Fee, hours, rating, accessibility and physical-demand coverage is incomplete.
- Some hotel prices are historical or dated; no live booking/rate guarantee exists. Unknown-price hotels are not priced starting-hotel choices.
- Budgets show known subtotals, excluding unavailable transport fares, unknown fees/taxes and unscheduled costs. Unknown does not mean free.
- Routes and schedules are estimates constrained by available data. Sparse catalogs can leave disclosed gaps or unsupported sightseeing days; global optimality is not claimed.
- Runtime search is prefix-based, without typo tolerance.
- Gujarati/Hindi aliases and short translations need native review. Descriptions and some controls remain English-only; native chatbot-language quality is not certified.
- Groq needs a backend key and remains subject to provider quotas and application rate limits; database-only mode is available during failures.
- Production operators need owner approval. Public recipient sharing, account editing and password recovery are unavailable; copied trip links remain owner-authenticated.
- Native-device testing is incomplete; viewport checks do not certify native devices. Public maps/routing depend on external services.
- A live website may be older than the submitted branch. Local verification does not establish deployment freshness.

## Documentation and references

- [Final bug log](docs/FINAL_BUG_LOG.md) and [translation review](docs/TRANSLATION_REVIEW.md)
- [DSA documentation](dsa/README.md), [testing guide](tests/README.md) and [frontend integration](frontend/README.md)
- [Research sources](data/research/), [image rights](docs/IMAGES.md), [photo credits](frontend/public/image-credits.html) and [license](LICENSE)
- [Historical team responsibilities and credits](docs/TEAM_RESPONSIBILITIES.md); Git authorship does not establish total individual contribution.

Administrative item: official end-semester AI-tool disclosure instructions remain **NOT VERIFIED**. Confirm course requirements and disclose actual tool use honestly in the required submission materials; this README does not invent university policy.
