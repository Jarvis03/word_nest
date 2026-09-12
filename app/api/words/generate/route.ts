import { NextResponse } from "next/server";
import { createMockWordCard } from "@/lib/mock-word-card";
import {
  generateWordInputSchema,
  normalizeTerm,
  wordCardDraftSchema,
} from "@/lib/word-card-schema";
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

  const input = generateWordInputSchema.safeParse(payload);
  if (!input.success) {
    return NextResponse.json(
      { error: "Please check the word, context, and source.", issues: input.error.flatten() },
      { status: 400 },
    );
  }

  const normalizedTerm = normalizeTerm(input.data.text);
  const { data: existing, error: duplicateError } = await supabase
    .from("words")
    .select("id, word")
    .eq("normalized_term", normalizedTerm)
    .maybeSingle();

  if (duplicateError) {
    return NextResponse.json(
      { error: "The database is not ready. Apply the Supabase migration first." },
      { status: 503 },
    );
  }

  if (existing) {
    return NextResponse.json(
      { error: `“${existing.word}” is already in My Words.`, existingId: existing.id },
      { status: 409 },
    );
  }

  // This adapter keeps the API contract executable before an LLM provider is configured.
  const generated = createMockWordCard(input.data);
  const draft = wordCardDraftSchema.safeParse(generated);
  if (!draft.success) {
    return NextResponse.json({ error: "Unable to generate this card." }, { status: 422 });
  }

  return NextResponse.json({ draft: draft.data, mode: "local-preview" });
}
