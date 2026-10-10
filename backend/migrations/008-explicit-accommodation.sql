-- NULL preserves legacy one-room-night-per-day semantics; do not rewrite saved trips.
ALTER TABLE trips ADD COLUMN lodging_nights integer;
ALTER TABLE trips ADD COLUMN arrival_date date;
ALTER TABLE trips ADD COLUMN departure_date date;
ALTER TABLE trips ADD CONSTRAINT trips_lodging_nights_valid CHECK (lodging_nights IS NULL OR lodging_nights BETWEEN 0 AND trip_days+1);
ALTER TABLE trips ADD CONSTRAINT trips_accommodation_dates_valid CHECK (
 (arrival_date IS NULL AND departure_date IS NULL) OR
 (arrival_date IS NOT NULL AND departure_date IS NOT NULL AND lodging_nights IS NOT NULL AND departure_date-arrival_date=lodging_nights));
