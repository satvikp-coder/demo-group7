# Image sources, licensing and validation

Latest measured audit (12 October 2026):120entity references,38genuine-photo
associations,82intentional fallbacks,34unique resolved assets and0errors. This does
not claim that fallbacks are genuine photographs. See [latest installed checks](../reports/TEAMMATE_FIXES.md)
and [current catalog](../README.md#current-data). Earlier recovery counts below
describe the initial image-repair stage and remain historical.

The frontend serves images from `frontend/public/assets/`. Vite copies them into
the production build; nginx serves `/assets/` as files with real 404s, independently
of the private API/database. Express uses PostgreSQL through `pg`, without an ORM;
`image_url` is returned unchanged by the catalog endpoints. No upload mount is used.

`frontend/src/utils/imageSources.ts` resolves presentation imagery through the
curated `assets/photographs/manifest.json`. Catalog slugs select the correct local
photograph. Persisted stops without slugs use exact catalog names. The manifest
contains individually verified Commons sources, authors, license links, image
dimensions, hashes and transformation notes. Source URLs and all tourism/account/
trip data in PostgreSQL stay unchanged. No database reset, reseed or image migration
is needed. A supplied photo can replace an intentional missing-photo fallback.
New slugs never inherit a different property's photo merely because names match.

The local photographs are optimized WebP copies, each with its own CC BY, CC BY-SA,
CC0 or public-domain terms. Modified CC BY-SA images remain under the stated
share-alike license, independently of the application license. Attribution is
available through the existing footer's **Photo credits** link and
`/image-credits.html`; this page ships with the images. Do not describe the images
as exclusive property of this application or remove their credits.

The original assets are retained. Twelve original frames were matched to licensed
Commons originals using visual review and thumbnail comparison. Unrelated old
hotel stock photos and the old pool photograph labeled Rukmini Temple are not used
as property/site photographs. Historical tourism hotlinks can return valid image
responses; accessibility alone does not establish redistribution permission.

`ImageWithFallback` preserves callers' dimensions/classes/object fit. It lazily
loads images, resolves paths against Vite's base, clears failed `srcSet` when
falling back, retries a new source after earlier failure, and progresses through
custom/category/self-contained fallback sources once each. Fallback SVGs explicitly
say **Photograph unavailable**. The final SVG has no network dependency; if even
that is blocked, an accessible styled element replaces the image icon. The
existing production CSP allows local/data imagery. Intentional illustration states
are marked `data-image-state="fallback"`; successfully loaded photos use `photo`.

## Repeatable checks

Run from the application root after `npm run local:up`:

```sh
npm run audit:images
npm run audit:images -- --remote
python -m pip install -r requirements-images.txt
python scripts/audit-images.py --base http://127.0.0.1:8080 --assets-only
python scripts/audit-images.py --phase production
npm --prefix frontend run test:unit
```

The first command audits every live destination, attraction, hotel and restaurant,
checks resolved local files, HTTP status/content type/body length, and validates
future gallery fields. Empty original fields are recorded separately from working
intentional fallbacks. `--remote` additionally probes historical source URLs;
those results are diagnostics, never licensing evidence or build prerequisites.
The Python checks parse SVG XML and decode bitmap bytes (both disk and HTTP), then
verify browser `naturalWidth`/`naturalHeight` on desktop and mobile. They capture
screenshots, missing requests, image HTTP failures, console and page errors. Use
`--api http://localhost:PORT/api` when testing a separate Vite/API development pair.
Evidence is written under `backend/reports/images/`.

The component fault test uses a Vite development instance at 4310:

```sh
python tests/frontend/image_component_browser.py
```

It explicitly injects missing images, HTTP 200 HTML and missing fallbacks. Such
intentional fault traffic is separate from the zero-error successful page audit.
The test-only `frontend/scripts/image-component-harness.tsx` is never imported by
the product or bundled into its production entry point.

```sh
python scripts/image-data-snapshot.py before
python tests/frontend/image_functional_browser.py
python scripts/image-data-snapshot.py after
```

This browser acceptance path creates only disposable verification accounts/trips,
exercises all eight cities and all eleven hotels at both viewport sizes, checks
three ranking orders, authenticates/reloads, generates and retrieves exact saved
itineraries/budgets, checks read-only operator administration, then deletes only
its exact user IDs (and their cascading test trips). It neither reseeds nor edits
catalog records. Snapshots store row digests/counts, never account credentials.
Run it sequentially, without rebuilding/restarting the same stack during the test.

## Maintaining the photographs

Normal builds use only committed local images and metadata. Optional acquisition
is a separate maintainer action in `scripts/acquire-images.py`; its reviewed source
choices are recorded in `data/images/photograph-sources.json`. Inspect the original
Commons file, identity, author and license before adding a choice. A named business
match is required: a stock hotel, similarly named property, or nearby monument is
not a valid substitution. Regenerate local images/manifest/credits and rerun the
checks. Do not use search thumbnails as permanent image URLs. Preserve source
provenance in the database. Use a new descriptive key/filename when changing an
image source; the acquisition tool rejects reuse of an existing filename for a
different photo, so the existing long-lived asset cache cannot serve stale imagery
under a new photograph's attribution.

Image deployments use the existing Docker frontend build and nginx static route.
Include the photos, manifest and credits page when publishing. No external image
service, API secret, backend volume, developer-specific path or runtime Commons
connection is required. Absolute `/api` routing and root site mounting remain the
documented production topology; a new subpath deployment must configure Vite and
the application router consistently. This task does not claim public deployment.

See [the measured repair report](../backend/reports/images/IMAGE_REPAIR_REPORT.md)
for the source inventory, recovered/replacement list, exact remaining fallbacks,
screenshots, final test results and existing language limitations.
