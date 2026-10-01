# Production operation

For a machine-only production stack with one-command startup and automatic fresh
database initialization, follow [LOCAL_PRODUCTION.md](LOCAL_PRODUCTION.md).
The current local acceptance evidence is in
[LOCAL_FINAL_READINESS.md](../backend/reports/LOCAL_FINAL_READINESS.md).

This is the deployment runbook for the current API-backed product. Older course/demo
documentation is historical. Public deployment has not been performed from this
copied workspace; see `backend/reports/PRODUCTION_READINESS.md` for measured gates.

## Prerequisites and architecture

Use Node22 or newer, npm lockfiles, PostgreSQL17, Docker Engine/Compose for the tested
deployment, and Python3.13/Playwright for browser tests. The backend runs JavaScript
plus shared TypeScript through the production `tsx` dependency; it needs no watcher
or transpiled backend build artifact. `npm --prefix backend run build` validates JS
syntax; frontend TypeScript is checked separately.

Browser → HTTPS Caddy/platform → nginx static SPA → private Express API → private
PostgreSQL. The supplied images run without root. Only the frontend loopback port
is published by base Compose; DB and API have no public host ports. The optional
TLS overlay publishes80/443. Production builds use `/api` on the same origin,
preventing mixed content. For a different static host, set `VITE_API_BASE_URL` to
its real HTTPS API root and configure that host's CSP `connect-src` for that root.
The supplied nginx config intentionally supports the same-origin architecture.

Use one backend instance for this deployment. Rate-limit state is in memory and
resets on restart. Before horizontal scaling, use a supported shared limiter store
or edge limits; do not multiply replicas without that work. With ten DB connections
per instance, reserve additional capacity for maintenance/backup and PostgreSQL's
own overhead. Load evidence covers local sanity, not an internet-scale capacity SLA.

## Environment variables

Copy `.env.production.example` to an ignored protected `.env.production`, with file
permissions restricted to the deployment operator. Supply separate random
`POSTGRES_PASSWORD`, `POSTGRES_APP_PASSWORD`, and a random `JWT_SECRET` of at least48
characters; generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
Do not put them in frontend VITE variables, image arguments, Git, screenshots or CI
logs. URL-encode DB passwords in both URLs. Use a secret manager instead of files
when the hosting platform provides one.

| Setting | Purpose |
|---|---|
| `NODE_ENV` | `production` for deployed API; Compose sets it. |
| `PORT` | API listening port; Compose fixes the internal API/proxy contract at5000. |
| `DATABASE_URL` | Runtime `heritage_app` connection; no DDL/superuser privileges. |
| `DATABASE_ADMIN_URL` | Compose maintenance only, `heritage_owner`; never injected into the API container. |
| `DATABASE_SSL` | `verify-full` for hosted PostgreSQL; `disable` only for the supplied private local network. |
| `DATABASE_SSL_CA_FILE` | Optional trusted provider root CA PEM mounted read-only; certificate validation cannot be disabled. |
| `JWT_SECRET` | Random signing key; rotate to invalidate every outstanding token. |
| `CORS_ORIGIN` | Exact comma-separated frontend origins, no paths/trailing slash/wildcards. Public production origins must be HTTPS. |
| `TRUST_PROXY` | Empty for direct hosting, otherwise trusted proxy CIDRs. Compose restricts backend access to its private network. Never use `true`. |
| `DB_POOL_MAX` | Default10, valid1–100; scripts default2. |
| `DB_CONNECTION_TIMEOUT_MS` | Default5000, max60000. |
| `DB_IDLE_TIMEOUT_MS` | Default30000, max300000. |
| `DB_STATEMENT_TIMEOUT_MS` | Default15000, max120000. |
| `DB_TRANSACTION_IDLE_TIMEOUT_MS` | Default30000, max120000. |
| `AUTH_RATE_LIMIT` | Default20 per IP per15min for each login/registration bucket in production. |
| `GENERATION_RATE_LIMIT` | Default30 per account per minute. |
| `ALLOW_OPERATOR_REGISTRATION` | Always forbidden in production. Setfalse for development parity. |
| `VITE_API_BASE_URL` | Public build setting: `/api` or `https://YOUR_API_HOST/api`. |
| `HTTP_PORT` | Loopback staging/reverse-proxy port, default8080. |
| `PUBLIC_HOSTNAME` | Actual DNS hostname for Caddy certificates. |
| `DB_APP_ROLE` | Maintenance grants after migrations; Compose uses `heritage_app`. |
| `PG_TOOLS_CONTAINER` | Optional ID/name of this deployment's PostgreSQL container for local archive tools. Native mode needs `pg_dump`/`pg_restore` on PATH. |

Old Gemini/APP_URL template keys are not runtime requirements and were removed.
Translation API credentials belong only to an optional offline maintenance script.
The Vercel files support SPA hosting only; they do not deploy the API or database.

## Database, migrations and approved data

These commands create a fresh deployment without touching the existing developer DB:

```sh
docker compose --env-file .env.production up -d postgres
docker compose --env-file .env.production run --rm maintenance npm run db:migrate
docker compose --env-file .env.production run --rm maintenance npm run db:seed
docker compose --env-file .env.production run --rm maintenance npm run db:verify
docker compose --env-file .env.production up -d backend frontend
```

Initial PostgreSQL boot creates `heritage_app` with no superuser/create-role/create-DB
rights. Migrations grant runtime table DML, withholding the migration/seed ledgers.
Maintenance credentials alone can change schema. Managed DB deployments should
create equivalent separate owner/runtime roles and supply `DB_APP_ROLE` when
running migrations. Do not publicly expose either DB role.

`db:migrate` handles fresh schema creation and transactional ordered upgrades. Its
advisory lock serializes deploy jobs; SHA256 checksums prevent editing already
applied migrations. Append a numbered migration for future changes. Previously
installed canonical databases are adopted without replaying CREATE TABLE, checked
for required core tables, then upgraded; backup and run the constraint/integration
gates before accepting such an adoption. `db:schema` is legacy EMPTY-DB tooling,
not an update/reset command. Never run it on production tables.

Seeding uses pinned approved CSVs, sourced supplements and archived route evidence;
simulated CSV routes stay excluded. Transactions/advisory locking preserve UUIDs,
user accounts, saved trips, stops and budgets. Managed-row snapshots refuse to
overwrite operator edits or deleted approved rows. Extra unrelated catalog rows
are preserved; exact total counts need not match approved counts when such rows
exist. Direct research import CLI commands are forbidden in production.

To refresh approved facts, review primary evidence, update the appropriate
`data/research/<city>.json` fields and source date, test on a disposable database,
back up, then run the guarded seed. Existing saved prices stay snapshots. If live
operator changes conflict, first reconcile the reviewed manifests to live approved
values, run `maintenance npm run db:adopt -- --reviewed`, then seed. Adoption checks
all approved values first and changes only seed ownership metadata; it cannot
silently replace live facts. Do not simply drop ownership guards.

Register the intended operator as an ordinary tourist, then approve through a
privileged maintenance session:

```sh
docker compose --env-file .env.production run --rm maintenance npm run operator:approve -- person@example.com
```

This is owner-controlled onboarding, not public privilege escalation. Operators
log in again after approval. Demotion/deletion takes effect on the next protected
request because roles are read from PostgreSQL. JWTs expire in one hour. Logout
clears the browser token; there is no per-token blacklist/password-reset endpoint.

## Build, start and HTTPS deployment

```sh
docker compose --env-file .env.production build
docker compose --env-file .env.production up -d backend frontend
```

Native equivalent: install backend/frontend with `npm ci`, run backend migrations
and approved seed using owner credentials, run `npm --prefix frontend run lint`
and `npm --prefix frontend run build` with a production API value, serve `dist`
with SPA fallback, and `npm --prefix backend start` using runtime credentials.
There is no dev server/watcher in production. nginx serves refreshes of
`/destination/:id`, `/itinerary`, `/budget`, `/admin`, etc. Missing `/assets/*`
returns404 rather than HTML. Source maps are disabled; API responses and SPA shell
are not cached as successful offline data.

For the supplied public HTTPS path, point your domain's A/AAAA records at your
server, open inbound80/443, set `PUBLIC_HOSTNAME` and the exact
`CORS_ORIGIN=https://YOUR_DOMAIN`, then:

```sh
docker compose --env-file .env.production -f compose.yml -f compose.tls.yml up -d
```

Caddy provisions/renews certificates and terminates TLS; its certificate state must
persist in `tls_data`. nginx and Express remain on the private network. HSTS is set
by the HTTPS edge. For a managed TLS platform, configure the same private proxy
path, health probes and real frontend origin. Local HTTP testing does not certify
public HTTPS. No cloud account, domain ownership, DNS or hosting token was available
in this workspace, and the old demo link is not evidence of this version deployed.

After DNS/certificate provisioning, verify the real public deployment before routing
users to it:

1. Fetch `https://YOUR_DOMAIN/health` and `/ready`; expect200 and a valid trusted
   certificate with an HTTP-to-HTTPS redirect. Confirm PostgreSQL/API host ports
   are closed publicly and browser network requests use HTTPS/same-origin `/api`.
2. Refresh direct destination/itinerary/budget/admin routes; expect the SPA shell,
   while `/assets/definitely-missing.js` returns404. Check CSP/frame/nosniff headers.
3. A read-only API request with `Origin: https://unapproved.example` must return403
   without an allow-origin header; the real configured origin must succeed.
4. Register a disposable tourist, log in, search and inspect children for all eight
   destinations, create/generate/reopen each trip and compare persisted budgets.
   Check an expensive explicitly chosen hotel remains selected when over budget.
5. Owner-approve a designated test operator, log in and create/update/delete one
   clearly identified temporary catalog fixture. Tourist access must remain403;
   another tourist's trip must be inaccessible; logout must clear browser access.
6. Remove only the identified test fixtures/accounts through owner-controlled
   maintenance, verify approved counts/data and review safe logs/health/backups.

Do not run the destructive failure-trigger/DB-stop/load staging harness against
the public production database. `test:production` always creates its own isolation.

## Health, logging and monitoring

`GET /health` checks process liveness. `GET /ready` checks database availability;
it returns503 while draining or unavailable, without server details. Route external
traffic only while readiness succeeds. Containers probe readiness, and startup
warms the real search index before listening. SIGTERM/SIGINT close HTTP, stop
refresh work and close the pool; a ten-second deadline bounds shutdown.

JSON stdout/stderr logs carry time/event/level, generated request ID, method, route
template, status and duration. No request bodies, URLs with query parameters,
authorization headers, password hashes or error stacks are serialized. Readiness,
startup/shutdown, cache/database failures,5xx and rate limits have named events.

```sh
docker compose --env-file .env.production logs --since 30m backend
docker compose --env-file .env.production ps
```

The supplied Compose services use Docker's local log driver with five10MB rotated
files per service. Static-edge access logs exclude URLs/query strings/headers;
backend logs supply safe route templates. Have other hosting platforms retain and
rotate stdout. Monitor `/ready` every minute,
alert after three failed probes, alert on unexpected5xx and sustained auth429,
and investigate slow itinerary requests with their request IDs. Monitor disk,
memory, PostgreSQL connections and backup job exit status. This needs no paid
monitoring service; automatic alert delivery must be configured by the host owner.

## Backup, restore and recovery

Install PostgreSQL client tools matching or newer than the server (tested17), or
set `PG_TOOLS_CONTAINER` for this deployment's PostgreSQL container. Use a protected
backup credential/environment file; scripts derive PG environment variables and
never pass passwords in command arguments. Local container mode uses its private
Unix socket, not a public authentication bypass.

```sh
# DATABASE_URL must identify the source using a backup/owner account.
npm --prefix backend run db:backup -- backups/heritage-YYYY-MM-DD.dump
# Create a NEW EMPTY target DB first, set DATABASE_URL to it:
npm --prefix backend run db:restore -- backups/heritage-YYYY-MM-DD.dump
```

Archive files are custom-format, created exclusively (no accidental overwrite),
with restrictive file mode on supported systems. Restore is one transaction,
fails on errors, and refuses a nonempty target; it never uses `--clean` or DROP.
On Windows restrict the containing folder's ACL. Archives contain password hashes
and personal trip/account data: encrypt storage and restrict access.

For Compose, obtain the exact PostgreSQL container ID with `docker compose
--env-file .env.production ps -q postgres`; set `PG_TOOLS_CONTAINER` to it and use
an owner URL reachable from the maintenance host. The staging-only port override
must stay loopback. Alternatively run native tools on the deployment host over
its private DB network. After `--no-owner --no-acl` restore, reapply runtime grants
with the owner's `db:migrate` command and `DB_APP_ROLE`; ledger checks prevent
schema replay. Start a separate backend against the restored DB, verify counts,
account login, persisted itinerary and budget, then switch traffic.

Required policy for the actual deployment: daily encrypted off-host logical backup,
30 daily copies,12 monthly copies, and a monthly disposable restore drill. Enable
managed PostgreSQL automated backups and at least7-day point-in-time recovery
where available. Keep credentials in the operator's secret manager, with a separate
backup identity and documented access for the recovery operator. Monitor backup
exit status and storage capacity. These jobs/platform backups are NOT claimed
already running; the host owner must enable them after deployment. Local recovery
test evidence includes a seeded DB, user, generated trip, custom archive, clean
restore and matching HTTP itinerary/budget. Retained staging archives are ignored.

## Rollback

Keep immutable image digests for the previous passing release. Deploy the new
version to staging, back up before migrations, apply additive migrations first,
switch traffic only after health and browser smoke pass. If application code fails,
point Compose/platform image tags back to the previous digest and restart. Do not
edit the migration ledger or automatically reverse DDL. Confirm old code remains
compatible with the additive schema. If not, apply a reviewed forward fix.

A database restore is for corruption/disaster, not ordinary application rollback:
restoring yesterday's DB loses subsequent users/trips. Restore into a different DB,
inspect/reconcile later writes or use PITR, then explicitly switch. Retain the
original DB until recovery is accepted. No destructive rollback script is supplied.

## Tests and CI

Install the browser harness with `pip install -r requirements-tests.txt` and
`python -m playwright install --with-deps chrome` (Windows may omit `--with-deps`).
Root `npm run test:all` uses a CREATE DATABASE-capable isolated-test connection in
`DATABASE_URL`; never give CI a production URL. It runs backend/security unit tests,
complete standalone Trie/planner assertions, frontend TypeScript, backend syntax,
production build/module audit, fresh/repeated migrations, reseed preservation,
real auth/destination/trip/admin/constraint suites, development Chrome, malformed
API-client browser regressions, research browser, dependency audits and source/UI
audit. Categories remain distinct; planner tests exercise legacy reference logic,
not live tourism accuracy. Report totals are measured, not hardcoded banners.

`npm run test:production` builds/runs the real Compose images with fresh private
credentials and a unique project/volume, seeds twice, runs all-city API and browser
flows, concurrency/load/rollback failure probes, operator CRUD, PWA/failure recovery,
backup/clean restore and graceful restart. It stops its own containers and retains
isolated volumes/archive evidence. Both commands hold a shared lock and must run
sequentially because evidence files are shared. `.github/workflows/production.yml`
performs those two gates sequentially on an isolated PostgreSQL service and Docker.
The workflow runs on pushes and pull requests. See [release verification](RELEASE_VERIFICATION.md)
for the observed GitHub result; local results alone do not prove remote CI success.

## Data freshness, provenance and rights

`npm --prefix backend run data:freshness` emits per-field source/date/refresh deadlines
to `production-data-freshness.json`. Recheck room quotes weekly; meals/admission/hours
monthly; ratings/routes every90days. Always reconfirm safari permits/timed slots,
seasonal access, ferry service and museum reopening before booking. Do not transfer
an official source label from identity facts to independently unverified prices,
durations, coordinates or accessibility. The21 researched child rows remain
record-wide unverified; field reviews independently support14 identities, while
other fields stay qualified. No fully verified record was invented.

The planner is date-free, uses a single opening interval, and cannot enforce calendars,
split opening windows or live inventory. Two entry prices and23 attraction wheelchair
statuses remain unknown. Fares have no schema and stay explicitly excluded/unknown.
Directional OSRM evidence is used when available; approach overrides without return
evidence still carry an explicit warning. OSRM models road travel, not live traffic.
Selected expensive hotels are retained even when over budget; no hotel swapping or
fake discount was introduced. Counts remain8/25/11/12/131.

External image URLs are retained as provenance; runtime catalog images use existing
local category fallbacks. An official URL is not a redistribution license. No copyrighted
image was downloaded in this pass. Supplied local JPG ownership is not independently established by this release; do not
sell/relicense them as independently cleared assets. Obtain owner documentation or use the existing safe fallback with an approved
data-image update if distribution rights are uncertain. External failure never
fabricates catalog data. See the production data/image audit for tested URLs.
