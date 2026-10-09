# Itinerary verification checkpoint

Live8080 anonymous Bearer failure reproduced in `auth-itinerary-before.json/png`. Isolated auth browser passes draft-preserving sign-in, invalid credentials, generation, refresh, repeated calls and signed-expired/forged/missing rejection. Category browser passes real selected UUID/category persistence and mismatch422.

Weights browser passes seven API scenarios, independent scores, persisted dates/group/weights and1440/390responsive screenshots. Reproduced mobile stop/detail overflow and calendar-date serialization were repaired. A duplicate start_date migration attempt was corrected before any live migration.

Expanded browser PASS2026-10-09T03:59:31Z:20records/32routes, every original row preserved, dry-run rollback, repeat import unchanged. New Ahmedabad/Somnath hotels generate real attraction stops; unknown-price selection returns422. Lazy images decode after scrolling.

Fresh production-build demo PASS2026-10-09T09:03:47Z:17API/SQL checks, seven auth browser checks, three Ahmedabad priorities and Somnath mobile generation, refresh, delayed real requests, duplicate submission and logout. No demo page/console errors. Evidence: itinerary-demo-runner.json, itinerary-api-matrix.json, itinerary-auth-browser.json, itinerary-demo-browser.json, demo-1.png through demo-4.png. Final18unified/16container gates and60live image states PASS; see FINAL_DEMO_READINESS.md for timestamps.

| Test | Result | Evidence / behavior |
|---|---|---|
| T01 authenticated generation | PASS | Fresh UI login and database-backed schedules |
| T02 missing token | PASS | Backend401; guest draft-preserving sign-in |
| T03 expired token | PASS | Signed expired JWT rejected; session cleared |
| T04 Low Cost | PASS | Maruti and Somnath trust properties; strict matching |
| T05 Budget | PASS | Good Night historical tariff and Somnath choices |
| T06 Premium | PASS | Three Ahmedabad properties; French Haveli selected |
| T07 category change | PASS | Options update; no silent substitution |
| T08 hotel ID | PASS | Actual UUID reaches and persists through generation |
| T09 distance80 | PASS | Real demo and independent scoring |
| T10 cost80 | PASS | Real demo and independent scoring |
| T11 rating80 | PASS | Real demo and independent scoring |
| T12 balanced | PASS | Seven-scenario browser/API test |
| T13 distance100 | PASS | Browser/API and controlled trade-off fixtures |
| T14 cost100 | PASS | Browser/API and controlled trade-off fixtures |
| T15 rating100 | PASS | Browser/API and controlled trade-off fixtures |
| T16 invalid total | PASS | API400 and SQL rejection |
| T17 missing rating | PASS | Null retained; no invented rating utility |
| T18 missing price | PASS | API422; never free |
| T19 very low budget | PASS | Weighted generation422, no fabricated plan |
| T20 larger budget | PASS | Feasible schedules and boundary tests |
| T21 small candidate pool | PASS | Existing city journeys and deterministic fixtures |
| T22 empty category | PASS | Original base catalog Low Cost empty state |
| T23 other destinations | PASS | Eight-city regression and expanded Somnath demo |
| T24 identical input | PASS | Stable scores and substantive saved stops |
| T25 altered weights | PASS | Seven recomputations; real Ahmedabad route trade-offs |
| T26 changed hotel coordinates | PASS | Haversine changes; stale OSRM evidence excluded,422 |
| T27 database unavailable | PASS | Actual container database outage503 and recovery |
| T28 image error | PASS | Shared fallback tests,66decoded assets,60live viewport states |
| T29 refresh | PASS | Session and latest saved weights/date/result restored |
| T30 mobile | PASS | 390px selection/generation/result; no horizontal overflow |
| T31 inserted records | PASS | New hotel IDs returned and used by real planner |
| T32 duplicate ingestion | PASS | Repeat adds nothing; original rows unchanged |
| T33 backend failure | PASS | Infeasible422 and injected-error controls show failure |
| T34 slow response | PASS | Delayed forwarded request shows pending/disabled generation |
| T35 repeated clicks | PASS | Same-frame double click sends one create and one generate |

Failed attempts are not counted as passes: guest auth handoff, duplicate DATE migration corrected before live use, nullable expansion fields, asynchronous hotel-option test race, tall centered planner controls, and legacy research calls implicitly converted to weighted mode. The demo harness initially failed the production HTTP API guard; a test-only same-origin proxy fixed it without weakening that guard. Lazy images are scrolled before decoding checks. Malformed transport tests now assert exact validation errors with an intercepted session, preventing auth-preflight false positives.

The720px desktop demo and original browser regression exercise the scrolling repair. Research tests inspect all22 persisted strategy-only trips. Displayed distance sums use stored two-decimal route precision; optimizer metrics remain unchanged. Tests use disposable databases; no bookings or paid actions.

Final demo replay completed2026-10-09T14:35:48.643Z with decoded itinerary thumbnails and clean screenshots. Installed8080 guest flow and nine-table preservation passed after restart.
