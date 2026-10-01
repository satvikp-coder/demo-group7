-- Preserve existing forward route IDs and prices. Reverse values are separate evidence.
ALTER TABLE routes ADD COLUMN reverse_distance_km numeric(10,2) CHECK (reverse_distance_km > 0);
ALTER TABLE routes ADD COLUMN reverse_travel_time_minutes integer CHECK (reverse_travel_time_minutes > 0);
ALTER TABLE routes ADD CONSTRAINT routes_reverse_pair CHECK ((reverse_distance_km IS NULL) = (reverse_travel_time_minutes IS NULL));
-- Older seed ownership snapshots gain the same nullable columns during upgrade.
UPDATE seed_managed_rows SET snapshot = snapshot || '{"reverse_distance_km":null,"reverse_travel_time_minutes":null}'::jsonb WHERE table_name='routes';
