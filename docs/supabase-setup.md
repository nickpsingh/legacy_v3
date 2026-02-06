# Connect a new Supabase database

Follow these steps to create a new Supabase project and connect the Estate Planner app to it.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New project**.
3. Choose your organization, name the project (e.g. `estate-planner`), set a database password, and pick a region.
4. Click **Create new project** and wait until the project is ready.

## 2. Run the schema in the SQL Editor

1. In the Supabase Dashboard, open **SQL Editor**.
2. Click **New query**.
3. Open the file `supabase/full_schema.sql` in this repo and copy its full contents.
4. Paste into the SQL Editor and click **Run** (or press Cmd/Ctrl+Enter).
5. Confirm there are no errors. The script creates:
   - `users`, `people`, `assets`, `liabilities`
   - `documents`, `document_templates`, `document_steps`, `document_submissions`
   - Row Level Security policies (anon allowed for app use without auth)
   - A demo user (John Smith) and seed data for templates/steps

## 3. Get your project URL and anon key

1. In the Dashboard, go to **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## 4. Configure the app

1. In the project root, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set:
   ```env
   REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-pasted-here
   ```
3. Restart the dev server so it picks up the new env vars:
   ```bash
   npm start
   ```

The app will now use your new Supabase database. The demo user (John Smith) will be created on first load if not already present from the schema seed; you can add assets, liabilities, and documents as usual.

## Optional: Use the Supabase CLI

You can also run the schema with the [Supabase CLI](https://supabase.com/docs/guides/cli) if you have it installed and linked:

```bash
supabase db execute -f supabase/full_schema.sql
```

(Requires `supabase link` to your project first.)
