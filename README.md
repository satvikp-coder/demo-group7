# Gujarat Heritage Tourism Planner

**Live site: https://heritage-planner-web.onrender.com**

CSC210 Data Structures & Algorithms, Monsoon 2026, Group 7, Ahmedabad University.

Pick a Gujarat heritage destination, a hotel and a budget, and the app plans each day as a loop:
**hotel → sights and meals → back to the hotel**, using real road distances, opening hours and recorded prices.
It is a full web app (React + Express + PostgreSQL) where the course's data structures and algorithms do the real work.

> The first visit after a quiet period can take about a minute, because the free server sleeps when idle.

## Try it in two minutes

1. Open the live site and browse **Explore** (8 destinations, search, filters) and **Ranked Stays** (56 hotels).
2. **Register**, then **Plan Itinerary**: choose a city, hotel, days and budget, then **Generate**.
3. Explore the result: day-by-day schedule, route map, budget breakdown, strategy comparison, shortest-path visualizer, PDF export and a shareable link.
4. Open the chat button and ask the **Heritage Guide** about hotels or attractions.

## What it does

- **Discover** 8 destinations: Ahmedabad, Somnath, Dwarka, Modhera, Champaner, Gir National Park, Rann of Kutch and Saputara (100 attractions, 56 hotels, 12 restaurants, 1,330 road routes).
- **Plan** multi-day trips from a chosen hotel, balancing distance, cost and rating, with meals and opening hours respected.
- **Budget** with honest numbers: unknown prices are shown as unknown and never counted as free.
- **Save and share** trips (login required), view a saved trip offline, export a PDF.
- **Ask** the Heritage Guide chatbot (Groq): it only answers from the project's database.
- **Languages:** English, Hindi and Gujarati.

## How it works

```text
Browser (React) → Express API → PostgreSQL
                      │
                      └── dsa/ (graph, Dijkstra, heap, trie, hash table, merge sort, greedy)
Chat: signed-in user → read-only database tools → Groq → grounded answer
```

| Data structure / algorithm | Where it is used |
|---|---|
| Graph | Road network between hotels, sights and restaurants |
| Dijkstra + MinHeap | Shortest path when two places have no direct recorded route |
| Greedy scoring | Choosing which sights fit each day and the budget |
| Trie | Instant prefix search over destination and attraction names |
| Hash table | Fast route and visit lookups while planning |
| Merge sort | Stable ranking of hotels |

The planner is a bounded heuristic: it finds a good plan, not a proven global optimum.

## Repository map

| Folder | What is inside |
|---|---|
| `frontend/` | React 19 + TypeScript + Vite app (pages in `src/components`, API client in `src/api`) |
| `backend/` | Express API: routes, controllers, services, SQL migrations (`migrations/`), tests, maintenance scripts (`scripts/`) |
| `dsa/` | The shared algorithms and data structures, written in TypeScript |
| `database/` | Base schema and historical SQL examples |
| `data/` | Researched source data (CSVs and JSON with citations) used to build the catalog |
| `tests/`, `scripts/` | Browser and assertion test harnesses, suite runners, local operations |
| `docs/` | Guides: [deploy to Render](docs/RENDER_DEPLOY.md), [production](docs/PRODUCTION.md), [local demo](docs/LOCAL_DEMO.md), [repository map](docs/REPOSITORY_STRUCTURE.md), [bug log](docs/FINAL_BUG_LOG.md) |
| `reports/`, `backend/reports/` | Verification evidence (audit scripts and CI read these, so they stay) |
| `deploy/`, `compose*.yml`, `render.yaml`, `.github/` | Docker, Render blueprint and CI configuration |

## Run it on your computer

You need Node.js 22.18+ and PostgreSQL 17 (or Docker for the database).

```sh
git clone https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner.git
cd group-07-heritage-tourism-planner
npm ci --prefix backend
npm ci --prefix frontend
cp backend/.env.example backend/.env       # then fill in DATABASE_URL and JWT_SECRET (see below)
cp frontend/.env.example frontend/.env.local
npm --prefix backend run db:bootstrap      # empty database: schema + data + all hotels and attractions
npm --prefix backend start                 # API on http://localhost:5000
npm --prefix frontend run dev              # app on http://localhost:3000
```

In `backend/.env` set `DATABASE_URL` (your PostgreSQL URL), `PORT=5000`, `CORS_ORIGIN=http://localhost:3000`, and a random
`JWT_SECRET` (32+ characters; generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
To enable the chatbot, add `GROQ_API_KEY` from [console.groq.com/keys](https://console.groq.com/keys) (optional; the rest of the app works without it).
Windows Git Bash users: prefix commands that pass `/api` with `MSYS_NO_PATHCONV=1`.

No PostgreSQL installed? `npm run local:up` starts the whole stack in Docker at http://localhost:8080
(see [docs/LOCAL_PRODUCTION.md](docs/LOCAL_PRODUCTION.md)). It starts with the small base catalog; add the extra hotels and
attractions with `npm run local:expand`, `local:enrich`, `local:hotel-coverage` and `local:attractions`, in that order.

## Tests

```sh
npm --prefix backend test          # API and planner unit tests
npm --prefix frontend test         # frontend unit tests and planner assertions
npm --prefix frontend run lint     # TypeScript type check
npm --prefix backend run test:integration   # real HTTP + PostgreSQL checks (needs the database)
npm --prefix backend run test:frontend      # Chrome browser journeys (needs Python, Playwright, Chrome)
```

## Deploying

`render.yaml` describes the whole deployment (database, API, website). Step by step guide: [docs/RENDER_DEPLOY.md](docs/RENDER_DEPLOY.md).
On every start the API applies pending migrations and, on an empty database, loads the full catalog automatically.

## Data and honest limits

- Prices, hours and accessibility come from dated public sources and are **snapshots, not live quotes**. Check before you travel.
- Where a fact is not known (a ticket price, a transport fare, wheelchair access) the app says "not available" instead of guessing.
- Maps use OpenStreetMap; road geometry from OSRM is display-only and the planner uses the recorded route distances.
- The free hosting plan sleeps when idle and its database expires after 30 days.

## Team

Satvik (frontend, DSA integration), Manya (data collection, documentation), Aryan (DSA and backend), Sonam (research and testing).
Licensed under the terms in [LICENSE](LICENSE).
