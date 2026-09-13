"use client";

import { useEffect, useState } from "react";
import { WordListItem } from "@/components/word-list-item";
import {
  loadWordsCached,
  type CachedWord,
  wordsCacheKey,
} from "@/lib/words-cache";
import { createClient } from "@/lib/supabase/client";

type WordRow = {
  id: string;
  word: string;
  chinese_hint: string;
  source: string;
  word_memory: { due: string | null }[] | { due: string | null } | null;
};

export function WordsExplorer({ query, normalizedQuery }: { query: string; normalizedQuery: string }) {
  const [words, setWords] = useState<CachedWord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setError(null);
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        if (active) setError("Your session has expired. Please sign in again.");
        return;
      }

      const key = wordsCacheKey(userId, normalizedQuery);

      try {
        const result = await loadWordsCached(key, async () => {
          let request = supabase
            .from("words")
            .select("id, word, chinese_hint, source, word_memory(due)")
            .order("created_at", { ascending: false })
            .limit(100);

          if (normalizedQuery) {
            const escaped = normalizedQuery.replace(/[\\%_]/g, "\\$&");
            request = request.ilike("normalized_term", `${escaped}%`);
          }

          const { data, error: queryError } = await request;
          if (queryError) throw queryError;

          return ((data ?? []) as WordRow[]).map((row) => {
            const memory = Array.isArray(row.word_memory) ? row.word_memory[0] : row.word_memory;
            return {
              id: row.id,
              word: row.word,
              chineseHint: row.chinese_hint,
              source: row.source,
              due: memory?.due ?? null,
            };
          });
        });

        if (active) setWords(result);
      } catch {
        if (active) setError("Unable to load your words. Please try again.");
      }
    }

    setWords(null);
    void load();
    return () => {
      active = false;
    };
  }, [normalizedQuery]);

  if (error) {
    return (
      <div className="mt-6 rounded-2xl bg-[#f8e5df] p-5 text-sm leading-6 text-[#8b392b]">
        {error}
      </div>
    );
  }

  if (!words) {
    return (
      <div role="status" aria-label="Loading words" className="mt-6 space-y-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="animate-pulse rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="h-5 w-1/3 rounded-full bg-[#dedfd8]" />
            <div className="mt-4 h-4 w-2/3 rounded-full bg-[#e6e7e1]" />
            <div className="mt-5 h-3 w-1/2 rounded-full bg-[#e6e7e1]" />
          </div>
        ))}
        <span className="sr-only">Loading words…</span>
      </div>
    );
  }

  return (
    <>
      {query ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {words.length} result{words.length === 1 ? "" : "s"} for “{query}”
        </p>
      ) : null}

      {words.length ? (
        <div className="mt-6 space-y-3">
          {words.map((word) => (
            <WordListItem key={word.id} {...word} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[2rem] border border-dashed border-[#c9cbc2] bg-[rgba(255,254,250,0.7)] p-8 text-center">
          <h2 className="text-xl font-semibold">{query ? "No matching words" : "Your word list is waiting"}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {query ? "Try a shorter prefix." : "Generate and save your first card."}
          </p>
        </div>
      )}
    </>
  );
}
