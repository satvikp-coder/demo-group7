# Phase 3 itinerary accuracy

P3-001: Gir admissions incorrectly multiplied a per-vehicle tariff by each traveler. The old flexible window also missed monsoon closure. The source-backed policy now budgets six-seat Category A plus G2 guide and Indian permit estimates: INR4700 weekday /4900 weekend per vehicle, rounded up for groups. Fixed departures and June16?October15 closure are enforced. Other nationalities, festivals, availability and extras require confirmation. Four unit tests and four real API cases pass, including persisted costs4700 for3 travelers,9400 for7,4900 on Saturday, and no Gir visit during closure. Evidence: `phase3-safari-api-tests.json`, `data/phase3/operating-policies.json`.

P3-002: WhatIf changed days while retaining incompatible lodging nights/check-out. The new-version helper adjusts explicit nights and checkout, preserves extra-night offsets and explicit zero-night visits, and leaves legacy requests and saved originals intact. Two unit tests and actual7-day/6-night to1-day/0-night saved-version browser journeys pass at1440/768/390, including refresh and changed trip ID.

P3-003: Eight greedy guidance vectors could all choose the same first stop and miss a useful feasible alternative. A deterministic directed-route fixture reproduced103km versus a feasible4km route. Existing weighted scoring/constraints remain; up to12 deterministic alternative first attractions extend the existing search. Two new tests verify improved ranking, deterministic output and unknown-hours advisories. No global optimality is claimed.

| Destination | Distinct evaluated candidates before | After |
|---|---:|---:|
| Ahmedabad |6|9?10|
| Champaner |1|1|
| Dwarka |4|7|
| Gir National Park |1|1?2|
| Modhera |2|2|
| Rann of Kutch |2|2|
| Saputara |1|2|
| Somnath |4|6|

Before/after use the same enriched catalog and32 API scenarios (three one-day weight vectors and one three-day balanced request per city), dated2026-10-12. Gir is seasonally closed on that date; other valid visits remain. Files: `phase3-before-search-matrix.json`, `phase3-after-search-matrix.json`. Low candidate counts are factual limitations, not artificially varied results.

P3-004: Scheduled attractions lacking verified operating hours now carry a confirmation advisory in saved stop notes. Unknown fees/durations continue to exclude unsupported candidates; missing prices are not treated as free.

Accommodation API tests verify zero nights, nights?rooms, arrival/departure agreement, invalid ranges, legacy behavior and unknown overnight prices. Transport fares remain unknown and excluded; totals are known-cost subtotals, not all-inclusive quotes. Broader calendar, child/festival pricing and complete factual data remain limitations.


## P3-005 ? reported planning rejection

Read-only inspection of the user's failed local request identified House of MG,2 nights,1 room,2 travelers,INR12000 budget and8469 indicative nightly rate. Accommodation alone is16938, a4938 shortfall. No route/weight failure or authentication error caused this rejection. The generic no-feasible-plan message concealed the actionable cause, and the UI created a draft before finding this known cost conflict.

The existing form now checks the shared room-night subtotal before creating a trip, preserves all selections and returns to logistics with exact accommodation/budget/shortfall amounts. The weighted backend independently returns422 with the same explanation. Neither layer silently changes nights, room count, hotel or budget. Two new unit regressions pass, including the same hotel/budget with one explicitly selected night. Real browser recovery passed at1440/768/390: blocked16938 lodging against12000 with zero writes; explicitly changing only nights to1 generated a9319 known-cost subtotal,8469 lodging, same hotel UUID and persisted refresh. Evidence: `phase3-budget-recovery.json`. Final full regression and installed refresh are pending. The user's existing failed draft is retained.


Latest 2026-10-11T04:18:15.639168+00:00: final source full regression18/18 PASS. Rebuilt local app confirmed via3 read-only budget/guest handoff journeys,9 language/viewport checks and24 destination/category API parity checks. Original-row preservation PASS; all services running. Final isolated16-gate container suite active.


Final 2026-10-11T04:21:38.546950+00:00: container regression16/16 PASS after all runtime edits. Local repair installed and tested; no active test process remains. CONDITIONALLY_READY for documented demo, with factual price/photo/scheduling/localization limitations retained in PHASE3_LOCAL_DEMO_READINESS.md. No further runtime edits after passing final suites.
