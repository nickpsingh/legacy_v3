const { createClient } = require('@supabase/supabase-js');

// For this to work, we need to temporarily disable RLS or use the service key
// Since we can't do that with the anon key, let's use a direct SQL approach

const supabaseUrl = 'https://lecjkqhiuspqjyuaifme.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlY2prcWhpdXNwcWp5dWFpZm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzQyNjMsImV4cCI6MjA2OTA1MDI2M30.V-QgHYFW-1jgFebHb8PlhCq-0fE0fHvlPKoWIfsOZBM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEMO_USER_UID = 'ec540338-923f-400d-a185-6028c5d5f823';

console.log('=================================');
console.log('📋 SAMPLE DOCUMENTS SETUP GUIDE');
console.log('=================================');
console.log('');
console.log('Since RLS is enabled, you need to manually add sample documents.');
console.log('Please follow these steps:');
console.log('');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');  
console.log('3. Copy and paste the SQL below:');
console.log('');
console.log('-- SAMPLE DOCUMENTS SQL --');
console.log(`
-- Insert sample documents for demo user
INSERT INTO documents (user_id, document_type, title, status, content, current_step, total_steps, progress_percentage, template_id) 
VALUES 
(
  '${DEMO_USER_UID}',
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
  '${DEMO_USER_UID}',
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
  '${DEMO_USER_UID}',
  'power-of-attorney',
  'Durable Power of Attorney - Financial',
  'submitted',
  '{"principal_name": "John Smith", "agent_name": "Jane Smith", "powers_granted": ["financial", "business"]}',
  5,
  5,
  100,
  (SELECT id FROM document_templates WHERE document_type = 'power-of-attorney' LIMIT 1)
);
`);
console.log('');
console.log('4. Run the SQL');
console.log('5. Your Dashboard will now show real documents!');
console.log('');
console.log('=================================');

// Let's also check what's currently in the database
async function checkCurrentStatus() {
  console.log('📊 Current Database Status:');
  
  try {
    const { data: templates } = await supabase.from('document_templates').select('id, document_type, title');
    console.log('✅ Templates available:', templates?.length || 0);
    
    const { data: docs } = await supabase.from('documents').select('*');
    console.log('📄 Documents in database:', docs?.length || 0, '(may be 0 due to RLS)');
    
    if (docs && docs.length > 0) {
      console.log('🎉 Documents already exist! Dashboard should show them.');
    } else {
      console.log('⚠️  No documents visible - please run the SQL above.');
    }
    
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
}

checkCurrentStatus(); 