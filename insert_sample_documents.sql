-- Insert Sample Documents for Demo User
-- Run this in Supabase Dashboard → SQL Editor

INSERT INTO documents (
  user_id, 
  document_type, 
  title, 
  status, 
  content, 
  current_step, 
  total_steps, 
  progress_percentage, 
  template_id
) VALUES 
(
  'ec540338-923f-400d-a185-6028c5d5f823',
  'will',
  'John Smith - Last Will and Testament',
  'in_progress',
  '{"full_name": "John Smith", "executor_name": "Jane Smith", "beneficiaries": [{"name": "Sarah Smith", "relationship": "daughter", "percentage": 50}]}',
  2,
  6,
  33,
  (SELECT id FROM document_templates WHERE document_type = 'will' LIMIT 1)
),
(
  'ec540338-923f-400d-a185-6028c5d5f823',
  'living-trust',
  'Smith Family Living Trust',
  'draft',
  '{"grantor_name": "John Smith", "trust_type": "revocable"}',
  0,
  5,
  20,
  (SELECT id FROM document_templates WHERE document_type = 'living-trust' LIMIT 1)
),
(
  'ec540338-923f-400d-a185-6028c5d5f823',
  'power-of-attorney',
  'Durable Power of Attorney - Financial',
  'submitted',
  '{"principal_name": "John Smith", "agent_name": "Jane Smith", "powers_granted": ["financial", "business"]}',
  5,
  5,
  100,
  (SELECT id FROM document_templates WHERE document_type = 'power-of-attorney' LIMIT 1)
); 