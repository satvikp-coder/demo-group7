# Phase 3 data quality

Installed snapshot: `phase3-installed-catalog.json`; private SQL preservation: `phase3-live-preservation.json`. Counts remain8 destinations /44 attractions /43 hotels /12 restaurants /322 routes. One original user and all original rows are preserved, except six explicitly reviewed attraction fields; prior values and provenance are retained. No new catalog records or invented rates/ratings were added.

| Destination | Attractions | Hotels | Restaurants | Usable prices | Hotel ratings | Attraction fees | Durations | Hour pairs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Ahmedabad | 14 | 11 | 3 | 4 | 3 | 11 | 11 | 11 |
| Champaner | 9 | 2 | 1 | 2 | 1 | 1 | 2 | 1 |
| Dwarka | 4 | 7 | 2 | 2 | 2 | 4 | 4 | 4 |
| Gir National Park | 2 | 5 | 1 | 1 | 1 | 2 | 2 | 1 |
| Modhera | 4 | 4 | 1 | 1 | 1 | 2 | 2 | 1 |
| Rann of Kutch | 2 | 2 | 1 | 1 | 1 | 2 | 2 | 0 |
| Saputara | 5 | 7 | 1 | 1 | 1 | 2 | 3 | 0 |
| Somnath | 4 | 5 | 2 | 4 | 1 | 4 | 4 | 4 |

Field presence does not prove all existing information is current.16 usable hotel prices remain indicative,27 are unknown/historical;11 stored hotel ratings retain their existing provenance. Unknown prices are excluded from category/overnight estimates. No live availability is asserted.

Five Ahmedabad attractions now have municipal visitor guidance for fees, approximate visit duration and hours: Amritavarshini Vav, Astodia Darwaza, Bhadra Fort, Raipur Gate and Teen Darwaza. Sources/date/expected previous values: `data/phase3/enrichment-20261011.json`. Known fee fields increased23?28, durations25?30. Hour pairs18?22: five added, Gir's misleading single window removed in favor of explicit seasonal fixed departures.

Gir correction: official booking guidance supports Indian six-seat CategoryA vehicle3500 + G2 guide400 + permit800 weekday/1000 weekend, total4700/4900 per vehicle. Capacity rounding and date policy are now used in generation. Other guides/vehicle types/nationalities/festivals/availability remain advisory. Source: https://girlion.gujarat.gov.in/GirJungleTrailBooking.aspx (checked2026-10-10).

Safe importer tests passed dry-run rollback, partial-failure rollback, unchanged unrelated records/fields and idempotence. Before local application, the backup restored into a new database and matched all nine original-table fingerprints. Installed dry-run/apply/repeat completed, preserving user records and counts.

Remaining admission/duration gaps:

- Ahmedabad: kalupur-darwaza-ahmedabad, manek-burj-ahmedabad, tomb-of-ahmad-shah-ahmedabad.
- Champaner: east-bhadra-gate-champaner, ek-minar-ki-masjid-champaner, helical-stepwell-champaner, kevada-masjid, maqbara-mandvi-champaner, octagonal-stepwell-champaner, sahar-ki-masjid-champaner, south-bhadra-gate-champaner.
- Modhera: modhera-vav-modhera, sun-temple-museum-modhera.
- Saputara: saputara-museum, sunrise-point-saputara, table-point-saputara.

Hotel research limitations: official Ginger Dwarka rendered a zero-price booking placeholder, not a usable rate; no new rate was imported. Shivalik, Gir Birding Lodge, Gokul Farm and French Haveli pages did not supply a reliable current published amount in the reviewed pages. Shaam-e-Sarhad tariff access timed out. A similarly named Hotel Sarvottam tariff belonged to a different locality and was rejected. These are scoped research outcomes, not a claim that further data cannot be obtained.

Photographs: three exact-entity licensed Commons images added (Amritavarshini Vav, Raipur Gate, Teen Darwaza). Existing genuine French Haveli image preserved. Installed image audit:107 records,38 photo associations,69 intentional fallbacks,0 errors;70 public assets decode. Attribution is served at `/image-credits.html`. Reviewed but unused French Haveli alternative is marked explicitly in `data/phase3/reviewed-photos.json`.
