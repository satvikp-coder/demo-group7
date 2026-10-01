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
npm run test:production
npm run test:local
```

Install Google Chrome for the Playwright scripts (`channel=chrome`). Run suites
sequentially: a process lock protects shared evidence. `test:all:local` runs the
unified `test:all` using generated local credentials, temporarily exposes PostgreSQL
only on loopback port 55434, and removes that port after testing. It creates and
removes its own isolated test database while preserving the active catalog/users.
No manually configured developer database is needed for this setup path.
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
URLs remain in provenance, but the app uses existing project-owned graphics until
hotlink/distribution permission and reliable availability are established.

Public hosting still requires a chosen account, production database, protected
secrets, URLs/domain/DNS, HTTPS termination, provider backup scheduling and monitoring.
Use [PRODUCTION.md](PRODUCTION.md) for that separate deployment step.
