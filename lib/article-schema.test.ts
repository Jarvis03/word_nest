import { describe, expect, it } from "vitest";
import { articlePackSchema, extractArticleKeywords } from "./article-schema";

describe("article learning packs", () => {
  it("ranks repeated meaningful words and removes common words", () => {
    const keywords = extractArticleKeywords("The deployment improved reliability. This deployment reduced latency and improved reliability.", 3);
    expect(keywords.map((item) => item.keyword)).toEqual(["reliability", "deployment", "improved"]);
  });

  it("validates a complete article pack", () => {
    expect(articlePackSchema.safeParse({ title: "A rollout", content: "A product rollout needs careful planning and clear communication across every team.", source: "work", keywords: [{ keyword: "rollout", note: "launch" }] }).success).toBe(true);
  });
});
