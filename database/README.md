# Database Module (`database/`)

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
