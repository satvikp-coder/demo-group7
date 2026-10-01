> Current deployment/testing workflow: [Production runbook](../docs/PRODUCTION.md).
> Its migration ledger, guarded seed and unified tests supersede historical guidance below.

# Heritage Tourism Planner Frontend  

The frontend reads the PostgreSQL-backed API through `src/api/index.ts`.
It does not generate itineraries or authenticate accounts from bundled demo data.

## Local setup

1. Start PostgreSQL and the backend using `../backend/README.md`.
2. Set `VITE_API_BASE_URL=http://localhost:5000/api` in `.env.local` (or your
   deployment environment). Include `/api`; this is the only API base URL setting.
3. Set backend `CORS_ORIGIN` to the exact frontend origin, normally
   `http://localhost:3000`. Use matching HTTPS origins when deployed.
4. Run `npm ci`, then `npm run dev`. Restart Vite after changing environment values.
   Production builds require `/api` or an HTTPS API root ending in `/api`; they reject
   the development HTTP URL. `npm run build` embeds the production setting.

No API key, password, or JWT secret belongs in a `VITE_` variable. JWTs are obtained
by real login and held in session storage. Missing configuration or a failed request
shows an error, not a bundled-data fallback. API calls bypass service-worker caches.

## API data paths

| View | Server source |
| --- | --- |
| Explore | `/destinations/search?prefix=...`, debounced 300 ms; empty search lists destinations |
| Destination detail | `/destinations/:id` plus attractions, hotels and restaurants |
| Planner | `POST /trips`, then `POST /trips/:id/generate-itinerary` |
| Itinerary | `GET /trips/:id`, displaying persisted stop times and prices |
| Budget | `GET /trips/:id/budget`, scoped to the same saved trip ID |
| Hotels | `/destinations/:id/hotels?sort=value|rating|price` |
| Admin | Operator-only `/admin/{destinations,attractions,hotels,restaurants}` CRUD |
| Authentication | `/auth/register`, `/auth/login`, `/auth/me` |

Admin forms require destination and coordinates when creating child records. Enter
coordinates from a verified source; the app does not invent them or assert that an
operator-entered record has independently verified provenance. Existing classes and
styles are reused for these required fields.

## Verification

- `npm run lint`: TypeScript.
- `npm test`: complete standalone Trie and reference planner tests (measured assertion totals).
- `npm run test:unit`: standalone Trie assertions and the owned-image regression.
- `npm run test:planner`: reference planner tests only, distinct from backend production planning.
- From the application root, `npm run test:all` runs the isolated complete suite;
  `npm run test:production` runs built-container browser, recovery and load gates.
- From the project root, `node tests/frontend/build-audit.mjs`: production build
  that fails if legacy catalog, routes CSV, client planner or Trie enters the bundle.
- Real browser flow: start a backend with `PORT=5310` and
  `CORS_ORIGIN=http://localhost:4310`; start Vite with
  `VITE_API_BASE_URL=http://localhost:5310/api` and `npm run dev -- --port 4310`.
  Then run `npm run test:frontend` in `backend/`. Python Playwright and Chrome must
  already be installed. The script creates temporary accounts/catalog fixtures,
  records actual API responses, and cleans only their exact IDs. It compares the
  full catalog before and after. Test fixture coordinates are not tourism data.

Large browser traces are generated locally and ignored. Curated results are in
[Release Verification](../docs/RELEASE_VERIFICATION.md).

## Data limitations

The database has Ahmedabad, Somnath, Dwarka, Modhera, Champaner, Gir National Park,
Rann of Kutch and Saputara: eight destinations, 25 attractions, 11 hotels,
12 restaurants and 131 sourced road-route snapshots. Somnath Temple has verified
wheelchair access; Rukmini Temple is marked inaccessible; 23 attraction values
remain unknown and are excluded by wheelchair-only planning. Missing ratings,
travel fares, mode splits and algorithm timings remain unavailable. Unknown
transport costs display as excluded, rather than verified free transport.
Hotel choice is retained when over budget. One lodging night per trip day is
the existing backend contract. Simulated CSV routes remain excluded.

The profile discovers owned trips from PostgreSQL after a new login. There is no
account-update, preview or verified-discount endpoint; account edits report unsupported; What If generates a new persisted version on Save; budget
tips do not apply fabricated savings. Strategy comparisons create real server trips.
Shared trip IDs remain owner-protected, and reloading trip data requires a network
connection. These controls never fall back to the legacy client planner.

From frontend/, run `node --import tsx scripts/run-experiments.ts` with the backend
running. It executes the original 22 scenarios through HTTP, persists/retrieves
their trips and budgets, and removes its temporary account. Results are under
../docs/research/. Current baseline: 22 generated, 12 budget-compliant, 48 visits;
the ten over-budget selected-hotel cases are valid constraint failures.

For this workspace's ports, run the browser suite in backend/ with
`FRONTEND_TEST_URL=http://localhost:3000` and
`API_TEST_URL=http://localhost:5000/api`. Run it once with Vite development and
once with `npm run preview -- --port 3000 --host 0.0.0.0` after building; stop the
other frontend server first. `python tests/frontend/api_client_browser.py` from
the project root uses FRONTEND_TEST_URL and requires the Vite development server.
`node tests/frontend/completion-source-audit.mjs` checks this session's preserved
styles/structure against its captured baseline. Consult the final verification
report for precise browser coverage and limitations, including native speech/PWA
behavior that cannot be fully certified in a headless browser.

`rg -n 'data/destinations' src` finds only `utils/destinationTrie.ts` and
`utils/itineraryPlanner.ts`, retained for reference/offline tests. Component and API
planner imports are explicitly type-only. Neither utility nor the catalog is in
the production bundle. `src/data/destinations.ts` itself is unchanged.
  
