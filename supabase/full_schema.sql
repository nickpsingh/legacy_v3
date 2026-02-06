-- =============================================================================
-- Estate Planner – Full Supabase schema for a NEW project
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. USERS (must exist first; other tables reference user_id)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  age INTEGER DEFAULT 0,
  date_of_birth TEXT,
  marital_status TEXT DEFAULT 'single',
  street TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);

-- -----------------------------------------------------------------------------
-- 2. PEOPLE (family members, executors, beneficiaries)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  relationship TEXT,
  date_of_birth TEXT,
  email TEXT,
  phone TEXT,
  is_executor BOOLEAN DEFAULT false,
  is_trustee BOOLEAN DEFAULT false,
  is_beneficiary BOOLEAN DEFAULT false,
  is_healthcare_agent BOOLEAN DEFAULT false,
  is_power_of_attorney BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_people_user_id ON people(user_id);

-- -----------------------------------------------------------------------------
-- 3. ASSETS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  value NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);

-- -----------------------------------------------------------------------------
-- 4. LIABILITIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS liabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  amount NUMERIC DEFAULT 0,
  description TEXT,
  interest_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_liabilities_user_id ON liabilities(user_id);

-- -----------------------------------------------------------------------------
-- 5. DOCUMENT TYPES (for documents table)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE document_type AS ENUM ('will', 'living-trust', 'living-will', 'power-of-attorney');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('draft', 'in_progress', 'submitted', 'completed', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 6. DOCUMENT TEMPLATES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type document_type NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  template_content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. DOCUMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  template_id UUID REFERENCES document_templates(id),
  title VARCHAR(255) NOT NULL,
  status document_status DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}',
  step_data JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- -----------------------------------------------------------------------------
-- 8. DOCUMENT STEPS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type document_type NOT NULL,
  step_number INTEGER NOT NULL,
  step_title VARCHAR(255) NOT NULL,
  step_description TEXT,
  required_fields JSONB DEFAULT '[]',
  validation_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_steps_type ON document_steps(document_type);

-- -----------------------------------------------------------------------------
-- 9. DOCUMENT SUBMISSIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  submission_method VARCHAR(100),
  external_reference_id VARCHAR(255),
  submission_status VARCHAR(50) DEFAULT 'pending',
  submitted_by UUID NOT NULL REFERENCES users(id),
  submission_notes TEXT,
  response_data JSONB,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_document_submissions_document_id ON document_submissions(document_id);

-- -----------------------------------------------------------------------------
-- 10. UPDATED_AT TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_people_updated_at ON people;
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_liabilities_updated_at ON liabilities;
CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON liabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_templates_updated_at ON document_templates;
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (allow anon for demo – no Supabase Auth required)
-- -----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_steps ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated full access (app uses anon key without login)
CREATE POLICY "Allow anon all users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all people" ON people FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all assets" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all liabilities" ON liabilities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all documents" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all document_submissions" ON document_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read document_templates" ON document_templates FOR SELECT USING (true);
CREATE POLICY "Allow anon read document_steps" ON document_steps FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- 12. DEMO USER (app expects this uid; id = same so documents can reference it)
-- -----------------------------------------------------------------------------
INSERT INTO users (id, uid, first_name, last_name, name, email, phone, age, date_of_birth, marital_status, street, city, state, zip_code, country)
VALUES (
  'ec540338-923f-400d-a185-6028c5d5f823',
  'ec540338-923f-400d-a185-6028c5d5f823',
  'John',
  'Smith',
  'John Smith',
  'john.smith@example.com',
  '(555) 123-4567',
  35,
  '1988-06-15',
  'married',
  '123 Main St',
  'San Francisco',
  'CA',
  '94105',
  'USA'
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 13. SEED DOCUMENT TEMPLATES & STEPS (optional; from existing seed)
-- -----------------------------------------------------------------------------
-- Run once; safe to skip if you already have templates/steps
INSERT INTO document_templates (document_type, template_name, title, template_content)
SELECT 'will', 'Standard Will Template', 'Last Will and Testament', '{"sections":[{"title":"Declaration","content":"I, {full_name}, being of sound mind...","placeholders":["full_name"]}]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM document_templates WHERE document_type = 'will' LIMIT 1);

INSERT INTO document_templates (document_type, template_name, title, template_content)
SELECT 'living-trust', 'Revocable Living Trust Template', 'Revocable Living Trust', '{"sections":[{"title":"Trust Declaration","content":"This Revocable Living Trust...","placeholders":["date","grantor_name"]}]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM document_templates WHERE document_type = 'living-trust' LIMIT 1);

INSERT INTO document_templates (document_type, template_name, title, template_content)
SELECT 'living-will', 'Standard Living Will Template', 'Advance Healthcare Directive', '{"sections":[{"title":"Declaration","content":"I, {full_name}...","placeholders":["full_name"]}]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM document_templates WHERE document_type = 'living-will' LIMIT 1);

INSERT INTO document_templates (document_type, template_name, title, template_content)
SELECT 'power-of-attorney', 'Durable Power of Attorney Template', 'Durable Power of Attorney', '{"sections":[{"title":"Appointment of Agent","content":"I, {principal_name}...","placeholders":["principal_name","agent_name","agent_address"]}]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM document_templates WHERE document_type = 'power-of-attorney' LIMIT 1);

INSERT INTO document_steps (document_type, step_number, step_title, step_description, required_fields)
SELECT * FROM (VALUES
  ('will'::document_type, 0, 'Personal Information', 'Basic details about you', '["full_name", "address", "date_of_birth"]'::jsonb),
  ('will'::document_type, 1, 'Executor Selection', 'Choose your executor', '["executor_name", "executor_address", "backup_executor_name"]'::jsonb),
  ('will'::document_type, 2, 'Beneficiaries', 'Add your beneficiaries', '["beneficiaries"]'::jsonb),
  ('will'::document_type, 3, 'Asset Distribution', 'Specify how assets should be distributed', '["asset_distribution"]'::jsonb),
  ('will'::document_type, 4, 'Special Requests', 'Any special instructions', '[]'::jsonb),
  ('will'::document_type, 5, 'Review & Submit', 'Review and finalize', '[]'::jsonb),
  ('living-trust'::document_type, 0, 'Trust Type', 'Choose the type of trust', '["trust_type"]'::jsonb),
  ('living-will'::document_type, 0, 'Healthcare Agent', 'Choose your healthcare agent', '["agent_name", "agent_address"]'::jsonb),
  ('power-of-attorney'::document_type, 0, 'Agent Selection', 'Choose your attorney-in-fact', '["agent_name", "agent_address"]'::jsonb)
) v(document_type, step_number, step_title, step_description, required_fields)
WHERE NOT EXISTS (SELECT 1 FROM document_steps LIMIT 1);
