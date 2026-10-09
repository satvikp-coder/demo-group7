# CODEX HANDOFF

## Project Summary

Existing Gujarat Heritage Tourism Planner: React/TypeScript, Express, PostgreSQL and shared DSA modules. Preserve the existing architecture and visual identity.

## Current Goal

Publish the verified image, integration and itinerary repairs to the existing main branch. Check the Actions run associated with the published commit.

## Current Project State

Local acceptance completed 2026-10-09. CONDITIONALLY_READY for the documented university demo. Current catalog: 8 destinations, 33 attractions, 23 hotels, 12 restaurants, 163 routes. See reports/FINAL_DEMO_READINESS.md; older release reports are historical.

## Completed

Reproduced and repaired Bearer-token user flow; real authenticated generation, category/property selection, geographic filtering, synchronized 100% priorities and weighted existing planner. Added 20 sourced records and 32 routes safely. Shared image recovery/fallbacks, full audit, regression and browser demonstration completed. Original records preserved against a restored backup.

## Files Changed

Frontend API/planner/auth/hotel/image components; backend hotel/trip models, validation and planner; shared planning utilities; local maintenance image refresh; tests, workflow and reports. See reports/09_BUG_FIX_LOG.md and the commit diff.

## Files Created

Migrations 005-007; category and priority controls; sourced expansion data/importer; licensed photograph assets and credits; repeatable image/itinerary tests; reports/01_PROJECT_ARCHITECTURE_AUDIT.md through reports/10_FINAL_PRODUCTION_READINESS.md plus eight itinerary reports.

## Technical Decisions

Extend the existing constrained greedy/graph engine with bounded candidate scoring, not a parallel engine. Unknown prices/ratings remain unknown. Distances identify straight-line versus road estimates. Preserve exact migration/evidence/source bytes using Git attributes. Keep private historical continuity and backups outside the public checkout.

## Dependencies / Setup Changes

Use locked npm installs, Node 22, PostgreSQL 17, Docker Compose, Python and Chrome for browser tests. Frontend source-map-js patched to 1.2.2. Existing live database safely migrated without reset.

## Commands Used

npm run test:all; npm run test:production; npm run test:itinerary -- demo; npm run audit:images; python scripts/audit-images.py; npm run local:up; npm run local:expand; npm run local:verify; npm run local:restart. Tests use isolated databases; never run destructive fixtures against user data.

## Testing Completed

Local unified 18/18 gates PASS (2026-10-09T09:12:08Z); container 16/16 PASS (14:34:17Z); expanded production-build demo/auth/API matrix PASS (14:35:48Z). 17 API checks, four demo journeys, 60 image page/viewport states, 66 decoded assets; zero broken images. Detailed evidence in reports/END_TO_END_TEST_RESULTS.md. These are local results; consult GitHub Actions for remote CI.

## Current Issues / Bugs

42 intentional image fallbacks remain among 76 entity associations; 34 associations use genuine photographs. Dataset expansion covers Ahmedabad/Somnath, not every city. Unknown fares, rates, availability and calendar constraints remain explicit. Gujarati, native-device certification and public hosting remain incomplete; no blanket production certification.

## Important Warnings

Never publish environments, secrets, private backups or session traces. Never reset/reseed the live database. Preserve unknown tourism facts and provenance. Run mutating suites sequentially and in isolated databases. Existing account/session records must remain intact.

## Next Steps

Complete normal push and inspect remote CI; fix any reproduced portability failure without weakening tests. Public hosting requires its own configured environment and verification. Follow reports/FINAL_DEMO_READINESS.md for reproducible demo steps and limitations.

## Last Session Summary

Local implementation, installed application verification and reports are complete. Public checkout synchronized with reviewed source/assets/evidence; privacy and checkout hash review precede publication. No force push or database reset.

## Last Updated

2026-10-09T20:13:09.000915+00:00 UTC / Asia/Calcutta (UTC+05:30).
