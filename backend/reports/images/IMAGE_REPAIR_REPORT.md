# Image repair report

2026-10-08T06:44:01.591183+00:00 (UTC). Local application: http://localhost:8080.

## A. Root causes

1. `frontend/src/api/index.ts` deliberately discarded every remote catalog image. Most child image fields were already empty; the older reference hotel catalog used unrelated Unsplash stock thumbnails rather than verified property photos.
2. `temple.svg` and `hotel.svg` had unescaped ampersands. Their HTTP200 `image/svg+xml` responses failed browser/XML decoding, producing the observed Dwarka/Somnath/hotel broken icons and alt text.
3. `ImageWithFallback` retained a sticky error state when its source changed; it lacked a terminal fallback when the fallback itself could not decode. Hero images bypassed this shared component.
4. Some original imagery had no recoverable licensing/identity evidence. In particular, the old Rukmini photo depicts a pool/resort, so it was not reused as a temple photo.

Eight distinct historical tourism hotlinks currently return HTTP200 image/jpeg; the root cause is not that all these hosts currently fail. Accessibility alone does not establish permission to redistribute their photographs.

## B. Changes and design preservation

- Existing frontend edits: API image adapters/persisted stop presentation; ImageWithFallback; Hero uses the same shared component; Footer adds the required photo-credit link.
- Added `frontend/src/utils/imageSources.ts`, 27 WebP assets with manifest and `image-credits.html`. Repaired/labeled the six existing category SVG illustrations.
- Added image validation, component/browser/asset and safe fixture tests; audit npm commands; optional Pillow test requirement; acquisition/research/source-review tooling; `docs/IMAGES.md`.
- No backend runtime changes, database migrations, catalog updates, resets or reseeds. No price, location, algorithm, auth or transaction logic changes.
- Existing JSX class/style attributes retained; CSS and 122 existing protected frontend/assets/DSA/backend files match the preserved release. Visual screenshots were inspected; this is not a pixel identity certificate.

## C. Original photographs recovered

12 original frames identified against Commons originals, visually reviewed and compared as resized frames. Original JPEG files remain intact; licensed optimized copies now render.

| Photograph | Source | License |
|---|---|---|
| Sabarmati riverfront, Ahmedabad | [Tarun802](https://commons.wikimedia.org/wiki/File:Sabarmati_riverside.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Dwarkadhish Temple, Dwarka | [Vishnupranay.k](https://commons.wikimedia.org/wiki/File:Dwarakadheesh_Temple,_2014.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Asiatic lions in Gir National Park | [Mayankvagadiya](https://commons.wikimedia.org/wiki/File:Gir_lion-Gir_forest,junagadh,gujarat,india.jpeg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| Sun Temple, Modhera | [Musafir kanya](https://commons.wikimedia.org/wiki/File:Surya_mandhir.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Saputara Lake and hill town | [Sumeet photography](https://commons.wikimedia.org/wiki/File:Lake_Saputara.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| Somnath Temple | [B. SurajPatro1997](https://commons.wikimedia.org/wiki/File:Somanath_mandir_(cropped).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Adalaj Stepwell | [AnupGandhe](https://commons.wikimedia.org/wiki/File:Adalaj_ki_Vav_Gujarat_240A1370_72.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Sabarmati Ashram, Ahmedabad | [Umar](https://commons.wikimedia.org/wiki/File:GANDHI_ASHRAM_03.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| Sarkhej Roza, Ahmedabad | [Museeb fakih](https://commons.wikimedia.org/wiki/File:Sarkhej.JPG) | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) |
| Sidi Saiyyed Mosque, Ahmedabad | [Bernard Gagnon](https://commons.wikimedia.org/wiki/File:Sidi_Saiyyed_Mosque,_Ahmedabad.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| Kankaria Lake, Ahmedabad | [Mahargh Shah](https://commons.wikimedia.org/wiki/File:Kankaria_Carnival_2_Ahmedabad.JPG) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| Nageshwar Jyotirlinga, Dwarka | [Bkjit](https://commons.wikimedia.org/wiki/File:Nageshwar.JPG) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |

## D. Replacement/new photographs

15 verified replacement/new photographs. Some serve more than one correctly associated destination/attraction record.

| Photograph | Source | License |
|---|---|---|
| Jami Masjid, Champaner | [Iamarfat](https://commons.wikimedia.org/wiki/File:Jama_Mosque,PMS.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| White Rann of Kutch | [Superfast1111](https://commons.wikimedia.org/wiki/File:Rann_of_Kutch_-_White_Desert.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| French Haveli, Ahmedabad Ã¢â‚¬â€ exterior | [Open source historian](https://commons.wikimedia.org/wiki/File:French_Haveli_4.jpg) | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| Champaner Heritage Resort | [Haard Shah](https://commons.wikimedia.org/wiki/File:Champaner_Heritage_Resort.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Rukmini Devi Temple, Dwarka | [Akkida at English Wikipedia](https://commons.wikimedia.org/wiki/File:Rukmini_temple.JPG) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| Kevada Masjid, Champaner | [Aishwarya Dwivedi](https://commons.wikimedia.org/wiki/File:Kevada_Mosque,_Champaner.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Asiatic lions at Devalia, Gir | [Grondmaster](https://commons.wikimedia.org/wiki/File:Asiatic_Lions_at_Devaliya_Gir.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Modheshwari Mata Temple, Modhera | [Nizil Shah](https://commons.wikimedia.org/wiki/File:Modheshwari_Temple,_Modhera.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| View from Kalo Dungar | [Superfast1111](https://commons.wikimedia.org/wiki/File:Rann_of_Kutch_-_Highest_Point.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| Chandravilas Restaurant, Ahmedabad | [Demon Slayer697563](https://commons.wikimedia.org/wiki/File:ChandraVilas_Restaurant_Today.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Gujarati thali served at Vishalla, Ahmedabad | [KHC Khushtar Heritage](https://commons.wikimedia.org/wiki/File:Gujarati_Thali_at_Vishalla.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Bet Dwarka | [Vinayaraj](https://commons.wikimedia.org/wiki/File:Bet_Dwarka_during_Dwaraka_DWARASPDB_2015_(12).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Bhalka Tirth, near Somnath | [Manoj Khurana](https://commons.wikimedia.org/wiki/File:BHALKA-06.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Somnath Beach | [Dhimant2702](https://commons.wikimedia.org/wiki/File:Somnath_Beach_evening.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Sunset Point, Saputara | [ritesh169O](https://commons.wikimedia.org/wiki/File:Saputara_sunset_point_-_panoramio.jpg) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |

## E. Remaining intentional fallbacks

No verified reusable photograph was found for these records within the reviewed sources. Some Commons searches were rate-limited; this does not establish that suitable photos cannot exist. No unrelated stock/property image was substituted.

| Kind | Record |
|---|---|
| attractions | Calico Textile Museum |
| hotels | Lemon Tree Premier |
| hotels | The House of MG |
| restaurants | Agashiye Terrace Restaurant |
| restaurants | Hotel Sarvottam Restaurant, Halol |
| hotels | Hotel Darshan Palace |
| hotels | Toran Hotel Dwarka |
| restaurants | Shrinath Dining Hall |
| restaurants | Toran Dining Hall Dwarka |
| hotels | Anil Farms Gir Jungle Resort |
| restaurants | Hotel Gir Kathiyawadi Sasan Gir |
| hotels | Modhera Sunrise Resort |
| restaurants | Eulogia Restro Cafe, Sun Temple Modhera |
| hotels | Gateway to Rann Resort |
| restaurants | Gateway to Rann Resort dining room |
| attractions | Saputara Museum |
| hotels | Aakar Lords Inn Saputara |
| restaurants | Anando Restaurant Saputara |
| attractions | Triveni Sangam |
| hotels | Premier Somnath |
| restaurants | Honest Restaurant Somnath |
| restaurants | Toran Dining Hall Somnath |

## F. Validation

- Inventory: 771 image-related source reference lines, 56 live catalog records and 66 public image files. Includes legacy/reference assets and icons; archived publisher pages/vendor/build files are not runtime image references.
- 27 unique genuine photographs; 34 catalog records use photos; 22 use identified generic illustrations; **0 remaining broken images** in tested states.
- All 66 public images pass disk and HTTP decoding/MIME checks; 30 distinct resolved catalog assets return image responses.
- 40 production and 40 development route/viewport states checked (1440×1000 and 390×844). Includes home/explore, all eight destination details, hotels, itinerary/budget/profile/admin/auth/research/not-found and credits routes. Anonymous protected routes are checked as protected/empty states, not as authenticated capability proof.
- Authenticated production: 16 city/viewport journeys; 130 image/control groups; all eleven hotel records and three ranking controls; search/detail/planner, actual generation, itinerary/budget/persisted GET equality, profile reload and read-only operator admin. Zero page/console/image-request/HTTP errors; fixture cleanup verified.
- 6 image unit cases, 6 real React browser fault regressions, 80 Trie assertions, 33 reference-planner assertions, 28 backend tests and TypeScript pass. Docker production build/start pass.
- An initial development mobile sample was captured before a lazy decode settled. That exact case passed with explicit scroll/decode waits; initial artifact retained. Initial harness failures from transition selectors, offscreen lazy loading, and an overlapping rebuild are not claimed as successful runs.
- PostgreSQL row digests before/after match for all catalog, users, trips, stops, budgets and seed/migration ledgers. One existing account preserved; only disposable audit fixture accounts/trips were cleaned.
- The actual UI language control is English/Hindi. That existing switch was exercised; a Gujarati UI switch is not implemented and was not fabricated by this image task.

## G. Before/after artifacts

- [Before Explore desktop](before-explore-1440.png) / [after Explore desktop](production-explore-1440.png).
- [Before Dwarka desktop](before-destination-dwarka-1440.png) / [after Dwarka desktop](production-destination-dwarka-1440.png).
- [Before hotels](before-hotels-1440.png) / [after Ahmedabad hotels](after-hotels-ahmedabad-1440.png).
- [After Explore mobile](production-explore-390.png) / [after hotels mobile](after-hotels-ahmedabad-390.png).
- Detailed JSON: inventory, catalog-validation, asset-validation, production-browser, development-final-browser, functional-browser, component-browser, preservation and database-before/after/restored.

## H. Production reliability

All verified photography is bundled with the normal frontend Docker/Vite build and served by nginx. No external image service, uploader volume, credential or runtime Commons request is required. Existing local assets, same-origin paths, decoder fallbacks and PWA network-first caching remain compatible with the supported root-mounted deployment. New image sources require new filenames to avoid stale asset caches. Include the credits page with any deployment and retain each photo license. Public hosting/provider behavior is not claimed verified by localhost tests.

Repeatable commands and maintenance instructions: [docs/IMAGES.md](../../../docs/IMAGES.md).
