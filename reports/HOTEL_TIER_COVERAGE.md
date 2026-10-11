# Hotel category coverage

Installed at http://localhost:8080; full18-gate regression PASS. Original live catalog: 8 destinations, 43 hotels, 44 attractions, 12 restaurants, 322 routes. Prepared additive catalog: 13 sourced hotels and 175 OSRM road-route pairs; isolated final: 56 hotels, 497 routes. All original rows preserved, dry-run and late-record rollback tested, repeated import inserts zero rows.

Low Cost is below INR1,500; Budget INR1,500 through INR4,000; Premium above INR4,000. These are project price bands applied to base indicative room estimates, not live quotes. Nearby properties retain actual localities. No invented ratings or photos.

| Destination | Hotel | Category | INR/night estimate | Source |
|---|---|---|---:|---|
| ahmedabad | Hotel Alka Inn, Ahmedabad | Budget | 1700 | [Published room reference](https://www.hotelalkainn.com/tariff.html) |
| champaner | Hotel Rajdhani And Guest House, Halol | Low Cost | 800 | [Published room reference](https://yatradham.org/halol-hotel-rajdhani-and-guest-house-pavagadh.html) |
| dwarka | Mathura Bhavan, Dwarka | Low Cost | 896 | [Published room reference](https://yatradham.org/dwarka-mathura-bhavan.html) |
| dwarka | IRA by Orchid Dwarka | Premium | 5156 | [Published room reference](https://irahotels.com/dwarka.html) |
| gir-national-park | Hotel Sapphire, Junagadh | Low Cost | 908 | [Published room reference](https://www.goibibo.com/hotels/g-pu-hotels-under-1000-in-junagadh-hotel.html) |
| gir-national-park | Dwarkesh Farm & Resort, Somnath | Budget | 2159 | [Published room reference](https://www.easemytrip.com/hotels/dwarkesh-farm-resort-4925169/) |
| modhera | The Grand Takshak, Mehsana | Low Cost | 1050 | [Published room reference](https://yatradham.org/mehsana-the-grand-takshak.html) |
| modhera | Shankus Waterpark and Resort, Mehsana | Premium | 4879 | [Published room reference](https://www.easemytrip.com/hotels/shankus-waterpark-and-resort-1143187/) |
| rann-of-kutch | Hotel Sahara Palace, Bhuj | Low Cost | 1199 | [Published room reference](https://yatradham.org/bhuj-sahara-palace-hotel.html) |
| rann-of-kutch | Hotel Prince Residency, Bhuj | Budget | 2561 | [Published room reference](https://www.ixigo.com/hotels/hotel-prince-residency-in-bhuj-1111947-d) |
| saputara | Manas Cottage, Saputara | Low Cost | 1430 | [Published room reference](https://www.makemytrip.com/hotels/saputara-hotels-with-room_service.html) |
| saputara | Savshanti Motels, Saputara | Budget | 2800 | [Published room reference](https://yatradham.org/savshanti-motels-saputara.html) |
| somnath | Lords Inn Somnath | Premium | 4255 | [Published room reference](https://www.ixigo.com/hotels/hotels-in-somnath) |

Every record includes checked date2026-10-11, price/room basis, coordinate basis and field sources in [the reproducible manifest](../data/hotel-coverage/catalog-20261011.json). Rates are published snapshots, some undated; confirm current rates/taxes and guest policies. No availability claim. Known minimum guests and quoted room capacities validated before writes; zero-night anchors and old records remain compatible. New images intentionally fall back because publisher photo rights are unverified.

Tests so far: backend60/60, frontend types PASS, source audit0secrets/0unapprovedUI. Isolated API48 one-/three-day generation and persisted retrieval cases across24city/category slots PASS; selected UUIDs and accommodation subtotals verified. Browser guest preflight3widths PASS. Expanded production-preview PASS, including72catalog/category/width cases,9language cases,3guest preflight cases and3budget recoveries. Backup restored to separate local_restore_hotel_20261011 with all9table fingerprints matching. Local rebuild, dryrun/import/repeat and all9-table preservation PASS. Installed read-only API checks24/24category slots PASS;56hotels/29usable indicative prices. Installed72details/9languages/3guestpreflight browser PASS; full18 regression PASS. Readiness7/7 and image audit120records/38photo associations/82intentional fallbacks/0errors PASS.

Safe command after backup: `npm run local:hotel-coverage -- --dry-run`, then `npm run local:hotel-coverage`; repeat inserts nothing. No reset/reseed/update of old hotels.

## Installed choice counts

| Destination | Recorded hotels | Low Cost | Budget | Premium | Unpriced |
|---|---:|---:|---:|---:|---:|
| Ahmedabad | 12 | 1 | 1 | 3 | 7 |
| Champaner | 3 | 1 | 1 | 1 | 0 |
| Dwarka | 9 | 1 | 2 | 1 | 5 |
| Gir National Park | 7 | 1 | 1 | 1 | 4 |
| Modhera | 6 | 1 | 1 | 1 | 3 |
| Rann of Kutch | 4 | 1 | 1 | 1 | 1 |
| Saputara | 9 | 1 | 1 | 1 | 6 |
| Somnath | 6 | 2 | 2 | 1 | 1 |

Read-only evidence: [installed API matrix](hotel-tier-installed.json), [original row preservation](hotel-coverage-live-preservation.json), [48 actual API generation cases](hotel-tier-api-tests.json). Backup restored and verified separately before apply. Existing8destinations/44attractions/12restaurants unchanged; routes322to497, hotels43to56.

## Changed files and implementation

- `data/hotel-coverage/`:13-record source manifest, research/provenance and8cached OSRM matrices.
- `backend/scripts/expand-catalog.js`, `scripts/local-stack.js`, `package.json`: existing additive importer validation and explicit repeatable maintenance command; no schema changes.
- `dsa/planning/accommodation.ts`, `backend/models/tripModel.js`, `backend/controllers/tripController.js`: enforce sourced guest conditions before writes, retaining legacy/zero-night semantics.
- `frontend/src/api/index.ts`, `frontend/src/api/types.ts`, `PlannerModal.tsx`, `HotelCategoryPicker.tsx`, hotel/accommodation dictionaries: real metadata and translated preflight; total recorded vs category-selectable counts and all hotel details; existing styles retained.
- Public hotel manifest and data credits provide sources and relevant ODbL attribution. No hotel image rights guessed.
- API/browser/preservation tests are repeatable and isolated; Phase3 and professor-demo runners load the same catalog. No live test users or trips created.

Limitations:27existing hotels retain unknown usable prices; their details remain visible without fabricated categorization. Published room estimates can change and are not bookings. New13records use intentional photograph fallbacks until appropriate exact-property reuse rights are established. No public deployment claimed.

## Final test evidence

- `npm run test:all:local`:18/18gates PASS,60backend tests and64browser-control groups; [fresh full suite](hotel-tier-full-tests.json).
- `npm run test:phase3:production:local`:PASS; rollback, exact preservation, idempotence,32cross-destination cases plus48category plan/persistence cases; [isolated release](phase3-import-tests.json).
- Installed read-only hotel browser:72city/category/width cases PASS;9language/width cases PASS;3guest/room preflight cases PASS. [Details matrix](hotel-catalog-details.json), [languages](phase3-hotel-localization.json), [guest conditions](hotel-guest-browser-tests.json).
- `npm run local:demo:check`:7/7PASS. `npm run audit:images`:120records,38genuine-photo associations,82intentional fallbacks,0errors.
- Restore to NEW local_restore_hotel_20261011:all9pre-import table fingerprints match. Live dryrun leaves all rows unchanged; apply adds13hotels/175routes; repeat adds0/0. Post-suite preservation confirms original43hotels,322routes and all original user/trip/stop/budget rows unchanged.
- Source scan0secrets/0unapprovedUI;34style checks and2localization tests PASS.

The earlier full-suite failure was a stale assertion for the renamed Recorded Hotels label; repaired with the same empty-catalog visibility assertion. Initial enrichment-preview failure was a test click on already-selected Low Cost; test now changes category before expecting a new request. No weakened application constraints or fake responses.

Professor-demo runner with new catalog PASS: five real authenticated journeys across Ahmedabad (distance/cost/rating), Somnath (cost), Modhera (distance), saved retrieval/refresh and logout401. See itinerary-demo-runner.json and itinerary-demo-browser.json. Existing16container gates are previous verified results, not rerun for this change. Current production-mode evidence is the expanded Vite preview plus installed rebuilt Docker app and browser/API tests.

Requested 24-slot hotel-tier coverage: **PASSED**. Refresh http://localhost:8080, choose any destination, Continue to Logistics, and switch Low Cost/Budget/Premium. Every category has a selectable real property; other recorded hotels remain inspectable. Final readiness7/7 and original-row preservation repeated after all suites PASS. Published prices remain indicative, with unknown rates/photos retained honestly. Overall factual/provider limitations remain CONDITIONALLY_READY; no live-price or availability claim.
