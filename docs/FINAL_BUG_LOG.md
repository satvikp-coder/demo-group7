# Final bug log

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
| A-M14 | PNG icons | M | NOT REPRODUCED | `/icon-192.png` 200 image/png 8,097 B and `/icon-512.png` 200 image/png 20,865 B. Production host rewrite not tested. | none | n/a |
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
| N1 | Algorithm stats text | L | REPRODUCED | Itinerary shows "Generated in Not availablems -- 6 attractions..." on every trip. | hide the unit when the time is unavailable | frontend/src/components/AlgorithmStatsPanel.tsx:32, 53 |
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
