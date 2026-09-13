export type CachedWord = {
  id: string;
  word: string;
  chineseHint: string;
  source: string;
  due: string | null;
};

type CacheEntry = {
  words: CachedWord[];
  cachedAt: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<CachedWord[]>>();
let cacheVersion = 0;

export function wordsCacheKey(userId: string, query: string) {
  return `${userId}:${query}`;
}

export function readWordsCache(key: string, now = Date.now()) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (now - entry.cachedAt >= CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.words;
}

export async function loadWordsCached(
  key: string,
  loader: () => Promise<CachedWord[]>,
  now = Date.now(),
) {
  const cached = readWordsCache(key, now);
  if (cached) return cached;

  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const requestVersion = cacheVersion;
  const request = loader()
    .then((words) => {
      if (cacheVersion === requestVersion) {
        cache.set(key, { words, cachedAt: now });
      }
      return words;
    })
    .finally(() => {
      if (pending.get(key) === request) pending.delete(key);
    });

  pending.set(key, request);
  return request;
}

export function invalidateWordsCache() {
  cacheVersion += 1;
  cache.clear();
  pending.clear();
}
