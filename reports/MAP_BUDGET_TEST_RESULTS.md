# Map and budget validation

## Baseline and preservation

Baseline: `f65b96407623010f10dacb2ec9c07cbc6526f8df` on both main remotes; clean release checkout before work. Backend 95/95 and frontend TypeScript passed. Private fingerprints were captured for all nine existing catalog/account/trip/budget tables. No schema migration or catalog update is required by this feature.

## Executed checks

| Command / check | Observed result |
|---|---|
| `npm run test:map-budget` | 9 deterministic routing/cost cases passed. |
| `npm run test:all:local` | Final repeat after PDF repair: 18/18 gates and 104 backend tests passed, completed 2026-10-20T03:41:23Z. |
| `npm run test:production` | 17/17 container gates passed, including security, browser, persistence, backup/restore, database outage recovery and read-only chat/provider isolation. |
| `npm run test:map-budget:local -- --production` | Final targeted run passed 2026-10-19T21:19:33Z: 8 destinations, 16 generated trips (one/three days), 10 real browser viewport cases, separate budget page and six edge-case groups. |
| Actual PDF with map open | 849162-byte valid PDF; all three saved days made visible for capture, map omitted, selected-day view restored. |
| `npm --prefix frontend run lint` | TypeScript passed after PDF repair. |
| `npm run audit:source` | Zero credential patterns and zero unapproved UI changes. |
| Live routing probe | One actual Modhera connection: 0.4609 km, 16 coordinate pairs. See routing report. |

University demo passed five authenticated journeys across three destinations. Chat regression passed 71 real SQL/security checks and three viewport tests using the isolated provider fixture; no live Groq request was made. Local installation passed all seven readiness checks, and the installed guest widget smoke passed. Image audit: 120 records, 38 photo associations, 82 intentional fallbacks, zero errors. All nine original table fingerprints match exactly (catalog 8/44/56/12/497; users/trips/stops/budgets 2/5/43/4). Final container rerun after PDF/profile-caption repair passed all 17 gates, completed 2026-10-20T03:47:41Z. No required local test remains failing.

## Coverage and qualifications

Real PostgreSQL/API tests generate itineraries for Ahmedabad, Champaner, Dwarka, Gir National Park, Modhera, Rann of Kutch, Saputara and Somnath. Every day's leg endpoints match persisted stop order. Map reads leave saved itineraries unchanged; guest requests return 401, other-owner requests 404, malformed day 400 and out-of-trip day 404. Budget values match persisted stop sums, with two travelers, two rooms and zero/two accommodation nights. Unknown transport/food remain incomplete rather than free.

Browser coverage: all eight destinations at 1440px, plus Ahmedabad at 768px and 390px. Tests exercise opening/closing, zoom/fit, marker/timeline keyboard synchronization, day switching, rapid switches, budget labels, room-night text, no horizontal overflow and no JavaScript exceptions. Deterministic edge responses cover provider failure, mixed road/estimated lines, stale stop identity, missing coordinates, empty day and a single stop.

Unit coverage includes coordinate validation/Haversine units, zero-distance legs, geometry validation/snapping, directional caching, timeout/cancellation/concurrency, known positive/zero/unknown prices, invalid values, paise rounding, legacy zero ambiguity, incomplete meals/taxes and missing-meal cost ranking. Existing algorithm/accommodation tests remain in the full suite.

Automated browser tests substitute OSM tile bytes to avoid bulk/headless public tile harvesting. Their blank backgrounds are intentional test fixtures, not evidence of live tile availability. All-destination routing is deliberately offline; solid-road behavior uses explicit deterministic fixtures. Only the separate Modhera leg was verified against the live provider.

Screenshots: [desktop](map-budget-1-1440.png), [tablet](map-budget-1-768.png), [mobile](map-budget-1-390.png). They contain isolated test trips and mocked tile backgrounds.

## Reproduced issues and fixes

- Existing sums and labels hid missing food/transport and ambiguous legacy zeros; additive cost states and known-subtotal labels fix this without rewriting rows.
- Budget page accommodation text used trip days; it now shows actual purchased nights and rooms.
- Marker popup selection raced Leaflet icon updates; deferred popup opening fixes it without moving stored coordinates.
- A prior marker selection scroll moved the map out of view; removed that automatic scroll while retaining shared highlighting.
- PDF capture inherited the selected-day visibility filter; temporary capture-only display overrides include all days and restore the map view afterward. Actual download verified above.
- Test deep-link and overlapping-marker selectors were corrected to the real existing link contract and visible attraction marker; assertions were not weakened.
- The historical September raw source guard rejects later authorized UI changes against its old baseline. The current approved-hash `audit:source` passes; old baseline and assertions remain unchanged.

Machine evidence: `map-budget-integration.json`, `map-budget-browser.json`, `map-live-routing.json`, and curated final regression summaries. No live AI inference was needed for this scoped change.

Fresh staged-index export source audit passed with zero secret patterns and zero unapproved UI changes. Private-value/path scan passed. See `map-budget-release-review.json`. The installed local build is available at http://localhost:8080.
