import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lecjkqhiuspqjyuaifme.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlY2prcWhpdXNwcWp5dWFpZm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzQyNjMsImV4cCI6MjA2OTA1MDI2M30.V-QgHYFW-1jgFebHb8PlhCq-0fE0fHvlPKoWIfsOZBM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 