# Word Nest

An AI-assisted personal English vocabulary and spaced-repetition app.

## Local development

```bash
npm install
```

Before starting, copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key. Then run
[`supabase/migrations/20260912140000_initial_schema.sql`](supabase/migrations/20260912140000_initial_schema.sql)
in the Supabase SQL Editor.

Add the local callback URL to **Supabase → Authentication → URL Configuration → Redirect URLs**:

```text
http://localhost:3000/auth/callback
```

Start the app:

```bash
npm run dev
```

If port 3000 is already occupied, use a different port and register its callback URL too:

```bash
npm run dev -- --port 3100
```

Open the displayed local URL, register with an email address and a password of at least 8 characters containing both a letter and a number, then confirm the email if email confirmation is enabled in Supabase.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

## Current scope

- Email/password registration, login, logout, and protected routes
- Supabase SSR sessions, schema, row-level security, and transactional word saving
- Mobile-first five-tab shell
- Word/phrase input with optional context and source
- Validated generation and persistence APIs with per-user duplicate handling
- Deterministic local card generator with a full `rollout` example
- Editable card preview and browser speech synthesis

The real LLM adapter and FSRS review scheduling are the next implementation slices.
