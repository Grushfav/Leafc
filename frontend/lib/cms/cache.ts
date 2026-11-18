/**
 * Small stale-while-revalidate cache for published CMS responses.
 *
 * - In-memory map: instant on in-site navigation.
 * - sessionStorage: instant on refresh / repeat visits within the tab session.
 *
 * Only browser code should read or write it (sessionStorage access is guarded).
 */

const STORAGE_PREFIX = "leafc:cms:v1:";

const memory = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export type CacheHit<T> = { hit: true; value: T } | { hit: false };

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readCmsCache<T>(key: string): CacheHit<T> {
  if (memory.has(key)) {
    return { hit: true, value: memory.get(key) as T };
  }
  const store = storage();
  if (!store) return { hit: false };
  try {
    const raw = store.getItem(STORAGE_PREFIX + key);
    if (raw == null) return { hit: false };
    const parsed = JSON.parse(raw) as { value: T };
    memory.set(key, parsed.value);
    return { hit: true, value: parsed.value };
  } catch {
    return { hit: false };
  }
}

export function writeCmsCache<T>(key: string, value: T): void {
  memory.set(key, value);
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_PREFIX + key, JSON.stringify({ value }));
  } catch {
    // Quota or serialization problems should never break the page.
  }
}

/** Fetches, de-duplicates concurrent calls for the same key, and stores the result. */
export function fetchAndCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { cache?: boolean } = {},
): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const request = fetcher()
    .then((value) => {
      if (options.cache !== false) writeCmsCache(key, value);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}
