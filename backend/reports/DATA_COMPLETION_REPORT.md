# Dataset completion and verification — 2026-09-30

Stabilization continuation: five sourced primary categories are now filled; provenance is 595 fields. Earlier frontend-unchanged/test-count statements below describe the preceding data-only session. Current functional fixes, actual tests, visual preservation and remaining limitations are authoritative in [FINAL_VERIFICATION.md](FINAL_VERIFICATION.md).

## Dataset completion

All eight intended destinations now have real attractions, lodging, dining and sourced road routes. All eight city API/create/generate/retrieve/budget flows pass. This is **not a fully complete tourism dataset**: accessibility, two admission prices, current operating intervals and nullable display metadata remain unresolved. No city is certified universally accessible or financially complete including transport.

| City | Classification | Attractions / hotels / restaurants / routes | City-check attraction visits | Material unresolved fields |
|---|---|---|---:|---|
| Ahmedabad | PARTIALLY COMPLETE | 6 / 3 / 3 / 63 | 6 | All six attraction wheelchair statuses; partial Kankaria facilities and Sarkhej tour guidance do not certify whole-site access. |
| Somnath | PARTIALLY COMPLETE | 4 / 1 / 2 / 15 | 4 | Bhalka, Triveni and beach wheelchair status; legacy r101 Toran Dining Hall identity/location/cuisine/provenance and six route pairs. |
| Dwarka | PARTIALLY COMPLETE | 4 / 2 / 2 / 20 | 4 | Dwarkadhish, Nageshwar and Bet Dwarka whole-site wheelchair status; legacy r201 dining identity/location/cuisine/provenance and seven route pairs; current optional ferry fare/timetable. |
| Modhera | PARTIALLY COMPLETE | 2 / 1 / 1 / 6 | 2 | Both attraction wheelchair statuses; conflicting Modheshwari opening/closing times; attraction ratings. |
| Champaner | PARTIALLY COMPLETE | 2 / 1 / 1 / 6 | 1 | Kevada numeric admission price; both monuments' fixed opening/closing times and wheelchair statuses. Official daylight guidance is not a fixed annual clock interval. |
| Gir National Park | PARTIALLY COMPLETE | 2 / 1 / 1 / 6 | 2 | Both safari vehicle wheelchair loading/accessibility; permit availability/calendar exceptions and fixed-departure enforcement are not represented. |
| Rann of Kutch | PARTIALLY COMPLETE | 2 / 1 / 1 / 5 | 2 | White Rann/Kalo wheelchair status and fixed gate hours; dining cuisine/rating; one colocated hotel/dining edge omitted because schema prohibits zero distance. |
| Saputara | PARTIALLY COMPLETE | 3 / 1 / 1 / 10 | 2 | Museum current Indian adult fee, reopening/current hours; all three wheelchair statuses; lake/sunset fixed hours and ratings. Mislabelled official image assets rejected. |

All hotel value scores/tier classifications and attraction physical-demand scales remain unrated: there is no approved scoring rubric. The schema has no route fare, destination coordinate, hotel accessibility/amenity or calendar/split-interval fields. No new architecture was introduced. City-wide admission/rating/duration and nearest services without a defined anchor are not fabricated.

The exact remaining entity/field checklist is [data-completion-checklist.json](data-completion-checklist.json), also reproduced below. `optional_unfilled` is an explicit remaining display/editorial field, **not a claim that the information is unavailable publicly**. Remaining native-language text/images/ratings have not been falsely marked complete.

## Database counts and additions

| Entity | Before | After | Added |
|---|---:|---:|---:|
| Destinations | 3 | 8 | 5 |
| Attractions | 14 | 25 | 11 |
| Hotels | 5 | 11 | 6 |
| Restaurants | 5 | 12 | 7 |
| Routes | 0 | 131 | 131 |

The unique merged baseline comparison contains **2 accessibility boolean fields, 44 pricing fields, 92 coordinate components and 293 metadata fields** added/corrected. These include fields on new records. Pricing counts include separate text and numeric fields for a ticket; counts are not repeated import-log entries. Fourteen official image references were added across destination/attraction records, with source labels and attribution.

## Important corrections

- Premier Somnath retained its approved common name/UUID, but copied temple coordinates were replaced with the actual Hotel The Premier location in Bhalpara. Nageshwar, Bhalka and other named map entities were verified/corrected; full old/new values are in provenance.
- Ahmedabad representative hotel prices now use dated published evidence: French Haveli INR5300, Lemon Tree Premier INR5239, House of MG INR8469. Source date, occupancy, room/tax limitations are documented; these are not guaranteed future rates.
- Somnath temple closing time is22:00 per its trust; wheelchair facilities are verified. Calico booking/tour timing and temporary Hridaykunj interior closure are documented.
- **Hotel Darshan Palace is real**: verified Dwarka business at22.245748,68.978602, Jalaram Road, with sourced representative INR2460 room quote and Google2.6 rating. The original experiment hotel was preserved, not replaced.
- Toran Dwarka private AC room tariff is INR2900 with breakfast from the official booking page. Sold-out inventory is not asserted available; a cheaper dormitory bed was not substituted for a private room.
- Bet Dwarka general admission is0 from documented secondary visitor sources. Official bridge information confirms road access over Sudarshan Setu. Ferry travel is optional; no unverified ferry fare/timetable was inserted.
- Damaged Somnath Gujarati-name and temple-hours encoding was corrected from archived evidence.
- Large OSRM road snaps were rejected; reviewed Google approach directions replace affected Champaner, White Rann and Saputara edges. Restricted access and approach limitations remain documented.

## Sources and reproducibility

[data-provenance.json](data-provenance.json) and [data-provenance.md](data-provenance.md) record595 merged fields and131 routes, with old/new values, source URLs, checked dates and assumptions. Source batches and archived maps/pages/routes are under `data/research/`. Contradictory/rejected follow-up evidence is in `data/research/unresolved-research.json`.

Sources include Gujarat Tourism, district administrations, Government of India tourism/culture/ASI/forest information, Somnath Trust, official hotel/restaurant websites and booking pages, Google business/directions, OpenStreetMap/OSRM, and identified secondary booking/travel/accessibility sources where official details were unavailable. Official branding alone was insufficient when content conflicted: Saputara Lake-labelled Don Hill/Girmal Waterfalls image assets were rejected.

Normal `backend` `npm run db:seed` transactionally applies approved CSV plus researched supplements/routes. Original UUID/legacy CSV hash guards remain. Two repeated reseeds preserved every catalog value and ID. The audit detected an intentionally incorrect field and the probe was rolled back. Simulated CSV routes remain excluded.

## Backend experiment

Original22 configurations and original named hotels retained. HTTP request success is distinct from a complete, affordable visit plan.

| Metric | Previous backend | Current backend |
|---|---:|---:|
| Scenarios | 22 | 22 |
| Successful generation requests | 11 | 22 |
| Failed requests | 11 | 0 |
| Budget-compliant generations | 7 | 12 |
| Attraction visits | 0 | 48 |

All generated results match fresh persisted trip and budget GETs. Temporary experiment records were cleaned. Details are in `docs/research/experiment_results.json`, `experiment_comparison.json` and preserved `.previous-backend` files. Historical client results are separately labelled.

### Remaining failed/incomplete scenarios

**Zero failed requests.** Ten generated plans remain incomplete because the unchanged selected hotel alone exceeds the original budget:

| Experiment | City | Days | Budget INR | Hotel total INR |
|---|---|---:|---:|---:|
| Duration | Somnath | 3 | 10000 | 11916 |
| Budget | Somnath | 1 | 500 | 3972 |
| Budget | Somnath | 1 | 900 | 3972 |
| Budget | Somnath | 1 | 1200 | 3972 |
| Budget | Somnath | 1 | 1500 | 3972 |
| Budget | Somnath | 1 | 3000 | 3972 |
| Budget | Dwarka | 1 | 500 | 2460 |
| Budget | Dwarka | 1 | 900 | 2460 |
| Budget | Dwarka | 1 | 1200 | 2460 |
| Budget | Dwarka | 1 | 1500 | 2460 |

No invented discount or substitute hotel was used. Every traveled plan flags unknown transport fares; budget compliance excludes them. Fixed safari departures, midday temple closures, seasonal permits, museum reopening and dated room inventory cannot be enforced by the current planner. Data changes do not resolve those model limits.

## Verification

- Backend startup/health passes on5000; PostgreSQL55432 running.
- Backend19/19 tests; auth17, destination106, trip37 and admin101 HTTP exchanges pass. DB constraints pass with rollback.
- Two full-catalog reseed equality passes, negative audit probe and rollback pass: `research-preservation.json`.
- Frontend TypeScript/lint and28 Trie tests pass. Production build passes with2365 modules, zero legacy catalog/route modules: `frontend-build-report.json`.
- API-client transport regressions7/7 pass.
- Real Chrome34-check suite includes registration/login, search/detail, sorts, over-budget selected-hotel preservation, actual attraction itinerary/reload/budget, permissions and operator CRUD. Final post-metadata rerun passed all34 checks, with cleanup and original catalog preservation true (`frontend-browser-report.json`). The saved real budget screenshot was visually inspected: total INR10928, unknown fares explicitly flagged.
- All eight city API flows pass with real attraction visits as listed above.
- Coverage, provenance and runtime marker audits refreshed. Decorative placeholders and unused legacy reference data are documented; neither was added as real tourism data.

## UI and final status

SHA256 comparison of89 frontend source/public files finds zero added/changed/deleted files. Frontend experiment tooling and browser tests changed; no frontend application/UI file changed.

**The dataset supports real attraction itineraries across all eight destinations, but is not fully complete for accessible, calendar-aware or transport-inclusive travel planning.** Unverified facts and optional display gaps remain explicit. Full dataset completion is not claimed.

NO NEW PRODUCT FEATURES WERE ADDED.

NO FRONTEND UI OR VISUAL DESIGN WAS MODIFIED.

NO FAKE OR FABRICATED TOURISM DATA WAS ADDED.

ALL NEW FACTUAL DATA WAS RESEARCHED FROM REAL EXTERNAL SOURCES AND DOCUMENTED WITH PROVENANCE WHERE POSSIBLE.

## Exact remaining field inventory

Reasons and evidence are in the machine-readable checklist. Unused route endpoint-type foreign keys are excluded because each endpoint deliberately has only one entity type.

### ahmedabad

| Table / entity | Field | Disposition |
|---|---|---|
| destinations / ahmedabad | tag | unrated |
| destinations / ahmedabad | rating | not_applicable_without_defined_basis |
| destinations / ahmedabad | entry_fee | not_applicable_without_defined_basis |
| destinations / ahmedabad | entry_fee_numeric | unknown_after_research |
| destinations / ahmedabad | best_time | optional_unfilled |
| destinations / ahmedabad | distance_from_ahmedabad | optional_unfilled |
| destinations / ahmedabad | distance_numeric | optional_unfilled |
| destinations / ahmedabad | duration | not_applicable_without_defined_basis |
| destinations / ahmedabad | avg_visit_time | not_applicable_without_defined_basis |
| destinations / ahmedabad | gujarati_name | optional_unfilled |
| destinations / ahmedabad | hindi_name | optional_unfilled |
| destinations / ahmedabad | gujarati_description | optional_unfilled |
| destinations / ahmedabad | hindi_description | optional_unfilled |
| destinations / ahmedabad | seasonal_note | optional_unfilled |
| destinations / ahmedabad | seasonal_gujarati_note | optional_unfilled |
| destinations / ahmedabad | seasonal_hindi_note | optional_unfilled |
| destinations / ahmedabad | seasonal_active_months | optional_unfilled |
| destinations / ahmedabad | seasonal_peak_window_label | optional_unfilled |
| destinations / ahmedabad | nearest_hospital | not_applicable_without_defined_basis |
| destinations / ahmedabad | nearest_police_station | not_applicable_without_defined_basis |
| attractions / a305 | wheelchair_accessible | unknown_after_research |
| attractions / a305 | physical_demand | unrated |
| attractions / a305 | image_url | optional_unfilled |
| attractions / a305 | image_alt | optional_unfilled |
| attractions / a305 | gujarati_name | optional_unfilled |
| attractions / a305 | hindi_name | optional_unfilled |
| attractions / a305 | gujarati_description | optional_unfilled |
| attractions / a305 | hindi_description | optional_unfilled |
| attractions / a302 | wheelchair_accessible | unknown_after_research |
| attractions / a302 | physical_demand | unrated |
| attractions / a302 | best_time_note | optional_unfilled |
| attractions / a302 | gujarati_name | optional_unfilled |
| attractions / a302 | hindi_name | optional_unfilled |
| attractions / a302 | gujarati_description | optional_unfilled |
| attractions / a302 | hindi_description | optional_unfilled |
| attractions / a304 | wheelchair_accessible | unknown_after_research |
| attractions / a304 | physical_demand | unrated |
| attractions / a304 | transport_mode | optional_unfilled |
| attractions / a304 | image_url | optional_unfilled |
| attractions / a304 | image_alt | optional_unfilled |
| attractions / a304 | gujarati_name | optional_unfilled |
| attractions / a304 | hindi_name | optional_unfilled |
| attractions / a304 | gujarati_description | optional_unfilled |
| attractions / a304 | hindi_description | optional_unfilled |
| attractions / a303 | wheelchair_accessible | unknown_after_research |
| attractions / a303 | physical_demand | unrated |
| attractions / a303 | best_time_note | optional_unfilled |
| attractions / a303 | image_url | optional_unfilled |
| attractions / a303 | image_alt | optional_unfilled |
| attractions / a303 | gujarati_name | optional_unfilled |
| attractions / a303 | hindi_name | optional_unfilled |
| attractions / a303 | gujarati_description | optional_unfilled |
| attractions / a303 | hindi_description | optional_unfilled |
| attractions / a306 | wheelchair_accessible | unknown_after_research |
| attractions / a306 | physical_demand | unrated |
| attractions / a306 | gujarati_name | optional_unfilled |
| attractions / a306 | hindi_name | optional_unfilled |
| attractions / a306 | gujarati_description | optional_unfilled |
| attractions / a306 | hindi_description | optional_unfilled |
| attractions / a301 | wheelchair_accessible | unknown_after_research |
| attractions / a301 | physical_demand | unrated |
| attractions / a301 | gujarati_name | optional_unfilled |
| attractions / a301 | hindi_name | optional_unfilled |
| attractions / a301 | gujarati_description | optional_unfilled |
| attractions / a301 | hindi_description | optional_unfilled |
| hotels / h302 | tier | unrated |
| hotels / h302 | value_score | unrated |
| hotels / h302 | image_url | optional_unfilled |
| hotels / h302 | hindi_name | optional_unfilled |
| hotels / h302 | gujarati_description | optional_unfilled |
| hotels / h302 | hindi_description | optional_unfilled |
| hotels / h303 | tier | unrated |
| hotels / h303 | value_score | unrated |
| hotels / h303 | image_url | optional_unfilled |
| hotels / h303 | hindi_name | optional_unfilled |
| hotels / h303 | gujarati_description | optional_unfilled |
| hotels / h303 | hindi_description | optional_unfilled |
| hotels / h301 | tier | unrated |
| hotels / h301 | value_score | unrated |
| hotels / h301 | image_url | optional_unfilled |
| hotels / h301 | hindi_name | optional_unfilled |
| hotels / h301 | gujarati_description | optional_unfilled |
| hotels / h301 | hindi_description | optional_unfilled |
| restaurants / r302 | gujarati_name | optional_unfilled |
| restaurants / r302 | hindi_name | optional_unfilled |
| restaurants / r302 | gujarati_description | optional_unfilled |
| restaurants / r302 | hindi_description | optional_unfilled |
| restaurants / r301 | gujarati_name | optional_unfilled |
| restaurants / r301 | hindi_name | optional_unfilled |
| restaurants / r301 | gujarati_description | optional_unfilled |
| restaurants / r301 | hindi_description | optional_unfilled |
| restaurants / r303 | gujarati_name | optional_unfilled |
| restaurants / r303 | hindi_name | optional_unfilled |
| restaurants / r303 | gujarati_description | optional_unfilled |
| restaurants / r303 | hindi_description | optional_unfilled |

### somnath

| Table / entity | Field | Disposition |
|---|---|---|
| destinations / somnath | tag | unrated |
| destinations / somnath | rating | not_applicable_without_defined_basis |
| destinations / somnath | entry_fee | not_applicable_without_defined_basis |
| destinations / somnath | entry_fee_numeric | unknown_after_research |
| destinations / somnath | distance_from_ahmedabad | optional_unfilled |
| destinations / somnath | distance_numeric | optional_unfilled |
| destinations / somnath | duration | not_applicable_without_defined_basis |
| destinations / somnath | avg_visit_time | not_applicable_without_defined_basis |
| destinations / somnath | gujarati_name | optional_unfilled |
| destinations / somnath | hindi_name | optional_unfilled |
| destinations / somnath | gujarati_description | optional_unfilled |
| destinations / somnath | hindi_description | optional_unfilled |
| destinations / somnath | seasonal_note | optional_unfilled |
| destinations / somnath | seasonal_gujarati_note | optional_unfilled |
| destinations / somnath | seasonal_hindi_note | optional_unfilled |
| destinations / somnath | seasonal_active_months | optional_unfilled |
| destinations / somnath | seasonal_peak_window_label | optional_unfilled |
| destinations / somnath | nearest_hospital | not_applicable_without_defined_basis |
| destinations / somnath | nearest_police_station | not_applicable_without_defined_basis |
| attractions / a102 | wheelchair_accessible | unknown_after_research |
| attractions / a102 | physical_demand | unrated |
| attractions / a102 | best_time_note | optional_unfilled |
| attractions / a102 | image_url | optional_unfilled |
| attractions / a102 | image_alt | optional_unfilled |
| attractions / a102 | gujarati_name | optional_unfilled |
| attractions / a102 | hindi_name | optional_unfilled |
| attractions / a102 | gujarati_description | optional_unfilled |
| attractions / a102 | hindi_description | optional_unfilled |
| attractions / a101 | physical_demand | unrated |
| attractions / a101 | gujarati_name | optional_unfilled |
| attractions / a101 | hindi_name | optional_unfilled |
| attractions / a101 | gujarati_description | optional_unfilled |
| attractions / a101 | hindi_description | optional_unfilled |
| attractions / a103 | wheelchair_accessible | unknown_after_research |
| attractions / a103 | physical_demand | unrated |
| attractions / a103 | image_url | optional_unfilled |
| attractions / a103 | image_alt | optional_unfilled |
| attractions / a103 | hindi_name | optional_unfilled |
| attractions / a103 | gujarati_description | optional_unfilled |
| attractions / a103 | hindi_description | optional_unfilled |
| attractions / a104 | wheelchair_accessible | unknown_after_research |
| attractions / a104 | physical_demand | unrated |
| attractions / a104 | best_time_note | optional_unfilled |
| attractions / a104 | image_url | optional_unfilled |
| attractions / a104 | image_alt | optional_unfilled |
| attractions / a104 | gujarati_name | optional_unfilled |
| attractions / a104 | hindi_name | optional_unfilled |
| attractions / a104 | gujarati_description | optional_unfilled |
| attractions / a104 | hindi_description | optional_unfilled |
| hotels / h101 | tier | unrated |
| hotels / h101 | value_score | unrated |
| hotels / h101 | image_url | optional_unfilled |
| hotels / h101 | gujarati_name | optional_unfilled |
| hotels / h101 | hindi_name | optional_unfilled |
| hotels / h101 | gujarati_description | optional_unfilled |
| hotels / h101 | hindi_description | optional_unfilled |
| restaurants / r101 | slug | unknown_after_research |
| restaurants / r101 | location | unknown_after_research |
| restaurants / r101 | cuisine | unknown_after_research |
| restaurants / r101 | gujarati_name | unknown_after_research |
| restaurants / r101 | hindi_name | unknown_after_research |
| restaurants / r101 | gujarati_description | unknown_after_research |
| restaurants / r101 | hindi_description | unknown_after_research |
| restaurants / r101 | source_url | unknown_after_research |
| restaurants / r101 | source_date | unknown_after_research |
| restaurants / r102 | gujarati_name | optional_unfilled |
| restaurants / r102 | hindi_name | optional_unfilled |
| restaurants / r102 | gujarati_description | optional_unfilled |
| restaurants / r102 | hindi_description | optional_unfilled |
| restaurants / r102 | source_row_hash | not_applicable |

Missing route pairs: a102/r101, a101/r101, a103/r101, a104/r101, h101/r101, r101/r102.

### dwarka

| Table / entity | Field | Disposition |
|---|---|---|
| destinations / dwarka | tag | unrated |
| destinations / dwarka | rating | not_applicable_without_defined_basis |
| destinations / dwarka | entry_fee | not_applicable_without_defined_basis |
| destinations / dwarka | entry_fee_numeric | unknown_after_research |
| destinations / dwarka | distance_from_ahmedabad | optional_unfilled |
| destinations / dwarka | distance_numeric | optional_unfilled |
| destinations / dwarka | duration | not_applicable_without_defined_basis |
| destinations / dwarka | avg_visit_time | not_applicable_without_defined_basis |
| destinations / dwarka | gujarati_name | optional_unfilled |
| destinations / dwarka | hindi_name | optional_unfilled |
| destinations / dwarka | gujarati_description | optional_unfilled |
| destinations / dwarka | hindi_description | optional_unfilled |
| destinations / dwarka | seasonal_note | optional_unfilled |
| destinations / dwarka | seasonal_gujarati_note | optional_unfilled |
| destinations / dwarka | seasonal_hindi_note | optional_unfilled |
| destinations / dwarka | seasonal_active_months | optional_unfilled |
| destinations / dwarka | seasonal_peak_window_label | optional_unfilled |
| destinations / dwarka | nearest_hospital | not_applicable_without_defined_basis |
| destinations / dwarka | nearest_police_station | not_applicable_without_defined_basis |
| attractions / a201 | wheelchair_accessible | unknown_after_research |
| attractions / a201 | physical_demand | unrated |
| attractions / a201 | image_url | optional_unfilled |
| attractions / a201 | image_alt | optional_unfilled |
| attractions / a201 | gujarati_name | optional_unfilled |
| attractions / a201 | hindi_name | optional_unfilled |
| attractions / a201 | gujarati_description | optional_unfilled |
| attractions / a201 | hindi_description | optional_unfilled |
| attractions / a202 | wheelchair_accessible | unknown_after_research |
| attractions / a202 | physical_demand | unrated |
| attractions / a202 | hindi_name | optional_unfilled |
| attractions / a202 | gujarati_description | optional_unfilled |
| attractions / a202 | hindi_description | optional_unfilled |
| attractions / a204 | wheelchair_accessible | unknown_after_research |
| attractions / a204 | physical_demand | unrated |
| attractions / a204 | image_url | optional_unfilled |
| attractions / a204 | image_alt | optional_unfilled |
| attractions / a204 | gujarati_name | optional_unfilled |
| attractions / a204 | hindi_name | optional_unfilled |
| attractions / a204 | gujarati_description | optional_unfilled |
| attractions / a204 | hindi_description | optional_unfilled |
| attractions / a203 | physical_demand | unrated |
| attractions / a203 | image_url | optional_unfilled |
| attractions / a203 | image_alt | optional_unfilled |
| attractions / a203 | gujarati_name | optional_unfilled |
| attractions / a203 | hindi_name | optional_unfilled |
| attractions / a203 | gujarati_description | optional_unfilled |
| attractions / a203 | hindi_description | optional_unfilled |
| hotels / h202 | tier | unrated |
| hotels / h202 | value_score | unrated |
| hotels / h202 | image_url | optional_unfilled |
| hotels / h202 | gujarati_name | optional_unfilled |
| hotels / h202 | hindi_name | optional_unfilled |
| hotels / h202 | gujarati_description | optional_unfilled |
| hotels / h202 | hindi_description | optional_unfilled |
| hotels / h202 | source_row_hash | not_applicable |
| hotels / h201 | tier | unrated |
| hotels / h201 | value_score | unrated |
| hotels / h201 | image_url | optional_unfilled |
| hotels / h201 | gujarati_name | optional_unfilled |
| hotels / h201 | hindi_name | optional_unfilled |
| hotels / h201 | gujarati_description | optional_unfilled |
| hotels / h201 | hindi_description | optional_unfilled |
| restaurants / r202 | gujarati_name | optional_unfilled |
| restaurants / r202 | hindi_name | optional_unfilled |
| restaurants / r202 | gujarati_description | optional_unfilled |
| restaurants / r202 | hindi_description | optional_unfilled |
| restaurants / r202 | source_row_hash | not_applicable |
| restaurants / r201 | slug | unknown_after_research |
| restaurants / r201 | location | unknown_after_research |
| restaurants / r201 | cuisine | unknown_after_research |
| restaurants / r201 | gujarati_name | unknown_after_research |
| restaurants / r201 | hindi_name | unknown_after_research |
| restaurants / r201 | gujarati_description | unknown_after_research |
| restaurants / r201 | hindi_description | unknown_after_research |
| restaurants / r201 | source_url | unknown_after_research |
| restaurants / r201 | source_date | unknown_after_research |

Missing route pairs: a201/r201, a202/r201, a204/r201, a203/r201, h202/r201, h201/r201, r202/r201.

### modhera

| Table / entity | Field | Disposition |
|---|---|---|
| destinations / modhera | tag | unrated |
| destinations / modhera | rating | not_applicable_without_defined_basis |
| destinations / modhera | entry_fee | not_applicable_without_defined_basis |
| destinations / modhera | entry_fee_numeric | unknown_after_research |
| destinations / modhera | duration | not_applicable_without_defined_basis |
| destinations / modhera | avg_visit_time | not_applicable_without_defined_basis |
| destinations / modhera | gujarati_name | optional_unfilled |
| destinations / modhera | hindi_name | optional_unfilled |
| destinations / modhera | gujarati_description | optional_unfilled |
| destinations / modhera | hindi_description | optional_unfilled |
| destinations / modhera | seasonal_note | optional_unfilled |
| destinations / modhera | seasonal_gujarati_note | optional_unfilled |
| destinations / modhera | seasonal_hindi_note | optional_unfilled |
| destinations / modhera | seasonal_active_months | optional_unfilled |
| destinations / modhera | seasonal_peak_window_label | optional_unfilled |
| destinations / modhera | nearest_hospital | not_applicable_without_defined_basis |
| destinations / modhera | nearest_police_station | not_applicable_without_defined_basis |
| attractions / a402 | rating | optional_unfilled |
| attractions / a402 | opening_time | unknown_after_research |
| attractions / a402 | closing_time | unknown_after_research |
| attractions / a402 | wheelchair_accessible | unknown_after_research |
| attractions / a402 | physical_demand | unrated |
| attractions / a402 | image_url | optional_unfilled |
| attractions / a402 | image_alt | optional_unfilled |
| attractions / a402 | gujarati_name | optional_unfilled |
| attractions / a402 | hindi_name | optional_unfilled |
| attractions / a402 | gujarati_description | optional_unfilled |
| attractions / a402 | hindi_description | optional_unfilled |
| attractions / a402 | source_row_hash | not_applicable |
| attractions / a401 | rating | optional_unfilled |
| attractions / a401 | wheelchair_accessible | unknown_after_research |
| attractions / a401 | physical_demand | unrated |
| attractions / a401 | gujarati_name | optional_unfilled |
| attractions / a401 | hindi_name | optional_unfilled |
| attractions / a401 | gujarati_description | optional_unfilled |
| attractions / a401 | hindi_description | optional_unfilled |
| attractions / a401 | source_row_hash | not_applicable |
| hotels / h401 | tier | unrated |
| hotels / h401 | value_score | unrated |
| hotels / h401 | image_url | optional_unfilled |
| hotels / h401 | gujarati_name | optional_unfilled |
| hotels / h401 | hindi_name | optional_unfilled |
| hotels / h401 | gujarati_description | optional_unfilled |
| hotels / h401 | hindi_description | optional_unfilled |
| hotels / h401 | source_row_hash | not_applicable |
| restaurants / r401 | gujarati_name | optional_unfilled |
| restaurants / r401 | hindi_name | optional_unfilled |
| restaurants / r401 | gujarati_description | optional_unfilled |
| restaurants / r401 | hindi_description | optional_unfilled |
| restaurants / r401 | source_row_hash | not_applicable |

### champaner

| Table / entity | Field | Disposition |
|---|---|---|
| destinations / champaner | tag | unrated |
| destinations / champaner | rating | not_applicable_without_defined_basis |
| destinations / champaner | entry_fee | not_applicable_without_defined_basis |
| destinations / champaner | entry_fee_numeric | unknown_after_research |
| destinations / champaner | distance_from_ahmedabad | optional_unfilled |
| destinations / champaner | distance_numeric | optional_unfilled |
| destinations / champaner | duration | not_applicable_without_defined_basis |
| destinations / champaner | avg_visit_time | not_applicable_without_defined_basis |
| destinations / champaner | gujarati_name | optional_unfilled |
| destinations / champaner | hindi_name | optional_unfilled |
| destinations / champaner | gujarati_description | optional_unfilled |
| destinations / champaner | hindi_description | optional_unfilled |
| destinations / champaner | seasonal_note | optional_unfilled |
| destinations / champaner | seasonal_gujarati_note | optional_unfilled |
| destinations / champaner | seasonal_hindi_note | optional_unfilled |
| destinations / champaner | seasonal_active_months | optional_unfilled |
| destinations / champaner | seasonal_peak_window_label | optional_unfilled |
| destinations / champaner | nearest_hospital | not_applicable_without_defined_basis |
| destinations / champaner | nearest_police_station | not_applicable_without_defined_basis |
| attractions / a501 | opening_time | unknown_after_research |
| attractions / a501 | closing_time | unknown_after_research |
| attractions / a501 | wheelchair_accessible | unknown_after_research |
| attractions / a501 | physical_demand | unrated |
| attractions / a501 | gujarati_name | optional_unfilled |
| attractions / a501 | hindi_name | optional_unfilled |
| attractions / a501 | gujarati_description | optional_unfilled |
| attractions / a501 | hindi_description | optional_unfilled |
| attractions / a501 | source_row_hash | not_applicable |
| attractions / a502 | entry_fee_numeric | unknown_after_research |
| attractions / a502 | opening_time | unknown_after_research |
| attractions / a502 | closing_time | unknown_after_research |
| attractions / a502 | wheelchair_accessible | unknown_after_research |
| attractions / a502 | physical_demand | unrated |
| attractions / a502 | image_url | optional_unfilled |
| attractions / a502 | image_alt | optional_unfilled |
| attractions / a502 | gujarati_name | optional_unfilled |
| attractions / a502 | hindi_name | optional_unfilled |
| attractions / a502 | gujarati_description | optional_unfilled |
| attractions / a502 | hindi_description | optional_unfilled |
| attractions / a502 | source_row_hash | not_applicable |
| hotels / h501 | tier | unrated |
| hotels / h501 | value_score | unrated |
| hotels / h501 | image_url | optional_unfilled |
| hotels / h501 | gujarati_name | optional_unfilled |
| hotels / h501 | hindi_name | optional_unfilled |
| hotels / h501 | gujarati_description | optional_unfilled |
| hotels / h501 | hindi_description | optional_unfilled |
| hotels / h501 | source_row_hash | not_applicable |
| restaurants / r501 | gujarati_name | optional_unfilled |
| restaurants / r501 | hindi_name | optional_unfilled |
| restaurants / r501 | gujarati_description | optional_unfilled |
| restaurants / r501 | hindi_description | optional_unfilled |
| restaurants / r501 | source_row_hash | not_applicable |

### gir-national-park

| Table / entity | Field | Disposition |
|---|---|---|
| destinations / gir-national-park | official_category | optional_unfilled |
| destinations / gir-national-park | tag | unrated |
| destinations / gir-national-park | rating | not_applicable_without_defined_basis |
| destinations / gir-national-park | entry_fee | not_applicable_without_defined_basis |
| destinations / gir-national-park | entry_fee_numeric | unknown_after_research |
| destinations / gir-national-park | distance_from_ahmedabad | optional_unfilled |
| destinations / gir-national-park | distance_numeric | optional_unfilled |
| destinations / gir-national-park | duration | not_applicable_without_defined_basis |
| destinations / gir-national-park | avg_visit_time | not_applicable_without_defined_basis |
| destinations / gir-national-park | image_url | optional_unfilled |
| destinations / gir-national-park | image_alt | optional_unfilled |
| destinations / gir-national-park | gujarati_name | optional_unfilled |
| destinations / gir-national-park | hindi_name | optional_unfilled |
| destinations / gir-national-park | gujarati_description | optional_unfilled |
| destinations / gir-national-park | hindi_description | optional_unfilled |
| destinations / gir-national-park | seasonal_gujarati_note | optional_unfilled |
| destinations / gir-national-park | seasonal_hindi_note | optional_unfilled |
| destinations / gir-national-park | seasonal_active_months | optional_unfilled |
| destinations / gir-national-park | seasonal_peak_window_label | optional_unfilled |
| destinations / gir-national-park | nearest_hospital | not_applicable_without_defined_basis |
| destinations / gir-national-park | nearest_police_station | not_applicable_without_defined_basis |
| attractions / a601 | rating | optional_unfilled |
| attractions / a601 | wheelchair_accessible | unknown_after_research |
| attractions / a601 | physical_demand | unrated |
| attractions / a601 | image_url | optional_unfilled |
| attractions / a601 | image_alt | optional_unfilled |
| attractions / a601 | gujarati_name | optional_unfilled |
| attractions / a601 | hindi_name | optional_unfilled |
| attractions / a601 | gujarati_description | optional_unfilled |
| attractions / a601 | hindi_description | optional_unfilled |
| attractions / a601 | source_row_hash | not_applicable |
| attractions / a602 | wheelchair_accessible | unknown_after_research |
| attractions / a602 | physical_demand | unrated |
| attractions / a602 | image_url | optional_unfilled |
| attractions / a602 | image_alt | optional_unfilled |
| attractions / a602 | gujarati_name | optional_unfilled |
| attractions / a602 | hindi_name | optional_unfilled |
| attractions / a602 | gujarati_description | optional_unfilled |
| attractions / a602 | hindi_description | optional_unfilled |
| attractions / a602 | source_row_hash | not_applicable |
| hotels / h601 | tier | unrated |
| hotels / h601 | value_score | unrated |
| hotels / h601 | image_url | optional_unfilled |
| hotels / h601 | gujarati_name | optional_unfilled |
| hotels / h601 | hindi_name | optional_unfilled |
| hotels / h601 | gujarati_description | optional_unfilled |
| hotels / h601 | hindi_description | optional_unfilled |
| hotels / h601 | source_row_hash | not_applicable |
| restaurants / r601 | gujarati_name | optional_unfilled |
| restaurants / r601 | hindi_name | optional_unfilled |
| restaurants / r601 | gujarati_description | optional_unfilled |
| restaurants / r601 | hindi_description | optional_unfilled |
| restaurants / r601 | source_row_hash | not_applicable |

### rann-of-kutch

| Table / entity | Field | Disposition |
|---|---|---|
| destinations / rann-of-kutch | official_category | optional_unfilled |
| destinations / rann-of-kutch | tag | unrated |
| destinations / rann-of-kutch | rating | not_applicable_without_defined_basis |
| destinations / rann-of-kutch | entry_fee | not_applicable_without_defined_basis |
| destinations / rann-of-kutch | entry_fee_numeric | unknown_after_research |
| destinations / rann-of-kutch | distance_from_ahmedabad | optional_unfilled |
| destinations / rann-of-kutch | distance_numeric | optional_unfilled |
| destinations / rann-of-kutch | duration | not_applicable_without_defined_basis |
| destinations / rann-of-kutch | avg_visit_time | not_applicable_without_defined_basis |
| destinations / rann-of-kutch | gujarati_name | optional_unfilled |
| destinations / rann-of-kutch | hindi_name | optional_unfilled |
| destinations / rann-of-kutch | gujarati_description | optional_unfilled |
| destinations / rann-of-kutch | hindi_description | optional_unfilled |
| destinations / rann-of-kutch | seasonal_gujarati_note | optional_unfilled |
| destinations / rann-of-kutch | seasonal_hindi_note | optional_unfilled |
| destinations / rann-of-kutch | seasonal_peak_window_label | optional_unfilled |
| destinations / rann-of-kutch | nearest_hospital | not_applicable_without_defined_basis |
| destinations / rann-of-kutch | nearest_police_station | not_applicable_without_defined_basis |
| attractions / a702 | rating | optional_unfilled |
| attractions / a702 | opening_time | unknown_after_research |
| attractions / a702 | closing_time | unknown_after_research |
| attractions / a702 | wheelchair_accessible | unknown_after_research |
| attractions / a702 | physical_demand | unrated |
| attractions / a702 | gujarati_name | optional_unfilled |
| attractions / a702 | hindi_name | optional_unfilled |
| attractions / a702 | gujarati_description | optional_unfilled |
| attractions / a702 | hindi_description | optional_unfilled |
| attractions / a702 | source_row_hash | not_applicable |
| attractions / a701 | opening_time | unknown_after_research |
| attractions / a701 | closing_time | unknown_after_research |
| attractions / a701 | wheelchair_accessible | unknown_after_research |
| attractions / a701 | physical_demand | unrated |
| attractions / a701 | image_url | optional_unfilled |
| attractions / a701 | image_alt | optional_unfilled |
| attractions / a701 | gujarati_name | optional_unfilled |
| attractions / a701 | hindi_name | optional_unfilled |
| attractions / a701 | gujarati_description | optional_unfilled |
| attractions / a701 | hindi_description | optional_unfilled |
| attractions / a701 | source_row_hash | not_applicable |
| hotels / h701 | tier | unrated |
| hotels / h701 | value_score | unrated |
| hotels / h701 | image_url | optional_unfilled |
| hotels / h701 | gujarati_name | optional_unfilled |
| hotels / h701 | hindi_name | optional_unfilled |
| hotels / h701 | gujarati_description | optional_unfilled |
| hotels / h701 | hindi_description | optional_unfilled |
| hotels / h701 | source_row_hash | not_applicable |
| restaurants / r701 | rating | optional_unfilled |
| restaurants / r701 | cuisine | optional_unfilled |
| restaurants / r701 | gujarati_name | optional_unfilled |
| restaurants / r701 | hindi_name | optional_unfilled |
| restaurants / r701 | gujarati_description | optional_unfilled |
| restaurants / r701 | hindi_description | optional_unfilled |
| restaurants / r701 | source_row_hash | not_applicable |

Missing route pairs: h701/r701.

### saputara

| Table / entity | Field | Disposition |
|---|---|---|
| destinations / saputara | official_category | optional_unfilled |
| destinations / saputara | tag | unrated |
| destinations / saputara | rating | not_applicable_without_defined_basis |
| destinations / saputara | entry_fee | not_applicable_without_defined_basis |
| destinations / saputara | entry_fee_numeric | unknown_after_research |
| destinations / saputara | best_time | optional_unfilled |
| destinations / saputara | duration | not_applicable_without_defined_basis |
| destinations / saputara | avg_visit_time | not_applicable_without_defined_basis |
| destinations / saputara | image_url | optional_unfilled |
| destinations / saputara | image_alt | optional_unfilled |
| destinations / saputara | gujarati_name | optional_unfilled |
| destinations / saputara | hindi_name | optional_unfilled |
| destinations / saputara | gujarati_description | optional_unfilled |
| destinations / saputara | hindi_description | optional_unfilled |
| destinations / saputara | seasonal_gujarati_note | optional_unfilled |
| destinations / saputara | seasonal_hindi_note | optional_unfilled |
| destinations / saputara | seasonal_active_months | optional_unfilled |
| destinations / saputara | seasonal_peak_window_label | optional_unfilled |
| destinations / saputara | nearest_hospital | not_applicable_without_defined_basis |
| destinations / saputara | nearest_police_station | not_applicable_without_defined_basis |
| attractions / a802 | rating | optional_unfilled |
| attractions / a802 | opening_time | unknown_after_research |
| attractions / a802 | closing_time | unknown_after_research |
| attractions / a802 | wheelchair_accessible | unknown_after_research |
| attractions / a802 | physical_demand | unrated |
| attractions / a802 | image_url | optional_unfilled |
| attractions / a802 | image_alt | optional_unfilled |
| attractions / a802 | gujarati_name | optional_unfilled |
| attractions / a802 | hindi_name | optional_unfilled |
| attractions / a802 | gujarati_description | optional_unfilled |
| attractions / a802 | hindi_description | optional_unfilled |
| attractions / a802 | source_row_hash | not_applicable |
| attractions / a801 | rating | optional_unfilled |
| attractions / a801 | opening_time | unknown_after_research |
| attractions / a801 | closing_time | unknown_after_research |
| attractions / a801 | wheelchair_accessible | unknown_after_research |
| attractions / a801 | physical_demand | unrated |
| attractions / a801 | image_url | optional_unfilled |
| attractions / a801 | image_alt | optional_unfilled |
| attractions / a801 | gujarati_name | optional_unfilled |
| attractions / a801 | hindi_name | optional_unfilled |
| attractions / a801 | gujarati_description | optional_unfilled |
| attractions / a801 | hindi_description | optional_unfilled |
| attractions / a801 | source_row_hash | not_applicable |
| attractions / a803 | entry_fee_numeric | unknown_after_research |
| attractions / a803 | opening_time | unknown_after_research |
| attractions / a803 | closing_time | unknown_after_research |
| attractions / a803 | wheelchair_accessible | unknown_after_research |
| attractions / a803 | physical_demand | unrated |
| attractions / a803 | image_url | optional_unfilled |
| attractions / a803 | image_alt | optional_unfilled |
| attractions / a803 | gujarati_name | optional_unfilled |
| attractions / a803 | hindi_name | optional_unfilled |
| attractions / a803 | gujarati_description | optional_unfilled |
| attractions / a803 | hindi_description | optional_unfilled |
| attractions / a803 | source_row_hash | not_applicable |
| hotels / h801 | tier | unrated |
| hotels / h801 | value_score | unrated |
| hotels / h801 | image_url | optional_unfilled |
| hotels / h801 | gujarati_name | optional_unfilled |
| hotels / h801 | hindi_name | optional_unfilled |
| hotels / h801 | gujarati_description | optional_unfilled |
| hotels / h801 | hindi_description | optional_unfilled |
| hotels / h801 | source_row_hash | not_applicable |
| restaurants / r801 | gujarati_name | optional_unfilled |
| restaurants / r801 | hindi_name | optional_unfilled |
| restaurants / r801 | gujarati_description | optional_unfilled |
| restaurants / r801 | hindi_description | optional_unfilled |
| restaurants / r801 | source_row_hash | not_applicable |
