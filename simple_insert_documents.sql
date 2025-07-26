-- SIMPLE DOCUMENT INSERT (Step-by-step)
-- Run each block separately in Supabase SQL Editor

-- Step 1: Check templates exist
SELECT id, document_type, title FROM document_templates;

-- Step 2: Insert documents one by one (safer approach)

-- Insert Will Document
INSERT INTO documents (
  user_id,
  document_type,
  title,
  status,
  content,
  current_step,
  total_steps,
  progress_percentage
) VALUES (
  'ec540338-923f-400d-a185-6028c5d5f823',
  'will',
  'John Smith - Last Will and Testament',
  'in_progress',
  '{"full_name": "John Smith", "executor_name": "Jane Smith"}',
  2,
  6,
  33
);

-- Insert Living Trust Document  
INSERT INTO documents (
  user_id,
  document_type,
  title,
  status,
  content,
  current_step,
  total_steps,
  progress_percentage
) VALUES (
  'ec540338-923f-400d-a185-6028c5d5f823',
  'living-trust',
  'Smith Family Living Trust',
  'draft',
  '{"grantor_name": "John Smith", "trust_type": "revocable"}',
  0,
  5,
  20
);

-- Insert Power of Attorney Document
INSERT INTO documents (
  user_id,
  document_type,
  title,
  status,
  content,
  current_step,
  total_steps,
  progress_percentage
) VALUES (
  'ec540338-923f-400d-a185-6028c5d5f823',
  'power-of-attorney',
  'Durable Power of Attorney - Financial',
  'submitted',
  '{"principal_name": "John Smith", "agent_name": "Jane Smith"}',
  5,
  5,
  100
);

-- Step 3: Verify the inserts worked
SELECT id, title, status, progress_percentage, created_at 
FROM documents 
WHERE user_id = 'ec540338-923f-400d-a185-6028c5d5f823'; 