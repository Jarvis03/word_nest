import { z } from "zod";
import { sourceSchema } from "./word-card-schema";

export const articleKeywordSchema = z.object({
  keyword: z.string().trim().min(1).max(80),
  note: z.string().trim().max(160).default(""),
});

export const articlePackSchema = z.object({
  title: z.string().trim().min(1).max(160),
  content: z.string().trim().min(40).max(20000),
  source: sourceSchema.default("reading"),
  keywords: z.array(articleKeywordSchema).min(1).max(40),
});

export const articleKeywordsUpdateSchema = z.object({
  keywords: z.array(articleKeywordSchema).min(1).max(40),
});

const STOP_WORDS = new Set("about after again against also among because been before being between both could does doing down during each from further have having here into itself just more most other over same should some such than that their them then there these they this those through under very what when where which while whom will with would your you're were aren't can't didn't doesn't don't hasn't haven't isn't it's let's mustn't shouldn't wasn't weren't won't wouldn't".split(" "));

export function extractArticleKeywords(content: string, limit = 14) {
  const counts = new Map<string, number>();
  const firstIndex = new Map<string, number>();
  const tokens = content.toLocaleLowerCase("en-US").match(/[a-z]+(?:'[a-z]+)?/g) ?? [];

  tokens.forEach((token, index) => {
    if (token.length < 5 || STOP_WORDS.has(token)) return;
    counts.set(token, (counts.get(token) ?? 0) + 1);
    if (!firstIndex.has(token)) firstIndex.set(token, index);
  });

  return [...counts]
    .sort(([a, aCount], [b, bCount]) => bCount - aCount || b.length - a.length || (firstIndex.get(a) ?? 0) - (firstIndex.get(b) ?? 0))
    .slice(0, limit)
    .map(([keyword]) => ({ keyword, note: "" }));
}

export type ArticleKeyword = z.infer<typeof articleKeywordSchema>;
