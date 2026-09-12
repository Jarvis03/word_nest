import { NextResponse } from "next/server";
import { createMockWordCard } from "@/lib/mock-word-card";
import { generateWordInputSchema, wordCardDraftSchema } from "@/lib/word-card-schema";

export async function POST(request: Request) {
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

  // This adapter keeps the API contract executable before an LLM provider is configured.
  const generated = createMockWordCard(input.data);
  const draft = wordCardDraftSchema.safeParse(generated);
  if (!draft.success) {
    return NextResponse.json({ error: "Unable to generate this card." }, { status: 422 });
  }

  return NextResponse.json({ draft: draft.data, mode: "local-preview" });
}
