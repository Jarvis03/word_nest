import { NextResponse } from "next/server";
import { articlePackSchema } from "@/lib/article-schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const input = articlePackSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Check the article and keywords." }, { status: 400 });

  const keywords = input.data.keywords.map((item, sortOrder) => ({ ...item, sortOrder }));
  const { data, error } = await supabase.rpc("create_article_pack", {
    p_title: input.data.title,
    p_content: input.data.content,
    p_source: input.data.source,
    p_keywords: keywords,
  });

  if (error) return NextResponse.json({ error: "Unable to save. Apply the article migration in Supabase first." }, { status: 500 });
  return NextResponse.json({ id: data }, { status: 201 });
}
