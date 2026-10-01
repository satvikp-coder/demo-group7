# PostgreSQL database

The supported production process is described in [the runbook](../docs/PRODUCTION.md).
Use `npm --prefix backend run db:migrate`, then guarded `db:seed` and `db:verify`.
Do not manually create/edit tables or run a reset against user data.

The migration baseline is `schema/schema.sql`; ordered additive upgrades live in
`backend/migrations/`, protected by a transactional advisory lock and checksum ledger.
Runtime and maintenance roles are separate. Fresh/repeat migrations, constraints,
two reseeds, preserved user/trip data and a clean backup restore were tested.

The approved runtime dataset has eight destinations,25 attractions,11 hotels,
12 restaurants and131 sourced modelled routes. Original CSVs and approved research
supplements are imported by the backend seed pipeline. Record-wide unverified facts
remain unverified; see `backend/reports/production-provenance-review.json`.

Other SQL files under `schema/` and `seeds/` are historical/reference material.
They are not the approved production import, and their larger dataset counts,
verification claims or proposed tables do not describe the current application.
Do not substitute those scripts for the supported guarded pipeline.

## Historical coursework description (not production instructions)

**Status:** SCHEMA DESIGNED & COMPREHENSIVELY SEEDED (See [`docs/foundation/06_Database_Design.md`](../docs/foundation/06_Database_Design.md))

Contains production-ready 3NF PostgreSQL schema DDL definitions, comprehensive seed datasets across Gujarat heritage destinations, and migration specifications.

## Folder Structure

- **`schema/`**
  - [`heritage_planner_schema.sql`](schema/heritage_planner_schema.sql): Consolidated production schema combining core entities (`users`, `destinations`, `attractions`, `hotels`, `restaurants`, `routes`, `trips`, `budgets`) with operator ownership (`operator_id`), soft-delete flags (`is_active`), and `hotel_submissions` staging table with admin approval workflows.
  - [`schema.sql`](schema/schema.sql): Base 3NF normalized schema with PostgreSQL `uuid-ossp` and `pg_trgm` extensions, foreign key cascades, check constraints, and B-tree / GIN indexes.
- **`seeds/`**
  - [`ahmedabad_gujarat_full_seed.sql`](seeds/ahmedabad_gujarat_full_seed.sql): Master seed script covering 7 Gujarat heritage destinations (Ahmedabad, Dwarka, Somnath, Rann of Kutch, Champaner, Saputara, Modhera) and 175 verified attractions (25 per destination) with GPS coordinates, operating hours, durations, ratings, and entry fees.
  - [`somnath_dwarka_seed.sql`](seeds/somnath_dwarka_seed.sql): Foundational seed dataset for Somnath and Dwarka covering destinations, attractions, hotels, restaurants, and intra-city route graph edges.
- **`migrations/`**
  - [`README.md`](migrations/README.md): Database schema versioning and migration guides.
