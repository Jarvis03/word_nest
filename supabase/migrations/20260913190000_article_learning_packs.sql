create table public.articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  content text not null check (char_length(content) between 40 and 20000),
  source public.word_source not null default 'reading',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.article_keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null,
  keyword text not null check (char_length(keyword) between 1 and 80),
  note text check (char_length(note) <= 160),
  sort_order smallint not null default 0,
  foreign key (article_id, user_id) references public.articles(id, user_id) on delete cascade,
  unique (article_id, keyword)
);

create index articles_user_created_idx on public.articles(user_id, created_at desc);
create index article_keywords_article_order_idx on public.article_keywords(article_id, sort_order);

create trigger articles_set_updated_at before update on public.articles
for each row execute function public.set_updated_at();

alter table public.articles enable row level security;
alter table public.article_keywords enable row level security;

revoke all on table public.articles, public.article_keywords from anon;
grant select, insert, update, delete on table public.articles, public.article_keywords to authenticated;

create policy articles_select_own on public.articles for select to authenticated using ((select auth.uid()) = user_id);
create policy articles_insert_own on public.articles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy articles_update_own on public.articles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy articles_delete_own on public.articles for delete to authenticated using ((select auth.uid()) = user_id);

create policy article_keywords_select_own on public.article_keywords for select to authenticated using ((select auth.uid()) = user_id);
create policy article_keywords_insert_own on public.article_keywords for insert to authenticated with check ((select auth.uid()) = user_id);
create policy article_keywords_update_own on public.article_keywords for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy article_keywords_delete_own on public.article_keywords for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.create_article_pack(
  p_title text,
  p_content text,
  p_source public.word_source,
  p_keywords jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_article_id uuid;
  v_keyword jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.articles(user_id, title, content, source)
  values (v_user_id, trim(p_title), trim(p_content), p_source)
  returning id into v_article_id;

  for v_keyword in select value from jsonb_array_elements(p_keywords)
  loop
    insert into public.article_keywords(user_id, article_id, keyword, note, sort_order)
    values (
      v_user_id,
      v_article_id,
      lower(trim(v_keyword->>'keyword')),
      nullif(trim(v_keyword->>'note'), ''),
      coalesce((v_keyword->>'sortOrder')::smallint, 0)
    );
  end loop;

  return v_article_id;
end;
$$;

create or replace function public.replace_article_keywords(p_article_id uuid, p_keywords jsonb)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_keyword jsonb;
begin
  if not exists (select 1 from public.articles where id = p_article_id and user_id = v_user_id) then
    raise exception 'Article not found' using errcode = 'P0002';
  end if;

  delete from public.article_keywords where article_id = p_article_id and user_id = v_user_id;
  for v_keyword in select value from jsonb_array_elements(p_keywords)
  loop
    insert into public.article_keywords(user_id, article_id, keyword, note, sort_order)
    values (v_user_id, p_article_id, lower(trim(v_keyword->>'keyword')), nullif(trim(v_keyword->>'note'), ''), coalesce((v_keyword->>'sortOrder')::smallint, 0));
  end loop;
end;
$$;

revoke all on function public.create_article_pack(text, text, public.word_source, jsonb) from public, anon;
revoke all on function public.replace_article_keywords(uuid, jsonb) from public, anon;
grant execute on function public.create_article_pack(text, text, public.word_source, jsonb) to authenticated;
grant execute on function public.replace_article_keywords(uuid, jsonb) to authenticated;
