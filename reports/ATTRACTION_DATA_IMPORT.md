# Additive attraction import

Baseline:3fbcae1e9d8a28a3270112812996536d41e533d0. The application folder has no Git metadata; a clean sibling publication checkout was branched as feature/attraction-itinerary-quality. Existing unrelated workspace changes remain separate.

Existing migrations/schema already support nullable fees/durations, provenance JSON and unlocated meals. No schema migration or data reset was introduced.

The versioned20261020 manifest adds56 actual places/experiences and833 modeled road-graph relationships. Every existing identity/UUID is preserved; matching identities, normalized names and slugs are skipped rather than overwritten. The existing expansion transaction/advisory lock protects the complete release. No existing attraction, hotel, restaurant, price, rating or user record is updated.

Isolated PostgreSQL evidence: dry run rolled back; deliberately stale hotel coordinates caused late import failure and full rollback; successful import inserted56/833; repeated import inserted0/0; every original row in four catalog tables matched its snapshot. Verified: true. See attraction-quality-integration.json.

Before live changes, a private archive was restored to a separate database and all nine original table row digests matched. Private archives/digests are excluded from Git. Installed after-import preservation is recorded separately in attraction-coverage-after.json; do not infer it from isolated tests alone.

Import commands and cached-source reproduction: data/attraction-20261020/README.md. Eight road matrices are actual cached OSRM table results, not fabricated road geometry or fares. Unsourced legacy restaurants receive no new edges. Existing road rows remain intact.

Installed verification: fresh pre-apply backup taken; dry run, successful additive import and repeat import passed. Final catalog is8/100/56/12/1330. All original rows in nine audited tables retain identical UUID/row hashes, including existing users, trips, stops and budgets. Installed read-only24-case browser and7/7 readiness checks pass. No schema change, reset, reseed, customer test account or historical itinerary rewrite.
