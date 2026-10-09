# Additive catalog release20261009

Isolated verified counts: destinations8 unchanged; attractions25→33; hotels11→23; restaurants12 unchanged; routes131→163. Every original record/UUID is preserved. Dry-run rollback and repeated import verified in `itinerary-expanded-runner.json`. Live import and post-restart preservation PASS; see itinerary-live-preservation.json.

Sources: `data/expansion/catalog-20261009.json`, OSM object snapshots and two directional OSRM matrices. `backend/scripts/expand-catalog.js` validates provenance, identities and Gujarat coordinates, uses a transaction/advisory lock, preserves matching existing names/slugs/IDs, and never updates/deletes originals. Only new endpoints receive route rows. Use `npm run local:expand` after rebuild; direct backend command supports `--dry-run`. Recovery uses the separately restored private pre-change backup.

Ahmedabad adds8hotels/8heritage identities; Somnath adds4trust guesthouses. [Maruti](https://www.hotelmaruti.com/) supplies an undated starting estimate1400; [Good Night](https://www.hotelgoodnight.co.in/tariff.html) supplies an explicitly historical2014 double-room tariff1700. [Somnath Trust](https://somnath.org/pilgrim-facilities) publishes Lilavati/Maheshwari non-AC two-bed750 and Sagar Darshan Premier3400; taxes/deposits are stated separately. These are not live quotes. Seven added hotel prices and all new guest ratings remain unknown. Eight new attraction admissions/durations remain unknown and are excluded from timed generation.

OSM facts carry ODbL attribution and a public derived-data download. Road estimates are modeled, not live traffic/fares;250m snap ceiling enforced. No copyrighted property media copied. Migrations005/006 add trip fields;007 loosens price/duration nullability without removing values. Broad coverage across all8cities remains incomplete; the other6cities retain original data.

The maintenance profile initially reused an old image without db:expand; no data changed. local-stack.js now uses compose run --build for seed/verify/expand. Retried expansion and read-only local:verify both passed. Original user/trip data was preserved; no live reset or reseed.
