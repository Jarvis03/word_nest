import { z } from "zod";
import { NextResponse } from "next/server";
import { articleKeywordsUpdateSchema } from "@/lib/article-schema";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const id = z.uuid().safeParse((await context.params).id);
  if (!id.success) return NextResponse.json({ error: "Invalid article ID." }, { status: 400 });

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const input = articleKeywordsUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Add at least one valid keyword." }, { status: 400 });

  const keywords = input.data.keywords.map((item, sortOrder) => ({ ...item, sortOrder }));
  const { error } = await supabase.rpc("replace_article_keywords", { p_article_id: id.data, p_keywords: keywords });
  if (error?.code === "P0002") return NextResponse.json({ error: "Article not found." }, { status: 404 });
  if (error) return NextResponse.json({ error: "Unable to update the keywords." }, { status: 500 });
  return NextResponse.json({ keywords: input.data.keywords });
}
