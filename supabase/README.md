# Supabase schema

## Create all tables (first time)

1. Open your project in the **Supabase Dashboard**:  
   **https://supabase.com/dashboard/project/fosswrlfrdtakzuzbjco**
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Open the file **`full_schema.sql`** in this folder, copy its entire contents, and paste into the SQL Editor.
5. Click **Run** (or press Cmd/Ctrl+Enter).

You should see “Success. No rows returned” (or similar). Tables **users**, **people**, **assets**, **liabilities**, **documents**, **document_templates**, **document_steps**, and **document_submissions** will be created, plus RLS policies and the demo user (John Smith).

Then restart your app (`npm start`) and use the dashboard.
