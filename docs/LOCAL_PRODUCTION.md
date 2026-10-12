# Complete local production setup

Run commands from the application folder containing `package.json` and `compose.yml`,
not its enclosing copied-workspace folder. This path creates a separate local stack;
it does not publish a website or alter an existing developer database.

## Prerequisites

Install Node.js 22.18 or newer, npm, and Docker Engine with Compose v2. On Windows,
start Docker Desktop using Linux containers. Allow Docker to download the locked
application dependencies and PostgreSQL/nginx images. Port 8080 must be free.

## Environment, database, migrations, data, build and startup

```sh
npm run local:up
```

This one command generates ignored `.env.local-production` with independent random
database owner/runtime passwords and a strong JWT key. It builds the real frontend
and backend images, starts PostgreSQL, runs checksum-tracked transactional migrations,
imports the approved eight-destination dataset into a fresh database, and waits for
database/application readiness. Open **http://localhost:8080**.

The browser loads nginx-served Vite production assets and same-origin `/api`; Express
runs `NODE_ENV=production` with `npm start`, without development watchers. Database
and API ports are private. This machine-only loopback HTTP origin is intentional;
public HTTPS remains part of external hosting configuration.

On later starts, schema migrations still run but existing managed catalog data is
preserved rather than automatically overwriting operator edits. Preserve the private
environment file together with the `heritage-local_production_db` Docker volume.
Do not delete either to troubleshoot a connection problem. To choose another port,
set `LOCAL_HTTP_PORT` **before the first start**; after creation, edit `HTTP_PORT` and
matching `CORS_ORIGIN=http://localhost:PORT` in the private file and rerun startup.
Use `localhost`, rather than another hostname, to match the configured origin.

## Verification and approved data updates

```sh
npm run local:status
npm run local:verify
npm run local:seed
npm run local:seed
```

Expected fresh catalog: 8 destinations, 25 attractions, 11 hotels, 12 restaurants,
131 routes. Guarded reseeding preserves users/trips and unrelated catalog rows;
it refuses conflicting edits to previously managed records. Review such changes
using the approved-data adoption procedure in [PRODUCTION.md](PRODUCTION.md).
Do not use development reset scripts on saved data.

The reviewed itinerary expansion is a separate additive command, not a reset or
automatic replacement of curated data:

```sh
npm run local:backup -- backups/before-catalog-expansion.dump
npm run local:expand
```

Run `local:up` first to build the current importer and apply migrations. Expansion
is transactional and idempotent; the expected combined catalog is 8 destinations,
33 attractions, 23 hotels, 12 restaurants and 163 routes. It preserves matching
existing identities without overwriting them. See
[sources and unknown facts](../reports/DATABASE_EXPANSION_REPORT.md). Hotel prices
are estimates, and unknown attraction fees/durations exclude those new records
from timed scheduling. The original base `local:verify` command checks its managed
records, not independent factual completeness of this expansion.

For the new planner acceptance suite, run `npm run test:itinerary -- demo` using
the isolated-test database configuration below. It checks real authentication,
categories, weights, persistence, browser controls and import preservation.

Register a tourist in the UI. To approve your own operator account locally:

```sh
npm run local:operator -- YOUR_REGISTERED_EMAIL
```

Log in again after approval. Production registration never lets a caller grant
themselves operator privileges. There are no fixed passwords or seeded admin users.

Health: `http://localhost:8080/health`; readiness:
`http://localhost:8080/ready`. Readiness returns 503 during database failure;
liveness continues returning 200. Docker rotates structured logs. Inspect them with
`docker compose --env-file .env.local-production -p heritage-local -f compose.yml -f compose.local.yml logs --tail 100 backend frontend`.

## Tests

```sh
npm ci --prefix backend
npm ci --prefix frontend
python -m pip install -r requirements-tests.txt
npm run test:all:local
npm run test:scheduling:local
npm run test:demo:local
npm run test:production
```

Install Google Chrome for the Playwright scripts (`channel=chrome`). Run suites
sequentially: a process lock protects shared evidence. `test:all:local` runs the
unified `test:all` using generated local credentials, temporarily exposes PostgreSQL
only on loopback port 55434, and removes that port after testing. It creates and
removes its own isolated test database while preserving the active catalog/users.
No manually configured developer database is needed for this setup path.
Use these isolated wrappers for routine verification. Do not run `test:local`
against real user data: that maintenance acceptance suite restarts/reseeds the
active stack. Its historical description below is not a routine demo command.
For an independently configured test service, `test:all` needs an owner
`DATABASE_URL` in ignored `backend/.env` pointing to a reachable PostgreSQL service
where it may create/drop **only its disposable test databases**. Supply your own
credentials from the safe backend example. It does not assume the working catalog
is already populated. `test:production` creates its own isolated Compose database
with private random credentials (loopback test ports 8088/55433). `test:local` uses
the active local stack, tests the successful built-browser journey for all eight
cities, restarts that stack, reseeds with saved trips, and backs up/restores into a
new isolated database. Temporary records are removed by exact verification IDs.

The unified suite includes backend security/unit and HTTP integration tests,
frontend Trie tests, planner assertions, catalog-image regression, typecheck,
production build/source audit, auth/admin/database constraints, seed preservation,
browser controls, malformed API-client responses, research-browser tests and
dependency audits. The production suite adds real containers, security/load/
concurrency, built-browser/PWA checks, whole-stack restart and recovery drills.
`test:local` adds the persistent developer-stack acceptance path and clean successful
browser console check. Counts come from executed reports, not fixed banners.

## Backup and restore

Install backend dependencies above for the archive helper. PostgreSQL tools run
inside the existing database container; no password is placed in command arguments.

```sh
npm run local:backup -- backups/my-local-backup.dump
npm run local:restore -- backups/my-local-backup.dump local_restore_review
```

The archive must have a new filename; existing archives are not overwritten.
Restore requires a **new** database name starting `local_restore_`; it never clears
or replaces the active application database. The helper checks the empty target,
restores the custom archive and reapplies runtime grants. To test the restored app,
back up the private env file, change only the database pathname in both database
URLs to that restore name, then run `npm run local:up`. Change back afterward.
Protect archives because they contain private account/trip data. Copy backups off
the machine and test restoration regularly; no automatic scheduler is claimed.

## Restart and shutdown

```sh
npm run local:restart
npm run local:stop
npm run local:up
```

Restarts and stops preserve the Docker database volume and signing key. Backend
termination drains HTTP and closes its pool. Do not run `down -v`: that destroys
saved PostgreSQL data. An application rebuild alone does not require reseeding.

## Honest data and deployment boundaries

Historical hotel/meal/admission prices need source refresh; unknown transport fares
are explicitly excluded, not verified zero. Accessibility/opening calendars and
some exact operating facts remain unknown. OSRM routes are modelled, with reverse
evidence where available and explicit reverse limitations elsewhere. External image
URLs remain in provenance. The app uses exact licensed local photographs where
available and explicit generic illustrations otherwise. Keep media attributions
intact; do not substitute unrelated property photographs.

Public hosting still requires a chosen account, production database, protected
secrets, URLs/domain/DNS, HTTPS termination, provider backup scheduling and monitoring.
Use [PRODUCTION.md](PRODUCTION.md) for that separate deployment step.

## Phase 2 additive enrichment

After a verified backup, run `npm run local:up`, `npm run local:expand`, then
`npm run local:enrich`. Existing installations already containing the first
expansion may run only the final enrichment command after upgrading.
The expected combined catalog is 8/44/43/12/322 (destinations/attractions/hotels/
restaurants/routes). Both imports are transactional and idempotent. No reset is
required. Migration008 adds nullable accommodation fields without changing old
trips. See [Phase 2 readiness](../reports/PHASE2_FINAL_READINESS.md).

## Phase 3 local checks and reviewed corrections

Before a presentation, run `npm run local:demo:check`. This read-only check verifies
the local configuration, frontend, API/database readiness, eight destination
catalogs, protected generation endpoint, migration checksums and installed image
bytes. It prints the failing check and recovery command when something is missing.
It does not sign in, create test accounts, import data or certify a complete trip.

The reviewed six-attraction correction is separate from startup:

```sh
npm run local:backup -- backups/before-phase3.dump
npm run local:up
npm run local:refine -- --dry-run
npm run local:refine
npm run local:demo:check
```

Verify backup restoration into a new database before applying corrections. The
import refuses unexpected existing values, preserves prior provenance and commits
all six updates together. Repetition is a no-op; it never deletes or resets records.
It updates five Ahmedabad visitor-guidance records and Gir's documented vehicle
fee/operating-policy description. It does not rewrite saved trips.

Use `npm run test:phase3:production:local` for the isolated expanded-catalog API and
browser tests, including dates, rooms, safari groups, seasonal closure, saved trip
resizing and Gujarati keyboard priorities. Run it sequentially with other suites.
`npm run test:demo:local` rehearses authenticated generation, three Ahmedabad
priority settings, Somnath on mobile and Modhera on tablet against the current
reviewed catalog in a separate temporary database; the installed user is untouched.
See [Phase 3 test evidence](../reports/PHASE3_FULL_TEST_RESULTS.md) and
[local demo status](../reports/PHASE3_LOCAL_DEMO_READINESS.md) for current coverage
and remaining factual/localization limitations.

## Current enriched catalog and controls

The latest measured enriched catalog (12 October 2026) is 8 destinations,
44 attractions, 56 hotels, 12 restaurants and 497 routes. Already enriched
installations need only startup and the read-only readiness check. `local:up`
does not silently apply all later enrichment to an existing database.

For a fresh base catalog, back up first and apply the reviewed sequence:

```sh
npm run local:backup -- backups/before-full-enrichment.dump
npm run local:expand
npm run local:enrich
npm run local:refine -- --dry-run
npm run local:refine
npm run local:hotel-coverage -- --dry-run
npm run local:hotel-coverage
npm run local:demo:check
```

Use a new archive filename and test restoration into a new database before risky
data corrections. Never reset existing data or overwrite curated conflicts merely
to match a count. See [hotel provenance](../reports/HOTEL_TIER_COVERAGE.md).

Ranked Stays switches all eight cities. Only supported priced hotels are
selectable for a priced stay; other records remain visible with explanations.
The planner validates price, rooms, guests and lodging budget before creating a
trip. Preferences rank comparable sightseeing coverage; unsupported extra days
are disclosed rather than filled with meals.

Delete Trip is permanent after confirmation: the owner-only API deletes that
trip's stops and budget and clears its browser snapshots. Demonstrate it only
using a new disposable demo trip. Copy private trip link requires the same owner
to sign in; recipients are not granted public access. Tourists cannot access
admin controls; approved operators retain their catalog tools.

Use [LOCAL_DEMO.md](LOCAL_DEMO.md) for presentation steps. Latest fixes/results:
[TEAMMATE_FIXES.md](../reports/TEAMMATE_FIXES.md) and
[SIGHTSEEING_QUALITY_REPAIR.md](../reports/SIGHTSEEING_QUALITY_REPAIR.md).
