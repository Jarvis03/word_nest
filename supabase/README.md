# Supabase setup

Run migrations in filename order in the project's Supabase SQL Editor, or apply them with the Supabase CLI after linking the project:

1. `migrations/20260912140000_initial_schema.sql`
2. `migrations/20260912170000_word_management.sql`
3. `migrations/20260913090000_system_heartbeat.sql`

The migrations create the Word Nest schema, user profile trigger, RLS policies, indexes, and transactional functions for creating and editing word cards.

The publishable key cannot create database tables. Applying the migration requires a Supabase Dashboard session, a personal access token through the CLI, or the database password.
