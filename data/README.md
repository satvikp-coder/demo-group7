# Tourism data

The approved runtime catalog contains eight destinations. Original CSVs cover
part of the catalog; `research/` supplies reviewed supplements and route evidence.
Use the backend guarded `db:seed` / `db:verify` commands, not historical SQL imports.

| Path | Role |
|---|---|
| `attractions.csv`, `hotels.csv`, `restaurants.csv` | Original project-approved rows, pinned by source hashes. |
| `routes.csv` | Historical simulated routes; all 56 are excluded from the production import. |
| `research/<city>.json` | Researched destination and child records with sources and uncertainty. |
| `research/routes-*.json` | Archived road matrices, including directional evidence where available. |
| `research/maps/`, `research/pages/` | Public-source evidence retained for traceability. |
| `research/production-provenance-*.json` | Field-level review qualifications. |
| `raw/`, `cleaned/`, `CHANGELOG.md` | Historical collection organization and notes. |

Sources and dates are documented in the [provenance report](../backend/reports/data-provenance.md).
All eight datasets retain unknown or time-sensitive fields. Identity confirmation
is not independent verification of every price, hour or accessibility claim.
See [research limitations](../backend/reports/COMPLETION_RESEARCH.md) and
[release verification](../docs/RELEASE_VERIFICATION.md).
