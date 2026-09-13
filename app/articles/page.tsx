import Link from "next/link";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function ArticlesPage() {
  const supabase = await createClient();
  const { data: articles, error } = await supabase.from("articles").select("id, title, source, created_at, article_keywords(id)").order("created_at", { ascending: false }).limit(50);
  return (
    <>
      <PageHeader eyebrow="Personal reading" title="Article packs" description="Articles you chose, with the words that matter to you." />
      <section className="px-5 pb-8 sm:px-8">
        <Link href="/add?mode=article" className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white"><FileText size={17} /> Add an article</Link>
        {error ? <p className="mt-6 rounded-2xl bg-[#f8e5df] p-4 text-sm text-[#8b392b]">Apply the article migration in Supabase to enable article packs.</p> : articles?.length ? <div className="mt-6 space-y-3">{articles.map((article) => <Link key={article.id} href={`/articles/${article.id}`} className="block rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5"><div className="flex items-start justify-between gap-4"><h2 className="font-semibold">{article.title}</h2><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold capitalize text-[var(--accent)]">{article.source.replace("_", " ")}</span></div><p className="mt-3 text-sm text-[var(--muted)]">{article.article_keywords.length} keywords · {new Date(article.created_at).toLocaleDateString("en-US")}</p></Link>)}</div> : <div className="mt-6 rounded-3xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">Your saved article packs will appear here.</div>}
      </section>
    </>
  );
}
