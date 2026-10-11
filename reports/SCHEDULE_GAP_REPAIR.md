# Itinerary scheduling and export repair

Completed local verification on 12 October 2026 (India time).

The reported lunch-to-dinner hole had two causes: an arbitrary three/four-visit daily cap, and sparse or constrained catalogs leaving personal time unmarked. The scheduler now allocates available visits across remaining days without that cap, while preserving budget, routes, visit durations, known openings/calendar rules and unique visits. Unused periods of at least60minutes are disclosed separately from evidenced travel. No additional activity or booking is fabricated.

Older saved plans receive the same disclosure from their saved stops and legs without rewriting records. Distinct-location gaps with unknown transfer evidence are not treated as free time. Dinner accessibility labels now identify dinner.

Regression testing also reproduced a PDF export stall: off-screen lazy images left the fallback cloner waiting on image.decode. Export loads those itinerary images eagerly only while capturing, restoring their original loading attributes afterward. The existing JPEG renderer/layout is retained, with capture/resource deadlines and abandoned-clone cleanup. Temporary diagnostics and the unsuccessful SVG experiment were removed.

| Executed validation | Result |
|---|---|
| Backend unit/security suite |65/65 PASS;5 new regressions|
| Frontend typecheck/reference planner |PASS /33 assertions PASS|
| Targeted isolated production-preview |48destination/category API cases with interval/non-overlap assertions;3 browser widths with current/legacy saved responses PASS|
| Read-only isolated SQL cross-check |98generated plans,315personal intervals,0overlaps; transfers excluded correctly|
| Isolated actual PDF download |PASS,898418bytes, valid PDF signature|
| Final full regression |18/18gates PASS,64browser-control groups including real PDF download; completed2026-10-11T18:39:41.625Z|
| Installed local rebuild/readiness |PASS /7checks PASS|
| Image audit |120records,38genuine-photo associations,82intentional fallbacks,0errors|
| Data preservation |Original catalog/user/trip/stop/budget rows unchanged|

Evidence: schedule-full-tests.json, schedule-production-tests.json, schedule-pdf-tests.json and schedule-gap-api-validation.json. The first full runs failed the real PDF download assertion; it was retained unchanged and passed after the lazy-image repair. Source/exported-index privacy and exact reviewed UI hashes are checked before publication.

Runtime files: backend/services/tripPlanner.js; dsa/greedy/daySplitter.ts; dsa/planning/scheduleGaps.ts; frontend/src/components/ItineraryView.tsx. Tests/guard: backend/tests/schedule-gaps.test.js; backend/scripts/test-hotel-coverage-api.js; tests/frontend/itinerary_phase3.py and schedule_pdf.py; existing isolated runners and reviewed source hashes.

The commit also publishes the earlier verified13-hotel/175-route tier coverage continuation; see HOTEL_TIER_COVERAGE.md for sources and data tests. Current catalog8destinations/44attractions/56hotels/12restaurants/497routes. All24destination/category slots are populated. Prices remain indicative; unknown information stays unknown. Sparse catalogs can still leave legitimate personal time.

Open http://localhost:8080 and refresh. Existing saved plans display intervals; generate a new itinerary to use the expanded allocation. Public deployment is outside this local task.
