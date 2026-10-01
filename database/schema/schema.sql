-- Canonical fresh-database schema for the Heritage Tourism Planner.
-- Unknown editorial/accessibility facts stay NULL; absence is not verification.
-- CSV IDs are preserved in external_id; application-facing slugs are separate.
-- Apply once to an empty database; this is not a destructive reset/migration.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('tourist', 'tour_operator', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    district VARCHAR(100),
    category VARCHAR(100),
    location TEXT,
    official_category TEXT,
    tag TEXT,
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    entry_fee TEXT,
    entry_fee_numeric NUMERIC(10,2) CHECK (entry_fee_numeric >= 0),
    best_time TEXT,
    distance_from_ahmedabad TEXT,
    distance_numeric NUMERIC(10,2) CHECK (distance_numeric >= 0),
    duration TEXT,
    avg_visit_time TEXT,
    image_url TEXT,
    image_alt TEXT,
    description TEXT,
    highlights TEXT[],
    gujarati_name TEXT,
    hindi_name TEXT,
    gujarati_description TEXT,
    hindi_description TEXT,
    seasonal_note TEXT,
    seasonal_gujarati_note TEXT,
    seasonal_hindi_note TEXT,
    seasonal_active_months SMALLINT[] CHECK (
        seasonal_active_months <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]::SMALLINT[]
        AND array_position(seasonal_active_months, NULL) IS NULL
    ),
    seasonal_peak_window_label TEXT,
    nearest_hospital TEXT,
    nearest_police_station TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE,
    slug TEXT UNIQUE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL CHECK (lat BETWEEN -90 AND 90),
    lng NUMERIC(9,6) NOT NULL CHECK (lng BETWEEN -180 AND 180),
    duration_hours NUMERIC(5,2) NOT NULL CHECK (duration_hours > 0),
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    category VARCHAR(100) NOT NULL,
    entry_fee TEXT,
    entry_fee_numeric NUMERIC(10,2) CHECK (entry_fee_numeric >= 0),
    opening_time TIME,
    closing_time TIME,
    wheelchair_accessible BOOLEAN,
    physical_demand TEXT CHECK (physical_demand IN ('low', 'moderate', 'high')),
    best_time_note TEXT,
    transport_mode TEXT CHECK (transport_mode IN ('road', 'boat', 'other')),
    image_url TEXT,
    image_alt TEXT,
    description TEXT,
    gujarati_name TEXT,
    hindi_name TEXT,
    gujarati_description TEXT,
    hindi_description TEXT,
    source TEXT,
    source_url TEXT,
    source_date DATE,
    provenance_status TEXT NOT NULL DEFAULT 'unverified'
        CHECK (provenance_status IN ('unverified', 'project_approved', 'independently_verified')),
    source_row_hash CHAR(64),
    UNIQUE (id, destination_id)
);

CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE,
    slug TEXT UNIQUE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL CHECK (lat BETWEEN -90 AND 90),
    lng NUMERIC(9,6) NOT NULL CHECK (lng BETWEEN -180 AND 180),
    price_per_night INT NOT NULL CHECK (price_per_night >= 0),
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    stay_type VARCHAR(50) NOT NULL CHECK (stay_type IN ('Toran Hotel', 'Heritage Hotel', 'Registered Hotel', 'Homestay')),
    tier TEXT CHECK (tier IN ('Budget', 'Mid-range', 'Luxury')),
    location TEXT,
    description TEXT,
    value_score NUMERIC(6,2),
    image_url TEXT,
    gujarati_name TEXT,
    hindi_name TEXT,
    gujarati_description TEXT,
    hindi_description TEXT,
    source TEXT,
    source_url TEXT,
    source_date DATE,
    provenance_status TEXT NOT NULL DEFAULT 'unverified'
        CHECK (provenance_status IN ('unverified', 'project_approved', 'independently_verified')),
    source_row_hash CHAR(64),
    UNIQUE (id, destination_id)
);

CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE,
    slug TEXT UNIQUE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(9,6) NOT NULL CHECK (lat BETWEEN -90 AND 90),
    lng NUMERIC(9,6) NOT NULL CHECK (lng BETWEEN -180 AND 180),
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    avg_cost_per_person INT NOT NULL CHECK (avg_cost_per_person >= 0),
    location TEXT,
    cuisine TEXT,
    gujarati_name TEXT,
    hindi_name TEXT,
    gujarati_description TEXT,
    hindi_description TEXT,
    source TEXT,
    source_url TEXT,
    source_date DATE,
    provenance_status TEXT NOT NULL DEFAULT 'unverified'
        CHECK (provenance_status IN ('unverified', 'project_approved', 'independently_verified')),
    source_row_hash CHAR(64),
    UNIQUE (id, destination_id)
);

-- Each route endpoint references exactly one real entity, in the same city.
-- Existing attraction endpoints remain supported; hotels/restaurants are explicit.
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    source_attraction_id UUID,
    destination_attraction_id UUID,
    source_hotel_id UUID,
    destination_hotel_id UUID,
    source_restaurant_id UUID,
    destination_restaurant_id UUID,
    source_node_id UUID GENERATED ALWAYS AS
        (coalesce(source_attraction_id, source_hotel_id, source_restaurant_id)) STORED,
    destination_node_id UUID GENERATED ALWAYS AS
        (coalesce(destination_attraction_id, destination_hotel_id, destination_restaurant_id)) STORED,
    distance_km NUMERIC(10,2) NOT NULL CHECK (distance_km > 0),
    travel_time_minutes INT NOT NULL CHECK (travel_time_minutes > 0),
    transport_mode TEXT NOT NULL CHECK (transport_mode IN ('road', 'boat', 'other')),
    source TEXT,
    source_url TEXT,
    source_date DATE,
    provenance_status TEXT NOT NULL DEFAULT 'unverified'
        CHECK (provenance_status IN ('unverified', 'project_approved', 'independently_verified')),
    source_row_hash CHAR(64),
    CHECK (num_nonnulls(source_attraction_id, source_hotel_id, source_restaurant_id) = 1),
    CHECK (num_nonnulls(destination_attraction_id, destination_hotel_id, destination_restaurant_id) = 1),
    CHECK (source_node_id <> destination_node_id),
    FOREIGN KEY (source_attraction_id, destination_id) REFERENCES attractions(id, destination_id) ON DELETE CASCADE,
    FOREIGN KEY (destination_attraction_id, destination_id) REFERENCES attractions(id, destination_id) ON DELETE CASCADE,
    FOREIGN KEY (source_hotel_id, destination_id) REFERENCES hotels(id, destination_id) ON DELETE CASCADE,
    FOREIGN KEY (destination_hotel_id, destination_id) REFERENCES hotels(id, destination_id) ON DELETE CASCADE,
    FOREIGN KEY (source_restaurant_id, destination_id) REFERENCES restaurants(id, destination_id) ON DELETE CASCADE,
    FOREIGN KEY (destination_restaurant_id, destination_id) REFERENCES restaurants(id, destination_id) ON DELETE CASCADE,
    UNIQUE (source_node_id, destination_node_id, transport_mode)
);

CREATE TABLE destination_nearby_attractions (
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
    distance_label TEXT,
    distance_km NUMERIC(10,2) CHECK (distance_km >= 0),
    PRIMARY KEY (destination_id, attraction_id)
);

CREATE TABLE destination_nearby_hotels (
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    PRIMARY KEY (destination_id, hotel_id)
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
    starting_hotel_id UUID NOT NULL,
    trip_days INT NOT NULL CHECK (trip_days >= 1),
    budget INT NOT NULL CHECK (budget > 0),
    start_time TIME NOT NULL DEFAULT '08:00:00',
    start_date DATE,
    strategy TEXT NOT NULL DEFAULT 'distance-first'
        CHECK (strategy IN ('budget-first', 'rating-first', 'distance-first')),
    wheelchair_accessible_only BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (starting_hotel_id, destination_id) REFERENCES hotels(id, destination_id) ON DELETE RESTRICT
);

CREATE TABLE itinerary_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number >= 1),
    stop_order INT NOT NULL CHECK (stop_order >= 1),
    stop_type VARCHAR(20) NOT NULL CHECK (stop_type IN ('attraction', 'meal', 'hotel', 'transit', 'cultural')),
    reference_id UUID,
    name VARCHAR(255) NOT NULL,
    category TEXT,
    arrival_time TIME NOT NULL,
    departure_time TIME NOT NULL,
    duration_minutes INT CHECK (duration_minutes >= 0),
    cost NUMERIC(10,2) CHECK (cost >= 0),
    location TEXT,
    description TEXT,
    image_url TEXT,
    lat NUMERIC(9,6) CHECK (lat BETWEEN -90 AND 90),
    lng NUMERIC(9,6) CHECK (lng BETWEEN -180 AND 180),
    wheelchair_accessible BOOLEAN,
    physical_demand TEXT CHECK (physical_demand IN ('low', 'moderate', 'high')),
    best_time_note TEXT,
    CONSTRAINT unique_stop_per_day UNIQUE (trip_id, day_number, stop_order)
);

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    spent_hotel NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (spent_hotel >= 0),
    spent_attractions NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (spent_attractions >= 0),
    spent_meals NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (spent_meals >= 0),
    spent_transit NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (spent_transit >= 0),
    remaining NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_attractions_dest ON attractions(destination_id);
CREATE INDEX idx_hotels_dest ON hotels(destination_id);
CREATE INDEX idx_hotels_dest_price ON hotels(destination_id, price_per_night);
CREATE INDEX idx_restaurants_dest ON restaurants(destination_id);
CREATE INDEX idx_routes_dest ON routes(destination_id);
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_itinerary_stops_trip ON itinerary_stops(trip_id, day_number, stop_order);
CREATE INDEX idx_destinations_name_trgm ON destinations USING gin (name gin_trgm_ops);
CREATE INDEX idx_attractions_name_trgm ON attractions USING gin (name gin_trgm_ops);
COMMIT;
