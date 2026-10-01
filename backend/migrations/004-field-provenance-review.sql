-- Field-level review supplements the deliberately conservative row-wide status.
ALTER TABLE attractions ADD COLUMN provenance_review jsonb;
ALTER TABLE hotels ADD COLUMN provenance_review jsonb;
ALTER TABLE restaurants ADD COLUMN provenance_review jsonb;
UPDATE seed_managed_rows SET snapshot = snapshot || '{"provenance_review":null}'::jsonb
 WHERE table_name IN ('attractions','hotels','restaurants');
