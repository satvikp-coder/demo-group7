> Historical acceptance report. For the current repository release and freshly rerun
> tests, see [Release Verification](../../docs/RELEASE_VERIFICATION.md). Earlier
> filesystem/Git/deployment statements describe the date of this report.

# Local final readiness

## Local Production Verdict

**LOCALLY FULLY PRODUCTION-READY — DEPLOYMENT ONLY REMAINS**

Final evidence generated 2026-10-01T08:11:56.770Z. This certifies the existing
supported product on the tested single-instance topology, not new product features
or independent certification of every tourism fact. No public deployment occurred.
The earlier readiness report remains historical; current gates are linked below.

## Application

The application is running at **http://localhost:8080**. Use `npm run local:up`.
This builds the production SPA, starts the production Node/Express backend and
PostgreSQL17, generates independent private credentials, applies migrations and
imports the approved catalog into a fresh database. Existing data is preserved on
later starts. Backend/frontend/database are real production images; no Vite dev
server or backend watcher is needed. Only the frontend loopback port is published.

Registration/login/auth-me/session refresh/logout, searches/details/children,
selected-hotel planner generation, persisted itinerary/budget, owned dashboard
retrieval, operator CRUD and tourist/ownership rejection passed. All existing
interactive controls are covered by the full browser suite. Existing account-edit
and password-recovery availability notices remain truthful informational behavior;
this task did not add those product capabilities. Remove deliberately hides session
history while preserving the saved trip; it is not destructive database deletion.

Reproduced fixes: fresh audit temporary-table transaction boundary; same-frame
registration/login/planner submission races; dashboard relying only on browser IDs;
unreliable external image downloads; PDF cross-origin CSS discovery; code-less
PostgreSQL connection timeout incorrectly returning500 during outage; auth restoration
briefly mounting the home view and stranding the protected dashboard transition. All have
focused regression evidence. UI callbacks now reject repeated pending submissions
synchronously. Dashboard discovery uses paginated, parameter-bound PostgreSQL
queries restricted to the authenticated owner. No mocked catalog is runtime truth.

## Eight Cities

Every PASS includes real search, detail/attractions/hotels/restaurants, UI trip
creation/generation, selected-hotel retention, exact API budget comparison and
refresh/persisted retrieval. Totals are known-cost subtotals, not guaranteed quotes.

| Destination | Complete applicable local journey | Tested known subtotal (INR) |
|---|---|---:|
| Ahmedabad | PASS | 10928 |
| Champaner | PASS | 18819 |
| Dwarka | PASS | 5430 |
| Gir National Park | PASS | 12928 |
| Modhera | PASS | 6486 |
| Rann of Kutch | PASS | 11650 |
| Saputara | PASS | 9820 |
| Somnath | PASS | 9144 |

Incomplete real-world coverage remains honest: no hotel substitution, invented
accessibility, calendar availability or transport fare was used to make tests pass.

## Database

Fresh isolated production bootstrap passed migrations plus initial approved import.
Catalog counts: **8 destinations /25 attractions /11 hotels /12 restaurants /131 routes**.
Two additional imports passed; local reseeding twice with persisted verification
records preserved counts and data. Operator edits and unrelated records remain
protected by seed ownership checks. Checksum/advisory-lock migrations are deterministic.
Runtime role has no superuser, role creation, database creation, schema DDL or
migration/seed-ledger access. Pool/timeout/SSL production settings remain enforced.

Final integrity audit passed coordinates, known nonnegative prices, duplicate
relationships, valid route endpoints, child ownership, stop/budget references,
orphans and independently summed persisted budgets. Existing constraint tests pass.

## Persistence

Frontend/backend/PostgreSQL restart retained the exact saved itinerary and budget.
A fresh browser context logged in and discovered trips from PostgreSQL, then used
Open Itinerary and the existing owner share URL. Generation requests were not
reissued by refresh. A real five-second database write lock demonstrated reload
while generation was in flight; the committed result remained retrievable with
exactly one generation request. Four simultaneous regenerations and an injected
halfway write failure passed the production transaction/rollback regressions.

## Backup

The final local custom archive **backups/local-final-1790841323657.dump** restored into new isolated
database **local_restore_b6f55717004c49d38695712705cb2ea6**. Approved catalog verification and runtime grants
passed; restored stop snapshots and budgets matched the source exactly. Recovery
counts: user 1, trips 10, stops 102, budgets
10, plus the full 8/25/11/12/131 catalog. The active application DB
was preserved. Exact-ID fixture cleanup passed in active and restored databases;
the live catalog remains intact with no verification users/trips left.

```sh
npm run local:backup -- backups/my-local-backup.dump
npm run local:restore -- backups/my-local-backup.dump local_restore_review
```

Archive commands use container PostgreSQL tools and private environment credentials,
never password arguments. Restore refuses an existing/nonempty target. No automated
local or cloud backup scheduler is claimed. The separate production recovery drill
also started the actual API against its restored database and compared persisted
trip/budget HTTP responses exactly.

## Tests

| Final gate/category | Actual result |
|---|---|
| `npm run test:all:local` → unified `test:all` | 18/18 gates PASS, 2026-10-01T08:03:09.885Z |
| Backend unit/security | 28 tests PASS |
| Frontend Trie / reference planner | 80 / 33 measured assertions PASS |
| Owned-image frontend regression | 1 test PASS |
| Auth / destinations / trips / admin HTTP | 17 / 106 / 45 / 101 exchanges PASS |
| DB constraints, fresh/repeated migrations, seed preservation | PASS |
| Full browser controls in development and built SPA | 63 groups in each final run PASS |
| API-client malformed/error/session regressions | 12 checks PASS |
| Research / real production platform | 3 /4 groups PASS |
| Types, syntax, production build, source/secrets, package audits | PASS |
| `npm run test:production` | 16/16 gates PASS, 2026-10-01T08:09:55.058Z |
| `npm run test:local` | 4/4 gates; 11 successful-browser groups; all8 cities PASS, 2026-10-01T07:55:36.543Z |

Unified categories remain separate: browser scripts are E2E, not unit tests.
`test:all` includes backend/security unit, frontend Trie/image/planner tests,
types/syntax/build/source audit, disposable fresh/repeat migrations and guarded
reseed, auth/destination/trip/admin/DB HTTP tests, full browser controls, API-client
and research regressions, both dependency audits and visual/secrets audit.
Container and persistent-local drills are the additional explicitly named workflows.
The documented local full-suite adapter needs no manually configured developer DB;
it removes its temporary loopback database port afterward. Suites run sequentially.

## Security

Bcrypt password hashing, strong expiring HS256 JWT configuration, invalid/expired/
forged rejection, current database role checks, trip ownership, restrictive exact
CORS, security headers/CSP, bounded body/field/pagination input, malformed JSON
handling, bound SQL, sanitized failures and actual 429 rate limiting passed.
Production registration cannot self-assign operator role. Private env files are
ignored and excluded from image contexts. Source audit: 0
secret findings, 0 visual changes. Both package audits
report zero vulnerabilities. Logs exclude credentials/bodies/tokens and rotate.
Keep the documented single API instance; shared limiter state must be addressed
before introducing horizontal scaling, which is outside this tested topology.

## Performance

Local production-container sanity load: 134 requests,
zero unexpected failures. Latencies below are milliseconds and machine-dependent.

| Path | Requests | Concurrency | Failures | p50 /p95 /max ms |
|---|---:|---:|---:|---|
| search | 40 | 8 | 0 | 7 / 287 / 288 |
| destination | 40 | 8 | 0 | 40 / 270 / 271 |
| trip-retrieval | 40 | 8 | 0 | 67 / 218 / 227 |
| authentication | 6 | 3 | 0 | 364 / 369 / 369 |
| itinerary-generation | 8 | 2 | 0 | 156 / 232 / 232 |

Backend container memory: 57.2MiB / 3.825GiB before → 72.63MiB / 3.825GiB
after; no crash or pool exhaustion. 8
observed database connections; runtime/maintenance pool limits remain10/2. This is a local sanity
measurement, not a public capacity SLA.

## Runtime Errors

Successful local browser flow: **0 page errors, 0 console errors/warnings, 0 failed requests,
0 HTTP error responses**. Real service workers were enabled. Export/font and asset
failures were fixed without disabling error logging. Deliberate negative regression
requests (401/403/404/429), injected rollback/503 failures and Playwright-blocked
service-worker notices are expected test evidence, distinct from normal operation.
Database stop/start preserved 200 liveness, produced truthful 503 readiness/API
failure, and recovered. Clean production startup and graceful shutdown passed.
No unresolved critical frontend/backend runtime error is known.

## Data Limitations

No factual status was artificially promoted in this pass. Whole-record independent
verified child count remains0; project-approved child rows24; still-unverified
children24 (11 attractions /6 hotels /7 restaurants). Primary identity review
supports14 fields across the previous reviewed records, with field-level nuance.
Historical hotel/meal/admission quotes and ratings require refresh and confirmation;
23 attraction accessibility values, two admission prices and some operating/calendar
facts remain unknown. Safari/ferry/seasonal/museum/split-hour uncertainties remain
explicit. OSRM estimates are modelled, not live traffic;121 routes have reverse
evidence,93 are asymmetric,10 have documented reverse fallback. Transport fares
are unknown/excluded, not verified zero. External imagery URLs remain in provenance;
existing owned fallback graphics avoid unlicensed/unreliable hotlinks. No new
tourism data, copyrighted downloads or fabricated facts were added.

## Deployment Remaining

Only external public deployment/hosting setup remains for this tested product:

1. Choose/provision the hosting account and a persistent production PostgreSQL17
   service (or the documented host/container topology).
2. Put independent production runtime/maintenance DB credentials and JWT key in
   that provider's protected environment; configure verified DB TLS when hosted.
3. Assign public frontend/API URLs or same-origin proxy; set the exact HTTPS CORS
   origin and build-time API setting using the runbook.
4. Connect domain/DNS and configure platform/reverse-proxy public HTTPS termination.
5. Enable provider-operated encrypted/off-host backups, retention/PITR and monitoring
   alerts; designate the credential/recovery owner. Run a public HTTPS smoke/recovery
   check after that separate deployment. No provider backup or public TLS is claimed.

## Files and Handoff

[local-final-files.json](local-final-files.json) lists source changes and regenerated
evidence with reasons/hashes. [LOCAL_PRODUCTION.md](../../docs/LOCAL_PRODUCTION.md)
is the complete fresh setup path; [PRODUCTION.md](../../docs/PRODUCTION.md) remains
the deployment/rollback/backup/monitoring runbook. Canonical
[CODEX_HANDOFF.md](../../CODEX_HANDOFF.md) contains current continuity. No Git metadata
or remote exists here; no history/commit/public deployment was invented.

Frontend functional source changed only to fix existing behavior. Layout, colors,
fonts, icons, spacing, Tailwind/Stepwell tokens, JSX structures and controls were
preserved; exact reverse-patch hashes and unchanged profile rendering verify this.

## Final Statement

THE APPLICATION IS FULLY FUNCTIONAL AND PRODUCTION-READY LOCALLY. NO KNOWN LOCAL CODE,
DATABASE, SECURITY, TESTING, OR REPRODUCIBILITY BLOCKER REMAINS. THE ONLY REMAINING STEP
IS EXTERNAL PUBLIC DEPLOYMENT AND HOSTING CONFIGURATION.

NO NEW PRODUCT FEATURES WERE ADDED.

NO FRONTEND VISUAL DESIGN WAS INTENTIONALLY MODIFIED.

NO FAKE OR FABRICATED TOURISM DATA WAS ADDED.
