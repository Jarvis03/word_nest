import { z } from "zod";

export const sourceValues = [
  "work",
  "reading",
  "news",
  "email",
  "ai_chat",
  "other",
] as const;

export const sourceSchema = z.enum(sourceValues);

export const generateWordInputSchema = z.object({
  text: z.string().trim().min(1).max(80),
  originalContext: z.string().trim().max(500).optional(),
  source: sourceSchema.default("other"),
});

export const wordCardDraftSchema = z.object({
  word: z.string().trim().min(1).max(80),
  normalizedTerm: z.string().trim().min(1).max(80),
  entryType: z.enum(["word", "phrase"]),
  lemma: z.string().trim().min(1).max(80),
  partOfSpeech: z.enum([
    "noun",
    "verb",
    "adjective",
    "adverb",
    "pronoun",
    "preposition",
    "conjunction",
    "determiner",
    "interjection",
    "phrasal_verb",
    "idiom",
    "phrase",
    "other",
  ]),
  coreMeaning: z.string().trim().min(1).max(500),
  chineseHint: z.string().trim().min(1).max(120),
  mentalModel: z.array(z.string().trim().min(1).max(80)).min(1).max(5),
  collocations: z.array(z.string().trim().min(1).max(120)).min(1).max(8),
  examples: z.object({
    common: z.string().trim().min(1).max(500),
    contextual: z.string().trim().min(1).max(500),
  }),
  relatedWords: z
    .array(
      z.object({
        word: z.string().trim().min(1).max(80),
        relationship: z.enum(["related", "confusing", "synonym"]),
      }),
    )
    .max(8),
});

export type GenerateWordInput = z.infer<typeof generateWordInputSchema>;
export type WordCardDraft = z.infer<typeof wordCardDraftSchema>;

export function normalizeTerm(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}
