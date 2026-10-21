/**
 * A short-lived cache for the public pages' database reads.
 *
 * The site is served from Cloudflare's edge (for most visitors, Dar es
 * Salaam), but the database is on another continent. Every page that waited
 * on it took 1–5 s before a single byte was sent, measured on 2026-10-21,
 * against well under 0.1 s for a page that did not.
 *
 * So each read is kept for a few minutes: first in this isolate's memory,
 * then in Cloudflare's edge cache (the Workers Cache API), which every
 * isolate in the data centre shares. A change staff make in the admin
 * appears on the public site within TTL_SECONDS.
 *
 * A failed read serves the last good answer when this isolate has one.
 * Otherwise it serves the caller's fallback, and that is remembered for
 * only ERROR_TTL_SECONDS: a query that fails on every request (a missing
 * table, a missing grant) must not cost every visitor the round trip, but a
 * fix to it should show within a minute.
 *
 * Outside Workers (local dev, tests) there is no `caches.default`, and the
 * memory layer alone applies.
 */

export const TTL_SECONDS = 300;
export const ERROR_TTL_SECONDS = 60;

type Entry = { expires: number; value: unknown };
const memory = new Map<string, Entry>();

type EdgeCache = {
  match(req: Request): Promise<Response | undefined>;
  put(req: Request, res: Response): Promise<void>;
};

function edgeCache(): EdgeCache | null {
  const c = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return c?.default ?? null;
}

const cacheRequest = (key: string) =>
  new Request(`https://edge-cache.alphaschools.internal/${encodeURIComponent(key)}`);

export async function cached<T>(
  key: string,
  load: () => Promise<T>,
  ttlSeconds: number = TTL_SECONDS,
  fallback?: () => T,
): Promise<T> {
  const now = Date.now();
  const hit = memory.get(key);
  if (hit && hit.expires > now) return hit.value as T;

  const edge = edgeCache();
  if (edge) {
    try {
      const res = await edge.match(cacheRequest(key));
      if (res) {
        const value = (await res.json()) as T;
        memory.set(key, { expires: now + ttlSeconds * 1000, value });
        return value;
      }
    } catch {
      // A cache read failing is not a page failing: fall through to the database.
    }
  }

  let value: T;
  try {
    value = await load();
  } catch (err) {
    if (hit) return hit.value as T; // stale, but better than empty
    if (!fallback) throw err;
    console.error(`[cached ${key}]`, err);
    const value = fallback();
    memory.set(key, { expires: now + ERROR_TTL_SECONDS * 1000, value });
    return value;
  }

  memory.set(key, { expires: now + ttlSeconds * 1000, value });
  if (edge) {
    try {
      await edge.put(
        cacheRequest(key),
        new Response(JSON.stringify(value), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${ttlSeconds}`,
          },
        }),
      );
    } catch {
      // Not cached at the edge this time; the memory layer still holds it.
    }
  }
  return value;
}

/** For tests. */
export function clearMemoryCache() {
  memory.clear();
}
