# Phase 3 local demonstration readiness

Status: CONDITIONALLY_READY for the documented local demonstration. The final budget validation and hotel/accommodation translations are installed at localhost:8080. Read-only readiness passes7/7, installed budget rejection/guest handoff passes at1440/768/390, and all24 destination/category dropdowns exactly match API records. Final isolated container regression passed16/16 at2026-10-11T04:21:14.864Z, including browser integration, restart persistence, backup restoration and outage recovery. Full regression passed18/18 after the final runtime edits.

The current source passes56 backend tests and expanded production-preview API/browser checks. The actual reported House of MG12000-budget/2-night input now shows16938 lodging and4938 shortfall before any trip write. Explicitly reducing nights to1 keeps the hotel and produces a9319 known-cost subtotal, with persisted refresh at1440/768/390. See `phase3-budget-recovery.json`.

The professor rehearsal passed5 real journeys using the enriched isolated catalog: Ahmedabad distance/cost/rating priorities, Somnath mobile and Modhera tablet. It verified authenticated requests, actual selected hotel IDs, highest evaluated candidate scores, budget sums, duplicate-submit protection, refresh, images and logout. Screenshots: `demo-1.png` through `demo-5.png`; evidence: `itinerary-demo-browser.json` and `itinerary-demo-runner.json`.

## Start and check

From the application folder:

```sh
npm run local:up
npm run local:demo:check
```

Open http://localhost:8080. All three services start together; the backend is served through `/api`, PostgreSQL stays private. Preserve `.env.local-production` and the database volume. No reset or reseed is needed.

The read-only check covers configuration, frontend/deep links, backend/database readiness, all8 catalogs, authenticated-endpoint protection, migration checksums and local image bytes. It prints exact recovery commands on failure. It creates no accounts or trips. It is an environment check, not proof of every user workflow.

For a repeatable automated rehearsal using disposable accounts/database:

```sh
npm run test:demo:local
npm run test:phase3:production:local
```

Run suites sequentially.

## Manual presentation

1. Sign in with your own account, Explore Ahmedabad and open the planner.
2. Compare Low Cost and Premium. These have1 and3 priced properties respectively; Budget is honestly empty.
3. Choose French Haveli or House of MG,2 travel days,1 lodging night,1 room,1 traveler and a sufficient budget such as30000. Optionally choose2026-11-10.
4. Generate with80/10/10, then edit and compare10/80/10 and10/10/80. Read actual evaluated scores and distances. Equal selections under different weights can be correct.
5. Open the budget and saved itinerary, refresh and verify the same persisted result.
6. Repeat with Somnath / Low Cost / Lilavati, then Modhera / Budget / Modhera Sunrise Resort. The automated demo also exercises390px and768px.
7. Demonstrate honest validation with House of MG,2 nights and12000: lodging alone exceeds budget. Explicitly change to1 night or another affordable hotel; never claim the original unaffordable input is feasible.
8. Switch language and verify translated hotel/priority/accommodation labels. Some older/result/error strings remain English.

## Verified scope and limitations

Installed image scan covers60 page/viewport states,70 decoded assets,107 records with38 photograph associations/69 intentional fallbacks. No broken image was found in these tested states. All24 destination/category dropdown checks match backend UUID sets; Dwarka has2 Budget choices among7 hotels. Missing prices limit choice counts:16 of43 hotels have usable indicative prices, not live quotes. Unknown costs/ratings remain unknown.

The optimizer is deterministic bounded multi-start greedy, not a proof of global optimality. Sparse catalogs, incomplete operating information, unknown transport fares, some language strings and licensed-photo gaps remain. The current reviewed dataset supports the demonstrated workflows, not universal booking/availability guarantees. No public hosting work was performed. No live user records were reset or removed; the reported failed draft is preserved.
