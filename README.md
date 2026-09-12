# Word Nest

An AI-assisted personal English vocabulary and spaced-repetition app.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The first vertical slice uses a deterministic local generator so the input, runtime schema validation, editing, pronunciation, and card preview can be exercised without external credentials.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

## Current scope

- Mobile-first five-tab shell
- Word/phrase input with optional context and source
- Validated `POST /api/words/generate` contract
- Local preview adapter with a full `rollout` example
- Editable card preview and browser speech synthesis

Next: Supabase Auth/schema/RLS, transactional persistence, duplicate handling, and the real LLM adapter.
