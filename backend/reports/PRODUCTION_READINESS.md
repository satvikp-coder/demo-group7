> Historical acceptance report. For the current repository release and freshly rerun
> tests, see [Release Verification](../../docs/RELEASE_VERIFICATION.md). Earlier
> filesystem/Git/deployment statements describe the date of this report.

# Production readiness — Heritage Tourism Planner

Current local-final acceptance: [LOCAL_FINAL_READINESS.md](LOCAL_FINAL_READINESS.md),
2026-10-01 08:11 UTC. Final18/18 unified,16/16 production-container and4/4
persistent-local gates passed. Local stack runs at http://localhost:8080; public
deployment was not performed. The earlier checkpoint details below are historical.

## 1. Production verdict

**PRODUCTION READY EXCEPT EXTERNAL DEPLOYMENT ACTION**

Finalized2026-10-01 05:37 UTC /11:07 Asia/Calcutta. All18 unified-suite gates and15
production-container gates passed against the final implementation. No fixable
repository-level deployment blocker remains in the tested topology. No public
deployment is claimed. The target deployment is one backend
instance, private PostgreSQL and a same-origin HTTPS static frontend/API proxy.

This is a continuation of the existing application, not a redesign or substitute
dataset. Historical functionality reports remain historical. The authoritative
deployment procedure is [docs/PRODUCTION.md](../../docs/PRODUCTION.md).

## 2. Architecture

- Frontend: existing React19/TypeScript/Vite6/Tailwind4 product; checked production
  assets served by nonroot nginx. SPA fallback preserves direct navigation/refresh;
  missing assets return404. Source maps are disabled. No reference catalog, legacy
  client planner or reference Trie enters the runtime bundle (2365 audited modules).
- API: Express5 on Node22 in the tested production image; `node --import tsx server.js`
  is the production entrypoint. Shared TypeScript DSA imports need `tsx`, which is a
  production dependency; no watcher or hidden build step is required.
- PostgreSQL17: persistent private volume; runtime `heritage_app` is not superuser,
  cannot create roles/databases/schema, and cannot read migration/seed ledgers.
  Maintenance has separate owner credentials. The API receives no admin URL.
- Compose: backend nonroot/read-only, dropped capabilities, init process and health
  probe; nginx nonroot. Database/API ports are unpublished. The staging override
  publishes PostgreSQL only on loopback. Base frontend HTTP is loopback only.
- Communication: production `/api` on the browser's origin, private nginx-to-API
  proxy. Optional Caddy terminates public TLS on80/443 with persistent certificates
  and HSTS; real DNS/domain activation is external. Hosted PostgreSQL supports
  `verify-full` and an optional trusted CA; disabled SSL is for the private local DB.
- A single-statement bulk catalog removes the reproduced33-request initial catalog
  fanout while preserving existing mapping/sorting and rendered component structure.

## 3. Security

Authentication retains bcrypt cost12 and strict password byte/length limits,
HS256 signatures and one-hour JWT expiry. Tests reject invalid, expired and forged
tokens, duplicate registration, tourist admin access and other-user trips. Production
startup rejects weak signing keys/public HTTP CORS; generate96 hexadecimal characters
from48 random bytes. Production self-registration as operator is forbidden.
Owner-controlled `operator:approve` provisions an existing tourist. Protected routes
re-read the current account/role, so demotion/deletion takes effect before JWT expiry.

Authorization remains server-side for every admin endpoint and every trip/budget
read/write. No public operator claim can grant privileges. Logout clears the browser
session; individual JWT blacklisting/password reset is outside the existing product.

Helmet protects API responses; nginx supplies CSP, frame denial, MIME protection and
referrer policy. Existing motion styles require inline **styles**, not inline scripts.
Configured exact-origin CORS rejects outsiders with403; no wildcard is used. HTTPS
same-origin API communication prevents mixed content in the supplied public topology.
Trusted proxies are validated IP/CIDR/private-range settings, not unrestricted `true`.

Established `express-rate-limit` middleware enforces global1200/min/IP, separate
login/registration20/15min/IP, admin mutations120/min/account and itinerary generation
30/min/account. Actual production login exhaustion returns429 and Retry-After.
Memory storage is appropriate to the declared single instance; shared storage/edge
limits are required **before** scaling replicas.

Strict schemas reject unexpected fields, invalid UUIDs, invalid pagination,
out-of-range numeric values and oversized strings. SQL values remain bound.
JSON bodies are limited to100KB; malformed JSON yields400, oversize413. DB conflicts
remain409/422 where appropriate. Connection/DNS/socket failures yield sanitized503;
unexpected errors yield sanitized500. No response contains SQL, stack or filesystem
details. Logger metadata is allowlisted; bodies, headers, query strings, JWTs and
passwords are never serialized. nginx access logs omit request URLs/headers too.

Both package audits report **zero vulnerabilities**, including low severity.
The compatible DOMPurify transitive patch was tested; no forced breaking upgrade
was used. No intentionally retained vulnerability needs an exception.

Source audit found no credential patterns in distributable text after removing
embedded third-party token/key strings from three archived HTML evidence pages.
Private local environment files were preserved and excluded from images/Git/report
contents. No application signing key/database password was moved into public source.
Ephemeral test secrets and archive contents are never published in reports.

Reproduced defects and their fixes:

| Verified problem / root cause | Implemented correction | Verification |
|---|---|---|
| Public operator registration and stale signed roles could retain privileges | Production signup403; current-account lookup | Production API and regression suites |
| Configuration accepted development-only deployment settings | Fail-closed secret/origin/TLS/pool validation | Backend security tests and real production startup |
| No abuse limits/headers/readiness/shutdown/log rotation | Established middleware, probes, bounded termination and logs | Unit and15 container gates |
| Initial catalog generated33 HTTP requests and hit conservative limits during real legitimate flows | One bounded catalog snapshot plus realistic global limit | Malformed-response regressions, all-city Chrome and load |
| Stopping Docker PostgreSQL removes its DNS entry; ENOTFOUND became500 | Classify DNS/socket/PG connection errors as retryable503 | New regression and real stop/start drill |
| Test/maintenance idle PG clients emitted unhandled error objects | Sanitized idle handlers and reliable cleanup | Repeated outage drill, no unhandled crash |
| nginx default access logging included full URLs; Docker logs unbounded | Safe JSON edge metadata and5×10MB local rotation | Secret-query sentinel absent; inspected actual log driver |
| Seed could overwrite operator-managed approved rows | Transactional ownership snapshots/refusal/reviewed adoption | Real edited-row refusal; user/trip/unrelated-row preservation |
| Planner used symmetric estimates despite asymmetric archived OSRM rows | Nullable reverse evidence and directed graph edges | Directional unit test,121 return rows, all-city production flows |
| Hardcoded test-count banners misstated executed assertions | Measured counters; normal frontend test includes planner | Actual80 Trie/33 planner assertions |
| Intermittent native mobile-tab click timed out during rapid viewport/tab transitions | Scope the dialog, wait for selected state/real transition, assert the heading; no force clicks | Final development63 and production63 browser checks |

## 4. Database

Runtime pool defaults to10 connections (maintenance2), five-second connection
timeout,30-second idle timeout,15-second statement timeout and30-second idle
transaction timeout. Inputs are bounded; idle errors are sanitized; pool closes
on shutdown. Hosted SSL enforces certificate verification and rejects URL parameters
that could override it. Real hosted-provider certificates still need provider access.

Canonical schema plus numbered001–004 migrations are reproducible and transactional,
serialized by an advisory lock, with a SHA256 ledger. Reapplying migrations is safe;
editing already applied SQL is rejected. Existing canonical tables are adopted
without replaying CREATE TABLE; the actual working database was backed up, upgraded
and reseeded twice with all original IDs/fields preserved.

Existing foreign keys, uniqueness/check constraints, endpoint ownership validation
and cascade/restrict behavior passed the isolated PostgreSQL constraint and API
suites. Saved generation replaces stops/budget in a transaction with existing bounded
serialization retries. Four simultaneous requests produce consistent final state;
an injected second-stop failure rolls back to the exact old itinerary/budget.

EXPLAIN ANALYZE used the existing `idx_hotels_dest_price`, `idx_routes_dest` and
`idx_itinerary_stops_trip` indexes for real application queries. No speculative
indexes were added for this small dataset. Query plans/observations are recorded
in [production-api-smoke.json](production-api-smoke.json).

Guarded seeding uses approved CSVs plus sourced manifests/archived routes, keeps
user/trip/stop/budget rows and extra unrelated catalog data, refuses conflicting
operator edits/deletions, and is transactional/idempotent. Reviewed `db:adopt` checks
manifest/live agreement before changing ownership metadata. Direct research import
CLIs cannot bypass the supported production pipeline. Old large SQL seeds are
explicitly historical/unapproved, not production import instructions.

## 5. Testing

Current commands and evidence categories are distinct:

| Command/category | Actual result |
|---|---|
| Backend `npm test` |27 tests passed,0 failed/skipped |
| Frontend `npm test` |80 Trie assertions plus33 reference planner assertions passed |
| Frontend `npm run lint` |TypeScript passed |
| Backend `npm run build` |JavaScript syntax validation passed; no watcher |
| Production frontend build/module audit |Passed;2365 modules;0 runtime reference modules; source maps off |
| Real HTTP auth/destination/trip/admin |17 /106 /41 /101 exchanges passed respectively |
| PostgreSQL constraints |Passed; test transaction rolled back |
| Development Chrome |63 checks passed |
| Built nginx production Chrome |63 checks passed; all eight cities, operator CRUD, reload and logout |
| API-client malformed responses |12 checks passed, including bulk collection/identity/ownership failures |
| Research browser |3 groups passed |
| Built SPA platform |4 groups passed, including recovery/PWA behavior |
| Source/UI/secrets and both package audits |Passed;0 findings/vulnerabilities |
| Production API/security/load/concurrency |9 measured groups passed |
| Production Compose/recovery gates |15 of15 passed |

Root `npm run test:all` runs18 **sequential** gates: backend/security unit,
frontend Trie/planner, types, backend syntax, production build/module audit,
fresh/repeat migration, reseed preservation, HTTP auth/destinations/trips/admin/DB,
development Chrome, API-client browser, research browser, both dependency audits,
and source/UI audit. Its DB is unique and disposable and is removed afterward.
Final run2026-10-01T05:26:42.906Z–05:31:13.223Z passed18/18, with its isolated DB
removed. See [production/full-suite.json](production/full-suite.json).

`npm run test:production` separately runs the actual built images, all-city API and
browser flows, security/rate limits, privileges/logs/CSP, load/concurrency/failure
rollback, TLS config syntax, clean backup restoration, dependency outage recovery
and graceful restart. It passed2026-10-01T05:32:09.285Z–05:35:51.692Z; isolated staging was
stopped and its archive/volume retained. Reports and raw command logs are in
[production/](production/). Shared suite locks prevent interfering evidence writers.

GitHub Actions implements these same two suites sequentially on Node22, isolated
PostgreSQL17 and Docker, with Python/real Chrome, fresh dependency installation and
retained evidence. It uses generated disposable secrets, no developer paths or real
credentials. A remote CI run cannot occur without the owner's actual repository.

## 6. Performance

Final production load sample (Node22/PG17 containers, private loopback staging):

| Endpoint | Requests | Concurrency | Failures | p50 ms | p95 ms | Max ms |
|---|---:|---:|---:|---:|---:|---:|
| Search |40|8|0|5|266|266|
| Destination |40|8|0|13|20|35|
| Persisted trip |40|8|0|16|69|81|
| Authentication |6|3|0|190|190|190|
| Itinerary generation |8|2|0|82|92|92|

All134 bounded load requests succeeded; deliberate500/429/503 probes are separately
expected failures. Four additional simultaneous regenerations passed without
duplicate/corrupt stops. The pool observation showed8 idle application connections,
below the configured10; no exhaustion was observed. Backend memory was52.8MiB before
and73.52MiB after the API/load sample (warmup included), without OOM or restart.
This short sanity test is not an endurance/leak proof or public capacity SLA.

The reproduced catalog fanout was fixed without a UI change. The search index is
real database-derived with a60-second refresh interval; it is not fabricated data.
Load/query evidence does not justify extra indexes or an architectural rewrite.

## 7. Deployment

Production startup/build/container/health/readiness/SPA-refresh gates passed against
the real static nginx build and production-mode API. No public URL was deployed;
the historical Vercel demo is not certification of this application version.

Caddy's HTTPS configuration validates in its actual image; public certificate
issuance, DNS, firewall and external TLS smoke tests remain external. Base staging
HTTP is private loopback and is explicitly **not** public HTTPS readiness. Deployed
CORS must be the exact real HTTPS frontend origin; `/api` is same-origin.

`GET /health` stays200 with PostgreSQL stopped; `/ready` and DB-backed catalog return
sanitized503. After restoring the dependency, readiness and persisted trip reads
recover. SIGTERM logs `server_shutdown_complete`, closes HTTP/pool, then restart
returns readiness200. Backend container is nonroot/read-only; all Compose logs are
bounded and edge sentinel testing confirmed no secret query logging.

Image build context excludes private environments, reports, backups, dependencies,
builds and local caches. No signing key/database password is a build argument.

## 8. Data quality

Runtime catalog remains **8 destinations /25 attractions /11 hotels /12 restaurants
/131 routes**. No numeric quote, coordinate, operating time or admission fact was
invented or lowered to make tests pass. Existing selected hotels remain selected.

Record-wide independently verified child records: **0**. Existing project-approved
child rows:24 (14 attractions,5 hotels,5 restaurants), which is an approval label,
not independent factual certification. Still record-wide unverified child rows:
24 (11 attractions,6 hotels,7 restaurants). Routes131 retain project approval as
modelled evidence, not real-time traffic/fare verification.

The specifically requested five-destination21-record gap was reviewed field by
field.14 name/identity fields were independently confirmed with primary sources;
no entire row was promoted. Other fields are separately classified as dated
tariff/quote, derived, secondary estimate, mapped point, archived only, unknown,
or project/source metadata. Metadata-only review does not reset the historical
source date. See [production-provenance-review.json](production-provenance-review.json)
and five pinned production-provenance manifests. Merged provenance now documents
616 fields including21 field-review objects.

Freshness report tracks233 dynamic/modelled fields,0 overdue at the audit date;
this means review deadlines have not elapsed, **not** that quotes are live.
Room quotes should be refreshed weekly; admissions/meals/hours monthly;
ratings/routes every90days. Seasonal/safari/ferry/museum status must be reconfirmed
before booking. Dated-price advisories use the existing description/warning fields.
Safe update/reconciliation commands are in the runbook.

Directional OSRM evidence exists for121 routes,93 differ between directions.
The planner now uses those differences. Ten approach overrides still lack reverse
evidence and emit an explicit estimate warning. OSRM remains road-network modelling,
not live traffic. Transport fares have no verified storage/source and remain unknown
and excluded, not asserted as known₹0.

Duplicate-name and coordinate-range audits found0 issues. This does not independently
prove every GPS point's precision; mapped compound/approach points stay qualified.
All8 unique inspected official image URLs returned200/image types. Images remain
hotlinked with attribution and existing safe category fallback. No copyrighted
image was downloaded. Official availability does not establish distribution rights;
local JPG rights also cannot be reconstructed from this copy's absent history.

## 9. Backup/recovery

The actual production recovery drill created a tourist,2-day Modhera trip and
persisted itinerary/budget, generated a116558-byte custom PostgreSQL archive,
restored into a clean isolated DB in one transaction, reapplied runtime grants
without schema replay, and started the same application against restored data.
HTTP itinerary and budget matched the pre-backup response **exactly**.

| Restored table | Count |
|---|---:|
| destinations /attractions /hotels /restaurants /routes |8 /25 /11 /12 /131|
| users /trips /itinerary_stops /budgets |1 /1 /10 /1|

Restored budget:₹6486; two persisted days. Actual DB stop/start and graceful API
restart followed successfully. Evidence is [production/container-suite.json](production/container-suite.json).
Working developer DB was separately backed up before its nondestructive upgrade;
original rows/IDs were preserved and two seeds passed (`production-local-upgrade.json`).

Supported commands: `npm --prefix backend run db:backup -- FILE.dump`, and
`db:restore -- FILE.dump` against a **new empty** target using protected owner/backup
credentials. Native PG tools or a specified local PostgreSQL container are supported.
No password is passed in argv; no destructive DROP/clean restore/rollback is supplied.
Archive files must be access-restricted and encrypted for off-host storage.

Actual deployment policy: daily encrypted off-host backups,30 daily/12 monthly
retention, monthly restore drills, managed automated backups and at least7-day PITR
where available. Owner secret manager holds credentials. These deployment jobs are
**not yet enabled**, since no authorized host/storage account exists. The runbook
includes credential placement, restoration, monitoring and non-destructive rollback.

## 10. Remaining limitations

There is no known unresolved repository-level deployment **BLOCKER** or practical
unresolved **IMPORTANT** issue in the tested single-instance topology. All applicable
local gates are green. Public deployment acceptance is conditional on the external
actions below; it is not already running on the internet.

**DOCUMENTED LIMITATION:** record/field uncertainty described above;23 unknown
attraction wheelchair values,2 unknown admission prices, museum reopening and
Modheshwari hours conflict, date-free/single-window planner, unknown fares,10 return
estimates, external image/rights availability, absence of live inventory/traffic.
Incomplete/over-budget results caused by valid user choices or missing facts remain
honest results. Native-device speech/install/share is not certified by headless tests.

**DOCUMENTED LIMITATION:** one API replica until shared abuse limits are configured;
JWT logout has no per-token revocation; search-cache refresh is eventual; local load
sample cannot establish large-scale production capacity. These are declared scope
limits, not hidden claims of fully verified tourism data or unlimited scaling.

**EXTERNAL ACTION REQUIRED:** public host/domain/DNS/TLS/provider DB integration,
secret custody, backup scheduling/storage/alerts, operator identity approval, actual
remote CI, and image-rights owner documentation for the intended distribution.
No paid monitoring platform or imaginary cloud deployment was introduced.

## 11. External actions

1. Choose/provide an owner-controlled Linux/Docker host with persistent encrypted
   storage, or equivalent managed app/static/PostgreSQL services. Grant deployment
   access to that actual account; no cloud/domain/hosting token is present here.
2. Supply the real hostname, point A/AAAA records to the host, permit80/443, and
   keep DB/API ports private. Set `PUBLIC_HOSTNAME` and exact
   `CORS_ORIGIN=https://YOUR_DOMAIN` in a protected environment/secret manager.
3. Generate separate owner/runtime DB passwords and a random96-hex JWT key. Fill
   both DB URLs, with URL-encoded passwords. For managed PostgreSQL create the two
   roles, set `verify-full` and mount any required provider CA; verify real TLS.
4. Follow runbook build → PostgreSQL start → migrations → approved seed → verify
   → app/TLS start. Register the real operator as tourist and owner-approve that
   email with `operator:approve`; never enable public operator registration.
5. Enable daily encrypted off-host backups/retention and managed backups/PITR
   where supported; designate a credential/recovery owner and monthly restore
   drill. Configure host log retention and readiness/5xx/abuse/backup alerts.
6. Run the runbook public HTTPS smoke checklist, including all-city generation,
   admin authorization, refresh, CORS and health. Only then direct public traffic.
7. Use the owner's actual upstream repository workflow to publish these files and
   run the supplied GitHub Actions pipeline. This copy has no `.git`; no history,
   commit or remote was invented. Obtain/retain asset-rights evidence for the
   intended public/commercial use, or approve replacement image references using
   the existing safe fallback behavior and guarded data update process.

## 12. Files changed

Every reviewed modified/new file and its purpose is listed in
[production-files.md](production-files.md), with machine-readable
[production-files.json](production-files.json). This includes runtime/config,
middleware, migration/seed/backup tools, Docker/TLS/CI/test files, safe environment
examples, five field-review manifests, three redacted archives, documentation,
canonical handoff and regenerated evidence/screenshots. Ignored installed modules,
build outputs, ephemeral archives and private environments are not source changes.
The inventory combines source/report hashes and explicit reviewed edits because
the source baseline was captured mid-pass; it is **not** a fabricated Git diff.

## 13. UI preservation

Frontend visual source did not change.88 baseline source/public files excluding
the centralized functional API client match their hashes; zero UI changes, no
component/CSS/Tailwind/layout/token/icon/font/spacing edits. The sole runtime
frontend edit is `src/api/index.ts`: bulk API mapping/validation and honest dated
price/route warning text through existing fields. Vite/build/hosting/package files
are infrastructure. Existing category image fallbacks and original assets remain.

## 14. Final handoff

Canonical [CODEX_HANDOFF.md](../../CODEX_HANDOFF.md) records the final suite results,
deployment verdict, recovery/counts, migrated working DB and exact external actions.
Historical sections are preserved and qualified by the newest records; no second
wrapper progress record or Git history was created. The isolated final staging
project is heritage-prod-f33c1b48 and is stopped; its ignored recovery archive/volume
remain as evidence. Developer private environments and original catalog data remain.

### Completion checklist

| User category | Disposition / evidence |
|---|---|
|1 Preserve product|Hash audit: zero visual changes|
|2 Audit first|Actual source/runtime/report inspection before edits; findings table above|
|3 Production env|Safe examples; validated secrets/origins/TLS/pool/proxies|
|4 Localhost assumptions|Production `/api`; loopback limited to development/private staging|
|5 Security|Auth/roles/ownership, Helmet/CSP/CORS/limits/validation regression gates|
|6 PostgreSQL hardening|Least privileges, bounded pool/TLS/transactions/existing query indexes|
|7 Migrations|Fresh/repeat/checksum/advisory lock; actual existing DB upgrade|
|8 Seed idempotence|Two passes and live user/trip/operator-edit/unrelated-row preservation|
|9 Backup/restore|Actual archive restored, counts and HTTP data matched|
|10 Health/readiness|Real DB stop/start:200 liveness,503 readiness, recovery|
|11 Shutdown|Actual SIGTERM closes server/pool, restart green|
|12 Logging|Safe request IDs/route/status/duration; edge redaction sentinel|
|13 Observability|Named startup/shutdown/DB/5xx/429 events; bounded logs; owner alerts external|
|14 Frontend build|Real nginx assets/browser; no reference catalog/source maps|
|15 SPA routing|nginx fallback and built-browser refresh; missing assets404|
|16 Backend start|One Node22 non-watcher command; syntax/types/build gates|
|17 Containers|Built and executed actual API/nginx/PG images with probes|
|18 Dependencies|Both audits0 vulnerabilities after compatible patch|
|19 Unified tests|Root18-gate suite and separate15-gate production suite; measured banners|
|20 CI|Real isolated-service GitHub Actions file; remote execution external|
|21 Critical coverage|Auth/ownership/planning/budget/admin/API failures/security/rollback|
|22 Load|134 requests,0 failures, metrics/pool/memory recorded|
|23 Concurrency|Four same-trip requests; halfway write rolls back exact old state|
|24 Provenance|21 rows reviewed,14 verified identities,0 whole-row promotions|
|25 Freshness|233 fields/deadlines; safe refresh/reconcile procedure|
|26 Routing|121 directional returns/93 asymmetries;10 honest limitations|
|27 Quality/rights|No duplicates/range errors;8 available image URLs; no downloads/rights claim|
|28 Failures|Invalid JWT/roles/IDs/body/DB/API/partial write controlled tests|
|29 Recovery drill|Seed → user/trip → archive → clean restore → exact HTTP itinerary/budget|
|30 Deployment|Repository/local production containers complete; no authorized public account|
|31 HTTPS|Validated Caddy/HSTS topology; real domain/certificate smoke external|
|32 CORS|Configured exactHTTPS origins, no wildcard; local staging exception only|
|33 Backup policy|Tested tools and daily/retention/PITR policy; host job/storage external|
|34 Rollback|Immutable prior images; additive schema/forward fix; no destructive restore|
|35 README|Development/Production entrypoints and authoritative detailed runbook|
|36 Git safety|No metadata/history/remote; preserved changes, no repository initialized|
|37 Final smoke|Actual built63-check tourist/operator/all8-city flow|
|38 Final gate|18/18 unified and15/15 final production gates green|
|39 Honest behavior|Explicit hotel costs, unknown fares/accessibility/schedules retained|
|40 Remaining blockers|No known fixable repository blocker; external boundaries explicit|
