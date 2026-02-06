import { createClient } from '@supabase/supabase-js';

// Use env vars for a new Supabase project; copy .env.example to .env and set values
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  'https://lecjkqhiuspqjyuaifme.supabase.co';
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlY2prcWhpdXNwcWp5dWFpZm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzQyNjMsImV4cCI6MjA2OTA1MDI2M30.V-QgHYFW-1jgFebHb8PlhCq-0fE0fHvlPKoWIfsOZBM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
