CREATE TABLE IF NOT EXISTS seed_managed_rows (
  table_name text NOT NULL,
  identity text NOT NULL,
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (table_name, identity)
);
