"""Summarize measured local acceptance artifacts; fails if a required gate failed."""
import json
from pathlib import Path
from datetime import datetime, timezone

def read(path): return json.loads(Path(path).read_text(encoding='utf-8'))
def write(name,text): Path('reports/'+name).write_text(text.strip()+'\n',encoding='utf-8')
stamp=datetime.now(timezone.utc).isoformat()
full=read('backend/reports/production/full-suite.json')
prod=read('backend/reports/production/container-suite.json')
demo=read('reports/itinerary-demo-runner.json')
demo_runs=read('reports/itinerary-demo-browser.json')['runs']
demo_metrics=[r['optimization']['candidates'][0] for r in demo_runs]
live=read('reports/itinerary-live-preservation.json')
smoke=read('reports/itinerary-live-readonly.json')
images=read('backend/reports/images/itinerary-final-browser.json')
catalog=read('backend/reports/images/catalog-validation.json')
assets=read('backend/reports/images/asset-validation.json')
inventory=read('backend/reports/images/itinerary-final-inventory.json')
for result in [full,prod,demo,live,smoke]: assert result['verified']
assert len(full['gates'])==18 and len(prod['gates'])==16
assert not any(images[k] for k in ['errors','consoleErrors','imageHttpErrors','failedImageRequests'])
assert not any(p['broken'] or p['horizontalOverflow'] for p in images['pages'])
assert not catalog['errors'] and not assets['errors']
fallbacks=[r for r in catalog['records'] if r['state']=='fallback']
photos=[r for r in catalog['records'] if r['state']=='photo']
counts='8 destinations / 33 attractions / 23 hotels / 12 restaurants / 163 routes'
write('FINAL_DEMO_READINESS.md',f'''
# Final local demonstration readiness

**CONDITIONALLY_READY** for the documented university demonstration. Verified {stamp}.
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
  relationships were added transactionally. Catalog: **{counts}**.
  All original rows and the existing user remain unchanged, including after restart.
- Images use licensed local photos or identified fallbacks: {len(photos)} genuine-photo
  associations / {len(fallbacks)} fallbacks / zero broken images in the tested states.

## Exact validation

| Command | Verified result |
|---|---|
| `npm run test:all` | 18/18 gates; completed {full['finishedAt']} |
| Backend unit/security | 41 passed, zero failed/skipped |
| Development browser | 64 groups; real APIs and fixture cleanup |
| API client / research | 12 transport checks;22 persisted strategy-only experiments |
| `npm run test:production` | 16/16 gates; completed {prod['finishedAt']} |
| `npm run test:itinerary -- demo` | Import preservation/idempotence,17API/SQL checks, auth replay,4fresh UI runs; completed {demo['finishedAt']} |
| `npm run local:up`, `local:expand`, `local:verify`, `local:restart` | PASS on installed stack; no reset/reseed of live data |
| `node scripts/verify-itinerary-preservation.js` | Nine original tables match separately restored backup |
| `python tests/frontend/itinerary_live_readonly.py` | Current8080 category/weights/login handoff; zero write requests |
| `npm run audit:images` | {len(catalog['records'])} associations;30resolved assets;zero errors |
| `python scripts/audit-images.py --assets-only` | {len(assets['checked'])} decodable local images |
| `python scripts/audit-images.py --phase itinerary-final --widths 1440 768 390` | {len(images['pages'])} states;zero broken images, console/page errors or horizontal overflow |
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
4. In the recorded run, Distance80 selected {demo_metrics[0]['distance_km']:.2f} km/₹{demo_metrics[0]['known_cost']}; Cost80 selected {demo_metrics[1]['distance_km']:.2f} km/₹{demo_metrics[1]['known_cost']}.
   Rating80 chose the same latter candidate. Each was highest-scoring among6evaluated
   candidates under its own weights. Same results across some priorities can be correct.
5. Refresh. Repeat Somnath, Low Cost, Lilavati, Cost80: recorded {demo_metrics[3]['distance_km']:.2f} km/₹{demo_metrics[3]['known_cost']} and
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
''')
write('IMAGE_REPAIR_REPORT.md',f'''
# Image restoration and final validation

The original causes were discarded image references, malformed category SVG assets,
and fallback state that did not recover correctly when sources changed. The shared
imageSources/ImageWithFallback repair and local manifests are preserved. Prior asset
history/licensing: backend/reports/images/IMAGE_REPAIR_REPORT.md and
frontend/public/assets/photographs/manifest.json; public attribution: image-credits.html.

Twelve original photographs were recovered and15licensed replacements added:27unique
local WebP photographs. No additional property photograph was copied for the20new
records. Searches did not establish reusable matching Maruti/Lilavati/Sagar Darshan
images; unrelated hospital hits and unlicensed official galleries were rejected.
Ranked Stays now renders an intentional fallback even for empty source fields.

Measured after production installation: {len(inventory['references'])} image-related
source lines audited; {len(catalog['records'])} catalog image associations;
{len(photos)} genuine-photo associations; {len(fallbacks)} identified fallbacks;
zero remaining broken images in the tested states. All8destination photos work.
French Haveli and Champaner Heritage Resort retain genuine property photographs.
All23hotel records were audited. There is no current API image-gallery field;
the validator also checks gallery arrays if introduced later.

All{len(assets['checked'])}public image files passed local parsing and HTTP image-type/decoding.
All{len(images['pages'])}page/viewport states at1440/768/390passed nonzero natural dimensions,
without image request errors, console/page errors or horizontal overflow. Generated
itinerary thumbnails and category-card images also decode in the authenticated
production-build demo. Protected-route guest states in the public scan are not
represented as authenticated verification. Normal builds require no third-party image
requests. Static assets survive the verified container restart.

Evidence: backend/reports/images/catalog-validation.json, asset-validation.json,
itinerary-final-inventory.json, itinerary-final-browser.json and itinerary-final-*.png;
reports/demo-*.png. Repeat with npm run audit:images and scripts/audit-images.py.

## Remaining identified fallbacks

| Entity | Record |
|---|---|
'''+ '\n'.join('| '+r['kind']+' | '+r['name'].replace('|','/')+' |' for r in fallbacks))
p=Path('reports/END_TO_END_TEST_RESULTS.md')
s=p.read_text(encoding='utf-8').replace('Final unified/container reruns and live image scan remain pending.','Final18unified/16container gates and60live image states PASS; see FINAL_DEMO_READINESS.md for timestamps.')
s=s.replace('| T27 database unavailable | PENDING FINAL | Real container outage/recovery rerunning |','| T27 database unavailable | PASS | Actual container database outage503 and recovery |')
s=s.replace('| T28 image error | PASS TARGETED | Shared fallback tests; final expanded live scan pending |','| T28 image error | PASS | Shared fallback tests,66decoded assets,60live viewport states |')
s=s.split('\nFinal demo replay completed')[0]+'\nFinal demo replay completed '+demo['finishedAt']+' with decoded generated-itinerary images and clean screenshots. Installed8080 guest flow and nine-table preservation passed after restart.\n'
p.write_text(s,encoding='utf-8')
p=Path('reports/DATABASE_EXPANSION_REPORT.md');s=p.read_text(encoding='utf-8').replace('Live import is pending.','Live import and post-restart preservation PASS; see itinerary-live-preservation.json.')
s=s.split('\nThe maintenance profile')[0]+'\nThe maintenance profile initially reused an old image without db:expand; no data changed. local-stack.js now uses compose run --build for seed/verify/expand. Retried expansion and read-only local:verify both passed. Original user/trip data was preserved; no live reset or reseed.\n'
p.write_text(s,encoding='utf-8')
write('ITINERARY_FIX_PROGRESS.md',f'''
# Itinerary implementation progress

Updated {stamp}. Local implementation and acceptance complete with explicit limitations;
authorized GitHub publication is the current phase.

- Completed A/B: reproduced live Bearer401, repaired draft-preserving authentication,
  verified real generation before category/weight/data extensions.
- Completed C/D/E: category/property/geographic matching,100%priorities, existing
  multi-start greedy engine and explainability; controlled and real trade-offs tested.
- Completed F/G:20sourced records/32routes added safely; photos or honest fallbacks.
- Completed H/I:18unified/16container gates;17API matrix;4production-build demo runs;
  final auth replay;60image states/66decoded assets; installed8080 restart/preservation.
- Completed J: eight requested reports; exact evidence and limitations recorded.
- Confirmed repairs: IT-001..009 in09_BUG_FIX_LOG.md; maintenance-image refresh also
  verified by installed import/verification. Every original record preserved.
- Current data: {counts}; original1user and0trips unchanged.
- Source: no Git metadata in application folder. Verified source ZIP/DB restore
  retained privately. Existing clean sibling demo-group7-release is main at3ad1dcb;
  fetched origin/main matches. User explicitly authorized push after completion.
- Remaining: prepare reviewed public sync into existing checkout, exclude private
  environments/backups/raw traces, preserve source hashes/line endings, commit and
  normal push to satvikp-coder/demo-group7, inspect remote tree and CI.
- Blockers: none for source publication. Product/data limitations in FINAL_DEMO_READINESS.md
  remain; no complete all-city data/photo/Gujarati/provider/public-hosting claim.
- Exact next action: public source/evidence sync and staged privacy/hash review.
''')
print('Final local reports generated from verified artifacts:',stamp)
