# Final local demonstration readiness

Classification:CONDITIONALLY_READY.

Verified local functionality passes; real-world admission/access/permit, price and photograph gaps remain explicit. This is not a booking/availability guarantee or public-deployment certification.

Installed catalog:8 destinations/100 attractions/56 hotels/12 restaurants/1330 route rows. Original catalog/account/trip/stop/budget rows all retained byte-equivalent row digests; no reset/reseed or schema change. 29 hotels have usable indicative room estimates. 28 attraction fee fields and19 stored ratings remain; existing values were not recertified as current. All56 new fees/ratings are unknown. Durations are explicitly planning estimates.

Image audit:176 entity associations; 38 genuine existing photograph associations; 138 intentional fallbacks;0 validation errors. No new media copied or unrelated photos substituted. The installed read-only browser check passed24 city/viewport cases with decoded images, rendered additions, no writes, no page exceptions or failed API responses.

## Reproducible local demonstration

1. `npm run local:up`; `npm run local:demo:check` (read-only7checks).
2. Open http://localhost:8080 and sign in with your own existing account. No test account was added to the installed database.
3. Explore Rann of Kutch; inspect Bhuj heritage, craft and regional-excursion records and their uncertainty notes.
4. Plan four days from10 November2026, Budget category, Hotel Prince Residency,Bhuj, two travelers, one room, three nights and a sufficient known-budget ceiling (the regression usesINR100000).
5. Generate and inspect every day, actual sightseeing, lunch/personal meal breaks, time allowances, unpriced fees and optional evening suggestions. Generic breaks have no invented restaurant marker.
6. Open the route map; switch all four days, select markers/timeline stops and check road versus estimated legend. Public tiles/geometry require Internet; cached graph metrics keep itinerary generation local.
7. Export the PDF; all requested days and honest day/cost status remain. Refresh the saved itinerary.
8. Repeat with Ahmedabad and another destination. Compare80/10/10,10/80/10 and10/10/80 priorities without assuming different winners. When costs are incomplete, the UI explicitly explains neutralized cost utility. Known-cost fixtures prove genuine mathematical trade-offs.
9. Try an accommodation budget below the known room-night subtotal; expect an honest422/validation message, never a substituted hotel or fake success.

Existing saved itineraries are untouched: regenerate a new plan to use expanded data. The bounded greedy search guarantees only the highest-scored evaluated feasible candidate, not a global optimum. Discovery records can still be excluded by dated closure, routes, duration, access or budget. No hotel-only day is called a successful tour. Groq live inference was not rerun for this task; isolated chatbot regression is separate and does not consume provider quota.

See FULL_REGRESSION_RESULTS.md, ALL_DESTINATION_QUALITY_MATRIX.md and DUAL_GITHUB_PUBLICATION.md. GitHub publication status is separate from local readiness; no merge or public deployment is implied.
