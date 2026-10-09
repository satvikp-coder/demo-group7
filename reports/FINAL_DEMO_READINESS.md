# Final local demonstration readiness

**CONDITIONALLY_READY** for the documented university demonstration. Verified 2026-10-09T14:45:35.784602+00:00.
Application is running at http://localhost:8080 with the current production build.
This is local verification, not a claim of public hosting or current hotel availability.

## Implemented and verified

- Guest generation now preserves the draft and opens sign-in. Valid login, refresh,
  repeated generation, invalid/expired/forged credentials and logout were tested in
  a real browser; backend authentication and ownership remain enforced.
- Category then property selection uses actual UUIDs and configurable INR bands:
  Low Cost below1500, Budget1500 through4000, Premium above4000. Named-anchor
  Haversine distances are labeled approximate straight-line, with25/75km search.
- Distance/cost/rating controls total100 and reach the existing backend engine.
  Deterministic normalized candidate scores, hard known-data constraints and
  explanations are persisted. Global optimality is not claimed.
- Twelve real hotels, eight attraction identities and32 archived directional road
  relationships were added transactionally. Catalog: **8 destinations / 33 attractions / 23 hotels / 12 restaurants / 163 routes**.
  All original rows and the existing user remain unchanged, including after restart.
- Images use licensed local photos or identified fallbacks: 34 genuine-photo
  associations / 42 fallbacks / zero broken images in the tested states.

## Exact validation

| Command | Verified result |
|---|---|
| `npm run test:all` | 18/18 gates; completed 2026-10-09T09:12:08.534Z |
| Backend unit/security | 41 passed, zero failed/skipped |
| Development browser | 64 groups; real APIs and fixture cleanup |
| API client / research | 12 transport checks;22 persisted strategy-only experiments |
| `npm run test:production` | 16/16 gates; completed 2026-10-09T14:34:17.447Z |
| `npm run test:itinerary -- demo` | Import preservation/idempotence,17API/SQL checks, auth replay,4fresh UI runs; completed 2026-10-09T14:35:48.643Z |
| `npm run local:up`, `local:expand`, `local:verify`, `local:restart` | PASS on installed stack; no reset/reseed of live data |
| `node scripts/verify-itinerary-preservation.js` | Nine original tables match separately restored backup |
| `python tests/frontend/itinerary_live_readonly.py` | Current8080 category/weights/login handoff; zero write requests |
| `npm run audit:images` | 76 associations;30resolved assets;zero errors |
| `python scripts/audit-images.py --assets-only` | 66 decodable local images |
| `python scripts/audit-images.py --phase itinerary-final --widths 1440 768 390` | 60 states;zero broken images, console/page errors or horizontal overflow |
| Source/style guard and negative probe | Reviewed hashes pass; unexpected edit rejected;34components checked |
| Dependency audits | Zero reported backend/frontend vulnerabilities |

Evidence is in END_TO_END_TEST_RESULTS.md and the named JSON artifacts. Tests that
write accounts/catalog/trips use disposable databases. Installed8080 checks are
read-only; credentials for the existing user were neither requested nor exposed.

## Reproduce the demonstration

1. Open8080 and sign in normally. A guest can configure a draft and is prompted to
   sign in at Generate. The draft resumes after successful login.
2. Choose Ahmedabad; inspect Low Cost (Maruti), Budget (historical Good Night tariff),
   then Premium. Select French Haveli, one day, one traveler/room, ₹30,000,
   start08:00 and date2026-11-10.
3. Reset priorities before each trial: Distance80, then Cost80, then Rating80.
   Inspect the real route, known-cost ledger and Your Priorities explanation.
4. In the recorded run, Distance80 selected 30.43 km/₹5525; Cost80 selected 44.09 km/₹5500.
   Rating80 chose the same latter candidate. Each was highest-scoring among6evaluated
   candidates under its own weights. Same results across some priorities can be correct.
5. Refresh. Repeat Somnath, Low Cost, Lilavati, Cost80: recorded 19.26 km/₹1350 and
   four attractions. Mobile390px and desktop720px-height journeys passed.

Screenshots: [desktop](demo-1.png), [cost](demo-2.png), [rating](demo-3.png),
[mobile](demo-4.png), [installed guest handoff](itinerary-live-login-handoff.png).

## Remaining acceptance limitations

- Expansion covers Ahmedabad/Somnath; the other six destinations retain their prior
  catalog. Broad8–15attraction/5–10hotel coverage per town is not achieved. Seven new
  hotel rates and all new ratings are unknown. Eight new attraction fees/durations
  are unknown, so those entries support discovery rather than fabricated schedules.
- 42 photo fallbacks remain (21 hotels,11 attractions,10 restaurants). No reusable exact
  photograph was verified for those records; see IMAGE_REPAIR_REPORT.md for names.
- Prices are dated/indicative; Good Night's published tariff is explicitly historical2014.
  Transport fares, live availability, bookings, traffic and reservation confirmation
  are unavailable. Budget feasibility covers known costs, not an all-inclusive quote.
- Daily stored opening/closing windows are enforced. Weekday/holiday closures,
  multiple tour slots and reservations are not fully modeled; displayed advisories
  require checking. Existing lodging convention is one room-night per trip day.
- Existing language controls are English/Hindi, not a completed Gujarati translation.
  Native-device capabilities and public deployment remain unverified/external.

No unresolved reproduced code failure remains in the tested scope. These limitations
must not be presented as completed product capabilities. Requested GitHub publication
is handled after this local acceptance; inspect the pushed commit's CI separately.
