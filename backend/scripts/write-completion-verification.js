// Documentation only: use actual report evidence; never modify experiment inputs/data.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'../..'),dir=path.join(root,'backend/reports');
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8').replace(/^\uFEFF/,''));
const browser=read('frontend-browser-report.json'),dev=read('completion-development-browser-report.json'),client=read('frontend-api-client-report.json');
const integrity=read('completion-integrity.json'),active=read('completion-active-trip-integrity.json'),clean=read('clean-startup-report.json'),preserve=read('research-preservation.json'),visual=read('completion-frontend-preservation.json');
const platform=read('completion-platform-report.json'),research=read('completion-research-browser-report.json'),display=read('completion-display-report.json');
const authControls=read('completion-auth-controls.json'),idle=read('completion-idle-report.json');
const provenance=read('data-provenance.json'),gaps=read('data-completion-checklist.json');
const http=Object.fromEntries(['auth','destinations','trips','admin'].map(n=>[n,read(n+'-http-report.json')]));
for(const r of [browser,dev,client,integrity,clean,preserve,visual,platform,research,display,authControls,idle,...Object.values(http)])assert.equal(r.verified,true,'An evidence report is not verified');
assert.ok(browser.cleanupCompleted&&browser.originalCatalogPreserved);
const exp=JSON.parse(fs.readFileSync(path.join(root,'docs/research/experiment_results.json'),'utf8'));
const comparison=JSON.parse(fs.readFileSync(path.join(root,'docs/research/experiment_comparison.json'),'utf8'));
const cityNames={ahmedabad:'Ahmedabad',somnath:'Somnath',dwarka:'Dwarka',modhera:'Modhera',champaner:'Champaner','gir-national-park':'Gir National Park','rann-of-kutch':'Rann of Kutch',saputara:'Saputara'};
const cityLimits={ahmedabad:'Six unknown attraction access statuses.',somnath:'Three unknown access statuses; six missing legacy dining route pairs.',dwarka:'One meal skipped in the two-day check; seven legacy dining pairs; optional ferry information unknown.',modhera:'Two unknown access statuses; conflicting Modheshwari hours.',champaner:'Kevada excluded because its entry price is unknown; daylight hours lack a fixed clock interval.','gir-national-park':'Calendar, reserved safari slots and vehicle wheelchair access are not certified.','rann-of-kutch':'Four meals skipped; co-located hotel/dining zero-distance relationship unresolved.',saputara:'Museum excluded because current ticket/reopening information is unknown.'};
const cityRows=Object.entries(cityNames).map(([slug,name])=>{
 const c=read('data-city-'+slug+'.json'),g=gaps.cities.find(r=>r.slug===slug);assert.equal(c.apiPassed,true);
 return `| ${name} | PASS | ${c.counts.attractions}/${c.counts.hotels}/${c.counts.restaurants}/${g.counts.routes} | ${c.attractionVisits} | ${c.summary.status}; ${c.budget.total} | ${cityLimits[slug]} |`;
}).join('\n');
const overRows=exp.filter(r=>!r.budgetCompliant).map(r=>`| ${r.experimentId}; ${cityNames[r.cityId]} | ${r.budget} | ${r.cityId==='somnath'?'Premier Somnath':'Hotel Darshan Palace Dwarka'} | ${r.cityId==='somnath'?3972:2460} | ${r.days} | ${r.totalCost} | ${r.totalCost-r.budget} | A: correct selected-hotel constraint |`).join('\n');
assert.equal(exp.filter(r=>!r.budgetCompliant).length,10);
const styles=visual.styleChecks.reduce((n,r)=>n+r.attributesChecked,0);
const stamp=new Date().toISOString();
const body=`# Final project verification — ${stamp}

The existing supported tourist and operator flows are stabilized and verified on
the local Express/PostgreSQL application in development and production browsers.
Missing backend capabilities and incomplete tourism facts remain explicit. This
report supersedes the old three-city/no-route verification, preserved as
FINAL_VERIFICATION.previous-codex2.md. Passing local checks does not certify
production deployment or live booking availability.

Recovery included wrapper/canonical AGENTS and handoffs, the data-completion and
prior verification reports, provenance, current source, and attempted git
status/diff. Neither workspace level has Git metadata; no reset or repository
initialization was performed. Existing codex1/codex2 data, UUIDs, tests and history
were preserved. This audit used file hashes and captured source comparisons.

## A. Existing Feature Audit

The source inventory identifies **${visual.controlCount} control declarations**,
including conditional/mobile variants, with file, line and handler text in
[completion-frontend-preservation.json](completion-frontend-preservation.json).
The following groups cover actual mounted features. Passing groups do not claim
every possible input, native operating-system action or missing capability works.
API failures, deliberate 503 responses and empty collections are tested without
mock tourism successes.

| Existing feature / control group | Handler / source | Backend dependency | Status and observed behavior |
|---|---|---|---|
| Home hero planning and browsing | Hero callbacks in App | Real catalog, planner | WORKING: existing actions open planner or discovery. |
| Desktop brand/navigation/account/logout | Navbar, App.handleNavigateSection | Auth me; real views | WORKING: navigation, login/session refresh, sign-out. |
| Mobile drawer and language controls | Navbar.handleNavClick / LanguageContext | Local translations; API names | WORKING: open/close/navigation and English/Hindi toggles; missing translations use existing fallback. |
| Every footer circuit/lodging/directory/planner link | Footer.handleLinkToDestination/Explore/Hotels | Real detail/catalog/planner | WORKING: tested links. Fee/guild labels lead to discovery; dedicated fee/guild APIs do not exist. |
| Register, roles, confirmation, login, guest navigation, visibility | AuthView handlers / api.register/login | auth endpoints | WORKING: valid/invalid login, registration, duplicate and validation rejection, refresh/logout; auth-control browser probe verifies modes/roles/visibility/guest actions. |
| Forgot password and dismiss recovery notice | AuthView recovery state | Reset/email endpoints absent | PARTIALLY WORKING: existing button opens honest Password Reset Unavailable notice and dismissal works; password reset is not implemented. |
| Search, clear/reset, empty results and retry | ExploreView / useApi / api.search | destinations/search | WORKING: eight cities, debounce, stale-data clearing and visible failures. |
| Every discovery category, five sorts, access and demand filters | ExploreView filtering/sort handlers | Actual catalog fields | FIXED AND VERIFIED: five missing sourced categories filled; unknown demand/access does not become a positive match. |
| Voice start/stop and error announcement | ExploreView.toggleListening | Browser Web Speech | PARTIALLY WORKING: real denied/network error exits listening; successful microphone transcription not certified headlessly. |
| Destination details, children, coordinates, filters, back | DestinationDetailView / api.destination | detail plus three child collections | FIXED AND VERIFIED: all eight cities, correct relationships; unknown ratings use available-label formatter. |
| Add/remove destination from trip list; custom planner | App.handleAddToTrip/handleOpenPlannerWithSite | Existing single-city planner | WORKING: toggles and clicked-city selection. Trip list is session UI, not a multi-city routing feature. |
| Hotel selection and ranked stays, all three sorts, overview | HotelsView / preferred stay callbacks | city hotels sort=price/rating/value | FIXED AND VERIFIED: actual rows, chosen hotel retained; unknown score label corrected. Selecting accommodation does not book tickets. |
| Restaurant listings and priced meal stops | DestinationDetailView / backend meal scheduling | child restaurants and accepted routes | PARTIALLY WORKING: real city-specific restaurants; unknown prices and missing route relationships are excluded. No separate restaurant reservation/search page exists. |
| Planner city, duration +/−, hotel, time, budget, access | PlannerModal setters / handleGenerate | POST trips and generate-itinerary | WORKING: actual persisted trips, parameters honored; empty city cannot fabricate hotels or routes. |
| Planner steps/back/review, close/Escape | PlannerModal step and close handlers | Catalog only until Generate | WORKING: navigation and existing modal controls tested. |
| Comparison, day expand/collapse, stats, mobile tabs, Use this plan | StrategyComparisonModal.toggleDayPlan / onSelectStrategy | Three actual generated trips | FIXED AND VERIFIED: first Collapse click works; chosen server plan survives refresh. Unknown measured runtime remains unavailable. |
| Persisted itinerary/timeline/map/budget/back | ItineraryView / api.trip | Owner-protected GET trip | WORKING: real references/times/costs and refresh; invalid trip displays actual 404. |
| Algorithm visualizer selectors/step/reset/play/pause | DijkstraVisualizer | Persisted trip summary legs | FIXED AND VERIFIED: real legs, interactive controls, repeated legs have unique React keys. Visualizer is educational; saved planner decisions are unchanged. |
| What If budget/days/reset/Save | ItineraryView + WhatIfPanel | New persisted trip/generation on Save | PARTIALLY WORKING: reset and Save verified. Live preview API absent; no simulated preview is substituted. |
| Share route/copy/read-only recovery | ShareItineraryModal, App routing | Same owner-protected trip | FIXED AND VERIFIED: copy/rejection visible, shared-link navigation stays subscribed, owned profile trip becomes editable. |
| Public recipient sharing/native OS share | ShareItineraryModal | No public share-token endpoint | PARTIALLY WORKING: URL/copy works for owner; another account remains rejected. Native share sheet not certified headlessly. |
| PDF download and print | ItineraryView, BudgetPlannerView | Current persisted view | WORKING: actual PDF download and print invocation. External stylesheet read warning can occur during PDF fallback; download succeeds. |
| Budget ledger/totals/remaining/over-budget/refresh | BudgetPlannerView / api.budget | Persisted stop snapshots | FIXED AND VERIFIED: actual backend sums; unknown transport explicitly excluded. |
| Budget target/three savings buttons/share | Existing ledger handlers | No budget-edit or discount endpoint | PARTIALLY WORKING: controls explain using planner, preserve totals; denied sharing visible. No fabricated savings applied. |
| Profile saved routes/Open/Remove/role | ProfileDashboardView | Session IDs; owner GET trips | FIXED AND VERIFIED: Open works after sharing; Remove deletes only session history, persisted trip stays. Cross-session trip-list API absent. |
| Profile account edits | handleSettingsSubmit | Account-update API absent | NOT WORKING as persistence: explicitly reports no changes saved. No fake success or replacement feature added. |
| Operator property submission and listing Edit/Admin panel | Profile callbacks + Admin query handling | Existing operator CRUD | FIXED AND VERIFIED: formerly fake alerts now open the actual create/selected-hotel edit drawer. |
| Admin four tabs, read/create/edit/delete, forms/cancel/confirm | AdminDashboardView | Four protected admin resource APIs | FIXED AND VERIFIED: complete UI/API/SQL CRUD, validation/relational rejection, tourist denied; blank hotel/restaurant prices no longer become zero. |
| Not-found and invalid-share recovery buttons | NotFoundView / InvalidSharedLinkView | Existing routes/planner | WORKING: every recovery action exercised. |
| PWA install prompt/dismissal | App timer + PwaInstallPrompt | Browser installation capability | FIXED AND VERIFIED dismissal: a pending timer no longer reopens after dismissal. Native acceptance not certified. Honest shell/connectivity text retained. |
| Offline shell/banner/online recovery | Service worker + OfflineBanner | API still requires connectivity | PARTIALLY WORKING: cached shell reloads; failed API shows error/no catalog; online catalog recovers. Saved trip/budget reload is not full offline functionality. |
| Research run/copy/Back (development only) | ResearchView | 22 real server generations | FIXED AND VERIFIED: 22 persisted UI rows, copy success/denial, Back; intentionally unavailable in production. |
| Nearby attraction/hotel cards | DestinationDetailView callbacks | Nearby relation/API wiring | PARTIALLY WORKING/data unavailable: relation tables are empty and current API adapter supplies empty nearby arrays, so related controls are not rendered. No nearby records/API capability invented. |

## B. City-by-City Results

Each city's real browser search → detail → hotel → planner → generation → reload →
budget flow passed. Coordinates and child/stop IDs were checked against real rows.
Below are independent **two-day, INR20000 city API checks**, not counts borrowed
from the one-day browser or original experiment configurations.

| City | Browser/API flow | Attractions/hotels/restaurants/routes | Visits | Generator status; known-cost total INR | Remaining limitation |
|---|---|---|---:|---|---|
${cityRows}

“scheduled” means the existing generator scheduled its eligible attractions and
meals. It does not mean excluded attractions, fares, accessibility or live booking
conditions are known. All city tourism datasets remain PARTIALLY COMPLETE.

## C. Itinerary and Budget Results

Latest unchanged 22-scenario run: **22 generated, 0 request failures, 12
budget-compliant, 48 attraction visits, INR118654 total known cost**. These match
the immediately preceding verified baseline. The comparison JSON also preserves
older client and early-backend baselines; those are not the current comparison.

All ten previously identified hotel-budget cases were inspected individually:

| Scenario | Budget INR | Selected hotel | Dated nightly quote INR | Nights | Accommodation/total INR | Shortfall INR | Classification |
|---|---:|---|---:|---:|---:|---:|---|
${overRows}

No hotel-price error or budget algorithm bug was found in these ten cases. The
existing contract reserves one lodging night per trip day and does not replace a
user-selected hotel. Other scheduled cost categories are zero here because no
visits/meals fit the negative remaining budget; this does not verify free services.
No route travel is scheduled for these hotel-only plans. Somnath has no other
catalog hotel; Dwarka's other catalog hotel is Toran Dwarka at INR2900, higher than
Darshan Palace INR2460. Dated representative rates are not live future quotes.
Budgets and original experiment hotels/inputs were not changed.

There are **9 scheduled and 13 incomplete summaries** in the latest experiment:
the ten hotel failures plus three affordable two-day Dwarka strategy variants
with a skipped meal. Thus 12 budget-compliant does not imply 12 fully scheduled.
The skipped-meal warning is retained; success is not forced. Calendar closures,
split temple intervals and reserved safari departures remain outside this
date-free single-interval planner's existing contract.

The retained greedy scorer uses an internal 4.5 priority fallback when an
attraction rating is absent. This is an existing scoring assumption, not a sourced
rating: database values stay null and the UI displays Not available. The audit
does not certify empirical ranking quality for unrated attractions or replace
the existing scoring algorithm.

Budget calculations were independently checked using stop sums and database
categories: hotel nightly snapshot × nights, selected admission prices, scheduled
meal prices, total and budget-minus-total. Transit fares have no schema field and
are explicitly excluded when unknown. [completion-active-trip-integrity.json](completion-active-trip-integrity.json)
also verified ${active.checks.persistedReferencesAndBudgetSums.stopsChecked} actual
persisted stops and ${active.checks.persistedReferencesAndBudgetSums.budgetsChecked}
budget rows before fixture cleanup. Historical trip prices are snapshots; later
catalog updates do not rewrite already generated costs.

## D. Bugs Fixed

| Affected file(s) | Root cause and correction | Reproduction / verification |
|---|---|---|
| backend/models/tripModel.js | Repeatable-read serialization failures during concurrent regeneration surfaced as 500. Retry whole rolled-back write transaction on 40001/40P01, bounded to five attempts. | completion-concurrency-before.json: three of four failed; latest trips-http-report.json: four succeed, same budget, no duplicate stops. |
| frontend/src/App.tsx | Shared-link branch returned before route subscription; production navigation changed URL without view. Subscribe first and always unsubscribe. | completion-production-before.json; production shared-link navigation check passes. |
| frontend/src/App.tsx | Shared read-only flag leaked into owned profile Open. Reset flag on owned Open; backend still enforces ownership. | completion-readonly-before.json; owned What If restored through in-app navigation. |
| frontend/src/App.tsx | Already pending install timer could reopen after dismissal. Recheck dismissal at timer firing. | completion-pwa-dismiss-before.json; delayed absence and later planner controls pass. |
| ProfileDashboardView.tsx, AdminDashboardView.tsx, App.tsx | Property submission/Edit used pretend-submit alerts. Open existing create/edit drawers via validated catalog query selection. | Actual operator browser profile controls and subsequent CRUD pass. |
| AdminDashboardView.tsx | Empty required prices converted through Number('') to zero. Preserve input text and reject blank/null using existing error area; explicit zero remains valid. | completion-blank-price-before.json; both blank-price browser regressions preserve SQL costs. |
| ShareItineraryModal.tsx, BudgetPlannerView.tsx, ResearchView.tsx | Clipboard promises were not consistently awaited/handled and failures could look successful. Await and show existing alert/error mechanisms. | Route denial/success, ledger denial and research success/denial checks pass; no unhandled rejection. |
| ItineraryView.tsx, BudgetPlannerView.tsx | Unknown excluded transit appeared as Included/zero-price transport. Use backend transport_cost_known flag for unknown label. | All-city budget flow and unknown-label assertion pass; no stored totals changed. |
| HotelsView.tsx, DestinationDetailView.tsx | Unknown numeric ratings/value score rendered as NaN. Use existing displayNumber formatter. | completion-display-before.json; current completion-display-report.json four city probes pass. |
| StrategyComparisonModal.tsx | Display default was expanded but toggle treated missing state as collapsed, so first Collapse did nothing. Toggle the same true default. | completion-comparison-before.json; all three first-collapse/expand/mobile/use controls pass. |
| DijkstraVisualizer.tsx | Repeated legitimate itinerary legs shared React SVG keys. Include stable traversal index without changing graph/render styling. | Development console previously logged 18 duplicate-key warnings; final browser asserts none. |
| frontend/src/api/index.ts | Arrays of malformed catalog rows/details could map to blank destination records. Validate nonempty id/name at the API boundary. | completion-api-client-before.json fails two cases; latest 9/9 pass. |
| Footer.tsx, HotelsView.tsx, PwaInstallPrompt.tsx, OfflineBanner.tsx | Static labels implied live guild synchronization, hotel admission permits and full offline loading unsupported by the backend. Correct existing text only. | Source/contracts inspected, actual offline shell/API failure and hotel UI verified; no new component. |
| data/research manifests for Ahmedabad/Somnath/Dwarka/Modhera/Champaner | Primary category metadata missing, so real destinations disappeared from existing category filters. Fill five sourced fields using existing seed/provenance path. | All discovery category checks, seed preservation and counts pass. |

## E. Data and Routes

Counts remain **8 destinations /25 attractions /11 hotels /12 restaurants /131
routes**. Provenance records ${provenance.fields.length} merged field differences
and ${provenance.routes.length} routes; this session adds five category fields,
not new route facts or altered hotel prices. All 131 routes have valid same-city
endpoints/FKs, unique undirected mode pairs, positive distances/durations,
road mode, source URL/date/hash and no simulated CSV acceptance. The actual
tripPlanner consumes DB routes for direct legs and its retained Dijkstra fallback.

Direction consistency is checked structurally; reverse-direction road times are
reused by the undirected planner, not independently verified. The existing strict
positive-distance rule leaves one co-located Rann hotel/restaurant relationship
unrepresented. Six Somnath/seven Dwarka pairs depend on unidentified legacy dining
records. No straight-line substitutes were added. Route snapshots do not certify
live traffic, access restrictions or fares.

23 of 25 attraction wheelchair values remain unknown; Somnath Temple is true and
Rukmini Temple false. Kevada and Saputara Museum priced availability, Modheshwari
conflicting hours, daylight/date-specific intervals, ferry prices/timetables,
safari reservations and whole-site access remain documented in
[COMPLETION_RESEARCH.md](COMPLETION_RESEARCH.md) and the exact checklist. Nullable
display fields are not functional blockers merely because they are empty.

## F. Tests and Experiments

| Latest check | Result / artifact |
|---|---|
| Backend unit tests | 19 passed; expected sanitation tests deliberately log two internal-error messages. |
| Frontend reference tests | 28 passed; these are retained Trie tests, distinct from runtime API behavior. |
| TypeScript | npm run lint passed. |
| Production build/module audit | Passed, 2365 modules; no legacy catalog, route CSV, client planner or Trie runtime imports. |
| Auth / destinations / trips / admin HTTP | ${http.auth.exchanges.length} / ${http.destinations.exchanges.length} / ${http.trips.exchanges.length} / ${http.admin.exchanges.length} real exchanges passed, with fixture cleanup. |
| Real Chrome development browser | ${dev.checks.length} checks passed; completion-development-browser-report.json. |
| Real Chrome production browser | ${browser.checks.length} checks passed; frontend-browser-report.json and completion-production-browser-report.json. |
| Shared API-client regressions | ${client.checks.length}/${client.checks.length} passed; malformed/401 responses deliberately intercepted as transport tests. |
| Production platform | ${platform.checks.length} passed: service worker, real speech error, offline shell/no catalog fallback, online recovery. |
| Unknown-display probes | ${display.checks.length} cities passed; completion-display-report.json. |
| Research console UI | ${research.checks.length} groups passed; 22 actual persisted UI plans, copy/Back, exact-account cleanup. |
| Additional auth controls | ${authControls.checks.length} groups passed: password visibility, recovery notice, modes/roles and every guest/back action. |
| Idle request probe | ${idle.checks.length} public views passed: zero continuing API requests after settling; initial overlapping reads recorded. |
| Eight independent city API flows | All passed; data-city-*.json. |
| SQL constraints/integrity/coverage | Passed; cross-city/ambiguous/missing route endpoints rejected and rolled back; completion-integrity.json and data-completion-checklist.json. |
| Isolated clean startup | Schema + trip migration + two seeds passed in disposable PostgreSQL DB; same UUIDs/values; database removed. Existing dependencies/lockfiles used, not a newly installed OS/container. |
| Reseed preservation | Two passes preserve all IDs/values; incorrect-field probe rejected/rolled back. |
| Original backend experiments | 22/22 generation, 0 failures, 12 compliant, 48 visits; docs/research/experiment_results.json. |

Browser logs contain deliberate rejected login, forbidden admin/ownership,
invalid IDs/links, injected unavailable APIs and clipboard denial. The PDF
fallback may log a cross-origin Google-font stylesheet read warning. Development
StrictMode/unmount requests are aborted rather than used as stale results. Final
browser has zero page errors, no duplicate-key warning and no unexpected API 500;
logging was not suppressed. The restarted live backend had no new exception
output during final flows.

The main production suite deliberately blocks service workers; its registration
warnings (including an undefined-registration warning) are harness artifacts.
The separate platform run permits the real service worker and verifies successful
registration/control/offline recovery. Multiple mounted catalog consumers perform
overlapping reads; these are bounded reads, not duplicated trip writes. The idle
probe records initial request counts and checks no continuing requests after each
public view settles (completion-idle-report.json).

## G. Security and Permissions

Real registration/login/duplicate registration, payload validation, JWT signature,
expiry/subject/role validation, auth refresh/logout and protected endpoints pass.
Tourist POST/PUT/DELETE on every admin resource returns 403 and leaves SQL data
unchanged. Operator create/read/update/delete persists correctly, with FK and
conflict rules honored. Direct other-user trip/generation/budget requests are
rejected; shared links do not bypass ownership. Password hashes/SQL details/tokens
are not exposed in evidence. Parameterized-query injection and sanitized error
tests pass. Existing registration intentionally allows tour_operator accounts;
this is a documented production policy limitation, not an ownership bypass.
Signed roles remain valid until expiry; no token revocation feature was added.

## H. Remaining Issues

| Severity | Unresolved issue | Exact reason |
|---|---|---|
| High for public deployment | Self-registration of operators; no vetting/revocation | Existing auth policy and API capabilities; changing policy/workflow is beyond this no-new-features audit. |
| Medium | Transport fares and complete accessibility/booking feasibility | No fare column; 23 unknown access values; no date/calendar/split-window/booking availability contract. Known-cost budgets are lower bounds, not complete quotes. |
| Medium | Incomplete meals in some Dwarka/Rann schedules | Real route/time windows and unresolved legacy/co-located dining relationships; warnings remain accurate. |
| Medium | Unknown Kevada price and Saputara museum reopening/price; Modheshwari hours | Research did not settle current reliable facts; unknown retained rather than copying an unrelated/historical value. |
| Medium | Public recipient sharing/account persistence edits/password reset/preview/cross-session trip listing | Missing backend endpoints; UI reports limitations, owner security retained. No invented replacement features. |
| Low | Full offline trip reload, native install/share and successful voice transcription | Shell verified; trip APIs need network, native/hardware success needs an actual supported interactive device. |
| Low | Optional translated/images/editorial fields/nearby relations | Nullable and unfilled; fallback or empty collections, no fake catalog. |

No confirmed in-scope fixable bug from this audit is knowingly left unfixed.
These limitations prevent describing every visible capability as complete.

## I. Frontend Preservation

It would be inaccurate to say no frontend files changed: functional corrections
were necessary. ${visual.changedFiles.length} of the 89 captured source/public
files changed; exact list:

${visual.changedFiles.map(f=>'- '+f).join('\n')}

All ${styles} captured className/style attributes and JSX element sequences in
the edited components are identical to the captured originals. No button,
component, page, Tailwind class, token, icon/image, animation or responsive class
was added/removed/redesigned. CSS/index.css, tokens, images and public files are
unchanged; repeated builds retain index-BVz60YKF.css. Changes are handlers, API
validation, React keys, unknown/error labels and inaccurate capability text.
This is source/style/structure evidence plus browser behavior, not a claim of
exhaustive pixel-diff certification across all devices. No Git baseline exists.

## J. Final Project Readiness

| Use | Readiness |
|---|---|
| Local demonstration | READY for the tested supported eight-city tourist/operator flows, with honest unknowns and constraint failures. |
| Academic evaluation | READY to evaluate the implementation and documented limitations; do not present all tourism facts/booking behavior as verified. |
| Submission | READY as this verified project with this report/provenance/handoff; unconditional rubric compliance cannot be established without a rubric requiring specific unsupported capabilities. |
| Deployment | NOT READY for unrestricted public production: operator onboarding policy, production HTTPS/secrets/CORS, lifecycle/operations and native-device behavior are not certified. No deployment performed. |

## K. Final Handoff

Canonical CODEX_HANDOFF.md is updated by the completion documentation script;
wrapper remains a pointer. README setup/testing instructions and AGENTS continuity
rules reflect the actual eight-city state. Next session should read this report
and canonical handoff, preserve current files, run sequential targeted checks,
and research only the exact remaining facts. Additional product capabilities or
deployment policy changes require a separately scoped task; do not fabricate
data or alter budgets to make these limitations disappear.
`;
const old=path.join(dir,'FINAL_VERIFICATION.previous-codex2.md');
if(!fs.existsSync(old))fs.copyFileSync(path.join(dir,'FINAL_VERIFICATION.md'),old);
fs.writeFileSync(path.join(dir,'FINAL_VERIFICATION.md'),body);
let data=fs.readFileSync(path.join(dir,'DATA_COMPLETION_REPORT.md'),'utf8');
data=data.replace('288 metadata fields','293 metadata fields').replace('record590 merged fields','record595 merged fields');
data=data.replace(/^\| destinations \/ (ahmedabad|somnath|dwarka|modhera|champaner) \| official_category \| optional_unfilled \|\r?\n/gm,'');
if(!data.includes('Stabilization continuation:'))data=data.replace('## Dataset completion','Stabilization continuation: five sourced primary categories are now filled; provenance is 595 fields. Earlier frontend-unchanged/test-count statements below describe the preceding data-only session. Current functional fixes, actual tests, visual preservation and remaining limitations are authoritative in [FINAL_VERIFICATION.md](FINAL_VERIFICATION.md).\n\n## Dataset completion');
fs.writeFileSync(path.join(dir,'DATA_COMPLETION_REPORT.md'),data);
const handoffPath=path.join(root,'CODEX_HANDOFF.md');
let handoff=fs.readFileSync(handoffPath,'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
handoff=handoff.replace('(active data research and final checks pending)','(supported flows stabilized; factual limitations remain documented)');
const additions={
 'Current Goal':'Completion audit finished for existing supported functionality. Read backend/reports/FINAL_VERIFICATION.md as the latest authoritative A-K report; all fixable reproduced bugs below were corrected and retested. Missing APIs/facts remain explicitly limited, not fabricated. No deployment or new features.',
 'Current Project State':`Latest stabilization: 8/25/11/12/131 catalog counts, 595 provenance fields/131 routes. Backend19/frontend28/typecheck/build pass; HTTP auth17/destinations106/trips41/admin101; development Chrome${dev.checks.length}, production Chrome${browser.checks.length}, API-client9, platform4 and research UI3 groups pass. Experiments22 generated/0failed/12 compliant/48 visits/118654 known cost. Summaries9 scheduled/13 incomplete:10 hotel over-budget plus3 Dwarka meal-window cases. Source preservation:89 baseline files,${visual.changedFiles.length} functional/text files modified,${styles} class/style attributes and JSX structure unchanged, CSS asset unchanged. No Git metadata.`,
 'Completed':'Reproduced/fixed whole-transaction generation serialization (three of four concurrent requests previously500), shared-link route subscription/read-only leaks, fake operator profile actions, blank required price becomingzero, ignored share/copy errors, unknown-cost/NaN displays, first comparison Collapse no-op, delayed PWA redisplay, duplicate visualizer React keys, malformed catalog identity acceptance, and unsupported capability claims. Five sourced category fields added. Full tourist/operator/all-city browser flows, safe disposable DB startup, reseed preservation, route/integrity/budget/security checks and original experiments verified.',
 'Files Changed':'backend/models/tripModel.js; backend/scripts/test-trips-http.js; frontend/src/App.tsx and components/AdminDashboardView,ProfileDashboardView,ShareItineraryModal,BudgetPlannerView,ResearchView,ItineraryView,HotelsView,DestinationDetailView,StrategyComparisonModal,DijkstraVisualizer,Footer,PwaInstallPrompt,OfflineBanner; frontend/src/api/index.ts; tests/frontend/browser_api.py,api_client_browser.py; five city research manifests; provenance/checklist/reports; backend/README.md,frontend/README.md,AGENTS.md and canonical handoff. Exact source hashes/controls are in completion-frontend-preservation.json.',
 'Files Created':'backend/scripts/audit-completion-integrity.js,test-clean-startup.js,research-completion-categories.js,test-research-browser.js,write-completion-verification.js; tests/frontend/completion_flows.py,completion_auxiliary.py,completion_platform.py,completion_display_probe.py,completion_research.py,completion_idle.py,completion_auth_controls.py,completion-source-audit.mjs; completion-category-evidence.json; COMPLETION_RESEARCH.md; clean-startup/completion reports, before-fix evidence and historical FINAL_VERIFICATION.previous-codex2.md. Do not rerun the one-time category-manifest writer; normal db:seed already reproduces fields.',
 'Technical Decisions':'Keep chosen hotels and one lodging night per trip day. Unknown route fares excluded/displayed unknown. Keep the existing generator/route constraints and ownership gates. Retry complete rolled-back repeatable-read write transactions only for 40001/40P01, at most five attempts. Reverse road snapshots remain reused, not independently verified. No source metadata guess for legacy restaurants, no zero-distance synthetic edge, no new account/public-sharing/booking APIs.',
 'Dependencies / Setup Changes':'No dependency/secret changes or destructive migrations. Existing Node/PostgreSQL/npm lockfiles used. Clean setup applied schema plus001 trip migration and twice-seeded a random disposable DB, then dropped only that DB. Real API remains localhost5000; frontend3000. Final server mode may be production preview; see current runtime report/terminal, stop only the verified process before changing modes.',
 'Commands Used':'backend: npm test; npm run test:auth; npm run test:destinations; npm run test:trips; npm run test:admin; npm run test:db; npm run db:verify; node scripts/audit-completion-integrity.js; node scripts/audit-data-completion.js; node scripts/test-clean-startup.js; node scripts/test-research-preservation.js; per-city node --import tsx scripts/test-researched-city.js <slug>. frontend: npm run lint; npm test; npm run dev; npm run preview -- --port 3000 --host 0.0.0.0; node --import tsx scripts/run-experiments.ts. root: node tests/frontend/build-audit.mjs; node tests/frontend/completion-source-audit.mjs. Browser/API Python tests require Chrome/Playwright and FRONTEND_TEST_URL/API_TEST_URL; README has exact commands.',
 'Testing Completed':`Fresh verified results as Current Project State and FINAL_VERIFICATION.md. Browser fixtures cleaned, approved catalog preserved, no page errors or final duplicate React keys. Deliberate malformed/injected503/denied/clipboard/invalid-link logging remains visible. PDF fallback can log external font stylesheet security warning while successful actual download is verified. Active SQL audit checked${active.checks.persistedReferencesAndBudgetSums.stopsChecked} stops/${active.checks.persistedReferencesAndBudgetSums.budgetsChecked} budgets before cleanup. Later zero fixture rows do not erase that evidence.`,
 'Current Issues / Bugs':'No knowingly unresolved reproduced in-scope code bug. Remaining:23 unknown attraction access fields; unknown Kevada/Saputara museum numeric price/current reopening; conflicting Modheshwari hours; calendar/split-window/slot limitations;14 missing route relationships (Somnath6,Dwarka7,Rann1); fares absent. Dwarka/Rann meals can remain incomplete. Account update, public recipient sharing, cross-session trip-list and preview endpoints absent. Offline shell works, trip reload needs network. Native install/share and successful microphone transcription need actual supported-device verification. Operators can self-register; no revocation/vetting; production not certified.',
 'Important Warnings':'Earlier34-browser/7-client/37-trip/89-files-unchanged/590-provenance claims are historical baselines, superseded above. Old FINAL_VERIFICATION described3cities/no routes; preserved separately. Do not force over-budget plans complete, lower quote prices, reset data, add simulated/straight-line routes, or claim source/style checks constitute pixel certification. Run catalog-mutating suites sequentially; never seed/reset while another suite is exercising temporary fixtures. No deployed site was updated.',
 'Next Steps':'For local review: start PostgreSQL, API5000 and frontend3000 using README; demonstrate all eight supported city flows and operator CRUD. For follow-up research: exact fields/routes in data-completion-checklist.json and COMPLETION_RESEARCH.md; obtain current verifiable authority/identity facts before merging. For any public deployment, separately scope operator onboarding/revocation and production operations/security configuration; existing task intentionally adds no new features. Native-device speech/install/share should be tested interactively if certification is required. Rerun affected checks only when code/data changes justify it.',
 'Last Session Summary':`Stabilization completed with reproduced fixes and real app retests, not review only. Latest complete A-K report backend/reports/FINAL_VERIFICATION.md. Counts8/25/11/12/131;22 experiments unchanged12 compliant/48visits. Full browser production${browser.checks.length}/development${dev.checks.length}, APIs/security/CRUD/concurrency/isolated startup/provenance/visual-preservation verified. Missing capabilities and factual gaps explicitly remain; local demonstration/evaluation supported, unrestricted public deployment not ready.`,
};
for(const [section,text]of Object.entries(additions)) {
 const heading=new RegExp('## '+section+'\\n(?:\\n\\d{4}[^\\n]* latest completion record: [^\\n]*\\n)?');
 handoff=handoff.replace(heading,'## '+section+'\n\n'+stamp+' latest completion record: '+text+'\n');
}
if(!handoff.includes('## Last Updated'))handoff=handoff.replace(/\n\$1[^\n]*\s*$/,'\n')+'\n## Last Updated\n\n';
handoff=handoff.replace(/(## Last Updated\s*)[\s\S]*$/,(_match,heading)=>heading+stamp+' UTC; '+new Date().toLocaleString('en-IN',{timeZone:'Asia/Calcutta'})+' Asia/Calcutta.\n');
const required=['Project Summary',...Object.keys(additions),'Last Updated'];
for(const section of required)assert.ok(handoff.includes('## '+section),'Missing handoff heading: '+section);
fs.writeFileSync(handoffPath,handoff);
console.log(JSON.stringify({written:true,browser:browser.checks.length,dev:dev.checks.length,client:client.checks.length,styles,fields:provenance.fields.length,experiments:comparison.current}));
