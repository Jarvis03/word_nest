import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function TodayPage() {
  const supabase = await createClient();
  const [{ count: dueCount }, { data: recentWords }] = await Promise.all([
    supabase
      .from("word_memory")
      .select("word_id", { count: "exact", head: true })
      .lte("due", new Date().toISOString()),
    supabase.from("words").select("id, word, chinese_hint").order("created_at", { ascending: false }).limit(3),
  ]);

  return (
    <>
      <PageHeader eyebrow="Good evening" title="Today" description="A calm place for the English you want to keep." />
      <section className="px-5 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[var(--accent)] p-7 text-white shadow-[0_22px_60px_rgba(49,92,66,0.18)]">
          <Sparkles className="mb-8 text-[#b9d4bd]" />
          <p className="text-sm font-semibold text-[#dce9de]">Words to review</p>
          <p className="mt-1 text-6xl font-semibold tracking-[-0.06em]">{dueCount ?? 0}</p>
          <Link
            href={(dueCount ?? 0) > 0 ? "/review" : "/add"}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--accent)]"
          >
            {(dueCount ?? 0) > 0 ? "Start review" : "Add a word"} <ArrowRight size={17} />
          </Link>
        </div>

        <article className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold">Recently added</h2>
          {recentWords?.length ? (
            <ul className="mt-4 divide-y divide-[var(--line)]">
              {recentWords.map((word) => (
                <li key={word.id} className="py-3 first:pt-0 last:pb-0">
                  <strong>{word.word}</strong>
                  <span className="ml-3 text-sm text-[var(--muted)]">{word.chinese_hint}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-[var(--muted)]">Your new words will appear here.</p>
          )}
        </article>
      </section>
    </>
  );
}
