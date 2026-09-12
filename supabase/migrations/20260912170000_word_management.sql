create or replace function public.update_word_card(
  p_word_id uuid,
  p_card jsonb
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_item text;
  v_related jsonb;
  v_sort_order bigint;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.words
  set
    word = p_card->>'word',
    normalized_term = p_card->>'normalizedTerm',
    entry_type = (p_card->>'entryType')::public.entry_type,
    lemma = p_card->>'lemma',
    part_of_speech = (p_card->>'partOfSpeech')::public.part_of_speech,
    core_meaning = p_card->>'coreMeaning',
    chinese_hint = p_card->>'chineseHint',
    mental_model = array(select jsonb_array_elements_text(p_card->'mentalModel'))
  where id = p_word_id and user_id = v_user_id;

  if not found then
    raise exception 'Word not found' using errcode = 'P0002';
  end if;

  delete from public.collocations where word_id = p_word_id and user_id = v_user_id;
  for v_item, v_sort_order in
    select value, ordinality
    from jsonb_array_elements_text(p_card->'collocations') with ordinality
  loop
    insert into public.collocations(user_id, word_id, text, sort_order)
    values (v_user_id, p_word_id, v_item, v_sort_order);
  end loop;

  delete from public.examples where word_id = p_word_id and user_id = v_user_id;
  insert into public.examples(user_id, word_id, sentence, example_type)
  values
    (v_user_id, p_word_id, p_card->'examples'->>'common', 'common'),
    (v_user_id, p_word_id, p_card->'examples'->>'contextual', 'contextual');

  delete from public.related_words where word_id = p_word_id and user_id = v_user_id;
  for v_related in select value from jsonb_array_elements(p_card->'relatedWords')
  loop
    insert into public.related_words(user_id, word_id, related_word, relationship)
    values (
      v_user_id,
      p_word_id,
      v_related->>'word',
      (v_related->>'relationship')::public.word_relationship
    );
  end loop;
end;
$$;

revoke all on function public.update_word_card(uuid, jsonb) from public, anon;
grant execute on function public.update_word_card(uuid, jsonb) to authenticated;
