-- PostgreSQL 3NF Schema for Heritage Tourism Planner for Gujarat
-- Course: CSC210 Data Structures & Algorithms — Ahmedabad University

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('tourist', 'tour_operator')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- DESTINATIONS (CITIES) TABLE
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ATTRACTIONS TABLE
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

-- HOTELS TABLE
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

-- RESTAURANTS TABLE
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0.0 AND 5.0),
    avg_cost_per_person INT NOT NULL CHECK (avg_cost_per_person >= 0)
);

-- INTRA-CITY ROUTES TABLE (Attraction to Attraction within SAME city)
CREATE TABLE routes (
    source_attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    destination_attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    distance_km NUMERIC(5,2) NOT NULL CHECK (distance_km > 0),
    travel_time_minutes INT NOT NULL CHECK (travel_time_minutes > 0),
    PRIMARY KEY (source_attraction_id, destination_attraction_id)
);

-- TRIPS TABLE
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

-- ITINERARY STOPS TABLE
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

-- BUDGETS TABLE
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    spent_hotel INT NOT NULL DEFAULT 0,
    spent_attractions INT NOT NULL DEFAULT 0,
    spent_meals INT NOT NULL DEFAULT 0,
    remaining INT NOT NULL
);

-- INDEXES
CREATE INDEX idx_attractions_dest ON attractions(destination_id);
CREATE INDEX idx_hotels_dest ON hotels(destination_id);
CREATE INDEX idx_hotels_dest_price ON hotels(destination_id, price_per_night);
CREATE INDEX idx_restaurants_dest ON restaurants(destination_id);
CREATE INDEX idx_routes_dest ON routes(destination_id);
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_itinerary_stops_trip ON itinerary_stops(trip_id, day_number, stop_order);
CREATE INDEX idx_destinations_name_trgm ON destinations USING gin (name gin_trgm_ops);
CREATE INDEX idx_attractions_name_trgm ON attractions USING gin (name gin_trgm_ops);
