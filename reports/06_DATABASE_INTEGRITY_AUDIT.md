# Database integrity and safety

Live environment: production-mode local PostgreSQL 17.11, persistent Docker volume. ORM: none; pg and versioned SQL migrations. Thirteen public tables: users, destinations, attractions, hotels, restaurants, routes, trips, itinerary_stops, budgets, destination_nearby_attractions, destination_nearby_hotels, schema_migrations, seed_managed_rows.

Verified original live catalog: 8 destinations, 25 attractions, 11 hotels, 12 restaurants, 131 routes; 1 existing user; 0 original trips/stops/budgets. Read-only image snapshots hash rows without exporting sensitive contents. Six attraction ratings are unknown and 23 wheelchair flags are unknown; these are missing evidence, not invented positive values. Source provenance and curated ledgers are retained.

Private backup command: npm run local:backup -- backups/full-audit-2026-10-08.dump. Restore into separate local_restore_fullaudit_20261008 database succeeded; 11 table counts/digests matched the baseline. No active DB reset, reseed or schema alteration. Image-phase fixtures were removed by exact IDs and original digests confirmed before expanded audit. Expanded-audit mutating tests use random heritage_suite_, heritage_audit_ databases or dedicated production-test Compose project/volume; cleanup is reported.

Fresh/repeated migrations, seed ownership preservation, FK/check constraints, admin CRUD and trip ownership/persistence are tested on those isolated databases. Unverified expensive production-data performance claims are not made from the small local catalog. Backup archive/private environment files are not public artifacts. No destructive data repair was needed.

Current read-only relationship checks: zero orphan attractions, hotels, restaurants, itinerary stops or budgets; zero out-of-range hotel coordinates and negative hotel prices. Exact queries/results are summarized in DATABASE_READ_ONLY_INTEGRITY.json. Destination records have a location field rather than latitude/longitude; an initial audit query using the wrong column was corrected, not counted as a pass.

Final expanded preservation proof covers all13 public tables, including both nearby-association tables omitted from the image-only11-table snapshot. Current live row hashes/counts match the separately restored full-audit baseline backup exactly: FINAL_DATABASE_PRESERVATION.json verified=true. No account/catalog/association/trip/budget/migration/seed-ledger data was altered by the full audit.
