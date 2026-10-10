# CODEX HANDOFF

## Project Summary

Existing Gujarat Heritage Tourism Planner: React/TypeScript, Express, PostgreSQL17,
and shared DSA. Preserve architecture, design, real user data and source provenance.

## Current Goal

Phase2 university release. Publish a reviewed feature branch and PR, verify CI,
without merging or activating public deployment. Current authority:
reports/PHASE2_FINAL_READINESS.md and reports/PHASE2_PROGRESS.md.

## Current Project State

Installed local catalog:8 destinations,44 attractions,43 hotels,12 restaurants,
322 routes. Local8080 rebuilt with migration008 and additive enrichment. Original
rows and existing user preserved; verified backup restored separately.

## Completed

31 source-backed records and159 modelled road connections; explicit lodging
nights/dates with legacy compatibility; historical hotel tariff exclusion;
dated Devalia scheduling;108-key Gujarati dictionary preserving English/Hindi;
one additional licensed Bhadra Fort photo. Prior auth/categories/weighted planner
remain functional. See Phase2 reports for field-level limitations.

## Files Changed

Trip API/model/scheduler, hotel price normalization, existing planner/result/language
components, shared accommodation utility, maintenance/test commands, CI and docs.
Exact frontend changes remain protected by PHASE2_APPROVED_CHANGES.json hashes.

## Files Created

Migration008; data/phase2 manifests and source caches; accommodation and operating
policy tests; Phase2 isolated API/browser/import tests; seven Phase2 reports and
coverage/preservation evidence. Public ODbL derived catalog and photo attribution.

## Technical Decisions

No reset, algorithm replacement, fabricated rates/ratings or unauthorized property
photos. Missing fees/durations exclude discovery attractions from timed schedules.
New forms default days minus one nights; old rows/requests retain old semantics.
Room subtotal is rate times nights times rooms; unknown taxes/fares are excluded.
Preserve reviewed byte hashes across Windows/Linux checkouts using Git attributes.

## Dependencies / Setup Changes

No new runtime dependency. Existing locked npm/Node22/PostgreSQL17/Docker and
Python/Chrome tooling. Back up before local:up and local:enrich; see local runbook.

## Commands Used

npm run test:all:local; npm run test:production;
npm run test:phase2:production:local; npm run test:localization;
node scripts/test-local-all.js itinerary-demo; npm run local:backup;
npm run local:restore; npm run local:up; npm run local:enrich;
npm run audit:images; python scripts/phase2-preservation.py --verify.

## Testing Completed

Development18/18 and production-container16/16 gates passed2026-10-10.
Expanded production preview,32 cross-destination API scenarios, accommodation
validation/persistence, responsive1440/768/390 and professor demo passed.
Fresh checkout source hashes and local backup restoration passed. Installed image
and final remote CI results belong in the Phase2 final report when completed.

## Current Issues / Bugs

Uneven price-band choice;27 hotel prices unavailable/historical;11 new discovery
attractions without fees/durations; partial calendar/vehicle-cost data; bounded
heuristic scope; partial Gujarati;72 intentional photo fallbacks. Public deployment
unverified. Do not present these as verified current quotes or live availability.

## Important Warnings

Never publish credentials/backups/user records, reset live data, or run test:local
against real records. Run mutating suites sequentially on disposable databases.
Keep private historical continuity outside the public release checkout.

## Next Steps

Finish installed image verification, publish reviewed branch/PR and inspect CI.
No automatic merge/public deployment. Report remaining factual/provider limits.

## Last Session Summary

Local Phase2 code/data installed with original-row preservation and isolated
regression evidence. Source publication and remote checks follow final review.

## Last Updated

2026-10-10T08:58:01.348294+00:00 UTC / Asia/Calcutta (UTC+05:30).
