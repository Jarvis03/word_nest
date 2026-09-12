create extension if not exists pgcrypto;

create type public.word_source as enum ('work', 'reading', 'news', 'email', 'ai_chat', 'other');
create type public.entry_type as enum ('word', 'phrase');
create type public.part_of_speech as enum (
  'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition',
  'conjunction', 'determiner', 'interjection', 'phrasal_verb', 'idiom', 'phrase', 'other'
);
create type public.example_type as enum ('common', 'contextual');
create type public.word_relationship as enum ('related', 'confusing', 'synonym');
create type public.fsrs_state as enum ('new', 'learning', 'review', 'relearning');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  learning_profile jsonb not null default '{
    "primaryUseCases": ["workplace English", "technology", "AI"],
    "preferredExamples": ["realistic", "professional", "natural"],
    "explanationLevel": "intermediate"
  }'::jsonb,
  timezone text not null default 'UTC',
  voice_name text,
  playback_rate numeric(3,2) not null default 1.0 check (playback_rate between 0.5 and 2.0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null check (char_length(word) between 1 and 80),
  normalized_term text not null check (char_length(normalized_term) between 1 and 80),
  entry_type public.entry_type not null,
  lemma text not null check (char_length(lemma) between 1 and 80),
  part_of_speech public.part_of_speech not null,
  core_meaning text not null check (char_length(core_meaning) between 1 and 500),
  chinese_hint text not null check (char_length(chinese_hint) between 1 and 120),
  mental_model text[] not null check (cardinality(mental_model) between 1 and 5),
  source public.word_source not null default 'other',
  original_context text check (char_length(original_context) <= 500),
  ai_model text,
  prompt_version text not null default 'local-preview-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, normalized_term),
  unique (id, user_id)
);

create table public.collocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid not null,
  text text not null check (char_length(text) between 1 and 120),
  sort_order smallint not null default 0,
  foreign key (word_id, user_id) references public.words(id, user_id) on delete cascade,
  unique (word_id, text)
);

create table public.examples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid not null,
  sentence text not null check (char_length(sentence) between 1 and 500),
  example_type public.example_type not null,
  created_at timestamptz not null default now(),
  foreign key (word_id, user_id) references public.words(id, user_id) on delete cascade,
  unique (word_id, example_type)
);

create table public.related_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid not null,
  related_word text not null check (char_length(related_word) between 1 and 80),
  relationship public.word_relationship not null,
  foreign key (word_id, user_id) references public.words(id, user_id) on delete cascade,
  unique (word_id, related_word, relationship)
);

create table public.word_memory (
  word_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  difficulty double precision not null default 0,
  stability double precision not null default 0,
  due timestamptz not null,
  last_review timestamptz,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state public.fsrs_state not null default 'new',
  version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (word_id, user_id) references public.words(id, user_id) on delete cascade
);

create table public.review_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid not null,
  rating smallint not null check (rating between 1 and 4),
  reviewed_at timestamptz not null default now(),
  previous_due timestamptz not null,
  new_due timestamptz not null,
  previous_state public.fsrs_state not null,
  new_state public.fsrs_state not null,
  previous_stability double precision not null,
  new_stability double precision not null,
  previous_difficulty double precision not null,
  new_difficulty double precision not null,
  elapsed_days integer not null,
  scheduled_days integer not null,
  algorithm_version text not null,
  foreign key (word_id, user_id) references public.words(id, user_id) on delete cascade
);

create index words_user_created_idx on public.words(user_id, created_at desc);
create index words_user_normalized_prefix_idx on public.words(user_id, normalized_term text_pattern_ops);
create index word_memory_user_due_idx on public.word_memory(user_id, due);
create index review_history_word_reviewed_idx on public.review_history(word_id, reviewed_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger words_set_updated_at before update on public.words
for each row execute function public.set_updated_at();
create trigger word_memory_set_updated_at before update on public.word_memory
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

create or replace function public.save_word_card(
  p_card jsonb,
  p_source public.word_source,
  p_original_context text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_word_id uuid;
  v_item text;
  v_related jsonb;
  v_timezone text;
  v_due timestamptz;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select timezone into v_timezone from public.profiles where id = v_user_id;
  v_timezone := coalesce(v_timezone, 'UTC');
  v_due := (date_trunc('day', now() at time zone v_timezone) + interval '1 day') at time zone v_timezone;

  insert into public.words (
    user_id, word, normalized_term, entry_type, lemma, part_of_speech,
    core_meaning, chinese_hint, mental_model, source, original_context,
    ai_model, prompt_version
  ) values (
    v_user_id,
    p_card->>'word',
    p_card->>'normalizedTerm',
    (p_card->>'entryType')::public.entry_type,
    p_card->>'lemma',
    (p_card->>'partOfSpeech')::public.part_of_speech,
    p_card->>'coreMeaning',
    p_card->>'chineseHint',
    array(select jsonb_array_elements_text(p_card->'mentalModel')),
    p_source,
    nullif(trim(p_original_context), ''),
    p_card->>'aiModel',
    coalesce(p_card->>'promptVersion', 'local-preview-v1')
  ) returning id into v_word_id;

  for v_item in select value from jsonb_array_elements_text(p_card->'collocations')
  loop
    insert into public.collocations(user_id, word_id, text, sort_order)
    values (v_user_id, v_word_id, v_item, coalesce(array_position(array(select jsonb_array_elements_text(p_card->'collocations')), v_item), 1));
  end loop;

  insert into public.examples(user_id, word_id, sentence, example_type)
  values
    (v_user_id, v_word_id, p_card->'examples'->>'common', 'common'),
    (v_user_id, v_word_id, p_card->'examples'->>'contextual', 'contextual');

  for v_related in select value from jsonb_array_elements(p_card->'relatedWords')
  loop
    insert into public.related_words(user_id, word_id, related_word, relationship)
    values (
      v_user_id,
      v_word_id,
      v_related->>'word',
      (v_related->>'relationship')::public.word_relationship
    );
  end loop;

  insert into public.word_memory(user_id, word_id, due)
  values (v_user_id, v_word_id, v_due);

  return v_word_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.words enable row level security;
alter table public.collocations enable row level security;
alter table public.examples enable row level security;
alter table public.related_words enable row level security;
alter table public.word_memory enable row level security;
alter table public.review_history enable row level security;

revoke all on table public.profiles, public.words, public.collocations, public.examples,
  public.related_words, public.word_memory, public.review_history from anon;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.words, public.collocations, public.examples,
  public.related_words, public.word_memory to authenticated;
grant select, insert on table public.review_history to authenticated;
revoke all on function public.save_word_card(jsonb, public.word_source, text) from public, anon;
grant execute on function public.save_word_card(jsonb, public.word_source, text) to authenticated;

create policy profiles_select_own on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy words_select_own on public.words for select to authenticated
using ((select auth.uid()) = user_id);
create policy words_insert_own on public.words for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy words_update_own on public.words for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy words_delete_own on public.words for delete to authenticated
using ((select auth.uid()) = user_id);

create policy collocations_select_own on public.collocations for select to authenticated using ((select auth.uid()) = user_id);
create policy collocations_insert_own on public.collocations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy collocations_update_own on public.collocations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy collocations_delete_own on public.collocations for delete to authenticated using ((select auth.uid()) = user_id);

create policy examples_select_own on public.examples for select to authenticated using ((select auth.uid()) = user_id);
create policy examples_insert_own on public.examples for insert to authenticated with check ((select auth.uid()) = user_id);
create policy examples_update_own on public.examples for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy examples_delete_own on public.examples for delete to authenticated using ((select auth.uid()) = user_id);

create policy related_words_select_own on public.related_words for select to authenticated using ((select auth.uid()) = user_id);
create policy related_words_insert_own on public.related_words for insert to authenticated with check ((select auth.uid()) = user_id);
create policy related_words_update_own on public.related_words for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy related_words_delete_own on public.related_words for delete to authenticated using ((select auth.uid()) = user_id);

create policy word_memory_select_own on public.word_memory for select to authenticated using ((select auth.uid()) = user_id);
create policy word_memory_insert_own on public.word_memory for insert to authenticated with check ((select auth.uid()) = user_id);
create policy word_memory_update_own on public.word_memory for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy word_memory_delete_own on public.word_memory for delete to authenticated using ((select auth.uid()) = user_id);

create policy review_history_select_own on public.review_history for select to authenticated using ((select auth.uid()) = user_id);
create policy review_history_insert_own on public.review_history for insert to authenticated with check ((select auth.uid()) = user_id);
