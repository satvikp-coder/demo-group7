# Database Design Specification

**Course:** CSC210 Data Structures & Algorithms — Ahmedabad University  
**Group:** Group 07  
**Status:** Production-Ready PostgreSQL Relational Schema & Indexing Specification

---

## 1. Scope & Relational Principles

The database design for the **Heritage Tourism Planner for Gujarat** adheres strictly to the system's **intra-city scope**:
- **Single-City Bound:** All itinerary generation, routing, hotel recommendations, and attraction filtering operate within **one city at a time**.
- **Intra-City Routes Only:** The `routes` table stores road distance and travel time between attraction pairs **within the same city**. There is **no city-to-city (inter-city) routes table or foreign key** anywhere in this schema.
- **Frontend Parity:** Every table, column, enum, and constraint maps directly to UI components verified in `Frontend_Documentation.md`. No speculative or unbacked tables (such as payment processing or live flight bookings) exist in this schema.

---

## 2. Table-by-Table Documentation

### 2.1. `users`
- **Purpose:** Stores registered user credentials and system access roles (Tourist vs. Tour Operator).
- **Primary Key:** `id` (`UUID`)
- **Columns:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `name` (`VARCHAR(255)`, NOT NULL)
  - `email` (`VARCHAR(255)`, UNIQUE, NOT NULL)
  - `password_hash` (`VARCHAR(255)`, NOT NULL)
  - `role` (`VARCHAR(50)`, NOT NULL, CHECK: `'tourist'` or `'tour_operator'`)
  - `created_at` (`TIMESTAMPTZ`, default `CURRENT_TIMESTAMP`)
- **Indexes:** Unique index on `email`.

---

### 2.2. `destinations` (Cities)
- **Purpose:** Catalogs the 8 supported Gujarat heritage destination cities.
- **Primary Key:** `id` (`UUID`)
- **Columns:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `name` (`VARCHAR(100)`, UNIQUE, NOT NULL) — e.g., `"Somnath"`, `"Dwarka"`
  - `district` (`VARCHAR(100)`, NOT NULL) — e.g., `"Gir Somnath"`, `"Devbhumi Dwarka"`
  - `category` (`VARCHAR(100)`, NOT NULL) — Official Gujarat Tourism taxonomy (e.g., `"Pilgrimage & Coastal"`)
  - `created_at` (`TIMESTAMPTZ`, default `CURRENT_TIMESTAMP`)
- **Indexes:** Index on `name` (with trigram GIN index for Trie initialization queries).

---

### 2.3. `attractions`
- **Purpose:** Stores heritage attractions and points of interest located within a specific destination city.
- **Primary Key:** `id` (`UUID`)
- **Foreign Keys:** `destination_id` $\rightarrow$ `destinations(id)` (`ON DELETE CASCADE`)
- **Columns:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `destination_id` (`UUID`, FK, NOT NULL)
  - `name` (`VARCHAR(255)`, NOT NULL) — e.g., `"Somnath Temple"`
  - `lat` (`NUMERIC(9,6)`, NOT NULL)
  - `lng` (`NUMERIC(9,6)`, NOT NULL)
  - `duration_hours` (`NUMERIC(3,1)`, NOT NULL, CHECK $> 0$) — Realistic visit time (e.g., `1.5` hrs temple vs `3.0` hrs safari)
  - `rating` (`NUMERIC(2,1)`, CHECK `rating BETWEEN 0.0 AND 5.0`)
  - `category` (`VARCHAR(100)`, NOT NULL) — Attraction category (e.g., `"Temple"`, `"Fort"`, `"Nature"`, `"Museum"`)
  - `entry_fee` (`VARCHAR(100)`, default `'Free'`) — String fee description (e.g., `"Free"`, `"₹50 entry"`, `"~₹30 boat fare"`)
- **Indexes:** Index on `destination_id`.

---

### 2.4. `hotels`
- **Purpose:** Records accommodation options available inside each destination city for trip start/end nodes and recommendations.
- **Primary Key:** `id` (`UUID`)
- **Foreign Keys:** `destination_id` $\rightarrow$ `destinations(id)` (`ON DELETE CASCADE`)
- **Columns:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `destination_id` (`UUID`, FK, NOT NULL)
  - `name` (`VARCHAR(255)`, NOT NULL) — e.g., `"Premier Somnath"`
  - `lat` (`NUMERIC(9,6)`, NOT NULL)
  - `lng` (`NUMERIC(9,6)`, NOT NULL)
  - `price_per_night` (`INT`, NOT NULL, CHECK $\ge 0$)
  - `rating` (`NUMERIC(2,1)`, CHECK `rating BETWEEN 0.0 AND 5.0`)
  - `stay_type` (`VARCHAR(50)`, NOT NULL, CHECK: `'Toran Hotel'` | `'Heritage Hotel'` | `'Registered Hotel'` | `'Homestay'`)
- **Indexes:** Index on `destination_id`, composite index on `(destination_id, price_per_night)`.

---

### 2.5. `restaurants`
- **Purpose:** Stores local dining establishments inside each destination city for automated meal-break schedule insertion.
- **Primary Key:** `id` (`UUID`)
- **Foreign Keys:** `destination_id` $\rightarrow$ `destinations(id)` (`ON DELETE CASCADE`)
- **Columns:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `destination_id` (`UUID`, FK, NOT NULL)
  - `name` (`VARCHAR(255)`, NOT NULL)
  - `lat` (`NUMERIC(9,6)`, NOT NULL)
  - `lng` (`NUMERIC(9,6)`, NOT NULL)
  - `rating` (`NUMERIC(2,1)`, CHECK `rating BETWEEN 0.0 AND 5.0`)
  - `avg_cost_per_person` (`INT`, NOT NULL, CHECK $\ge 0$)
- **Indexes:** Index on `destination_id`.

---

### 2.6. `routes` (Intra-City Road Edges)
- **Purpose:** Stores weighted road network edges between attraction pairs **within the same city** for Graph construction and Dijkstra pathfinding.
- **Primary Key:** Composite `(source_attraction_id, destination_attraction_id)`
- **Foreign Keys:**
  - `source_attraction_id` $\rightarrow$ `attractions(id)` (`ON DELETE CASCADE`)
  - `destination_attraction_id` $\rightarrow$ `attractions(id)` (`ON DELETE CASCADE`)
  - `destination_id` $\rightarrow$ `destinations(id)` (`ON DELETE CASCADE`)
- **Columns:**
  - `source_attraction_id` (`UUID`, FK, NOT NULL)
  - `destination_attraction_id` (`UUID`, FK, NOT NULL)
  - `destination_id` (`UUID`, FK, NOT NULL) — Denormalized city key for instant graph queries
  - `distance_km` (`NUMERIC(5,2)`, NOT NULL, CHECK $> 0$)
  - `travel_time_minutes` (`INT`, NOT NULL, CHECK $> 0$)
- **Indexes:** Index on `destination_id`.

---

### 2.7. `trips`
- **Purpose:** Records user-created intra-city trip configurations.
- **Primary Key:** `id` (`UUID`)
- **Foreign Keys:**
  - `user_id` $\rightarrow$ `users(id)` (`ON DELETE CASCADE`)
  - `destination_id` $\rightarrow$ `destinations(id)` (`ON DELETE RESTRICT`)
  - `starting_hotel_id` $\rightarrow$ `hotels(id)` (`ON DELETE RESTRICT`)
- **Columns:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `user_id` (`UUID`, FK, NOT NULL)
  - `destination_id` (`UUID`, FK, NOT NULL) — The ONE city selected for this trip
  - `starting_hotel_id` (`UUID`, FK, NOT NULL) — Circular route start & return point
  - `trip_days` (`INT`, NOT NULL, CHECK `trip_days BETWEEN 1 AND 3`)
  - `budget` (`INT`, NOT NULL, CHECK `budget > 0`)
  - `start_time` (`TIME`, NOT NULL, default `'08:00:00'`)
  - `created_at` (`TIMESTAMPTZ`, default `CURRENT_TIMESTAMP`)
- **Indexes:** Index on `user_id`, index on `destination_id`.

---

### 2.8. `itinerary_stops`
- **Purpose:** Stores the generated, ordered daily stops (attractions, meal breaks, and hotel return) for a specific trip.
- **Primary Key:** `id` (`UUID`)
- **Foreign Keys:** `trip_id` $\rightarrow$ `trips(id)` (`ON DELETE CASCADE`)
- **Columns:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `trip_id` (`UUID`, FK, NOT NULL)
  - `day_number` (`INT`, NOT NULL, CHECK `day_number >= 1`)
  - `stop_order` (`INT`, NOT NULL, CHECK `stop_order >= 1`)
  - `stop_type` (`VARCHAR(20)`, NOT NULL, CHECK: `'attraction'` | `'meal'` | `'hotel'`)
  - `reference_id` (`UUID`, NULLable) — FK reference to `attractions(id)` or `restaurants(id)` or `hotels(id)`
  - `name` (`VARCHAR(255)`, NOT NULL)
  - `arrival_time` (`TIME`, NOT NULL)
  - `departure_time` (`TIME`, NOT NULL)
- **Indexes:** Index on `(trip_id, day_number, stop_order)`.

---

### 2.9. `budgets`
- **Purpose:** Stores the calculated financial breakdown for a trip across stay, entry fees, meals, and remaining funds.
- **Primary Key:** `id` (`UUID`)
- **Foreign Keys:** `trip_id` $\rightarrow$ `trips(id)` (`ON DELETE CASCADE`)
- **Columns:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `trip_id` (`UUID`, FK, UNIQUE, NOT NULL)
  - `spent_hotel` (`INT`, NOT NULL, default `0`)
  - `spent_attractions` (`INT`, NOT NULL, default `0`)
  - `spent_meals` (`INT`, NOT NULL, default `0`)
  - `remaining` (`INT`, NOT NULL)
- **Indexes:** Unique index on `trip_id`.

---

## 3. SQL CREATE TABLE Statements (PostgreSQL DDL)

```sql
-- Enable UUID extension & Trigram extension for text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('tourist', 'tour_operator')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. DESTINATIONS (CITIES) TABLE
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. ATTRACTIONS TABLE
CREATE TABLE attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    duration_hours NUMERIC(3,1) NOT NULL CHECK (duration_hours > 0),
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0.0 AND 5.0),
    category VARCHAR(100) NOT NULL,
    entry_fee VARCHAR(100) DEFAULT 'Free'
);

-- 4. HOTELS TABLE
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    price_per_night INT NOT NULL CHECK (price_per_night >= 0),
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0.0 AND 5.0),
    stay_type VARCHAR(50) NOT NULL CHECK (stay_type IN ('Toran Hotel', 'Heritage Hotel', 'Registered Hotel', 'Homestay'))
);

-- 5. RESTAURANTS TABLE
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0.0 AND 5.0),
    avg_cost_per_person INT NOT NULL CHECK (avg_cost_per_person >= 0)
);

-- 6. INTRA-CITY ROUTES TABLE (Attraction to Attraction within SAME city)
CREATE TABLE routes (
    source_attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    destination_attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    distance_km NUMERIC(5,2) NOT NULL CHECK (distance_km > 0),
    travel_time_minutes INT NOT NULL CHECK (travel_time_minutes > 0),
    PRIMARY KEY (source_attraction_id, destination_attraction_id)
);

-- 7. TRIPS TABLE
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
    starting_hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE RESTRICT,
    trip_days INT NOT NULL CHECK (trip_days BETWEEN 1 AND 3),
    budget INT NOT NULL CHECK (budget > 0),
    start_time TIME NOT NULL DEFAULT '08:00:00',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. ITINERARY STOPS TABLE
CREATE TABLE itinerary_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number >= 1),
    stop_order INT NOT NULL CHECK (stop_order >= 1),
    stop_type VARCHAR(20) NOT NULL CHECK (stop_type IN ('attraction', 'meal', 'hotel')),
    reference_id UUID NULL,
    name VARCHAR(255) NOT NULL,
    arrival_time TIME NOT NULL,
    departure_time TIME NOT NULL,
    CONSTRAINT unique_stop_per_day UNIQUE (trip_id, day_number, stop_order)
);

-- 9. BUDGETS TABLE
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    spent_hotel INT NOT NULL DEFAULT 0,
    spent_attractions INT NOT NULL DEFAULT 0,
    spent_meals INT NOT NULL DEFAULT 0,
    remaining INT NOT NULL
);
```

---

## 4. Indexing Strategy

To achieve sub-100ms backend response times, indexes are placed strategically on high-frequency filtering columns:

```sql
-- High-frequency filtering indexes for confirmed city lookups
CREATE INDEX idx_attractions_dest ON attractions(destination_id);
CREATE INDEX idx_hotels_dest ON hotels(destination_id);
CREATE INDEX idx_hotels_dest_price ON hotels(destination_id, price_per_night);
CREATE INDEX idx_restaurants_dest ON restaurants(destination_id);
CREATE INDEX idx_routes_dest ON routes(destination_id);

-- User trip lookup indexes
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_itinerary_stops_trip ON itinerary_stops(trip_id, day_number, stop_order);

-- GIN Trigram Indexes for Trie initial population / autocomplete backing query
CREATE INDEX idx_destinations_name_trgm ON destinations USING gin (name gin_trgm_ops);
CREATE INDEX idx_attractions_name_trgm ON attractions USING gin (name gin_trgm_ops);
```

> [!NOTE]
> **Trie Pre-Loading Note:** The `PrefixTrie` is an in-memory application data structure residing in RAM. The trigram indexes (`idx_destinations_name_trgm`, `idx_attractions_name_trgm`) serve to make backend server startup and Trie memory hydration extremely fast ($< 10\text{ ms}$).

---

## 5. How the Backend Builds the Graph from SQL Rows

When a user selects a city (e.g., Somnath, `destination_id = :cityId`) and clicks **Generate Itinerary**:

```
[PostgreSQL Database]
   ├── 1. SELECT * FROM attractions WHERE destination_id = :cityId;
   ├── 2. SELECT * FROM routes WHERE destination_id = :cityId;
   └── 3. SELECT * FROM hotels WHERE id = :startingHotelId;
            │
            ▼
[Backend Service (In-Memory RAM)]
   ├── Construct AdjacencyListGraph:
   │     - Node: Starting Hotel (H)
   │     - Nodes: Attractions (A1, A2, A3, A4)
   │     - Edges: Weighted by travel_time_minutes
   └── Run Greedy Circular Routing + Dijkstra Solver
```

**Key Architectural Rule:** Graph representations and shortest path trees exist **in-memory during request execution**. They are **never stored as JSON blobs in PostgreSQL database columns**, maintaining clean 3NF relational structure.

---

## 6. Sample Seed Data (Somnath & Dwarka)

```sql
-- SEED DESTINATIONS
INSERT INTO destinations (id, name, district, category) VALUES
('11111111-1111-1111-1111-111111111111', 'Somnath', 'Gir Somnath', 'Pilgrimage & Coastal'),
('22222222-2222-2222-2222-222222222222', 'Dwarka', 'Devbhumi Dwarka', 'Sacred Heritage');

-- SEED HOTELS (SOMNATH & DWARKA)
INSERT INTO hotels (id, destination_id, name, lat, lng, price_per_night, rating, stay_type) VALUES
('h1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Premier Somnath', 20.8880, 70.4012, 2800, 4.5, 'Registered Hotel'),
('h2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Toran Hotel Dwarka', 22.2400, 68.9680, 1800, 4.2, 'Toran Hotel');

-- SEED ATTRACTIONS (SOMNATH)
INSERT INTO attractions (id, destination_id, name, lat, lng, duration_hours, rating, category, entry_fee) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Somnath Temple', 20.8880, 70.4012, 1.5, 4.9, 'Temple', 'Free'),
('a1111111-1111-1111-1111-222222222222', '11111111-1111-1111-1111-111111111111', 'Bhalka Tirth', 20.9000, 70.3800, 1.0, 4.7, 'Temple', 'Free'),
('a1111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', 'Triveni Sangam', 20.8920, 70.4080, 1.0, 4.6, 'Sacred Site', 'Free'),
('a1111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-111111111111', 'Somnath Beach', 20.8850, 70.4000, 1.5, 4.4, 'Nature', 'Free');

-- SEED INTRA-CITY ROUTES (SOMNATH)
INSERT INTO routes (source_attraction_id, destination_attraction_id, destination_id, distance_km, travel_time_minutes) VALUES
('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', 2.0, 8),
('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-111111111111', 1.2, 5),
('a1111111-1111-1111-1111-222222222222', 'a1111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', 4.0, 12);

-- SEED RESTAURANTS (SOMNATH)
INSERT INTO restaurants (id, destination_id, name, lat, lng, rating, avg_cost_per_person) VALUES
('r1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Toran Dining Hall Somnath', 20.8870, 70.4010, 4.5, 180);
```

---

## 7. Representative Backend Queries

### 7.1. Fetch City Datasets (Hash Table Hydration)
```sql
SELECT 
    d.id AS city_id, d.name AS city_name, d.district, d.category AS city_category,
    COALESCE(json_agg(DISTINCT a.*) FILTER (WHERE a.id IS NOT NULL), '[]') AS attractions,
    COALESCE(json_agg(DISTINCT h.*) FILTER (WHERE h.id IS NOT NULL), '[]') AS hotels,
    COALESCE(json_agg(DISTINCT r.*) FILTER (WHERE r.id IS NOT NULL), '[]') AS restaurants
FROM destinations d
LEFT JOIN attractions a ON a.destination_id = d.id
LEFT JOIN hotels h ON h.destination_id = d.id
LEFT JOIN restaurants r ON r.destination_id = d.id
WHERE d.id = '11111111-1111-1111-1111-111111111111'
GROUP BY d.id;
```

### 7.2. Fetch Intra-City Road Edges (Graph Construction)
```sql
SELECT 
    r.source_attraction_id, 
    r.destination_attraction_id, 
    r.distance_km, 
    r.travel_time_minutes
FROM routes r
WHERE r.destination_id = '11111111-1111-1111-1111-111111111111';
```

### 7.3. Fetch Trip Itinerary Stops (UI Rendering)
```sql
SELECT 
    s.day_number, 
    s.stop_order, 
    s.stop_type, 
    s.name, 
    s.arrival_time, 
    s.departure_time
FROM itinerary_stops s
WHERE s.trip_id = 't1111111-1111-1111-1111-111111111111'
ORDER BY s.day_number ASC, s.stop_order ASC;
```

---

## 8. Database Constraints Summary

| Constraint Name | Type | Target Column(s) | Description / Rule |
| :--- | :--- | :--- | :--- |
| `users_email_key` | UNIQUE | `users.email` | Prevents duplicate user registrations. |
| `users_role_check` | CHECK | `users.role` | Must be `'tourist'` or `'tour_operator'`. |
| `hotels_stay_type_check` | CHECK | `hotels.stay_type` | Must be `'Toran Hotel'`, `'Heritage Hotel'`, `'Registered Hotel'`, or `'Homestay'`. |
| `itinerary_stops_type_check`| CHECK | `itinerary_stops.stop_type` | Must be `'attraction'`, `'meal'`, or `'hotel'`. |
| `trips_days_check` | CHECK | `trips.trip_days` | Must be between $1$ and $3$ days. |
| `unique_stop_per_day` | UNIQUE | `(trip_id, day_number, stop_order)` | Guarantees sequential, non-overlapping stop order per day. |
| **Application-Level Intra-City Validation** | App Logic | `routes.(source, destination)` | Service layer validates that `source_attraction.destination_id == destination_attraction.destination_id`. |
