-- Unknown published prices/durations are not fabricated as zero.
-- This loosens nullability only; existing values, checks and relationships remain.
ALTER TABLE hotels ALTER COLUMN price_per_night DROP NOT NULL;
ALTER TABLE attractions ALTER COLUMN duration_hours DROP NOT NULL;
