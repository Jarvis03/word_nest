import { notFound } from "next/navigation";
import { WordDetailManager } from "@/components/word-detail-manager";
import type { WordCardDraft } from "@/lib/word-card-schema";
import { createClient } from "@/lib/supabase/server";

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: word, error } = await supabase
    .from("words")
    .select(`
      id, word, normalized_term, entry_type, lemma, part_of_speech,
      core_meaning, chinese_hint, mental_model, source, original_context,
      collocations(text, sort_order),
      examples(sentence, example_type),
      related_words(related_word, relationship),
      word_memory(due)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Unable to load this word.");
  if (!word) notFound();

  const commonExample = word.examples.find((example) => example.example_type === "common");
  const contextualExample = word.examples.find((example) => example.example_type === "contextual");
  if (!commonExample || !contextualExample) throw new Error("This word card is incomplete.");

  const draft: WordCardDraft = {
    word: word.word,
    normalizedTerm: word.normalized_term,
    entryType: word.entry_type,
    lemma: word.lemma,
    partOfSpeech: word.part_of_speech,
    coreMeaning: word.core_meaning,
    chineseHint: word.chinese_hint,
    mentalModel: word.mental_model,
    collocations: [...word.collocations]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => item.text),
    examples: {
      common: commonExample.sentence,
      contextual: contextualExample.sentence,
    },
    relatedWords: word.related_words.map((item) => ({
      word: item.related_word,
      relationship: item.relationship,
    })),
  };
  const memory = Array.isArray(word.word_memory) ? word.word_memory[0] : word.word_memory;

  return (
    <WordDetailManager
      wordId={word.id}
      initialDraft={draft}
      source={word.source}
      originalContext={word.original_context}
      nextReview={memory?.due ?? null}
    />
  );
}
