# Database Seeds (`database/seeds/`)

Contains reproducible SQL seed datasets for populating the database and hydrating intra-city graph structures.

## Seed Files

- **[`ahmedabad_gujarat_full_seed.sql`](ahmedabad_gujarat_full_seed.sql)**: Comprehensive Gujarat master seed dataset containing:
  - **7 Destinations**: Ahmedabad, Dwarka, Somnath, Rann of Kutch, Champaner, Saputara, and Modhera.
  - **175 Attractions**: 25 attractions per destination, complete with exact decimal coordinates (`lat`, `lng`), category classifications, estimated visit durations, entry fees, and opening/closing hours (`opens_at`, `closes_at`, `wraps_past_midnight`). This is a legacy, unreviewed export (see the warnings at the top of the SQL file) and is not loaded by `npm run db:seed`. The approved runtime dataset that `db:seed` loads from `data/*.csv` has 8 destinations and 25 attractions.
  - Deterministic UUID keys to guarantee relational integrity and consistent hydration across runs.

- **[`somnath_dwarka_seed.sql`](somnath_dwarka_seed.sql)**: Specialized initial seed script covering:
  - Somnath and Dwarka destinations, primary attractions, curated heritage stays/hotels, dining spots, and pre-calculated intra-city route distance/time edges.
