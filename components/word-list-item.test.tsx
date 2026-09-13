import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WordListItem } from "./word-list-item";

describe("WordListItem", () => {
  it("renders each word as one block-level card", () => {
    const html = renderToStaticMarkup(
      <WordListItem
        id="word-1"
        word="rollout"
        chineseHint="正式推出并逐步铺开"
        source="ai_chat"
      />,
    );

    expect(html).toContain('href="/words/word-1"');
    expect(html).toMatch(/^<a class="[^"]*\bblock\b[^"]*" href=/);
  });
});
