-- Document Workflow Tables for Estate Planner
-- Created for Supabase Database

-- Enable RLS (Row Level Security) and necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean re-creation)
DROP TABLE IF EXISTS document_submissions CASCADE;
DROP TABLE IF EXISTS document_steps CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

-- Document Types ENUM
CREATE TYPE document_type AS ENUM ('will', 'living-trust', 'living-will', 'power-of-attorney');
CREATE TYPE document_status AS ENUM ('draft', 'in_progress', 'submitted', 'completed', 'rejected');

-- 1. DOCUMENT TEMPLATES TABLE
-- Stores reusable templates for each document type
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type document_type NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    template_content JSONB NOT NULL, -- Stores sections and template structure
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DOCUMENTS TABLE
-- Stores individual document instances for users
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Foreign key to users table
    document_type document_type NOT NULL,
    template_id UUID REFERENCES document_templates(id),
    title VARCHAR(255) NOT NULL,
    status document_status DEFAULT 'draft',
    content JSONB NOT NULL DEFAULT '{}', -- User's document content
    step_data JSONB DEFAULT '{}', -- Current step and form data
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 1,
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE NULL,
    completed_at TIMESTAMP WITH TIME ZONE NULL
);

-- 3. DOCUMENT STEPS TABLE
-- Defines the workflow steps for each document type
CREATE TABLE document_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type document_type NOT NULL,
    step_number INTEGER NOT NULL,
    step_title VARCHAR(255) NOT NULL,
    step_description TEXT,
    required_fields JSONB DEFAULT '[]', -- Array of required field names
    validation_rules JSONB DEFAULT '{}', -- Validation rules for this step
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DOCUMENT SUBMISSIONS TABLE
-- Tracks document submission history and external filing status
CREATE TABLE document_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    submission_method VARCHAR(100), -- 'email', 'e-filing', 'print', etc.
    external_reference_id VARCHAR(255), -- Reference from external e-filing system
    submission_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'processing'
    submitted_by UUID NOT NULL, -- User who submitted
    submission_notes TEXT,
    response_data JSONB, -- Response from external system
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Add indexes for better performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_document_steps_type ON document_steps(document_type);
CREATE INDEX idx_document_submissions_document_id ON document_submissions(document_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update timestamps
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SEED DATA

-- Insert Document Templates
INSERT INTO document_templates (document_type, template_name, title, template_content) VALUES
('will', 'Standard Will Template', 'Last Will and Testament', '{
  "sections": [
    {
      "title": "Declaration",
      "content": "I, {full_name}, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils made by me.",
      "placeholders": ["full_name"]
    },
    {
      "title": "Executor Appointment",
      "content": "I hereby appoint {executor_name} of {executor_address} as the Executor of this my Last Will and Testament. If {executor_name} is unable or unwilling to serve, I appoint {backup_executor_name} as successor Executor.",
      "placeholders": ["executor_name", "executor_address", "backup_executor_name"]
    },
    {
      "title": "Asset Distribution",
      "content": "I hereby give, devise, and bequeath all of my property, both real and personal, of whatsoever kind and wheresoever situated, to my beneficiaries as specified in the attached schedule.",
      "placeholders": []
    }
  ]
}'),

('living-trust', 'Revocable Living Trust Template', 'Revocable Living Trust', '{
  "sections": [
    {
      "title": "Trust Declaration",
      "content": "This Revocable Living Trust is made on {date} by {grantor_name}, who will be referred to as the Grantor and initial Trustee.",
      "placeholders": ["date", "grantor_name"]
    },
    {
      "title": "Trust Property",
      "content": "The Grantor hereby transfers and assigns to the Trustee all property listed in Schedule A, attached hereto and incorporated herein by reference.",
      "placeholders": []
    },
    {
      "title": "Distribution Upon Death",
      "content": "Upon the death of the Grantor, the Trustee shall distribute the trust assets to the beneficiaries as specified in this document.",
      "placeholders": []
    }
  ]
}'),

('living-will', 'Standard Living Will Template', 'Advance Healthcare Directive (Living Will)', '{
  "sections": [
    {
      "title": "Declaration",
      "content": "I, {full_name}, being of sound mind, willfully and voluntarily make this advance directive for healthcare decisions.",
      "placeholders": ["full_name"]
    },
    {
      "title": "Healthcare Agent",
      "content": "I hereby appoint {agent_name} of {agent_address} as my healthcare agent to make healthcare decisions for me when I am unable to do so.",
      "placeholders": ["agent_name", "agent_address"]
    },
    {
      "title": "Life-Sustaining Treatment",
      "content": "If I should have an incurable condition, I direct that life-sustaining procedures be withheld or withdrawn and that I be permitted to die naturally.",
      "placeholders": []
    }
  ]
}'),

('power-of-attorney', 'Durable Power of Attorney Template', 'Durable Power of Attorney', '{
  "sections": [
    {
      "title": "Appointment of Agent",
      "content": "I, {principal_name}, hereby appoint {agent_name} of {agent_address} as my attorney-in-fact (agent) to act for me in any lawful way with respect to the powers delegated in this document.",
      "placeholders": ["principal_name", "agent_name", "agent_address"]
    },
    {
      "title": "Powers Granted",
      "content": "I grant my agent broad powers to act on my behalf in financial, business, and legal matters as specified in this document.",
      "placeholders": []
    },
    {
      "title": "Effective Date",
      "content": "This Power of Attorney shall become effective {effective_condition} and shall remain in effect until my death or until revoked by me in writing.",
      "placeholders": ["effective_condition"]
    }
  ]
}');

-- Insert Document Steps (Workflow definitions)
INSERT INTO document_steps (document_type, step_number, step_title, step_description, required_fields) VALUES
-- Will Creation Steps
('will', 0, 'Personal Information', 'Basic details about you', '["full_name", "address", "date_of_birth"]'),
('will', 1, 'Executor Selection', 'Choose your executor', '["executor_name", "executor_address", "backup_executor_name"]'),
('will', 2, 'Beneficiaries', 'Add your beneficiaries', '["beneficiaries"]'),
('will', 3, 'Asset Distribution', 'Specify how assets should be distributed', '["asset_distribution"]'),
('will', 4, 'Special Requests', 'Any special instructions or requests', '[]'),
('will', 5, 'Review & Submit', 'Review and finalize your will', '[]'),

-- Living Trust Steps
('living-trust', 0, 'Trust Type', 'Choose the type of trust', '["trust_type"]'),
('living-trust', 1, 'Trustee Selection', 'Choose your trustees', '["trustee_name", "successor_trustee"]'),
('living-trust', 2, 'Beneficiaries', 'Add trust beneficiaries', '["beneficiaries"]'),
('living-trust', 3, 'Trust Assets', 'Add assets to the trust', '["trust_assets"]'),
('living-trust', 4, 'Distribution Rules', 'Specify distribution rules', '["distribution_rules"]'),

-- Living Will Steps
('living-will', 0, 'Healthcare Agent', 'Choose your healthcare agent', '["agent_name", "agent_address"]'),
('living-will', 1, 'Medical Preferences', 'Specify medical care preferences', '["life_support_preferences"]'),
('living-will', 2, 'Organ Donation', 'Organ donation preferences', '["organ_donation"]'),
('living-will', 3, 'Special Instructions', 'Additional medical instructions', '[]'),
('living-will', 4, 'Religious Preferences', 'Religious or cultural preferences', '[]'),
('living-will', 5, 'Notifications', 'Notification requirements', '["notification_contacts"]'),
('living-will', 6, 'Review & Submit', 'Review and finalize', '[]'),

-- Power of Attorney Steps
('power-of-attorney', 0, 'Agent Selection', 'Choose your attorney-in-fact', '["agent_name", "agent_address"]'),
('power-of-attorney', 1, 'Powers Definition', 'Define the powers granted', '["powers_granted"]'),
('power-of-attorney', 2, 'Effective Conditions', 'When the POA becomes effective', '["effective_condition"]'),
('power-of-attorney', 3, 'Limitations', 'Any limitations or restrictions', '[]'),
('power-of-attorney', 4, 'Review & Submit', 'Review and finalize', '[]');

-- Insert Sample Documents for Demo User
INSERT INTO documents (user_id, document_type, template_id, title, status, content, current_step, total_steps, progress_percentage) VALUES
-- Get template IDs for references
('ec540338-923f-400d-a185-6028c5d5f823', 'will', 
    (SELECT id FROM document_templates WHERE document_type = 'will' LIMIT 1),
    'John Smith - Last Will and Testament', 'in_progress', 
    '{"executor_name": "Jane Smith", "executor_address": "123 Main St, Anytown, USA", "beneficiaries": [{"name": "Sarah Smith", "relationship": "daughter", "percentage": 50}]}',
    2, 6, 33),

('ec540338-923f-400d-a185-6028c5d5f823', 'living-trust',
    (SELECT id FROM document_templates WHERE document_type = 'living-trust' LIMIT 1),
    'Smith Family Living Trust', 'draft',
    '{"trust_type": "revocable", "trustee_name": "John Smith"}',
    0, 5, 20),

('ec540338-923f-400d-a185-6028c5d5f823', 'power-of-attorney',
    (SELECT id FROM document_templates WHERE document_type = 'power-of-attorney' LIMIT 1),
    'Durable Power of Attorney - Financial', 'submitted',
    '{"agent_name": "Jane Smith", "agent_address": "123 Main St, Anytown, USA", "powers_granted": ["financial", "business", "legal"], "effective_condition": "immediately"}',
    5, 5, 100);

-- Insert Sample Submissions
INSERT INTO document_submissions (document_id, submission_method, external_reference_id, submission_status, submitted_by, submission_notes)
SELECT 
    id, 
    'e-filing', 
    'EF-' || SUBSTRING(id::text, 1, 8), 
    'accepted', 
    user_id,
    'Document submitted successfully via e-filing system'
FROM documents 
WHERE status = 'submitted';

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (users can only see their own documents)
CREATE POLICY "Users can view their own documents" ON documents
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own submissions" ON document_submissions
    FOR ALL USING (submitted_by = auth.uid());

-- Allow public read access to templates and steps
CREATE POLICY "Anyone can view document templates" ON document_templates
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view document steps" ON document_steps
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Summary
SELECT 
    'Document workflow tables created successfully!' as status,
    COUNT(*) as total_templates
FROM document_templates
UNION ALL
SELECT 
    'Document steps defined for all types' as status,
    COUNT(*) as count
FROM document_steps
UNION ALL
SELECT 
    'Sample documents created' as status,
    COUNT(*) as count  
FROM documents; 