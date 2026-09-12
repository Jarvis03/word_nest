import { NextResponse } from "next/server";
import { normalizeTerm, saveWordInputSchema } from "@/lib/word-card-schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = saveWordInputSchema.safeParse(payload);
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
  const { data, error } = await supabase.rpc("save_word_card", {
    p_card: draft,
    p_source: input.data.source,
    p_original_context: input.data.originalContext || null,
  });

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: `“${draft.word}” is already in My Words.` },
      { status: 409 },
    );
  }

  if (error) {
    return NextResponse.json(
      { error: "Unable to save this card. Check that the Supabase migration is applied." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data }, { status: 201 });
}
