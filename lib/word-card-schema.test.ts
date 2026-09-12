import { describe, expect, it } from "vitest";
import { generateWordInputSchema, normalizeTerm, wordCardDraftSchema } from "./word-card-schema";
import { createMockWordCard } from "./mock-word-card";

describe("word card boundary", () => {
  it("normalizes Unicode, casing and repeated spaces", () => {
    expect(normalizeTerm("  Align   Ｗith  ")).toBe("align with");
  });

  it("defaults the source and rejects oversized context", () => {
    expect(generateWordInputSchema.parse({ text: "rollout" }).source).toBe("other");
    expect(() =>
      generateWordInputSchema.parse({ text: "rollout", originalContext: "x".repeat(501) }),
    ).toThrow();
  });

  it("produces a schema-valid local preview", () => {
    const input = generateWordInputSchema.parse({ text: "rollout", source: "work" });
    expect(wordCardDraftSchema.parse(createMockWordCard(input)).partOfSpeech).toBe("noun");
  });
});
