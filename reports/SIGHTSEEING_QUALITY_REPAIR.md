# Shared itinerary sightseeing quality repair

## Reproduced causes

The actual saved Champaner request (2 days, 2 nights, 2 rooms, 4 travelers, INR8500, 100% cost) scheduled one Jami Masjid visit, then forced lunch12:30/dinner19:30 on both days. Only one of the nine recorded Champaner sites currently has both known admission and duration. The planner appended meals after sightseeing stopped, making empty days look planned. Missing direct restaurant/hotel links were also rejected even when the evidenced graph contained a connected path. Comparing unlike coverage allowed distance/cost weights to reward dropping visits.

Four new deterministic tests failed before the repair and pass afterward. The fix applies to the shared scheduler for all destinations, not a property-specific exception.

## Repair

- Return to the selected hotel promptly after the last feasible visit. Do not append morning-tour lunch/dinner waits or meals-only sightseeing days. Meals during a sightseeing circuit remain genuine database restaurant suggestions, not bookings.
- Re-evaluate the next visit after a midday meal when later opening would otherwise jump across lunch.
- For missing direct pairs, use existing Dijkstra over evidenced edges for hotel/restaurant/attraction nodes. Retain direct-edge preference, coordinate-staleness checks, accessibility filtering and reverse-estimate warnings.
- Retain bounded deterministic multi-start greedy search. Compare the fullest feasible distinct-visit coverage found, then covered sightseeing days, before applying unchanged normalized distance/cost/rating weights. All ranked candidates expose coverage, score, normalization and pruning counts; no global-optimality claim.
- Unknown closing time uses an18:00 planning cutoff with an explicit unverified-hours advisory, not a claim about actual hours.
- Persist day_coverage, mark missing sightseeing days incomplete, and disclose why a shorter trip is appropriate. Do not invent admission fees, durations, attractions, road distances, ratings or prices.
- Existing saved plans are preserved; regenerate to apply the repaired scheduler. Historical schedule-gap rendering remains supported.

## Scope and limitations

No schema change or catalog write. Live catalog remains8destinations/44attractions/56hotels/12restaurants/497routes. Tests use disposable databases and isolated accounts.

Restaurant image remains an intentional fallback. [Official Sarvottam gallery](https://hotelsarvottam.com/gallery/) and existing assets were inspected; no exact-entity photograph with established redistribution permission was obtained. No unrelated photo or fabricated license was inserted.

## Verification checkpoint

Backend71/71, frontend reference/unit/localization/type and source audit PASS. Initial isolated production-preview passes192actual generation/save/refresh cases (8destinations x3tiers x2day-counts x4weight vectors),32existing city cases, admission/accommodation regressions and1440/768/390current/legacy-response browser journeys. All192plans satisfy no meals-only sightseeing day, chronology, selected hotel, known-budget arithmetic and highest comparable candidate score. Image audit120records/38photo associations/82intentional fallbacks/34resolved assets/0errors.

Initial all-city result ranges: Ahmedabad9-11visits; Champaner1; Dwarka4; Gir2; Modhera2; Rann2; Saputara2; Somnath4. Sparse destinations honestly disclose unsupported extra days. These counts reflect known feasible data, not fabricated coverage.

Final full regression18/18PASS (64actual browser controls inclPDF); latest production-preview192all8 APIcases,32citycases and3width saved-state/scheduling browser tests PASS. Exact reported Champaner8500-budget/4travelers/2rooms/2nights/cost100 browser flow PASS at1440/768/390: no forced meals, prompt hotel return, actual known subtotal3340, missing second sightseeing day disclosed and persisted on reload; all images decode, no page errors or overflow. Evidence: sightseeing-full-tests.json, sightseeing-production-tests.json, sightseeing-destination-tests.json, sightseeing-browser-tests.json. Commands: npm --prefix backend test; npm run test:all:local; npm run test:scheduling:local; npm run audit:images.

Initial failures not counted as passes: Docker Desktop stopped (restored using docker desktop start); a temporary test-generation limit500 violated the existing config maximum100 (restored100 and assigned separate isolated city accounts); old trip fixtures demanded obsolete forced meals1350/200 and400 meal cost (corrected to strict1150/0 with database totals and early-return assertions). Historical gap tests still validate old saved intervals.

Local:up installed the verified build at8080; readiness7/7PASS. Installed backend planner SHA matches tested source. All nine live table fingerprints unchanged, including original accounts and saved plans. Source/image audit PASS. Normal GitHub publication authorized and prepared; commit reference recorded in the handoff after push.
