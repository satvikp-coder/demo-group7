-- ============================================================
-- Heritage Tourism Planner for Gujarat — Consolidated Schema
-- Combines original design (06_Database_Design.md) with:
--   - 'admin' role support
--   - hotel_submissions (operator upload + admin approval workflow)
--   - hotels.operator_id + is_active (ownership + soft delete)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------
-- 1. USERS  (tourists, tour operators, admins)
-- ------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('tourist', 'tour_operator', 'admin')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. DESTINATIONS (CITIES)
-- ------------------------------------------------------------
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 3. ATTRACTIONS
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 4. HOTELS
--    (operator_id + is_active added for operator ownership /
--     soft-delete support)
-- ------------------------------------------------------------
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    price_per_night INT NOT NULL CHECK (price_per_night >= 0),
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0.0 AND 5.0),
    stay_type VARCHAR(50) NOT NULL CHECK (stay_type IN ('Toran Hotel', 'Heritage Hotel', 'Registered Hotel', 'Homestay')),
    operator_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL = seeded/reference hotel, not tied to a real operator
    is_active BOOLEAN NOT NULL DEFAULT TRUE                    -- FALSE = operator "removed" it (soft delete)
);

-- ------------------------------------------------------------
-- 5. RESTAURANTS
-- ------------------------------------------------------------
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0.0 AND 5.0),
    avg_cost_per_person INT NOT NULL CHECK (avg_cost_per_person >= 0)
);

-- ------------------------------------------------------------
-- 6. INTRA-CITY ROUTES (attraction <-> attraction, same city)
-- ------------------------------------------------------------
CREATE TABLE routes (
    source_attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    destination_attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    distance_km NUMERIC(5,2) NOT NULL CHECK (distance_km > 0),
    travel_time_minutes INT NOT NULL CHECK (travel_time_minutes > 0),
    PRIMARY KEY (source_attraction_id, destination_attraction_id)
);

-- ------------------------------------------------------------
-- 7. TRIPS
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 8. ITINERARY STOPS
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 9. BUDGETS
-- ------------------------------------------------------------
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    spent_hotel INT NOT NULL DEFAULT 0,
    spent_attractions INT NOT NULL DEFAULT 0,
    spent_meals INT NOT NULL DEFAULT 0,
    remaining INT NOT NULL
);

-- ------------------------------------------------------------
-- 10. HOTEL_SUBMISSIONS  (NEW — operator upload / admin approval)
--     Staging table: nothing here is live/visible to tourists
--     or the itinerary planner until an admin approves it.
-- ------------------------------------------------------------
CREATE TABLE hotel_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
    hotel_name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    price_per_night INT NOT NULL CHECK (price_per_night >= 0),
    stay_type VARCHAR(50) NOT NULL CHECK (stay_type IN ('Toran Hotel', 'Heritage Hotel', 'Registered Hotel', 'Homestay')),
    opens_at TIME NOT NULL DEFAULT '00:00:00',
    closes_at TIME NOT NULL DEFAULT '23:59:00',
    facilities TEXT[],                 -- e.g. {'WiFi','Pool','Parking','AC','Restaurant'}
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_attractions_dest ON attractions(destination_id);
CREATE INDEX idx_hotels_dest ON hotels(destination_id);
CREATE INDEX idx_hotels_dest_price ON hotels(destination_id, price_per_night);
CREATE INDEX idx_hotels_operator ON hotels(operator_id);
CREATE INDEX idx_hotels_active ON hotels(is_active);
CREATE INDEX idx_restaurants_dest ON restaurants(destination_id);
CREATE INDEX idx_routes_dest ON routes(destination_id);

CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_itinerary_stops_trip ON itinerary_stops(trip_id, day_number, stop_order);

CREATE INDEX idx_hotel_submissions_operator ON hotel_submissions(operator_id);
CREATE INDEX idx_hotel_submissions_status ON hotel_submissions(status);

CREATE INDEX idx_destinations_name_trgm ON destinations USING gin (name gin_trgm_ops);
CREATE INDEX idx_attractions_name_trgm ON attractions USING gin (name gin_trgm_ops);

-- ============================================================
-- SAMPLE QUERIES for the new features (for backend reference)
-- ============================================================

-- A) Operator's own active hotels ("My Hotels" dashboard)
-- SELECT * FROM hotels WHERE operator_id = :currentUserId AND is_active = TRUE;

-- B) Soft-delete a hotel (operator clicks "Remove")
-- UPDATE hotels SET is_active = FALSE WHERE id = :hotelId AND operator_id = :currentUserId;

-- C) Admin's pending approval queue
-- SELECT * FROM hotel_submissions WHERE status = 'pending' ORDER BY submitted_at ASC;

-- D) Approve a submission (copy into live hotels table + mark approved)
-- INSERT INTO hotels (destination_id, name, lat, lng, price_per_night, stay_type, operator_id, is_active)
-- SELECT destination_id, hotel_name, lat, lng, price_per_night, stay_type, operator_id, TRUE
-- FROM hotel_submissions WHERE id = :submissionId;
--
-- UPDATE hotel_submissions
-- SET status = 'approved', reviewed_by = :adminId, reviewed_at = NOW()
-- WHERE id = :submissionId;

-- E) Decline a submission
-- UPDATE hotel_submissions
-- SET status = 'rejected', reviewed_by = :adminId, reviewed_at = NOW(), rejection_reason = :reason
-- WHERE id = :submissionId;
