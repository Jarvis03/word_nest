# Supabase setup

Run `migrations/20260912140000_initial_schema.sql` in the project's Supabase SQL Editor, or apply it with the Supabase CLI after linking the project.

The migration creates the Word Nest schema, user profile trigger, RLS policies, indexes, and the transactional `save_word_card` database function.

The publishable key cannot create database tables. Applying the migration requires a Supabase Dashboard session, a personal access token through the CLI, or the database password.
