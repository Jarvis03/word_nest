import { notFound } from "next/navigation";
import { ArticleStudy } from "@/components/article-study";
import { createClient } from "@/lib/supabase/server";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: article, error } = await supabase.from("articles").select("id, title, content, source, article_keywords(keyword, note, sort_order)").eq("id", id).maybeSingle();
  if (error) throw new Error("Unable to load this article. Apply the article migration first.");
  if (!article) notFound();
  return <ArticleStudy id={article.id} title={article.title} content={article.content} source={article.source} initialKeywords={[...article.article_keywords].sort((a, b) => a.sort_order - b.sort_order).map(({ keyword, note }) => ({ keyword, note: note ?? "" }))} />;
}
