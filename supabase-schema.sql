-- ============================================================
-- Employee Map Tracker -- Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS employees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  telegram_user_id TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_locations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id         UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  address             TEXT NOT NULL,
  lat                 DOUBLE PRECISION NOT NULL,
  lng                 DOUBLE PRECISION NOT NULL,
  status              TEXT NOT NULL DEFAULT 'unknown'
                        CHECK (status IN ('active','idle','offline','unknown')),
  timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  telegram_message_id BIGINT,
  raw_message         TEXT,
  geocoded            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emp_locs_employee_id_timestamp
  ON employee_locations(employee_id, timestamp DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_emp_locs_message_id
  ON employee_locations(employee_id, telegram_message_id)
  WHERE telegram_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_emp_locs_status ON employee_locations(status);

CREATE INDEX IF NOT EXISTS idx_employees_name_trgm
  ON employees USING gin(name gin_trgm_ops);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS employees_updated_at ON employees;
CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "anon read locations" ON employee_locations FOR SELECT USING (true);
CREATE POLICY "service write employees" ON employees FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service write locations" ON employee_locations FOR ALL USING (auth.role() = 'service_role');

ALTER PUBLICATION supabase_realtime ADD TABLE employee_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
