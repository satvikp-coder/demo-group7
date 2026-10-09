from pathlib import Path
import json
r=Path('reports'); r.mkdir(exist_ok=True)
def write(name,text): (r/name).write_text(text.strip()+'\n',encoding='utf-8')
write('01_PROJECT_ARCHITECTURE_AUDIT.md','''# Existing architecture — inspected 2026-10-08

React 19 / TypeScript 5.8 / Vite 6 frontend, Tailwind and Motion; Express 5 ESM backend, shared TypeScript DSA modules through tsx; PostgreSQL 17 with parameterized pg queries, SQL migrations and curated provenance-bearing seed imports. There is no ORM. Existing code and visual design are retained.

Browser ? nginx SPA on :8080 ? /api proxy ? private Node API :5000 ? private PostgreSQL :5432. The central frontend/src/api/index.ts validates responses, supports cancellation and authenticated requests. App.tsx owns navigation and selected records; LanguageContext supplies en/hi dictionaries. Auth uses sessionStorage JWT, bcrypt passwords and database-backed role/account checks. Public catalog/search and child endpoints supply actual tourism records. Protected trip creation/generation/read/budget use transactionally persisted plans. Operator CRUD refreshes the search cache after committed edits.

backend/services/tripPlanner.js invokes shared Graph/Dijkstra/greedy helpers. Direct route evidence takes precedence; missing direct attraction pairs may use graph paths. Plans are circular, single-city, selected-hotel itineraries with time/budget/accessibility constraints. This is not a multi-city global optimizer. Costs are persisted snapshots, and unknown transport fares remain explicitly excluded. Destination Trie cache has bounded lifecycle and graceful shutdown.

frontend/public contains static assets and licensed photographs; imageSources.ts resolves validated sources and curated IDs, ImageWithFallback handles actual decode failures. Build copies assets into dist; nginx serves them without database URL rewrites. data/images and the shipped manifest/credits record licenses. Database image fields and user data were preserved.

compose.yml / local-production override provide nonroot nginx, private backend/database, health/readiness, persistent volume and separate maintenance role. compose.staging.yml is used only for disposable production tests. CI runs isolated suites; no external deployment was performed. Existing private env files were excluded from reports/checkpoints. No bookings, payment, live availability, background job queue or external routing provider is implemented. Map/graph views represent saved route evidence.

Recovery baseline: BASELINE_SOURCE.json records a verified source ZIP because the app has no Git metadata. The sibling release Git checkout was read only. A private PostgreSQL backup was restored into a separate database and row hashes matched. See report 06 and CODEX_HANDOFF.md for continuity.''')
features=[
('Home / Explore / featured cards','App,Hero,ExploreView,FeaturedDestinations','GET destinations/catalog','destinations + child catalog','Render real catalog, search/filter and navigate'),
('Destination details / attraction information','DestinationDetailView','GET destinations/:id and children','destinations,attractions','Correct selected entity and associated records'),
('Ranked stays / sorting / selection','HotelsView','GET destinations/:id/hotels','hotels','Price/rating/value ranking and intended hotel selection'),
('Restaurants / itinerary meal cards','DestinationDetailView,ItineraryView','destination restaurants; trip generate/read','restaurants,itinerary_stops','Actual associated meals and known price snapshots'),
('Registration / login / logout / refresh','AuthView,api,App','auth register/login/me','users','Validated account, JWT session, logout clears session'),
('Create / generate / reload itinerary','PlannerModal,ItineraryView','POST trips; POST trips/:id/generate; GET trips/:id','trips,itinerary_stops,budgets,routes','Owner-scoped persisted plan reflecting inputs'),
('Budget breakdown / changed settings','BudgetPlannerView,WhatIfPanel','GET trips/:id/budget; create/generate','trips,budgets,itinerary_stops','Database totals and current saved inputs'),
('Three strategy comparison','StrategyComparisonModal','create/generate three trips','trips,itinerary_stops','Compare actual weighted greedy outputs, selected hotel retained'),
('Saved profile plans / opening / session hiding','ProfileDashboardView','GET trips; GET trips/:id','trips','Owner plans persist; Remove hides in session only'),
('Account name / password editing','ProfileDashboardView','none','none','Explicit API-unavailable notice, no fake save'),
('Private route link','ShareItineraryModal,shareUrl','GET trips/:id requires owner','trips','Link carries ID/preferences; owner sign-in required'),
('Operator catalog CRUD / previews','AdminDashboardView','25 admin method/path combinations','destinations,attractions,hotels,restaurants','Role-protected transactional validation and search invalidation'),
('Routing graph / algorithm visualization','DijkstraVisualizer,OfflineRouteMap','saved trip response','routes + persisted generation legs','Directional evidence and explicit unreachable paths'),
('Image loading / galleries / attribution','ImageWithFallback,imageSources,Hero','catalog image fields','unmodified image provenance','Correct licensed photo or identified fallback, no broken icons'),
('EN / HI switching and persistence','LanguageContext,Navbar','none','none','Supported dictionary switching; Gujarati UI absent'),
('Research view / architecture explanations','ResearchView','real API where displayed','catalog/trips as applicable','Academic presentation distinguished from live solver'),
('PDF export / print / responsive navigation','ItineraryView,Navbar,App','read existing trip','persisted plan','Export current plan and functional navigation'),
('Offline shell / install prompt / speech','service worker,PwaInstallPrompt,Hero','authenticated API network only','none','Cached shell; OS capabilities conditional, no offline trip guarantee'),
('Health / readiness / shutdown','none','GET health; GET ready','readiness query','Liveness independent of DB, readiness 503 on outage'),
]
lines=['# Complete feature inventory','', 'Evidence: current isolated HTTP/control suites, image city journeys and targeted before/after regressions. Static trace alone does not verify native OS behavior or public deployment. Individual controls are enumerated in tests/frontend/completion_*.py and backend HTTP suites.','', '| Feature | Frontend | Backend | Database | Expected Behavior | Verification Status | Issue |','|---|---|---|---|---|---|---|']
for f,fe,be,db,ex in features:
 status='BLOCKED_UNVERIFIED' if 'speech' in f else ('NOT_APPLICABLE' if 'editing' in f else 'VERIFIED_WORKING')
 issue='Native install/microphone remains environment dependent' if status=='BLOCKED_UNVERIFIED' else ('No account mutation endpoint; truthful notice' if status=='NOT_APPLICABLE' else 'See 09 for repaired defects; supported EN/HI only' if 'switching' in f else 'See test evidence and scope limitations')
 lines.append('| '+' | '.join([f,fe,be,db,ex,status,issue])+' |')
lines+=['','No distinct public hotel/attraction/restaurant detail route or booking/payment workflow exists; entity information and selection are embedded in the existing views. No route/user management admin API exists. These absent capabilities are NOT_APPLICABLE, rather than fabricated integrations. Gujarati language support is BLOCKED_UNVERIFIED for the requested language; actual supported EN/HI was exercised. Full final gate outcomes are recorded in 10; historical image tests are separately timestamped.']
write('02_COMPLETE_FEATURE_INVENTORY.md','\n'.join(lines))
write('03_MOCK_AND_INTEGRATION_AUDIT.md','''# Mock and integration audit

Runtime catalog, hotel ranking, planner, budget and saved profile use actual APIs and PostgreSQL. No dummy successful booking or fake availability was added. Static frontend destination/reference planner modules are academic/test inputs and excluded from the production runtime graph (build-audit gate). Constants for labels, categories, preferences and test fixtures are legitimate static data.

AUD-003/004: What If used debounced values for a real request and claimed live recomputation; repaired to current settings and explicit Save-to-generate behavior. Saved confirmation now disappears when settings differ. AUD-005: sharing copy overstated public access; corrected to owner-authenticated link and accessible modal title. AUD-007: missing ratings were given 4.5 in greedy scoring; fixed to neutral unknown score while preserving genuine zero. AUD-008: graph presentation invented reverse edges/zero-length unreachable paths; repaired to persisted directed evidence. Strategy descriptions now match actual weighting and retained hotel.

Account-edit controls truthfully state that no API exists. Profile Remove is intentional session hiding, not a database delete. Unknown transport fares, prices and accessibility are not promoted to facts. Offline shell caching does not claim offline authenticated data. Illustrations are explicitly identified fallbacks; they do not pretend to depict hotels. Actual bookings, live room availability, public recipient sharing, Gujarati UI and external permit/calendar providers remain absent. No substitute provider workflow was invented.

Search indicators (TODO/mock/sample/setTimeout/static arrays) were inspected in context; timers serve debouncing/animation/cache/test behavior. Fixture seed scripts run only in separate test databases during this audit. See 09 for canonical defect IDs and backend/reports/images/IMAGE_REPAIR_REPORT.md for all photo/fallback identities.''')
write('04_FRONTEND_AUDIT.md','''# Frontend audit

Inspected App navigation and all significant components listed in frontend/src/components, central API client, contexts, helpers and public service worker. Tests cover actual controls, not just rendering: search/filter, destination selection, hotel ordering, login/logout, planner validation/generation, budget/What If, profile, admin CRUD, research, sharing, navigation and language persistence. Browser evidence distinguishes authenticated flows from anonymous protected routes.

AUD-003/004/005/008 fixes preserve component classes/styles and layout. Before and after isolated browser evidence: reports/targeted-{before,after}-browser.json. Pure visualizer regression tests assert distinct return distance and unreachable paths. Image component browser fault tests cover failed source changes, 200 HTML impostors, srcSet removal and terminal fallback.

Image desktop/mobile journeys cover all eight cities and hotel records. Production image scan covers 40 route/viewport states; original development lazy-image timing was separately rechecked, not concealed. Desktop/mobile browser suites and production controls are recorded in 10. Tablet and native device integrations are not inferred from these tests; responsive CSS/source inspection alone is not equivalent to physical-device certification.

Shared API error tests exercise malformed responses, backend outages, cancellation and honest error states. TypeScript/build and runtime graph checks are gates. No CSS redesign or replacement components were introduced. Preserve current native speech/install/share limitations. Photo credits and explicit fallback labels are the only intended image-related content additions.''')
write('05_BACKEND_API_AUDIT.md','''# Backend/API audit

42 registered method/path combinations: auth 3; destination/catalog/search/detail/children 7; trips 5; admin 25; health/readiness 2. nginx static-health is a separate edge probe. Routes/controllers/services/models were traced. Legacy unmounted budget route is not falsely counted as a live endpoint; protected trip budget is authoritative.

Request validation uses Zod and rejects extra/protected fields; parameterized SQL; owner scope on every trip read/generate/budget; operator role database recheck on catalog writes. Unknown records, bad payloads, forbidden users and database errors have meaningful sanitized status codes. Public hotel listing applies numeric Merge Sort with deterministic ties/unknown last. Search Trie cache refresh is coalesced and retains previous real snapshot on failure.

Generation obtains repeatable-read snapshots and atomically writes stops/budget; serialization/deadlock retry bounded at five attempts. AUD-002 fixes paise balance without rewriting greedy strategy; AUD-007 removes fabricated default rating without changing weighting. Direct route/reverse evidence, wheelchair intermediate-node exclusion and explicit missing-route behavior have backend regression tests.

HTTP suites exercise auth (17), destinations (106), trips (45), admin (101) assertions and database constraints against isolated fixtures. Current 31 backend unit cases include readiness/security/validation/cache/ranking/solver. Exact final commands/gates are in 10. External commercial/provider integrations do not exist; do not interpret a local HTTP 200 as provider confirmation.''')
write('06_DATABASE_INTEGRITY_AUDIT.md','''# Database integrity and safety

Live environment: production-mode local PostgreSQL 17.11, persistent Docker volume. ORM: none; pg and versioned SQL migrations. Thirteen public tables: users, destinations, attractions, hotels, restaurants, routes, trips, itinerary_stops, budgets, destination_nearby_attractions, destination_nearby_hotels, schema_migrations, seed_managed_rows.

Verified original live catalog: 8 destinations, 25 attractions, 11 hotels, 12 restaurants, 131 routes; 1 existing user; 0 original trips/stops/budgets. Read-only image snapshots hash rows without exporting sensitive contents. Six attraction ratings are unknown and 23 wheelchair flags are unknown; these are missing evidence, not invented positive values. Source provenance and curated ledgers are retained.

Private backup command: npm run local:backup -- backups/full-audit-2026-10-08.dump. Restore into separate local_restore_fullaudit_20261008 database succeeded; 11 table counts/digests matched the baseline. No active DB reset, reseed or schema alteration. Image-phase fixtures were removed by exact IDs and original digests confirmed before expanded audit. Expanded-audit mutating tests use random heritage_suite_, heritage_audit_ databases or dedicated production-test Compose project/volume; cleanup is reported.

Fresh/repeated migrations, seed ownership preservation, FK/check constraints, admin CRUD and trip ownership/persistence are tested on those isolated databases. Unverified expensive production-data performance claims are not made from the small local catalog. Backup archive/private environment files are not public artifacts. No destructive data repair was needed.''')
write('07_END_TO_END_INTEGRATION_AUDIT.md','''# End-to-end integration

Catalog journey: React API client ? public catalog/children ? pg rows ? validated DTO ? destination/hotel views. Image-phase 16 city/viewport journeys cover all eight destinations and all eleven hotel records, plus 130 image/control groups with no final image/console/HTTP errors.

Plan journey: real isolated account ? login ? selected city/hotel/preferences ? POST trips ? POST generate ? snapshot queries/shared solver ? atomic stops/budget ? returned itinerary ? GET reload/profile ? GET budget equality. Owner access, forbidden account, bad inputs, infeasible budget and missing routes are exercised by HTTP/control suites. No paid/external booking action occurs.

Operator journey: isolated role ? validated catalog mutation ? committed SQL ? search cache invalidation ? catalog/search update; cleanup prevents dataset interference. Tests run sequentially. Profile navigation refreshes real owner records; intentional Remove hides locally. Session JWT is not a public shared-plan permission.

AUD-003 before evidence recorded budget 20000 after selecting 20500; after records 20500 in the actual request. AUD-004 confirmation resets on unsaved edits; AUD-005 modal title resolves and sharing explicitly requires owner sign-in. All targeted fixtures are in a newly created database, removed in finally.

Dependency/security scans, API client outage tests, research controls and production restart/outage/backup/restore tests are separate gates. reports/10_FINAL_PRODUCTION_READINESS.md gives current gate results; no older completed report substitutes for the rerun.''')
write('08_SECURITY_AND_RELIABILITY_AUDIT.md','''# Security and reliability

AUD-001: frontend transitive source-map-js 1.2.1 was vulnerable to indexed-source-map event-loop denial of service, GHSA-68fv-2mgg-jv7q / CVE-2026-93749. Updated only that package to patched 1.2.2; lockfile reproducible, current npm audit has zero findings. Advisory: https://github.com/advisories/GHSA-68fv-2mgg-jv7q. Backend audit also zero. A clean audit is not proof that undiscovered vulnerabilities do not exist.

Existing protections verified by code and isolated tests: bcrypt12, one-hour HS256 JWT, expiry/signature validation, current DB account/role verification, owner-scoped trips, production signup cannot grant operator, parameterized SQL, strict schemas, exact-origin CORS, Helmet, body limits/rate limits, sanitized logs, SSL certificate verification, bounded pool/timeouts and graceful shutdown. No secret values are included in reports. Production source scan excludes private env files and checks credential patterns.

Runtime database role is separate from owner/maintenance; database and backend are private in normal local deployment. Production tests exercise role privileges, headers/redaction, outage readiness recovery, load/concurrency, restart persistence and backups. Public HTTPS/deployment/provider-account verification has not occurred. Existing secrets were neither rotated nor printed.

AUD-006 preservation guard pinned old pre-image sources; repaired using an exact reviewed SHA256 allowlist. Any subsequent edit invalidates its hash; no general UI exception introduced. A negative probe verifies unapproved modification fails and restored approved file passes.

No speculative performance rewrite: current small catalog uses indexed relationship queries, catalog response avoids per-card fanout, cache refresh coalesces, images are optimized locally. Real load gate measurements are retained in backend/reports/production; they do not establish a public production SLA.''')
issues=[('AUD-001','P1','Build dependency','source-map-js 1.2.1 CVE','frontend/package-lock.json','Patch 1.2.2','npm audit zero'),('AUD-002','P1','Planner budget','Floating-point residual excluded exact-fit admission','backend/services/tripPlanner.js; backend/tests/trips.test.js','Round remaining to paise','before JSON; exact-fit/one-paisa-over tests'),('AUD-003','P1','What If integration','Save read debounced old inputs','ItineraryView.tsx','Submit current slider values','real before/after POST capture'),('AUD-004','P2','What If truthfulness','Live claim and stale saved confirmation','WhatIfPanel.tsx','Describe Save generation; confirmation conditional on unchanged inputs','targeted before/after browser'),('AUD-005','P2','Private sharing/accessibility','Public-looking promise; unresolved dialog title','ShareItineraryModal.tsx; shareUrl.ts','Explain owner authentication; title id','targeted browser'),('AUD-006','P2','Preservation test tooling','Old baseline rejected authorized photo repairs','scripts/source-audit.js; APPROVED_FRONTEND_REPAIRS.json','Exact reviewed hashes','strict negative probe + source audit'),('AUD-007','P1','Rating-first scoring','Missing or zero rating became fabricated 4.5','dsa/greedy/routeBuilder.ts; trips.test.js','Finite actual rating or neutral unknown','before JSON; regression unit'),('AUD-008','P2','Route visualizer','Undirected reverse and false zero unreachable path','DijkstraVisualizer.tsx; visualizer.test.ts','Directed saved legs and explicit unreachable','before JSON; 2 regression cases')]
lines=['# Bug-fix log','','| ID | Severity | Feature | Root Cause | Files Changed | Fix | Test Evidence | Status |','|---|---|---|---|---|---|---|---|']
for row in issues:lines.append('| '+' | '.join(row)+' | FIXED_VERIFIED |')
lines+=['','Image defects IMG-001/002/003 and all asset replacements are canonically documented in backend/reports/images/IMAGE_REPAIR_REPORT.md. They are verified, with 12 original photographs recovered, 15 new/replacement photographs and 22 honest catalog fallbacks. All 8 destinations have real photos. French Haveli and Champaner Heritage Resort have licensed property photos; the other 9 hotels (including Lemon Tree Premier and House of MG) retain identified generic fallbacks.','', 'Absent Gujarati UI, live bookings/availability, account mutations and public recipient sharing are product limitations, not simulated fixes. Native OS/device and public deployment checks remain BLOCKED_UNVERIFIED.']
write('09_BUG_FIX_LOG.md','\n'.join(lines))
print('Reports 01–09 written from current evidence; final readiness remains pending full suites.')
