# Phase 2 test results

All commands below completed successfully on 2026-10-10 unless marked pending.

| Command / evidence | Result |
|---|---|
| Baseline `npm run test:all:local` | 18/18 gates; phase2-baseline-tests.json |
| Final `npm run test:all:local` | 18/18 gates, finished03:20:41Z; phase2-full-tests.json |
| `npm run test:production` | 16/16 container gates, finished03:25:29Z; phase2-production-tests.json |
| `npm run test:phase2:data:local` | Isolated31-record/159-route import, rollback, idempotence and preservation PASS |
| `npm run test:phase2:production:local` | Expanded production SPA/API/browser PASS, finished08:45:50Z; phase2-production-import-tests.json |
| `node scripts/test-local-all.js itinerary-demo` | API17 checks, authentication replay and4 production-browser demo runs PASS, finished08:48:36Z |
| Backend unit/security | 46 tests PASS |
| `npm run test:localization` | 1 test;108 existing dictionary keys covered |
| All-destination matrix | 32 real generation scenarios across8 destinations; category isolation, known-cost budget and unique visits PASS |
| Responsive Phase2 browser | 1440/768/390: authentication, zero nights, saved refresh, decoded images, no overflow/page exceptions, Gujarati persistence PASS |
| TypeScript / source / style guards | PASS;14 explicitly reviewed Phase2 hashes, no unauthorized UI changes |
| Installed-data/image audit | Original9-table fingerprints preserved;67 decoded assets and60 browser states PASS |
| GitHub CI | SUCCESS run38039970377, exact code commit2927b94; all configured steps passed |

The final full suite includes64 browser groups, API/client/security/database checks,
package audits and production build. Container tests include a real backup restore,
restart, database outage recovery and least-privilege checks. These do not certify
public hosting or current tourism prices.

Earlier attempts are retained honestly: baseline was interrupted by overlapping
Compose maintenance; one implementation run exposed an extra null response field,
which was removed without weakening API assertions; another browser run timed out
at a planner transition without a proven root cause. The unchanged transition
assertions passed in the final run. The demo Budget assertion now verifies exclusion
of Good Night's historical2014 tariff rather than treating it as a current price.

All write tests use disposable databases. No real account or booking is used.
