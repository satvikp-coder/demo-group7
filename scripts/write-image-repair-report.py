"""Publish measured image evidence, preserving the initial lazy-decode observation."""
import json
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'backend/reports/images'
read=lambda name:json.loads((OUT/name).read_text(encoding='utf-8'))
catalog=read('catalog-validation.json');manifest=json.loads((ROOT/'frontend/public/assets/photographs/manifest.json').read_text(encoding='utf-8'))
prod=read('production-browser.json');dev=read('development-browser.json');follow=read('development-home-confirmation-browser.json');functional=read('functional-browser.json');components=read('component-browser.json');assets=read('asset-validation.json');inventory=read('production-inventory.json')
for replacement in follow['pages']:
    for index,page in enumerate(dev['pages']):
        if page['path']==replacement['path'] and page['viewport']==replacement['viewport']:dev['pages'][index]=replacement
dev['followupEvidence']='development-home-confirmation-browser.json';dev['followupReason']='Initial mobile home snapshot caught an incomplete lazy decode; explicit scroll/decoder waits verified the same image. No application source change was needed.'
assert not any(row['broken'] for row in dev['pages'])
assert not any(row['broken'] for row in prod['pages'])
assert functional['verified'] and functional['cleanupCompleted'] and components['verified'] and not assets['errors']
(OUT/'development-final-browser.json').write_text(json.dumps(dev,indent=2),encoding='utf-8')
photos=manifest['photos'];recovered=[photo for photo in photos if photo['recovered']];new=[photo for photo in photos if not photo['recovered']]
lines=['# Image repair report','',datetime.now(timezone.utc).isoformat()+' (UTC). Local application: http://localhost:8080.','',
'## A. Root causes','',
'1. `frontend/src/api/index.ts` deliberately discarded every remote catalog image. Most child image fields were already empty; the older reference hotel catalog used unrelated Unsplash stock thumbnails rather than verified property photos.',
'2. `temple.svg` and `hotel.svg` had unescaped ampersands. Their HTTP200 `image/svg+xml` responses failed browser/XML decoding, producing the observed Dwarka/Somnath/hotel broken icons and alt text.',
'3. `ImageWithFallback` retained a sticky error state when its source changed; it lacked a terminal fallback when the fallback itself could not decode. Hero images bypassed this shared component.',
'4. Some original imagery had no recoverable licensing/identity evidence. In particular, the old Rukmini photo depicts a pool/resort, so it was not reused as a temple photo.',
'', 'Eight distinct historical tourism hotlinks currently return HTTP200 image/jpeg; the root cause is not that all these hosts currently fail. Accessibility alone does not establish permission to redistribute their photographs.',
'', '## B. Changes and design preservation','',
'- Existing frontend edits: API image adapters/persisted stop presentation; ImageWithFallback; Hero uses the same shared component; Footer adds the required photo-credit link.',
'- Added `frontend/src/utils/imageSources.ts`, 27 WebP assets with manifest and `image-credits.html`. Repaired/labeled the six existing category SVG illustrations.',
'- Added image validation, component/browser/asset and safe fixture tests; audit npm commands; optional Pillow test requirement; acquisition/research/source-review tooling; `docs/IMAGES.md`.',
'- No backend runtime changes, database migrations, catalog updates, resets or reseeds. No price, location, algorithm, auth or transaction logic changes.',
'- Existing JSX class/style attributes retained; CSS and 122 existing protected frontend/assets/DSA/backend files match the preserved release. Visual screenshots were inspected; this is not a pixel identity certificate.',
'', '## C. Original photographs recovered','',f'{len(recovered)} original frames identified against Commons originals, visually reviewed and compared as resized frames. Original JPEG files remain intact; licensed optimized copies now render.','',
'| Photograph | Source | License |','|---|---|---|']
for photo in recovered:lines.append(f"| {photo['title']} | [{photo['author']}]({photo['source']}) | [{photo['license']}]({photo['licenseUrl']}) |")
lines+=['','## D. Replacement/new photographs','',f'{len(new)} verified replacement/new photographs. Some serve more than one correctly associated destination/attraction record.','',
'| Photograph | Source | License |','|---|---|---|']
for photo in new:lines.append(f"| {photo['title']} | [{photo['author']}]({photo['source']}) | [{photo['license']}]({photo['licenseUrl']}) |")
lines+=['','## E. Remaining intentional fallbacks','',
'No verified reusable photograph was found for these records within the reviewed sources. Some Commons searches were rate-limited; this does not establish that suitable photos cannot exist. No unrelated stock/property image was substituted.','',
'| Kind | Record |','|---|---|']
for row in catalog['records']:
    if row['state']=='fallback':lines.append(f"| {row['kind']} | {row['name']} |")
lines+=['','## F. Validation','',
f"- Inventory: {len(inventory['references'])} image-related source reference lines, {len(catalog['records'])} live catalog records and {len(assets['checked'])} public image files. Includes legacy/reference assets and icons; archived publisher pages/vendor/build files are not runtime image references.",
f"- {len(photos)} unique genuine photographs; {sum(row['state']=='photo' for row in catalog['records'])} catalog records use photos; {sum(row['state']=='fallback' for row in catalog['records'])} use identified generic illustrations; **0 remaining broken images** in tested states.",
f"- All {len(assets['checked'])} public images pass disk and HTTP decoding/MIME checks; 30 distinct resolved catalog assets return image responses.",
f"- {len(prod['pages'])} production and {len(dev['pages'])} development route/viewport states checked (1440×1000 and 390×844). Includes home/explore, all eight destination details, hotels, itinerary/budget/profile/admin/auth/research/not-found and credits routes. Anonymous protected routes are checked as protected/empty states, not as authenticated capability proof.",
f"- Authenticated production: {len(functional['cities'])} city/viewport journeys; {len(functional['images'])} image/control groups; all eleven hotel records and three ranking controls; search/detail/planner, actual generation, itinerary/budget/persisted GET equality, profile reload and read-only operator admin. Zero page/console/image-request/HTTP errors; fixture cleanup verified.",
'- 6 image unit cases, 6 real React browser fault regressions, 80 Trie assertions, 33 reference-planner assertions, 28 backend tests and TypeScript pass. Docker production build/start pass.',
'- An initial development mobile sample was captured before a lazy decode settled. That exact case passed with explicit scroll/decode waits; initial artifact retained. Initial harness failures from transition selectors, offscreen lazy loading, and an overlapping rebuild are not claimed as successful runs.',
'- PostgreSQL row digests before/after match for all catalog, users, trips, stops, budgets and seed/migration ledgers. One existing account preserved; only disposable audit fixture accounts/trips were cleaned.',
'- The actual UI language control is English/Hindi. That existing switch was exercised; a Gujarati UI switch is not implemented and was not fabricated by this image task.',
'', '## G. Before/after artifacts','',
'- [Before Explore desktop](before-explore-1440.png) / [after Explore desktop](production-explore-1440.png).',
'- [Before Dwarka desktop](before-destination-dwarka-1440.png) / [after Dwarka desktop](production-destination-dwarka-1440.png).',
'- [Before hotels](before-hotels-1440.png) / [after Ahmedabad hotels](after-hotels-ahmedabad-1440.png).',
'- [After Explore mobile](production-explore-390.png) / [after hotels mobile](after-hotels-ahmedabad-390.png).',
'- Detailed JSON: inventory, catalog-validation, asset-validation, production-browser, development-final-browser, functional-browser, component-browser, preservation and database-before/after/restored.',
'', '## H. Production reliability','',
'All verified photography is bundled with the normal frontend Docker/Vite build and served by nginx. No external image service, uploader volume, credential or runtime Commons request is required. Existing local assets, same-origin paths, decoder fallbacks and PWA network-first caching remain compatible with the supported root-mounted deployment. New image sources require new filenames to avoid stale asset caches. Include the credits page with any deployment and retain each photo license. Public hosting/provider behavior is not claimed verified by localhost tests.','',
'Repeatable commands and maintenance instructions: [docs/IMAGES.md](../../../docs/IMAGES.md).']
(OUT/'IMAGE_REPAIR_REPORT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('Image report written:',len(recovered),'recovered,',len(new),'new/replaced; live data preserved.')
