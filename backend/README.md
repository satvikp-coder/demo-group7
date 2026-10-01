> Current deployment/testing workflow: [Production runbook](../docs/PRODUCTION.md).
> Its migration ledger, guarded seed and unified tests supersede historical guidance below.

# Heritage Tourism Planner backend

Express 5 and PostgreSQL backend. The frontend is connected through its central API client;
see ../frontend/README.md for setup and browser verification.
Use Node 22.18+ (tested on Node 24.12) for direct imports of the existing DSA
TypeScript modules. No generated copy of those algorithms is used.

## Run

For the complete stack, use `npm run local:up` from the repository root.
For manual development, install with `npm ci` here, copy `.env.example` to `.env`,
set your dedicated PostgreSQL connection and random JWT key, then run
`npm run db:migrate`, `npm run db:seed`, `npm run db:verify`, and `npm run dev`.
See [local setup](../docs/LOCAL_PRODUCTION.md) and [production operations](../docs/PRODUCTION.md).
Never run schema/reset commands over an existing populated database.

## Authentication

- POST /api/auth/register: {name, email, password, role}.
  Returns 201 with a public user record; no token until login.
- POST /api/auth/login: {email, password}.
  Returns 200 with token, tokenType, expiresIn, and user.
- GET /api/auth/me: requires Authorization: Bearer <token>; returns id, name, email,
  and the current database role. Name/email come from the current database account.
- GET /api/admin/status: requires a valid token whose role is exactly tour_operator.

Registration defaults to tourist. Production forbids self-registration as an operator.
Use owner-controlled `operator:approve` (or root `local:operator`) after ordinary
registration. Development can explicitly enable operator test registration.
The role admin is not accepted.
Emails are trimmed/lowercased and validated. Registration passwords require
at least 12 characters, uppercase, lowercase, a digit, and a symbol; the
maximum is 72 UTF-8 bytes to prevent bcrypt truncation. Passwords are not trimmed.
bcrypt uses cost 12 and a fresh salt. Only password hashes go to PostgreSQL.
Duplicate email returns 409. Unknown email and wrong password both return 401
with the same generic response. There are no demo credential exceptions.

JWTs use HS256 and expire after 3600 seconds. sub contains the stored UUID and
role contains the stored role. verifyJwt validates signature, expiry, subject,
and role and attaches decoded claims plus id to req.user.
Every /api/admin route inherits verifyJwt and requireRoles("tour_operator").
Role authorization is performed in the backend; frontend calls use the login JWT.
Protected requests re-read the account and role, so role changes/deletion take effect
before token expiry. Logout clears browser state; individual-token blacklisting
and password recovery are not implemented.

Authentication uses fixed parameterized SQL. Registration never returns hashes.
Error responses omit database details. The API requires HTTPS when deployed
outside local development.

## Database and CSV seed

The canonical schema is `../database/schema/schema.sql`. Use `npm run db:migrate`
for both fresh setup and ordered upgrades; `db:schema` is legacy EMPTY-database
tooling, not an update command.

- npm run db:seed reads approved CSVs plus researched manifests and archived routes.
- npm run db:verify re-queries counts and route joins.
- node scripts/seed.js --dry-run inspects acceptance without connecting.

The user approved the original 14 attraction, 5 hotel, and 5 restaurant records.
scripts/seed-approvals.json pins these exact file hashes; changed data requires
new review. These are project-attributed records, not independently verified
facts. All 56 explicitly simulated routes are rejected. Unsupported cities are
absent from the original CSV stage. The researched supplements now extend this
stage to eight destinations, 25 attractions, 11 hotels, 12 restaurants and 131
accepted road routes. Unknown fields remain NULL. See reports/data-provenance.md
for each researched field and route; simulated CSV routes remain excluded.

The schema now supports external IDs, slugs, localization, accessibility,
transport mode, editorial fields, provenance, opening hours, nearby relations,
longer trips, transit/cultural stops, and transit budgets. Route endpoints can
reference attractions, hotels, or restaurants, with same-city composite foreign
keys and exactly-one-endpoint checks. The 131 accepted routes are sourced snapshots;
121 routes include reverse-direction evidence; ten remaining return estimates
carry explicit warnings. Road fares and calendar-specific booking are unavailable.

For an EMPTY isolated database, configure DATABASE_URL first, then run
`npm run db:migrate`, `npm run db:seed`, and
`npm run db:verify`. Do not apply the fresh schema over an existing installation.
Normal seeding includes the researched supplements and preserves catalog UUIDs.
`node scripts/test-clean-startup.js` verifies schema, migration and two seeds in a
random disposable database, then drops only that database; its connection role
needs permission to create databases.

Seeding is transactional and repeatable, with conflict ownership checks and an
advisory lock. No existing records are deleted. Full raw/approved/inserted
counts, exclusions, executed SQL, and join results are written to
reports/seed-report.json. This seed is intended for the reference dataset;
verification compares approved records while permitting unrelated catalog rows.

CSV short IDs are preserved in external_id, not coerced to UUIDs.
The known routes.csv extra date column is handled explicitly, without dropping
unexpected columns silently. Ferry fare text is not converted into an entry fee.

## Verification

- npm test: database-independent scaffold and CSV tests.
- npm run test:auth: direct curl requests against Express and real PostgreSQL;
  creates unique temporary users, verifies bcrypt storage/JWTs/role gates,
  and deletes only those users. Writes reports/auth-http-report.json.
- npm run test:db: actual SQL route constraint tests, entirely rolled back.
- npm run test:trips: persisted generation, ownership, budget and four simultaneous
  regenerations. Serialization/deadlock failures retry the whole rolled-back
  write transaction, up to five attempts; no partial generation is committed.
- npm run test:destinations and npm run test:admin: real API/SQL coverage and CRUD.
- node scripts/audit-completion-integrity.js: all catalog relationships/routes.
- node scripts/audit-data-completion.js: remaining fields and route pairs.
- node scripts/test-research-preservation.js: two reseeds and a rolled-back probe.

Run catalog-mutating HTTP/browser suites sequentially so temporary fixtures do
not interfere with another suite's catalog snapshots. All suites remove their
exact temporary records. Current release evidence is in [Release Verification](../docs/RELEASE_VERIFICATION.md).

The HTTP verification report redacts passwords/tokens but preserves actual
request fields, status codes, response UUIDs, and verified JWT claims.

Trip creation, generation, retrieval and trip-specific budgets are implemented below.
Frontend API wiring is documented in ../frontend/README.md. /health checks HTTP liveness;
normal server startup now requires PostgreSQL to load the initial search index.

## Destination API

All routes are public read-only endpoints backed by PostgreSQL. Collections
return JSON arrays; detail returns one database record. Field names use SQL
snake_case. PostgreSQL NUMERIC values retain pg's decimal-string representation.
Unknown metadata remains null; nothing is filled from local frontend data.

- GET /api/destinations
- GET /api/destinations/catalog (bounded bulk catalog for the shared frontend client)
- GET /api/destinations/search?prefix=Som
- GET /api/destinations/:id
- GET /api/destinations/:id/attractions
- GET /api/destinations/:id/hotels?sort=price
- GET /api/destinations/:id/restaurants

:id accepts either a database UUID or an existing destination slug. Collection
routes accept limit (1-100, default 20) and offset (nonnegative, default 0).
Detail accepts no query parameters. Unsupported, duplicated, or malformed
parameters return 400. Unknown destinations return 404, including child routes;
existing destinations with empty child results and searches without matches
return 200 with []. Error shape is {error:{message, issues?}}.

Hotel sort values: price (default, ascending), rating (descending, unknown last),
value (descending, unknown last), and name (ascending). All sorting uses ../../dsa/sorting/mergeSort.ts via the
hotelRanking service. The complete city hotel set is sorted before pagination.
Ties use name and UUID; Array.prototype.sort is not used.

The search index is loaded before the HTTP server listens and refreshed every
60 seconds. It imports ../../dsa/trie/Trie.ts and indexes actual destination and
attraction names (including translations when present). Queries match the
beginning of a full indexed name, case-insensitively, and return each matching
destination once. Since the shared Trie also indexes suffixes, candidates are
checked for actual prefixes. Searches never rebuild the index or query the DB.
Refreshes coalesce, replace the snapshot atomically, and retain the last real
snapshot on failure. An uninitialized index returns 503, never mock results.

npm run test:destinations starts the real HTTP entry point, issues direct curl
requests, compares responses/order with independent SQL queries, and checks
cache reuse, pagination, validation, 404s, and empty arrays without inserting
fixtures. Full responses are saved in reports/destinations-http-report.json.
The test HTTP server stops afterward; PostgreSQL stays running.

## Trip API and persisted budgets

All trip endpoints require the JWT returned by POST /api/auth/login in
`Authorization: Bearer <token>`. Trips are scoped to that user's UUID; accessing
another user's trip returns 404.

- `GET /api/trips?limit=20&offset=0`: persisted trips belonging to the authenticated account.
- `POST /api/trips`: JSON `{destination_id, days, budget, starting_hotel_id, start_time}`.
  IDs are UUIDs; days is 1-30, budget is a positive integer in rupees, and start_time
  is 24-hour HH:mm between 00:00 and 21:59. Optional `strategy` is distance-first
  (default), budget-first, or rating-first; `wheelchair_accessible_only` defaults false.
  Returns 201 with `trip`, `hotel_total`, `hotel_over_budget`, and `hotel_replaced:false`.
  A hotel from another destination is rejected with 422. An over-budget hotel is kept.
- `POST /api/trips/:id/generate-itinerary`: `{}` or optional strategy/accessibility
  overrides. Returns `{trip, days, budget}` with persisted stops and generation_summary.
  Regeneration atomically replaces only this trip's stops and budget cache.
- `GET /api/trips/:id`: returns the same persisted trip, day-by-day stops and budget.
- `GET /api/trips/:id/budget`: computes hotel/attraction/meal/transit totals with SQL
  scoped to this trip's persisted stops. Prices are snapshots taken at generation;
  later catalog price edits do not silently change an already generated trip.

Run `npm run db:migrate` for checksum-tracked schema upgrades; it is safe to repeat
and does not reset existing data.

The adapter imports Graph, Dijkstra, MinHeap, HashTable and the greedy budget filter,
route scoring and day quota/time helpers directly from dsa/. It uses database route
rows first, with Dijkstra only for attraction pairs lacking a direct edge. It does
not read CSV files during requests. Database distances replace the client's synthetic
geographic fallback; unavailable hotel/restaurant transfer edges remain unavailable.
The legacy hotel-selection helper is intentionally not called because it can replace
an over-budget user selection. Lodging follows the existing convention: one night
per requested day, charged once on each day's departure stop; return costs zero.

Only `wheelchair_accessible=true` attractions enter wheelchair-only candidate selection
or intermediate graph nodes. False and unknown values produce explicit exclusions.
This does not certify hotel, restaurant or route accessibility, which the schema
does not record. Stops respect opening/closing times and same-day hotel return.
Meals require affordable known restaurant prices and known transfer/return edges;
lunch fits 12:30-14:30 and dinner 19:30-21:30. Missing meals/routes are reported in
generation_summary rather than fabricated. Transport fares are unavailable in the
route schema, so any traveled plan marks transport_cost_known=false; total is the
known persisted cost, not a claim that transportation is free.

`npm run test:trips` uses curl, the real server entry point, Step 3 registration/login,
and PostgreSQL. It verifies creation/generation/fetch/budget, SQL persistence, budget
isolation, multi-day stops, regeneration, ownership, validation, accessibility, late
start times and hotel preservation. It writes `reports/trips-http-report.json`, with
complete actual HTTP responses and redacted credentials. Test users and a uniquely
named synthetic destination are deleted afterward by exact IDs, including their
dependent trips/stops; the report remains as evidence.

Current approved catalog: 8 destinations, 25 attractions, 11 hotels, 12 restaurants
and 131 routes. All 56 simulated CSV routes remain excluded. Twenty-three attraction
accessibility values remain unknown. Missing information produces honest exclusions;
positive fixture tests do not independently certify tourism facts.

## Operator catalog CRUD

Every `/api/admin` route uses `verifyJwt`, current-account verification and
`requireRoles("tour_operator")` middleware. Valid tourist tokens get **403 Access denied**;
missing/invalid tokens get **401**. A body field cannot grant an operator role.

For each resource `destinations`, `attractions`, `hotels`, and `restaurants`:

- `POST /api/admin/<resource>/:id`: create with the supplied UUID; **201** and the stored row.
  Duplicate IDs/unique values return **409**. `POST /api/admin/<resource>` also supports
  server-generated UUIDs, with a Location header pointing to the created record.
- `PUT /api/admin/<resource>/:id`: update one or more editable fields; **200** and the
  stored row. Omitted fields retain their values; nullable fields can be explicitly cleared
  with null. Empty bodies and unknown/protected fields are rejected with **400**.
- `DELETE /api/admin/<resource>/:id`: **204**, no body. Missing records return **404**.
- `GET /api/admin/<resource>/:id` and `GET /api/admin/<resource>?limit=20&offset=0`:
  role-protected reads, **200**. The list limit is at most 100.

Required creation fields (additional supported fields follow the database snake_case
names; see middleware/adminSchemas.js for the complete strict allowlist):

| Resource | Required JSON fields |
| --- | --- |
| destinations | name, slug |
| attractions | destination_id, name, lat, lng, duration_hours, category |
| hotels | destination_id, name, lat, lng, price_per_night, stay_type |
| restaurants | destination_id, name, lat, lng, avg_cost_per_person |

Prices and coordinates are JSON numbers; hotel/meal prices are nonnegative integers.
Accessibility is a JSON boolean or null. IDs are UUIDs. A nonexistent destination on
creation returns **422**; updates/deletes conflicting with foreign keys return **409**.
Existing schema cascades remove a deleted destination's children/routes, and deleted
child entities' route/nearby links. Destinations and selected hotels referenced by trips
cannot be deleted. Persisted itinerary price/name snapshots remain unchanged.

SQL table/column names use a fixed server allowlist; values are bound parameters.
Created entities remain unverified. Operator edits clear source_row_hash and reset
provenance_status to unverified; clients cannot assert independent verification or a
seed hash. Destination/attraction changes refresh the public search index after saving;
if refresh fails, the committed write remains successful and the normal timer retries.

Run `npm run test:admin` for actual curl -> Express -> PostgreSQL evidence. The test
registers and logs in both roles through Step 3 endpoints and verifies all 12 mutation
combinations: tourist POST/PUT/DELETE **403/403/403**, operator **201/200/204** for every
resource. Independent SQL checks prove rejected requests did not insert/update/delete
anything. It also checks reads, 401s, validation, conflicts, cache refresh, exact-ID
cleanup and preservation of the original catalog. Full redacted exchanges are saved in
`reports/admin-http-report.json`. All temporary test records are removed afterward.


## References

- https://expressjs.com/en/guide/error-handling/
- https://node-postgres.com/features/queries
- https://github.com/kelektiv/node.bcrypt.js
- https://github.com/auth0/node-jsonwebtoken
- https://nodejs.org/download/release/v22.21.0/docs/api/typescript.html

## Frontend integration additions

Hotel sorting also accepts `sort=value`, ordered by persisted `value_score` descending,
unknown values last, then name/ID. It uses the existing shared Merge Sort.
`/auth/me` returns public account name/email so a reload restores the actual profile.
Role checks use the current database account.

`npm run test:frontend` runs the real Chrome/API checks described in ../frontend/README.md.
It validates all eight frontend data paths, tourist rejection and operator success on
all four CRUD resources, explicit request failure states, and catalog preservation.
No runtime dependencies or migrations were added by frontend integration.
