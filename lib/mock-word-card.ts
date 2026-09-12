import type { GenerateWordInput, WordCardDraft } from "./word-card-schema";
import { normalizeTerm, wordCardDraftSchema } from "./word-card-schema";

const rollout: WordCardDraft = {
  word: "rollout",
  normalizedTerm: "rollout",
  entryType: "word",
  lemma: "rollout",
  partOfSpeech: "noun",
  coreMeaning:
    "The process of introducing something new into actual use across a group, market, or organization.",
  chineseHint: "正式推出并逐步铺开",
  mentalModel: ["prepared", "introduced", "expanded"],
  collocations: ["global rollout", "product rollout", "phased rollout", "rollout plan"],
  examples: {
    common: "The company is preparing for a global rollout of the service.",
    contextual: "We plan to roll out the new training program to three more countries in Q4.",
  },
  relatedWords: [
    { word: "launch", relationship: "confusing" },
    { word: "deployment", relationship: "related" },
  ],
};

export function createMockWordCard(input: GenerateWordInput): WordCardDraft {
  const normalizedTerm = normalizeTerm(input.text);
  if (normalizedTerm === "rollout") return wordCardDraftSchema.parse(rollout);

  const isPhrase = normalizedTerm.includes(" ");
  return wordCardDraftSchema.parse({
    word: input.text.normalize("NFKC").trim().replace(/\s+/g, " "),
    normalizedTerm,
    entryType: isPhrase ? "phrase" : "word",
    lemma: normalizedTerm,
    partOfSpeech: isPhrase ? "phrase" : "other",
    coreMeaning: input.originalContext
      ? `A contextual meaning of “${input.text.trim()}” in the sentence you provided.`
      : `The most common modern meaning of “${input.text.trim()}”.`,
    chineseHint: "本地预览释义，接入 LLM 后生成",
    mentalModel: ["encounter", "understand", "use"],
    collocations: [`common ${normalizedTerm}`, `${normalizedTerm} in context`],
    examples: {
      common: `This is a natural example using “${input.text.trim()}”.`,
      contextual:
        input.originalContext || `You can add context to personalize the example for “${input.text.trim()}”.`,
    },
    relatedWords: [],
  });
}
