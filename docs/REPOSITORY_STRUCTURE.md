# Repository map

The [root README](../README.md) is the entry point. This is the implemented layout.

| Path | Purpose |
|---|---|
| `frontend/src/api/` | Central API client, validation and database-to-view adapters. |
| `frontend/src/components/` | Existing React views and controls. |
| `frontend/src/utils/` | UI utilities and historical reference planner/search logic. |
| `backend/routes/`, `controllers/`, `models/`, `services/` | Express API, persistence, database-backed search and scheduling. |
| `backend/middleware/`, `config/` | Validation, authorization, security and environment checks. |
| `backend/scripts/`, `backend/tests/` | Maintenance tools and backend verification. |
| `backend/migrations/`, `database/schema/schema.sql` | Ordered upgrades and canonical base schema. |
| `database/seeds/` | Historical academic SQL examples, not the approved production import. |
| `data/research/` | Researched supplements, source archives and road evidence. |
| `dsa/` | Shared algorithms; retain for academic evaluation. |
| `tests/`, `scripts/` | Browser/assertion harnesses, suite runners and local operation commands. |
| `deploy/`, `compose*.yml`, `.github/` | Deployment configuration and CI. |
| `docs/foundation/`, `docs/diagrams/` | Historical academic design documents. |
| `docs/research/` | Experiments with explicitly retained comparison baselines. |
| `backend/reports/` | Curated provenance/readiness reports, required fixtures and generated local evidence. |

No source directories were moved for this release. See
[release verification](RELEASE_VERIFICATION.md) for artifact retention decisions.
