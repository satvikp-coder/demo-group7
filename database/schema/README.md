# Database Schema (`database/schema/`)

Contains production-ready PostgreSQL DDL normalized to Third Normal Form (3NF).

## Schema Files

- **[`heritage_planner_schema.sql`](heritage_planner_schema.sql)**: Consolidated master schema combining:
  - **`users`**: Tourists, Tour Operators, and Admins with role-based check constraints (`CHECK (role IN ('tourist', 'tour_operator', 'admin'))`).
  - **`destinations`**: Core Gujarat destination cities with uniqueness constraints.
  - **`attractions`**: Monuments and heritage sites with GPS coordinates (`lat`, `lng`), operating hours (`opens_at`, `closes_at`, `wraps_past_midnight`), duration, rating, and entry fee constraints.
  - **`hotels`**: Accommodations with `operator_id` ownership, `is_active` soft-delete, stay type classification, and nightly pricing.
  - **`restaurants`**: Dining venues with average cost per person and cuisine tags.
  - **`routes`**: Intra-city spatial road edges with distance (km), transit time (min), and transport modes (`road`, `boat`) for Dijkstra graph traversal.
  - **`trips` & `itinerary_stops`**: Multi-day itinerary tracking with sequential day plans and timestamps.
  - **`budgets`**: Category-level expense allocations (hotel, food, transit, entry fees).
  - **`hotel_submissions`**: Tour operator submission queue with admin approval workflow (`pending`, `approved`, `rejected`).
  - **Indexes**: GIN trigram indexes (`gin_trgm_ops`) on names for autocomplete search, and B-tree indexes on foreign keys, categories, and coordinates.

- **[`schema.sql`](schema.sql)**: Foundational 3NF relational schema specification with extensions, foreign key cascades, and check constraints.
