import { Search } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { normalizeTerm } from "@/lib/word-card-schema";
import { createClient } from "@/lib/supabase/server";

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const rawQuery = (await searchParams).q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? "";
  const supabase = await createClient();
  let wordsQuery = supabase
    .from("words")
    .select("id, word, chinese_hint, source, created_at, word_memory(due, reps, stability)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (query) {
    const escaped = normalizeTerm(query).replace(/[\\%_]/g, "\\$&");
    wordsQuery = wordsQuery.ilike("normalized_term", `${escaped}%`);
  }

  const { data: words, error } = await wordsQuery;

  return (
    <>
      <PageHeader title="My Words" description="Every word you choose to keep, in one quiet place." />
      <section className="px-5 sm:px-8">
        <form action="/words" className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-[var(--muted)]">
          <Search size={18} className="shrink-0" />
          <input name="q" defaultValue={query} type="search" placeholder="Search by prefix..." className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-[var(--muted)]" />
          {query ? <Link href="/words" className="text-xs font-bold text-[var(--accent)]">Clear</Link> : null}
          <button type="submit" className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white">Search</button>
        </form>

        {query && !error ? <p className="mt-4 text-sm text-[var(--muted)]">{words?.length ?? 0} result{words?.length === 1 ? "" : "s"} for “{query}”</p> : null}

        {error ? (
          <div className="mt-6 rounded-2xl bg-[#f8e5df] p-5 text-sm leading-6 text-[#8b392b]">
            The word database is not ready. Apply the Supabase migration, then refresh this page.
          </div>
        ) : words?.length ? (
          <div className="mt-6 space-y-3">
            {words.map((word) => {
              const memory = Array.isArray(word.word_memory)
                ? word.word_memory[0]
                : word.word_memory;
              return (
                <Link
                  key={word.id}
                  href={`/words/${word.id}`}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{word.word}</h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{word.chinese_hint}</p>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold capitalize text-[var(--accent)]">
                      {word.source.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-[var(--muted)]">
                    Next review: {memory?.due ? new Date(memory.due).toLocaleDateString("en-US") : "Not scheduled"}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-[2rem] border border-dashed border-[#c9cbc2] bg-[rgba(255,254,250,0.7)] p-8 text-center">
            <h2 className="text-xl font-semibold">{query ? "No matching words" : "Your word list is waiting"}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{query ? "Try a shorter prefix." : "Generate and save your first card."}</p>
          </div>
        )}
      </section>
    </>
  );
}
