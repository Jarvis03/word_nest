import { afterEach, describe, expect, it, vi } from "vitest";
import {
  invalidateWordsCache,
  loadWordsCached,
  readWordsCache,
  wordsCacheKey,
  type CachedWord,
} from "./words-cache";

const word: CachedWord = {
  id: "word-1",
  word: "rollout",
  chineseHint: "正式推出",
  source: "work",
  due: null,
};

afterEach(() => invalidateWordsCache());

describe("words cache", () => {
  it("reuses a recent result for the same user and search", async () => {
    const loader = vi.fn(async () => [word]);
    const key = wordsCacheKey("user-1", "roll");

    await loadWordsCached(key, loader, 1_000);
    const second = await loadWordsCached(key, loader, 2_000);

    expect(second).toEqual([word]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("keeps results separate between users", async () => {
    const loader = vi.fn(async () => [word]);

    await loadWordsCached(wordsCacheKey("user-1", ""), loader, 1_000);
    await loadWordsCached(wordsCacheKey("user-2", ""), loader, 1_000);

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("expires cached results after two minutes", async () => {
    const loader = vi.fn(async () => [word]);
    const key = wordsCacheKey("user-1", "");

    await loadWordsCached(key, loader, 1_000);

    expect(readWordsCache(key, 120_999)).toEqual([word]);
    expect(readWordsCache(key, 121_000)).toBeNull();
  });

  it("does not restore stale data when invalidated during a request", async () => {
    let finish!: (words: CachedWord[]) => void;
    const loader = () => new Promise<CachedWord[]>((resolve) => { finish = resolve; });
    const key = wordsCacheKey("user-1", "");
    const request = loadWordsCached(key, loader, 1_000);

    invalidateWordsCache();
    finish([word]);
    await request;

    expect(readWordsCache(key, 1_001)).toBeNull();
  });
});
