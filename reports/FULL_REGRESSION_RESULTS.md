# Full regression results

Final frozen application source. All catalog-mutating suites ran sequentially against disposable databases; installed writes were limited to the reviewed additive import.

| Command | Result |
|---|---|
| `npm run test:attractions:local -- --production` | PASS |
| `npm run test:all:local` | PASS |
| `npm run test:production` | PASS |
| `npm run test:phase2:production:local` | PASS |
| `npm run test:phase3:production:local` | PASS |
| `npm run test:demo:local` | PASS |
| `npm run test:chat:local` | PASS |
| `npm run test:localization` | PASS |

Backend118/118 including14 new focused policy/data regressions; full suite18/18 gates; production container suite17/17 gates. Attraction matrix448 actual API scenarios plus8 low-budget cases, three four-day Kutch browser/PDF viewports and reused all-eight-city/10viewport map-budget checks. Installed readiness7/7; installed read-only24 cases; original nine-table row preservation PASS; image audit176 records/0errors.

Initial failures are retained honestly: one pre-interaction cold development navigation timeout (unchanged assertions rerun), legacy tests assuming float(null) for newly provisional expenses (replaced with strict Decimal known-subtotal, UNKNOWN-state and incomplete-total checks), stale sparse-day-note and one-visit/no-meal scarcity assumptions in older Phase3 tests (replaced with exact day-status, multi-day sightseeing, meal-window and room-night assertions), and a source-guard read during the final reviewed UI text/hash update (frozen rerun and fresh Git-index audit pass). Product regressions for missing-fee/duration eligibility, legacy cheapness, unreachable quotas, closure/window policy, rural return and incorrect incomplete status have deterministic failing-before tests.

Live road-metric evidence is the eight cached OSRM matrices; automated geometry/tiles use explicit fixtures. No live all-destination geometry or current hotel availability claim. No Groq inference was called by these regressions; current live provider availability is not certified. Private backups, credentials, original-user row digests and the separate context export are excluded from Git.
