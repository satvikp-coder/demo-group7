# Gujarat attraction quality release20261020

Additive56-record release for the existing eight destinations. No existing records, prices, ratings or photographs are overwritten. The intended result is provisional, sourced sightseeing coverage rather than a claim that unknown fees/access are verified.

## Apply locally

1. `npm run local:backup -- backups/before-attractions.dump`
2. `npm run local:up`
3. `npm run local:attractions -- --dry-run`
4. `npm run local:attractions`
5. Repeat step4: zero insertions/route additions expected.
6. `npm run local:demo:check`

Do not run seed/reset. This release uses the existing expansion transaction and advisory lock. A coordinate mismatch aborts and rolls back the complete import. Existing identity/normalized-name matches are preserved, never overwritten. Database UUIDs are generated once on insertion; external identities remain stable on repeat imports.

## Reproduce and validate

- `python scripts/build-attraction-release.py` rebuilds reviewed records from cached public facts/context and curated corrections; no Internet calls are made. The importer consumes the committed manifest, so rebuilding is not required for installation.
- `npm run test:attractions` validates policy, meals, quota regression and the data package.
- `npm run test:attractions:local -- --production` uses a disposable PostgreSQL database, proves dry-run/late-failure rollback/idempotence/original-row preservation and exercises real API/browser/PDF paths. It does not write the installed user database or call public routing/Groq providers.

The source package includes approximate coordinates, source URLs/check dates, local/excursion labels, explicitly estimated duration metadata, known closure/window rules, and unpriced fee/rating fields. Three Saputara identities use community sources and remain explicitly qualified. Old Saputara museum closure remains unresolved/excluded.

Eight `routes-*-20261020.json` files archive actual OSRM driving-table responses. Only valid bidirectional nonzero metrics, suitable snapping and matching endpoint coordinates become additive graph rows. Unsourced legacy restaurant records receive no new edges. Original row relationships remain untouched. These metrics do not contain road geometry, fares, traffic or access guarantees.

OpenStreetMap contributors: ODbL1.0. Wikivoyage contributors: CC BY-SA4.0. See each record, research-limitations.json and public/data-credits.html. No photograph rights are implied by a public source page. No media copied; intentional fallbacks remain.
