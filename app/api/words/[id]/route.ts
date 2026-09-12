import { z } from "zod";
import { NextResponse } from "next/server";
import { normalizeTerm, updateWordInputSchema } from "@/lib/word-card-schema";
import { createClient } from "@/lib/supabase/server";

const wordIdSchema = z.uuid();

type RouteContext = { params: Promise<{ id: string }> };

async function getAuthorizedClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, authenticated: Boolean(data?.claims?.sub) };
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, authenticated } = await getAuthorizedClient();
  if (!authenticated) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const parsedId = wordIdSchema.safeParse((await context.params).id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid word ID." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = updateWordInputSchema.safeParse(payload);
  if (!input.success) {
    return NextResponse.json(
      { error: "The card contains invalid content.", issues: input.error.flatten() },
      { status: 400 },
    );
  }

  const draft = {
    ...input.data.draft,
    normalizedTerm: normalizeTerm(input.data.draft.word),
  };
  const { error } = await supabase.rpc("update_word_card", {
    p_word_id: parsedId.data,
    p_card: draft,
  });

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: `“${draft.word}” is already in My Words.` },
      { status: 409 },
    );
  }
  if (error?.code === "P0002") {
    return NextResponse.json({ error: "Word not found." }, { status: 404 });
  }
  if (error) {
    return NextResponse.json(
      { error: "Unable to update this card. Apply the latest Supabase migration first." },
      { status: 500 },
    );
  }

  return NextResponse.json({ draft });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, authenticated } = await getAuthorizedClient();
  if (!authenticated) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const parsedId = wordIdSchema.safeParse((await context.params).id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid word ID." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("words")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Unable to delete this word." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Word not found." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
