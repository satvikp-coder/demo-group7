ALTER TABLE trips ADD COLUMN weights JSONB;
ALTER TABLE trips ADD COLUMN travelers INTEGER NOT NULL DEFAULT 1 CHECK (travelers BETWEEN 1 AND 20);
ALTER TABLE trips ADD COLUMN rooms INTEGER NOT NULL DEFAULT 1 CHECK (rooms BETWEEN 1 AND 20);
-- start_date already exists in the original schema.
ALTER TABLE trips ADD CONSTRAINT trip_weights_valid CHECK (weights IS NULL OR
 (weights ?& ARRAY['distance','cost','rating'] AND weights - ARRAY['distance','cost','rating'] = '{}'::jsonb AND
 (weights->>'distance')::numeric=trunc((weights->>'distance')::numeric) AND (weights->>'cost')::numeric=trunc((weights->>'cost')::numeric) AND (weights->>'rating')::numeric=trunc((weights->>'rating')::numeric) AND jsonb_typeof(weights)='object' AND jsonb_typeof(weights->'distance')='number' AND jsonb_typeof(weights->'cost')='number' AND jsonb_typeof(weights->'rating')='number'
 AND (weights->>'distance')::numeric BETWEEN 0 AND 100 AND (weights->>'cost')::numeric BETWEEN 0 AND 100 AND (weights->>'rating')::numeric BETWEEN 0 AND 100
 AND (weights->>'distance')::numeric+(weights->>'cost')::numeric+(weights->>'rating')::numeric=100));
