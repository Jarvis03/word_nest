import { Search } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { WordsExplorer } from "@/components/words-explorer";
import { normalizeTerm } from "@/lib/word-card-schema";

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const rawQuery = (await searchParams).q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? "";
  const normalizedQuery = normalizeTerm(query);

  return (
    <>
      <PageHeader title="My Words" description="Every word you choose to keep, in one quiet place." />
      <section className="px-5 sm:px-8">
        <form action="/words" className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-[var(--muted)]">
          <Search size={18} className="shrink-0" />
          <input name="q" defaultValue={query} type="search" placeholder="Search by prefix..." className="min-w-32 flex-1 bg-transparent py-2 outline-none placeholder:text-[var(--muted)]" />
          {query ? <Link href="/words" className="text-xs font-bold text-[var(--accent)]">Clear</Link> : null}
          <button type="submit" className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white">Search</button>
        </form>

        <WordsExplorer key={normalizedQuery} query={query} normalizedQuery={normalizedQuery} />
      </section>
    </>
  );
}
