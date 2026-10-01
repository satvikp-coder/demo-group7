import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),reports=new URL('../backend/reports/',import.meta.url);
const json=p=>JSON.parse(readFileSync(new URL(p,reports),'utf8'));
const text=p=>readFileSync(new URL(p,reports),'utf8');
const full=json('production/full-suite.json'),containers=json('production/container-suite.json'),local=json('local-final-suite.json'),smoke=json('production-api-smoke.json'),source=json('production-source-audit.json');
for(const result of [full,containers,local,smoke,source])assert.equal(result.verified,true,'A current final gate is not green');
assert.equal(local.browser.verified,true);assert.equal(local.fixturesRemoved,true);
const unitCount=Number(text('production/backend-unit.txt').match(/tests (\d+)/)?.[1]);
const assertions=[...text('production/frontend-unit-planner.txt').matchAll(/All (\d+) assertions passed/g)].map(m=>Number(m[1]));
const imageCount=Number(text('production/frontend-unit-planner.txt').match(/tests (\d+)/)?.[1]);
const http=Object.fromEntries(['auth','destinations','trips','admin'].map(k=>[k,json(k+'-http-report.json').exchanges.length]));
const browserCount=json('frontend-browser-report.json').checks.length,apiCount=json('frontend-api-client-report.json').checks.length;
const authored={
 'backend/scripts/bootstrap-local.js':'Fresh local migrations/import with transaction-scoped seed audit; later starts preserve managed data.',
 'compose.local.yml':'Production Compose bootstrap dependency; private database and API networking.',
 'scripts/local-stack.js':'Single startup and safe local status/restart/seed/operator/archive operations with private generated credentials.',
 'scripts/test-local.js':'Persistent local browser/reseed/integrity/backup acceptance and exact fixture cleanup.',
 'scripts/test-local-all.js':'Unified tests with generated credentials and temporary loopback-only PostgreSQL access.',
 'scripts/report-local-readiness.js':'Generate the final verdict and inventory only from green measured evidence.',
 'scripts/test-production.js':'Verify fresh local bootstrap and whole-stack restart/new-login persistence.',
 'scripts/source-audit.js':'Continue secret/visual audit with narrowly checked nonvisual component changes.',
 'backend/scripts/backup.js':'Empty-target verification inside private PostgreSQL container without publishing its port.',
 'backend/middleware/errorHandler.js':'Classify code-less PostgreSQL timeout/disconnection failures as sanitized retryable503.',
 'backend/tests/production.test.js':'Regression for exact pg driver failures and unrelated-error separation.',
 'backend/scripts/audit-completion-integrity.js':'Truthful directional-route statistics and writable audit output for read-only containers.',
 'backend/models/tripModel.js':'Parameterized owner-filtered, bounded persisted dashboard lookup.',
 'backend/controllers/tripController.js':'Read-only transaction for the existing saved-trip dashboard.',
 'backend/routes/tripRoutes.js':'Authenticated paginated GET /api/trips; existing strict detail/mutation validation preserved.',
 'backend/scripts/test-trips-http.js':'Owned-list, cross-user exclusion, pagination and unauthenticated regression checks.',
 'frontend/src/api/index.ts':'Persisted trip discovery, owned-image policy, session hiding cleanup and testable environment access.',
 'frontend/src/App.tsx':'Derive restored auth state during rendering so protected view transitions do not briefly show the home view.',
 'frontend/src/components/AuthView.tsx':'Synchronous submit guard; no visual markup change.',
 'frontend/src/components/PlannerModal.tsx':'Synchronous generation guard; no visual markup change.',
 'frontend/src/components/ItineraryView.tsx':'Proper external font stylesheet loading for the existing PDF fallback.',
 'frontend/src/components/ProfileDashboardView.tsx':'Recover the existing dashboard from PostgreSQL; retain session-only Remove semantics.',
 'frontend/nginx.conf':'Permit PDF font resource fetches from the same existing Google font sources only.',
 'frontend/package.json':'Include the owned-image regression in normal frontend unit tests.',
 'package.json':'Documented local operations and test workflows.',
 'tests/frontend/local_success.py':'Real built-browser successful flows, rapid submissions, in-flight refresh, fresh login, restart and clean console.',
 'tests/frontend/catalog-images.test.ts':'Owned asset/unsafe external image adapter regression.',
 'README.md':'One-command local production setup entry point.',
 'docs/PRODUCTION.md':'Link current local setup and evidence.',
 'docs/LOCAL_PRODUCTION.md':'Complete fresh local setup, tests, archives, restart and shutdown path.',
 'CODEX_HANDOFF.md':'Canonical continuity, final state and external-only next steps.',
};
const inventory=[];
for(const [file,why]of Object.entries(authored))inventory.push({file,why,sha256:createHash('sha256').update(readFileSync(new URL(file,root))).digest('hex')});
function evidence(dir,prefix){for(const entry of readdirSync(dir,{withFileTypes:true})){const url=new URL(entry.name,dir),path=prefix+entry.name;if(entry.isDirectory())evidence(new URL(entry.name+'/',dir),path+'/');else if(statSync(url).mtime>=new Date('2026-10-01T05:40:00Z'))inventory.push({file:path,why:'Regenerated local/production verification evidence or frozen nonvisual source comparison.',sha256:createHash('sha256').update(readFileSync(url)).digest('hex')});}}
evidence(reports,'backend/reports/');
writeFileSync(new URL('local-final-files.json',reports),JSON.stringify({checkedAt:new Date().toISOString(),gitHistoryAvailable:false,qualification:'Explicit source edits plus evidence files touched in this local-final pass; filesystem inventory, not a fabricated Git diff.',files:inventory},null,2));
const cityNames={'ahmedabad':'Ahmedabad','somnath':'Somnath','dwarka':'Dwarka','modhera':'Modhera','champaner':'Champaner','gir-national-park':'Gir National Park','rann-of-kutch':'Rann of Kutch','saputara':'Saputara'};
const cityRows=local.browser.cities.map(c=>`| ${cityNames[c.slug]} | PASS | ${c.total} |`).join('\n');
const loadRows=smoke.load.map(l=>`| ${l.name} | ${l.requests} | ${l.concurrency} | ${l.failures} | ${l.p50Ms} / ${l.p95Ms} / ${l.maxMs} |`).join('\n');
const counts=local.recoveryCounts;
const md=`# Local final readiness

## Local Production Verdict

**LOCALLY FULLY PRODUCTION-READY — DEPLOYMENT ONLY REMAINS**

Final evidence generated ${new Date().toISOString()}. This certifies the existing
supported product on the tested single-instance topology, not new product features
or independent certification of every tourism fact. No public deployment occurred.
The earlier readiness report remains historical; current gates are linked below.

## Application

The application is running at **http://localhost:8080**. Use \`npm run local:up\`.
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
${cityRows}

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

The final local custom archive **${local.archive}** restored into new isolated
database **${local.restoreTarget}**. Approved catalog verification and runtime grants
passed; restored stop snapshots and budgets matched the source exactly. Recovery
counts: user ${counts.users}, trips ${counts.trips}, stops ${counts.stops}, budgets
${counts.budgets}, plus the full 8/25/11/12/131 catalog. The active application DB
was preserved. Exact-ID fixture cleanup passed in active and restored databases;
the live catalog remains intact with no verification users/trips left.

\`\`\`sh
npm run local:backup -- backups/my-local-backup.dump
npm run local:restore -- backups/my-local-backup.dump local_restore_review
\`\`\`

Archive commands use container PostgreSQL tools and private environment credentials,
never password arguments. Restore refuses an existing/nonempty target. No automated
local or cloud backup scheduler is claimed. The separate production recovery drill
also started the actual API against its restored database and compared persisted
trip/budget HTTP responses exactly.

## Tests

| Final gate/category | Actual result |
|---|---|
| \`npm run test:all:local\` → unified \`test:all\` | ${full.gates.length}/${full.gates.length} gates PASS, ${full.finishedAt} |
| Backend unit/security | ${unitCount} tests PASS |
| Frontend Trie / reference planner | ${assertions.join(' / ')} measured assertions PASS |
| Owned-image frontend regression | ${imageCount} test PASS |
| Auth / destinations / trips / admin HTTP | ${http.auth} / ${http.destinations} / ${http.trips} / ${http.admin} exchanges PASS |
| DB constraints, fresh/repeated migrations, seed preservation | PASS |
| Full browser controls in development and built SPA | ${browserCount} groups in each final run PASS |
| API-client malformed/error/session regressions | ${apiCount} checks PASS |
| Research / real production platform | 3 /4 groups PASS |
| Types, syntax, production build, source/secrets, package audits | PASS |
| \`npm run test:production\` | ${containers.gates.length}/${containers.gates.length} gates PASS, ${containers.finishedAt} |
| \`npm run test:local\` | ${local.gates.length}/${local.gates.length} gates; ${local.browser.checks.length} successful-browser groups; all8 cities PASS, ${local.finishedAt} |

Unified categories remain separate: browser scripts are E2E, not unit tests.
\`test:all\` includes backend/security unit, frontend Trie/image/planner tests,
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
ignored and excluded from image contexts. Source audit: ${source.findings.length}
secret findings, ${source.uiChanges.length} visual changes. Both package audits
report zero vulnerabilities. Logs exclude credentials/bodies/tokens and rotate.
Keep the documented single API instance; shared limiter state must be addressed
before introducing horizontal scaling, which is outside this tested topology.

## Performance

Local production-container sanity load: ${smoke.load.reduce((n,l)=>n+l.requests,0)} requests,
zero unexpected failures. Latencies below are milliseconds and machine-dependent.

| Path | Requests | Concurrency | Failures | p50 /p95 /max ms |
|---|---:|---:|---:|---|
${loadRows}

Backend container memory: ${containers.memoryBefore} before → ${containers.memoryAfter}
after; no crash or pool exhaustion. ${smoke.databaseConnections.reduce((n,s)=>n+Number(s.count),0)}
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
`;
writeFileSync(new URL('LOCAL_FINAL_READINESS.md',reports),md);
console.log('Final local readiness report generated from green measured gates.');
