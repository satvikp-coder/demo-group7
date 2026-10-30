# Final bug log

## Phase 3 final review

| Finding | Status | Commit | Proof |
|---------|--------|--------|-------|
| README current/historical counts | FIXED (docs only) | 744f0d2 | SQL: 8 destinations, 25 attractions, 11 hotels, 12 restaurants, 131 routes. Full executed baseline: 122 backend tests, 56 frontend tests plus 80/33 assertions, types/build PASS, 64 browser checks. README now separates this checkpoint from dated 20 October expanded-catalog/test evidence; no catalog or algorithm change. |
| HashTable runtime documentation | FIXED (docs only) | 252ceac | Existing dsa/README.md claimed city-data caching. Actual tripPlanner.js call sites use HashTable for attraction membership (34), directional route cache (58), and visited attractions (95). Corrected that description only; no TypeScript DSA code changed. |

### Runtime DSA mapping

| Structure / algorithm | File | Runtime call site | Test file |
|-----------------------|------|-------------------|-----------|
| Graph | dsa/graph/Graph.ts | backend/services/tripPlanner.js:33, builds evidenced adjacency graph | backend/tests/trips.test.js |
| Dijkstra fallback | dsa/dijkstra/dijkstra.ts | backend/services/tripPlanner.js:77, only when a direct route is missing | backend/tests/trips.test.js; backend/tests/sightseeing-quality.test.js |
| MinHeap | dsa/priorityQueue/MinHeap.ts | dsa/dijkstra/dijkstra.ts:26; backend/services/tripPlanner.js:60,175 | backend/tests/trips.test.js; backend/tests/sightseeing-quality.test.js |
| Greedy route scoring | dsa/greedy/routeBuilder.ts | backend/services/tripPlanner.js:183, scoreAttraction for strategy requests without explicit weights | backend/tests/trips.test.js; tests/frontend/planner.test.ts |
| Greedy day split | dsa/greedy/daySplitter.ts | backend/services/tripPlanner.js:171,174,203, visit quota and meal-window helpers | backend/tests/schedule-gaps.test.js; backend/tests/attraction-quality.test.js |
| Greedy budget filter | dsa/greedy/budgetAllocator.ts | backend/services/tripPlanner.js:170,177, filterAttractionsByBudget | tests/frontend/planner.test.ts; backend/tests/trips.test.js |
| Trie | dsa/trie/Trie.ts | backend/services/destinationSearchCache.js:35,81, indexing and prefix lookup | tests/dsa/trie.test.ts; backend/tests/destinations.test.js |
| HashTable | dsa/hashTable/HashTable.ts | backend/services/tripPlanner.js:34,58,95, membership/cache/visited tracking | backend/tests/trips.test.js; backend/tests/schedule-gaps.test.js |
| Merge Sort | dsa/sorting/mergeSort.ts | backend/services/hotelRanking.js:9, persisted hotel ordering | backend/tests/destinations.test.js |

Graph, MinHeap and HashTable have integration coverage through the planner, rather than separate standalone unit suites. Existing frontend reference-planner tests are distinguished from backend runtime scheduling tests. No TypeScript DSA implementation changed.

### All-city production browser review

Executed `python tests/frontend/final_review.py` against production Vite preview on 3000 with same-origin /api proxy to the normal backend on 5000. Test implementation: 9e2586b. All cities passed English/Gujarati/Hindi search, city/hotel selection, the nine 1/2/3-day x INR 5000/15000/30000 attempts, three-strategy comparison, budget view, save/reopen, owner link, real PDF download, wheelchair filter, logout/login and reopening the saved city trip after the fresh login.

| City | Generated | Correctly blocked before writes | Journey | Console errors / failed requests |
|------|-----------|----------------------------------|---------|---------------------------------|
| Ahmedabad | 7 | 2 | PASS | 0 / 0 |
| Somnath | 8 | 1 | PASS | 0 / 0 |
| Dwarka | 9 | 0 | PASS | 0 / 0 |
| Modhera | 8 | 1 | PASS | 0 / 0 |
| Champaner | 6 | 3 | PASS | 0 / 0 |
| Gir National Park | 8 | 1 | PASS | 0 / 0 |
| Rann of Kutch | 7 | 2 | PASS | 0 / 0 |
| Saputara | 8 | 1 | PASS | 0 / 0 |

Totals: 72 attempts, 61 generated and 11 correct lodging-budget rejections; 24 successful localized/English searches, 24 compared strategy plans and 8 valid PDFs. Zero page errors or HTTP errors in the final full city run. Somnath has one known accessible attraction, which the wheelchair plan visits; the other seven city filters correctly show no matching destinations, without assuming accessibility.

Typos returned no match in all eight cities: NOT SUPPORTED by the documented runtime prefix-only search. The shared academic Trie has fuzzy-search tests, but the public endpoint intentionally does not enable it. Left unchanged under the no-new-features rule. Public recipient sharing also remains unavailable; tested links are owner-authenticated bookmarks. Sparse catalog data can leave disclosed sightseeing gaps; prices and suitability are not live verified facts.

The initial review harness timed out after downloaded PDFs while waiting for network quiescence. It now waits for the PDF control to be enabled. Seven additional negative probes of wheelchair generation with no known eligible attractions returned the expected 422; they were not application bugs. After correcting those test assumptions, the full clean city sequence passed in one run. No application/PDF/wheelchair fix was made.

### Curl authorization matrix

Executed `python tests/frontend/final_auth_review.py`, 2a9dadf: 48/48 checks PASS, catalog row hashes preserved. Tokens/passwords stay in process memory and curl stdin; neither is included in reports.

| Case | Observed status | Result |
|------|-----------------|--------|
| No token on admin/trips | 401 | PASS |
| Bad token on admin/trips | 401 | PASS |
| Tourist admin reads/creates/updates/deletes | 403 | PASS |
| Operator CRUD on all four resources | 201 / 200 / 204 | PASS |
| Another user's trip and budget | 404 | PASS |

Temporary catalog rows copied required values from existing seeded records and were deleted by exact IDs. Temporary accounts/trips were also deleted; no seed/import/reset ran.

### Counts-only secret scan

Scan at 9e2586b: 1111 working-tree files, 1675 unique historical blobs and 141 commits across all reachable refs. Excluded dependency/build/Git-internal directories; ignored environment files were included. Read errors: 0. Broad keyword counts are references/tests/placeholders, not counts of confirmed credentials.

| Pattern | Working tree | Git history |
|---------|--------------|-------------|
| Provider-prefix markers | 7 | 4 |
| API-key keyword references | 40 | 101 |
| Secret keyword references | 215 | 411 |
| Password assignments | 38 | 79 |
| NVIDIA token candidates | 1 | 0 |
| Legacy provider token candidates | 0 | 0 |
| Private-key headers | 0 | 0 |
| Exact current credential matches | 3 | 0 |
| Token candidates outside ignored environment files | 0 | 0 |
| Exact current credentials outside ignored environment files | 0 | 0 |

### Phase 3 gate totals

| Check | Before | After |
|-------|--------|-------|
| Backend | 122/122 | 122/122 |
| Frontend | 56 tests + 80 Trie / 33 planner assertions | Same, PASS |
| TypeScript | PASS | PASS |
| Backend syntax (extra check) | Not run separately | PASS |
| Production build with /api | PASS | PASS, 2442 modules |
| Playwright test:frontend | 64/64 | 64/64 |
| All-city review | pending | 8/8 journeys; typo search unsupported |
| Curl matrix | pending | 48/48 |

Final browser wrapper: verified=true, cleanupCompleted=true, originalCatalogPreserved=true. Final SQL: 0 users, 0 trips, 8 destinations, 25 attractions. Only documented count/DSA-description errors were fixed in Phase 3. Live NVIDIA answer remains NOT VERIFIED after the single 503; native translation review remains pending. No push; Phase 4 not started. Instruction and handoff files unchanged.

## Phase 2 provider migration

| Status | Commit | Proof |
|--------|--------|-------|
| IMPLEMENTED; live provider answer NOT VERIFIED | 0cf21cd | Authenticated POST /api/chat and frontend request/response fields preserved. Backend-only NVIDIA key, configurable model (listed default meta/llama-3.3-70b-instruct), native HTTPS POST, maximum 15-second deadline, existing input/grounding/history bounds plus IP limit. Provider package removed; all other lockfile dependency records unchanged. System prompt and DSA untouched. Only approved provider-name substitutions in widget copy. |

- Mocked chat suite: 27/27, including success, 401, timeout, missing key, quota/network sanitization and IP-limit enforcement across users.
- Production widget: mocked transport success HTTP 200 renders the actual app-help lookup; mocked upstream 401 becomes a friendly HTTP 503 error, textbox remains enabled, zero page errors. The normal backend was restored after testing.
- Key presence check printed only set. Exact key matches in frontend build: 0. No key value printed or committed.
- Single live widget/backend-route attempt: HTTP 503, no reply. No approval-review rejection occurred; no second live attempt was made. NVIDIA answer availability/quality remains NOT VERIFIED and requires manual provider testing.
- Full baseline/post migration: backend 119/119 -> 122/122; frontend 56/56 plus 80 Trie and 33 planner assertions unchanged; TypeScript/build PASS; Playwright test:frontend 64/64 before and after, cleanup completed and original catalog preserved. Final DB: 0 users, 0 trips, 8 destinations, 25 attractions.
- Previous-provider/switch grep: zero active runtime/config/package/current setup matches. Retained wording in 16 historical reports, unchanged instruction handoff, and original triage entries below; the exact report list is in docs/NVIDIA_CHAT.md. No reports were deleted.

## Batch 4 verification

Production build served by Vite preview on localhost:3000, with same-origin /api proxy to the default API on localhost:5000. Backend CORS remains http://localhost:3000. Test URL selectors point to this preview; the production-browser operator approval path preserves the registration policy.

Baseline: backend 118/118; frontend 55 tests plus 80 Trie and 33 planner assertions; TypeScript and production build PASS. `npm --prefix backend run test:frontend`: verified true, 64 checks, cleanup completed, original catalog preserved. An earlier browser attempt stopped at 40 checks during a concurrent rebuild; the successful rerun used an unchanged build. Database after cleanup: 0 users, 0 trips, 8 destinations, 25 attractions.

| ID | Status | Commit | Proof |
|----|--------|--------|-------|
| A-H6 / narrow itinerary actions | FIXED | c4b6281 | Production Chrome before: Home/Explore scrollWidth 377 at 320 and 375; Itinerary 367 at 320. After wrapping the sort/action rows and constraining the select: scrollWidth equals innerWidth in all 35 cases (Home, Explore, Somnath city, Hotels, generated Itinerary, Budget, authenticated Profile at 320/375/390/430/768). Existing descriptions fit; no description layout change. |
| A-M15 | FIXED | 39721b1 | Production Chrome computed colors, alpha composited through canvas to support computed oklab colors: eight Explore destination descriptions 2.270:1 and Hotels dark-panel description 2.493:1 before; all nine 8.790:1 after. Only the two description text color classes changed to the existing salt/80 value; other colors and typography unchanged. |
| A-M17 | FIXED | c998973 | Before: admin accessibility snapshot shows unnamed close button, textboxes and category combobox. Explore has only its placeholder-derived name. After: explicit search aria-label; Chrome verifies all 21 fields across destination/hotel/attraction/restaurant editors have aria-labels, and the named close button opens/closes correctly in all four editors. Only aria-label attributes changed; no visible text, structure or styles changed. Temporary operator deleted afterwards. |
| A-M13 | FIXED | b9f765e | Before: all 16 GU/HI city searches return zero cards; seeded destination translations are null. Added slug-bound aliases to the existing backend Trie index without modifying stored rows or dsa/. New backend regression fails before and passes after for all eight cities x two languages; destinations suite 7/7. Production Chrome after default API restart: all 16 return HTTP 200, the correct slug and one visible destination card. |
| A-M12 (missing keys) | FIXED for missing static keys; partial localization remains | 40d68ac | Existing EN/GU/HI dictionaries already have parity, but runtime scan found the literal stay.defaultNights missing in all three. Production Chrome before shows the English lodging note in GU and HI; after, both show localized notes with the nights number substituted and no raw placeholder. Added only this key, retaining the previous English fallback verbatim. Existing localization suite 2/2 PASS. New GU/HI key and search aliases listed in docs/TRANSLATION_REVIEW.md for native review. Dynamic hotel/priority key fragments resolve existing keys and were not added. |
| A-M1 / A-M2 | FIXED for all-unknown catalog; populated-data semantics NOT VERIFIED | b02d8a3 | SQL confirms all 25 physical_demand values null. Before: eight cards become zero when LOW is selected, and demand sort is offered without values. After: Chrome verifies zero demand chips/options, all eight cards under each of the four remaining sorts, and one known-accessible card under the existing wheelchair filter. Controls remain available when candidate primary demands exist; stale demand selection is ignored when none exist, with rating sorting shown/applied. Existing browser regression now asserts absence instead of the misleading zero-result behavior. No demand values assigned and no sort order for known demands changed. |
| A-L3 | FIXED | 43d3277 | Production Chrome before: Somnath Temple and Somnath Beach both render as SOM / Somnath in the same persisted graph. After: visible labels are Somnath Temple and Somnath Beach; non-colliding labels stay abbreviated. New regression fails before and passes after, visualizer suite 3/3; directional distances and graph algorithm unchanged. Final combined browser checks: 35 viewport cases with zero overflow; 16 correct localized-search cards; minimum measured description contrast 8.790:1; zero unknown-demand sort options; distinct Somnath labels. |

### Known limitations

- Seeded destination/entity names and long descriptions lack stored GU/HI translations; descriptions, provenance/source notes, dated prices, hotel policy text supplied by data, and many hardcoded UI strings remain English. Observed examples include the Explore discovery subtitle/help/count/sort controls, wheelchair/demand labels, Hotels introductory description and admin editor copy. No destination descriptions were machine translated and no tourism values were invented.
- Native review of the new short GU/HI lodging note and city search aliases is pending; see docs/TRANSLATION_REVIEW.md. This pass does not claim complete localization.

### Batch 4 totals

| Check | Before | After |
|-------|--------|-------|
| Backend tests | 118/118 | 119/119 |
| Frontend unit tests | 55/55 plus 80 Trie assertions | 56/56 plus 80 Trie assertions |
| Reference planner | 33/33 assertions | 33/33 assertions |
| TypeScript | PASS | PASS |
| Production build, VITE_API_BASE_URL=/api | PASS | PASS (2442 modules) |
| Playwright test:frontend | 64/64 | 64/64 |
| Extra localization suite | 2/2 | 2/2 |

Final browser wrapper reports verified=true, cleanupCompleted=true, originalCatalogPreserved=true. Final SQL: 0 users, 0 trips, 8 destinations, 25 attractions. Temporary diagnostic scripts removed; no DSA, instruction or handoff file changes. No push performed.

Repo: demo-group7-release, branch `final-fixes`, baseline taken from `main` at bcbe5ab.

## Fix log

| ID | Area | Reproduced? | Fix summary | Commit | Proof |
|----|------|-------------|-------------|--------|-------|
| D1 | dependencies | yes (npm audit: frontend 2, backend 4) | `npm audit fix` without --force; patch/minor only: dompurify 3.4.16->3.4.17, vite 6.4.3->6.4.5, body-parser 2.3.0->2.4.0, ip-address 10.7.2->10.7.5, qs 6.16.0->6.17.1, zod 4.6.5->4.6.7 | 859a978 | npm audit: 0 vulnerabilities in both; tsc 0, build OK, frontend tests 80+33 assertions pass, backend 118/118 |
| D2 | docs `/api/health` | NOT REPRODUCED | none; `git grep api/health` finds no reference outside reports | n/a | grep empty. Route is `/health` |

## Baseline (read-only, no code changed)

| Check | Result | Evidence |
|-------|--------|----------|
| npm ci frontend | PASS | 120 packages, exit 0 |
| npm ci backend | PASS | 111 packages, exit 0 |
| npm ci dsa | N/A | no dependencies, no lockfile |
| tsc --noEmit frontend | PASS | exit 0 |
| tsc dsa | N/A | no tsconfig |
| lint (`npm run lint` = tsc --noEmit) | PASS | exit 0; no ESLint configured |
| frontend build, no env | FAIL (by design) | vite.config.ts throws unless VITE_API_BASE_URL is `/api` or an https URL ending in `/api` |
| frontend build, VITE_API_BASE_URL=/api | PASS | 2435 modules, built in 14.33s |
| backend build (syntax check) | PASS | exit 0 |
| backend npm test | PASS | 118 tests, 118 pass, 0 fail |
| frontend npm test | PASS | exit 0, planner suite "All 33 assertions passed" |
| backend start (full) | NOT VERIFIED | needs PostgreSQL; none installed, Docker daemon not running |
| GET /health | PASS | 200 `{"status":"ok"}` via createApp() without DB warm-up |
| GET /ready | EXPECTED FAIL | 503, ECONNREFUSED (no DB) |
| GET /api/destinations | NOT VERIFIED | 503 without DB; data path untested |
| frontend vite preview | PASS | GET / returns 200, 2950 bytes |
| git status | PASS | clean on main, up to date with origin/main |
| files over 5 MB | PASS | only backend/reports/frontend-browser-report.json (26.8 MB), gitignored and untracked |

## Findings to triage

1. **Which tree is the submission?** `group-07-heritage-tourism-planner-main/` (the one AGENTS.md calls canonical) has no `.git` and differs from this repo, e.g. `dsa/planning/hotelPolicy.ts`, `backend/scripts/expand-catalog.js`, `compose.local.yml`, extra data files. Needs a decision before any fix.
2. `npm audit`: frontend 2 (dompurify critical, vite high), backend 4 (body-parser high, zod high, qs and ip-address moderate). Fixing means dependency upgrades, which are out of scope unless approved.
3. `/api/health` returns 404. The health route is `/health` (and `/ready`). Not a bug, but any doc or script that uses `/api/health` would be wrong.
4. `frontend/src/utils/offlineStorage.ts:112` leaves a `console.log` in the service worker registration path.
5. `backend/chat/config.js` reads `CHAT_MOCK`. `groqService.js` rejects it with 503, so it is inert, but it is a mock switch in a production path.
6. Groq is a real feature (Heritage Guide chatbot), not leftover code. Key is server-side only, `GROQ_API_KEY=` empty in `.env.example`.
7. No TODO/FIXME in source. No hardcoded API keys found. No tracked `.env` files.
8. `localhost` appears in source only inside the production CORS check in `backend/config/env.js`.
9. Tooling note: Git Bash rewrites `VITE_API_BASE_URL=/api` to `C:/Program Files/Git/api`. Use `MSYS_NO_PATHCONV=1` or PowerShell.

## Update after owner decisions

- Remotes: `origin` = satvikp-coder/demo-group7; the CSC210-Monsoon2026 repo is remote `classroom`, not `origin`.
- Tree comparison: nearly all differing files are CRLF vs LF only. See the table sent in chat. Nothing copied.
- Database: container `group07-heritage-postgres` (127.0.0.1:55432). Fresh database `heritage_final` created; `db:migrate` (000-008) and `db:seed` run. Credentials only in ignored backend/.env. The older `heritage_planner` DB (migration 004, 25 attractions) was left untouched.
- Real `npm start`: /health 200, /ready 200, /api/destinations 200 with 8 destinations.
- `npm run test:integration` (auth, destinations, trips, admin, db constraints): all pass, exit 0. Generated reports under backend/reports were restored with git checkout.
- Seed script also rewrites tracked backend/reports/seed-report.json; restored after running.
- Pending for README step: note `MSYS_NO_PATHCONV=1` for Windows Git Bash users.

## Triage (no code changed)

Environment: backend on `heritage_final` (PostgreSQL, port 5310), frontend dev server on 4310, Playwright with Chrome, curl and small scripts. The seeded DB has 25 attractions, so the audited live site's richer data (physical-demand values, 100 attractions) is not present here.

Playwright `npm run test:frontend` (backend `test:browser`): `verified: true`, 64 checks, cleanup done, catalog preserved.

Status: REPRODUCED / NOT REPRODUCED / NOT VERIFIED. Severity: C critical, H high, M medium, L low.

### List A (live-site audit)

| ID | Area | Sev | Status | Evidence | Proposed fix | Files |
|----|------|-----|--------|----------|--------------|-------|
| A-C1 | Auth / admin | C | NOT REPRODUCED | Invented login returns 401, UI shows "Invalid email or password", no token stored, no Admin Panel text. Tourist token on 5 admin routes returns 403, no token returns 401. | none | n/a |
| A-H1 | Budget | H | NOT REPRODUCED | Budget page for the Ahmedabad trip shows the trip's own subtotal ₹13,028; API `/trips/:id/budget` equals the generated budget; suite check 12. | none | n/a |
| A-H2 | Wheelchair filter | H | NOT REPRODUCED | API generate with `wheelchair_accessible_only:true` on Somnath returns only Somnath Temple (wc=true). UI toggle not clicked separately. | none | n/a |
| A-H3 | Hotel substitution | H | NOT REPRODUCED | Selected Premier Somnath kept: `starting_hotel_id` matches, `hotel_replaced:false`; suite checks 10 and 11. | none | n/a |
| A-H4 | PDF export | H | NOT REPRODUCED | "Download PDF" gives a 561,478 B PDF at 1440px and 458,051 B at 390px, no console errors. | none | n/a |
| A-H5 | Images | H | NOT REPRODUCED | Explore screenshot: lions (Gir), Sun Temple (Modhera), Rann, Saputara lake, Somnath temple match. Hotel cards use category SVG fallbacks. Not every image reviewed individually. | none | n/a |
| A-H6 | Header / page overflow | H | REPRODUCED (320px only) | 768px authenticated: no overflow. 320px: Home and Explore document is 377px wide (viewport 320); cause is the Explore "SORT BY" row (`shrink-0`). | let the sort row wrap or shrink on small screens | frontend/src/components/ExploreView.tsx |
| A-H7 | Route diagram overflow | H | NOT REPRODUCED | Itinerary at 390px: scrollWidth 390. At 320px overflow is 367px, from action buttons, not the diagram. | none | n/a |
| A-H8 | City advice overflow | H | NOT REPRODUCED | Somnath detail page at 390px: scrollWidth 390, no wide elements. | none | n/a |
| A-H9 | Saved trip opens wrong trip | H | NOT REPRODUCED | Open Itinerary for Rann of Kutch, Modhera and Somnath each show their own city, hotel and stops. | none | n/a |
| A-M1 | Explore demand filter | M | NOT VERIFIED | Seeded DB has no physical-demand values: cards show no badge and the LOW filter returns 0. Code uses `attractions[0].physicalDemand` for both filter and badge. | none until demand data exists | n/a |
| A-M2 | Explore demand sort | M | NOT VERIFIED | Same as M1: no demand data to sort. | none | n/a |
| A-M3 | Circuit total vs legs | M | FIXED (b52af5e) | Displayed day km vs sum of `/trips/:id/map/:day` legs: Ahmedabad day 1 17.29 vs 15.77, Rann of Kutch day 1 10.8 vs 10.52. Modhera, Somnath and the other days match. | derive displayed total from the same legs | frontend/src/components/ItineraryView.tsx:741, frontend/src/utils/itineraryPlanner.ts |
| A-M4 | Time Mismatch warning | M | FIXED (22fa0d8) | Modhera shows "Time Mismatch ... Note recommends late afternoon or sunset" although the note only says "sunrise to sunset" in an unrelated sentence. | use explicit visiting-window data | frontend/src/utils/bestTimeChecker.ts |
| A-M5 | Negative budget | M | NOT REPRODUCED | Input cannot change at all (see B2), so -1 cannot be entered. Masked by B2. | resolved with B2 | n/a |
| A-M6 | GSRTC saving | M | NOT REPRODUCED | Savings cards say "Savings not available from the server"; no totals change. | none | n/a |
| A-M7 | ASI pass discount | M | NOT REPRODUCED | Same as M6. | none | n/a |
| A-M8 | Stale title after city change | M | NOT REPRODUCED | `tripTitle` is built from `currentCityName` (ItineraryView.tsx:198); suite check 35 covers strategy comparison. Manual adjust-then-compare flow not re-run. | none | n/a |
| A-M9 | URL state | M | NOT REPRODUCED | Explore, hotels and budget set `/`, `/hotels`, `/budget`; reload on /budget stays; Back returns to /hotels. | none | n/a |
| A-M10 | Session on refresh | M | NOT REPRODUCED | Reload on /profile stays signed in (token in sessionStorage, `/auth/me`). | none | n/a |
| A-M11 | Footer anchors | M | NOT REPRODUCED | From /hotels, "Solanki Stepwells" goes to Home, "Heritage Haveli Lodging" to /hotels; suite check 37. | none | n/a |
| A-M12 | Gujarati/Hindi coverage | M | REPRODUCED | /explore in GU has 19 and in HI has 15 long English-only lines, e.g. destination descriptions and "Verified against Gujarat Tourism Board...". | translate destination descriptions and remaining strings | frontend/src/data/gujarati.ts, translations.ts, destination data |
| A-M13 | Gujarati/Hindi search | M | REPRODUCED | Searching સોમનાથ / सोमनाथ shows "No heritage destination found". | index localized names and aliases in the trie | frontend/src/utils/destinationTrie.ts, ExploreView.tsx |
| A-M14 | PNG icons | M | NOT REPRODUCED (re-verified on production build) | `/icon-192.png` 200 image/png 8,097 B and `/icon-512.png` 200 image/png 20,865 B. Production host rewrite not tested. | none | n/a |
| A-M15 | Card description contrast | M | REPRODUCED | 12px description text measures 2.28:1 on /explore (38 nodes under threshold) and 4 nodes on /hotels. Matches audit's 2.27:1. | use a lighter text colour for card descriptions | frontend/src/components/ExploreView.tsx, HotelsView.tsx |
| A-M16 | Planner dialog | M | NOT REPRODUCED | `role=dialog` present and Escape closes it. | none | n/a |
| A-M17 | Unnamed controls | M | REPRODUCED | Explore search input has only a placeholder; admin "Add record" dialog has an icon-only close button and two text inputs with no accessible name. Budget input is labelled. | add labels and aria-labels | frontend/src/components/ExploreView.tsx:228, AdminDashboardView.tsx |
| A-M18 | "Ferry Crossing" badge | M | NOT REPRODUCED | No "Ferry" text on the Ahmedabad, Modhera or Rann trips; current data has no local-transit stop. | none | n/a |
| A-L1 | Home site count | L | NOT REPRODUCED | Home shows "Browse 8 Heritage Sites"; count substituted at runtime (Hero.tsx:120). Hindi/Gujarati not checked in browser. | none | n/a |
| A-L2 | Forgot password | L | NOT REPRODUCED | Opens a "Password reset unavailable" panel. | none | n/a |
| A-L3 | Visualizer labels | L | NOT VERIFIED | Not tested. | n/a | n/a |
| A-L4 | Invalid route / shared link | L | NOT REPRODUCED | `/no-such-page` shows "Heritage Route or Monument Not Found"; malformed `?shared=` shows "Invalid Shared Itinerary Link". | none | n/a |
| A-L5 | Metadata | L | NOT REPRODUCED | index.html has canonical, Open Graph and Twitter tags. | none | n/a |

### List B (code audit)

| ID | Area | Sev | Status | Evidence | Proposed fix | Files |
|----|------|-----|--------|----------|--------------|-------|
| B1 | Offline cache | M | REPRODUCED | `saveTripToOfflineCache` has no callers; after opening a generated trip `localStorage` has no `heritage_pwa_cached_trips`. Offline reopen not verifiable on the dev server (no service worker). | call it after generate/load | frontend/src/utils/offlineStorage.ts, ItineraryView.tsx or App.tsx |
| B2 | Simulate budget cap | M | FIXED (b8b1a6e) | Typing 5000 leaves value 30000, cap ₹30,000, 43% Capacity. | bind input to the simulated state and use it in calculations | frontend/src/components/BudgetPlannerView.tsx:56-57, 202-221 |
| B3 | Route map crash | L | REPRODUCED (latent) | `location(undefined)` throws `TypeError: Cannot read properties of undefined (reading 'lat')`. Not triggered by real data (error boundary exists). | guard the `find()` results | frontend/src/components/ItineraryRouteMap.tsx:14-16, 57 |
| B4 | Admin hotel price NULL | n/a | NOT A BUG | Per owner: DB column NOT NULL CHECK >= 0, 11 of 11 hotels priced. | none | n/a |
| B5 | Nights vs dates | H | FIXED (2129771) | `POST /trips` with days 3, lodging_nights 2, arrival 2026-11-01, departure 2026-11-02 returns 400 "Accommodation dates and nights must agree". Same error from `accommodationNights()` directly. | derive nights from the dates in the planner (do not edit dsa) | frontend/src/components/PlannerModal.tsx:152, 159, 750, 783 |
| B6 | Password validation | M | FIXED (bac7d9d) | Register with `testpass123` returns 400 (needs 12+ chars, upper, symbol); client has no matching check and a blank form is still POSTed, showing raw server text. | add the same rules client-side | frontend/src/components/AuthView.tsx:72-80, 97-109 |
| B7 | Profile N+1 | M | REPRODUCED | `/profile` with 6 saved trips: 36 requests in 1.65 s on localhost (5 per trip, plus 4 duplicate `/destinations/catalog`, trips and `/auth/me`). Grows linearly with trips. | batch or cache per-destination fetches | frontend/src/components/ProfileDashboardView.tsx:88-98, frontend/src/api/index.ts:140-149, 300-304 |
| B8 | Share link payload | M | FIXED (5f49def) | Round trip drops travelers, rooms, lodgingNights, arrival/departure/start dates, wheelchair flag and weights (all `undefined` after decode). | include them in encode/decode | frontend/src/utils/shareUrl.ts:14-24, 58-67 |

### Extra checks

| ID | Check | Status | Evidence |
|----|-------|--------|----------|
| V1 | Invented login and admin panel | NOT REPRODUCED | 401, no token, no admin controls (see A-C1). |
| V2 | Tourist token on admin API | NOT REPRODUCED | GET users/destinations/attractions, POST destinations, DELETE hotels all 403; no token 401. |
| V3 | PDF oklab error | NOT REPRODUCED | PDF downloads with no console errors at 1440 and 390px. |
| V4 | Saved trip Open Itinerary | NOT REPRODUCED | Each saved trip loads its own destination (see A-H9). |

### New findings not on either list

| ID | Area | Sev | Status | Evidence | Proposed fix | Files |
|----|------|-----|--------|----------|--------------|-------|
| N1 | Algorithm stats text | L | FIXED (d4ab87a) | Itinerary shows "Generated in Not availablems -- 6 attractions..." on every trip. | hide the unit when the time is unavailable | frontend/src/components/AlgorithmStatsPanel.tsx:32, 53 |
| N2 | Request volume | L | REPRODUCED | `/destinations/catalog?limit=100&offset=0` fetched 4 times on the login page and on /profile. | share one fetch | frontend/src/api/index.ts, App.tsx |

### Batch plan (REPRODUCED items only)

- **Batch 1, security/auth/data correctness:** B6 (client password rules), B8 (share-link payload). There are no reproduced critical items.
- **Batch 2, planner/budget logic:** B5 (nights vs dates, the only High), B2 (simulate budget cap), A-M3 (circuit total vs legs), A-M4 (Time Mismatch).
- **Batch 3, PDF/offline/share/route-map/request volume/PWA icons:** B1 (offline cache), B7 and N2 (request volume), B3 (route-map guard). PDF and icons are NOT REPRODUCED.
- **Batch 4, responsive/accessibility/i18n:** A-H6 (320px Explore overflow), A-M15 (contrast), A-M17 (unnamed controls), A-M12 and A-M13 (Gujarati/Hindi content and search).
- **Batch 5, low priority:** N1 ("Not availablems").

Nothing has been fixed in this step.

### Fix log (Part A)

| ID | Status | Commit | Proof |
|----|--------|--------|-------|
| B6 | FIXED | bac7d9d | Before: Playwright register form sent a POST for a blank form, `testpass123` and `Short1!`. After: 0 POSTs for those, with "Full name is required.", "An email address is required.", "Password needs at least 12 characters, an uppercase letter, a symbol."; a strong password still registers ("Account created"). New `tests/frontend/password-policy.test.ts` (3 tests) includes a parity check against the backend `registerBody` schema. |
| B8 | FIXED | 5f49def | Round-trip of travelers, rooms, lodging nights, arrival/departure/start dates, wheelchair flag, weights and hotel category (version 2). Version 1 and unversioned links decode with defaults; invalid optional values are dropped; links from a newer version are rejected. New `tests/frontend/share-url.test.ts` (6 tests): 3 of them fail against the old `shareUrl.ts`, all 6 pass now. Browser: v2 link stores all preferences, v1 link loads with defaults, v99 and garbage links show "Invalid Shared Itinerary Link" and "Return to Home Screen" goes to Home. |

Suite after Part A: backend 118/118; frontend unit 6+2+3+6 tests and 80 and 33 assertions all pass; `tsc --noEmit` clean; production build OK; Playwright `test:frontend` verified, 64 checks.

### Fix log (Part B)

| ID | Status | Commit | Proof |
|----|--------|--------|-------|
| B5 | FIXED | 2129771 | Before (Playwright, planner UI): 3-day trip, default 2 nights, arrival 2026-11-01, departure 2026-11-02 left nights at 2 and blocked generation with "Accommodation dates and nights must agree" (no trip POST). After: nights become 1 and generate returns 200. Also verified in the UI: same-day (0 nights, 200), multi-night 11-01 to 11-03 (200), departure changed afterwards to 11-04 (3 nights, 200), nights edited moves the departure date, missing dates keep the default with an inline note, departure before arrival / one date only / nights out of range show an inline message and block generation with no trip created. New `tests/frontend/stay-dates.test.ts` (6 tests). `dsa/` unchanged (`git diff -- dsa` empty). Only `PlannerModal.tsx` plus the new helper `frontend/src/utils/stayDates.ts`. |
| B2 | FIXED | b8b1a6e | Before: typing 5000 left the input at 30000, cap ₹30,000, 43% Capacity (input bound to the fetched value, handler wrote an unused state, a message fired on every keystroke). After (Playwright): typing shows no message; on blur the cap becomes ₹5,000, capacity 100% and the over-budget banner uses it (₹19,517 − ₹5,000 = ₹14,517 over); -1, blank and 999999 are rejected on commit with a message and the value reverts; re-entering the saved amount clears the simulation note. Server totals unchanged. New `tests/frontend/budget-cap.test.ts` (3 tests). The existing Playwright check 34 in `tests/frontend/completion_auxiliary.py` asserted the old frozen behaviour (value snapping back, message on keystroke) and was updated to the specified behaviour. |
| A-M3 | FIXED | b52af5e | Root cause: the day total (17.29 km) sums the planner's stored route records (`generation_summary.legs`); the interactive map showed display-only OSRM road distances with a straight-line fallback (Ahmedabad day 1: 4 legs 12.31 km routed + 1 leg 3.46 km straight-line = 15.77 km, where the stored Kankaria Lake to hotel leg is 4.89 km). Fix is display-only in `ItineraryRouteMap.tsx`: popups and the day line now use the saved per-leg distances (helper `savedLegDistances.ts`). After (Playwright): list `17.29 km local circuit`, map `Day distance (saved route records): 17.29 km`. No route or attraction choice changed (`git diff -- dsa backend` empty). New `tests/frontend/saved-leg-distances.test.ts` (4 tests). |
| A-M4 | FIXED | 22fa0d8 | Root cause is the logic, not the data: `best_time_note` in the current catalog is a provenance/hours/accessibility note, and Modhera's says "Other sources describe sunrise to sunset" (opening hours). `checkBestTimeConflict` substring-matched "sunset"/"sunrise", so Modhera warned at every arrival time with contradictory advice (08:30 to 10:00 told "late afternoon or sunset", 12:00 to 15:00 told "early morning / sunrise"). Fix strips opening-hours ranges ("sunrise to sunset" and variants) before the rules run; real recommendations such as "Visit around sunset" (Sunset Point Saputara) still warn. Data note untouched. After (Playwright): Modhera trip shows 0 "Time Mismatch" (was 1); plans unchanged (Modhera: Sun Temple 08:30, Modheshwari Mata Temple 08:19; display-only change, `git diff -- dsa backend` empty). New `tests/frontend/best-time.test.ts` (4 tests; 2 fail on the original checker). |
| N1 | FIXED | d4ab87a | Saved trips deliberately carry `executionTimeMs = NaN`, and `AlgorithmStatsPanel` glued "ms" onto "Not available". Now the time is omitted when absent: collapsed text reads "Generated -- 6 attractions, 31 direct routes, 0 Dijkstra fallbacks." and the expanded Exec Time shows "Not recorded". Playwright on Ahmedabad and Modhera trips: no "Not availablems" or "Not available ms". New `tests/frontend/execution-time.test.ts` (2 tests). Not changed: the GRAPH OPS tile still reads "Not available nodes / Not available edges" (same kind of wording, outside N1). |
| D3 (docs) | FIXED | 8e38594 | `database/seeds/README.md:9` said 175 attractions. The SQL file does contain 175 rows (7 destinations x 25, counted with awk), so the number was accurate for the file but misleading as runtime state: it is a legacy unreviewed export that no script loads (`backend/scripts/seed.js` uses `data/*.csv`, 8 destinations / 25 attractions). Only that line was reworded; no other docs touched. |

### Fix log (Batch 3)

| ID | Status | Commit | Proof |
|----|--------|--------|-------|
| N1b GRAPH OPS | FIXED | 5dba52a | Cause: saved trips carry NaN for nodes/edges, `displayNumber` returned the text "Not available" and the tile appended the "nodes"/"edges" units. Now "N/A" (no unit) when absent, real numbers with units when present. Playwright: tile reads "N/A / N/A". New `tests/frontend/algorithm-stats.test.ts` (3 tests; 2 fail on the original component). |
| B3 | FIXED | 54d554e | Before: the original expression `location(stops.find(...)!)` throws `Cannot read properties of undefined (reading 'lat')` for a leg whose stop id is absent. Now `location` accepts a missing stop and leg filtering lives in `utils/routeLegs.ts` (`drawableLegs`, no non-null assertions). New `tests/frontend/route-legs.test.ts` (3 tests): a leg with a ghost stop id is skipped and the other legs are returned. Playwright regression on the Ahmedabad trip: 5 legs and 6 markers drawn, no page errors. The ghost-id case cannot be injected end to end because the component validates the API legs against the stops first; it is covered by the unit test. |
| B7 + N2 | FIXED | 4e38ce0 | Measured with Playwright against the local API (6 saved trips): login page 4 requests / 1.88 s before, 1 request after; `/profile` reload 36 requests / 2.67 s before (catalog x4, then 5 per trip), 9 after (trips list, 6 trip details, catalog x1, `/auth/me`); Explore + search "Ahmed" 10 before, 7 after (the 4 remaining are the first destination detail fetch, cached afterwards). Wall-clock times on localhost are dominated by the idle wait, so latency is not meaningfully different; the saving is request count. Fix: in-memory cache with in-flight de-duplication (`utils/requestCache.ts`) for the catalog and per-destination data, cleared on logout (`session.clear`) and after admin edits (`catalogMutation`); the profile reads city names and counts from the cached catalog (`loadItinerary(..., {summaryOnly:true})`). Not substituted: opening an itinerary still uses the full per-destination endpoints, because they differ from the catalog rows (they include `provenance_review` and return decimal strings), checked field by field. No new backend endpoints. In-app navigation no longer refetches the catalog; logout then login refetches it. Playwright admin CRUD checks still pass. New `tests/frontend/request-cache.test.ts` (7 tests). |
| B1 | FIXED | 4c9bce4 | Verified on the PRODUCTION build (`vite build` served with a scratch static+/api proxy, service worker active, Playwright `context.setOffline`). Before (original code, same script): no `heritage_pwa_cached_trips` written; offline reload shows "Unable to reach the server. Please try again." and no itinerary. After: cache written (about 40 KB for one trip); offline reload renders the full itinerary (title, base hotel, 2 day cards, no errors) under the existing `OfflineBanner` reading "Offline copy -- showing your itinerary saved on 30 Oct 2026, 8:38 am. Reconnect for the latest prices and availability."; back online the banner disappears and live data loads. Service worker online: all `/api` calls returned 2xx (it already bypasses `/api/` and Authorization requests). Changes: `ItineraryView` loads through `loadItineraryOrOfflineCopy` (saves on every successful load or generation, falls back to the stored copy only when the server is unreachable, not for other errors); `offlineStorage` keys copies by trip id (previously two trips with the same city/days/budget overwrote each other), stores the API copy, preserves NaN, keeps the 10 newest, and `clearOfflineTrips()` runs on sign out because saved trips are private (verified: 1 cached trip before Sign Out, 0 after). New `tests/frontend/offline-storage.test.ts` (6 tests; it caught a tie-break bug in my pruning). Observed, not changed: while offline the navbar shows "Sign In" because `/auth/me` cannot be reached. |
| A-M14 | NOT REPRODUCED | none (no code change) | Production build served by the scratch preview: `/icon-192.png` 200 `image/png` 8,097 B, valid PNG header, 192x192 (declared 192x192); `/icon-512.png` 200 `image/png` 20,865 B, 512x512 (declared 512x512); `/icon.svg` 200 `image/svg+xml`; `apple-touch-icon.png`, `favicon-32x32.png`, `favicon.ico` also 200 with image types. All files are present in `dist/`. `nginx.conf` (`try_files $uri $uri/ /index.html`) and `vercel.json` (filesystem first, then rewrite) serve real files and fall back to `index.html` only for files that do not exist, which is what an older deployment missing the PNGs would show. No icons needed generating. Not verified: the actual hosted site. |
