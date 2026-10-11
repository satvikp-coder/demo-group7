# Phase 2 hotel and attraction quality

Verified isolated import:31 additional records (20 hotels,11 attractions),159 new OSRM route pairs. Original rows preserved; transactional rollback, dry-run and repeat-import tests passed. Installed additive import and all original-row fingerprints passed on2026-10-10; the existing user record is preserved.

Sources: data/phase2/catalog-20261010.json retains per-record OSM identities, property URLs and verification dates. Smaller bounded queries recovered Dwarka/Hodka after earlier Overpass failures. The public derived catalog and ODbL attribution are linked from data-credits.html.

Only Hotel Sarvottam has a newly sourced published indicative price:INR2000 Silver double-room tariff from its official undated room page. This is not a dated current quote; taxes and live availability remain unknown. The other19 added hotels have null prices and all20 have null guest ratings. They must not be forced into price categories. Existing Good Night2014 tariff remains stored but is excluded from current category/budget calculations.

All11 added attractions retain unknown fees and durations, so they improve discovery but do not enter cost-constrained schedules. Helical Stepwell has official08:00-18:00 hours. No invented duration or free-entry assumption is used.

Coverage remains uneven: no new Ahmedabad/Somnath rows in this batch because their prior expansion is preserved. Dwarka now adds5 hotels; Rann adds a Hodka property with locality explicit. Not every destination has3-5 hotels per price band. Nearby Mehsana/Patan/Baska properties are named with their actual locality. No live room availability is claimed.

Final installed counts:8 destinations,44 attractions,43 hotels,12 restaurants,322 routes.
All44 attraction and43 hotel coordinates are in the reviewed Gujarat bounds.
Only16 hotels have usable indicative numeric prices; these are not16 independently
verified current quotes. The remaining27 are unknown/historical for budgeting.
See the per-city matrix and full source metadata in phase2-final-coverage.json.
