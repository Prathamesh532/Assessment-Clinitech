CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

CREATE TABLE clients (
  client_id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  occupation TEXT NOT NULL,
  health_condition TEXT NOT NULL,
  beauty_goal TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role "Role" NOT NULL DEFAULT 'USER',
  client_id INTEGER UNIQUE REFERENCES clients(client_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_reports (
  report_id TEXT PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  hemoglobin NUMERIC(4,1) NOT NULL,
  vitamin_d NUMERIC(5,1) NOT NULL,
  cholesterol NUMERIC(5,1) NOT NULL,
  blood_sugar_fasting NUMERIC(5,1) NOT NULL,
  creatinine NUMERIC(4,2) NOT NULL,
  urine_protein TEXT NOT NULL,
  bmi NUMERIC(4,1) NOT NULL,
  doctor_notes TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX clients_full_name_idx ON clients(full_name);
CREATE INDEX clients_city_idx ON clients(city);
CREATE INDEX clients_state_idx ON clients(state);
CREATE INDEX health_reports_client_date_idx ON health_reports(client_id, report_date DESC);
CREATE INDEX health_reports_date_idx ON health_reports(report_date DESC);
CREATE INDEX audit_logs_actor_date_idx ON audit_logs(actor_id, created_at DESC);
CREATE INDEX audit_logs_action_date_idx ON audit_logs(action, created_at DESC);
