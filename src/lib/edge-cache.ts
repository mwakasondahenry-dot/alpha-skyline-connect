/**
 * A cache for the public pages' database reads that keeps the database off
 * the critical path.
 *
 * The site is served from Cloudflare's edge (for most visitors, Dar es
 * Salaam), but the database is on another continent. A page that waits on
 * it takes 0.8–1.2 s before a single byte is sent, measured on 2026-10-21
 * and again on 2026-10-22, against under 0.1 s for one that does not. On a
 * quiet site almost every visit used to pay that: the data was kept for only
 * five minutes, and five minutes is longer than the gap between visitors.
 *
 * So, stale-while-revalidate. Each read has three ages:
 *
 *   fresh   (TTL_SECONDS)    served as is;
 *   stale   (STALE_SECONDS)  served as is, immediately, while one refresh
 *                            runs in the background for the next visitor;
 *   expired                  the visitor waits for a fresh read, as before.
 *
 * A change staff make in the admin shows on the next visit after
 * TTL_SECONDS at the latest plus one more page view, since the first visit
 * past the fresh window serves the old value and triggers the refresh.
 *
 * The value lives first in this isolate's memory, then in Cloudflare's
 * edge cache (the Workers Cache API), which every isolate in the data
 * centre shares. The background refresh is handed to the Worker's
 * `waitUntil` when the request exposes one, so it survives the response
 * being sent; without it the promise simply runs unawaited.
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

import { currentWaitUntil } from "@/lib/server/wait-until";

export const TTL_SECONDS = 300;
/** How long past fresh a value is still served while a refresh runs. */
export const STALE_SECONDS = 6 * 60 * 60;
export const ERROR_TTL_SECONDS = 60;

type Entry = { freshUntil: number; staleUntil: number; value: unknown };
const memory = new Map<string, Entry>();
/** One background refresh per key at a time. */
const inflight = new Map<string, Promise<void>>();

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

/** The body stored at the edge: the value and its two deadlines. */
type Stored = { value: unknown; freshUntil: number; staleUntil: number };

async function readEdge(key: string): Promise<Entry | null> {
  const edge = edgeCache();
  if (!edge) return null;
  try {
    const res = await edge.match(cacheRequest(key));
    if (!res) return null;
    const s = (await res.json()) as Stored;
    if (typeof s?.freshUntil !== "number" || typeof s?.staleUntil !== "number") return null;
    return { value: s.value, freshUntil: s.freshUntil, staleUntil: s.staleUntil };
  } catch {
    // A cache read failing is not a page failing: fall through to the database.
    return null;
  }
}

async function writeEdge(key: string, entry: Entry): Promise<void> {
  const edge = edgeCache();
  if (!edge) return;
  const keepSeconds = Math.max(1, Math.ceil((entry.staleUntil - Date.now()) / 1000));
  try {
    const body: Stored = {
      value: entry.value,
      freshUntil: entry.freshUntil,
      staleUntil: entry.staleUntil,
    };
    await edge.put(
      cacheRequest(key),
      new Response(JSON.stringify(body), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${keepSeconds}`,
        },
      }),
    );
  } catch {
    // Not cached at the edge this time; the memory layer still holds it.
  }
}

/**
 * Keeps a promise alive past the response when the runtime allows it.
 * src/server.ts stores the Worker's `waitUntil` for the current request;
 * without one (tests, local dev) the promise simply runs unawaited.
 *
 * Measured on 2026-10-22: without waitUntil the refresh never completed on
 * the live Worker, and a page kept serving the stale value on every visit.
 */
function inBackground(work: Promise<void>): void {
  const waitUntil = currentWaitUntil();
  if (waitUntil) {
    waitUntil(work);
    return;
  }
  void work;
}

export type CacheOptions<T> = {
  /**
   * Return false for a value that must not be kept, e.g. a lookup that
   * found nothing. It is returned to this caller only: nothing is added to
   * memory or the edge, so requests for random keys cannot grow either, and
   * an entry already held for the key is dropped, so a row that disappears
   * stops being served.
   */
  store?: (value: T) => boolean;
};

async function refresh<T>(
  key: string,
  load: () => Promise<T>,
  ttlSeconds: number,
  options: CacheOptions<T> | undefined,
  hadEntry: boolean,
): Promise<T> {
  const value = await load();
  const now = Date.now();
  if (options?.store && !options.store(value)) {
    memory.delete(key);
    /* An already-expired entry overwrites any copy at the edge (it lives a
       second). Written only when the key was held, never for a new key. */
    if (hadEntry) await writeEdge(key, { value, freshUntil: now, staleUntil: now });
    return value;
  }
  const entry: Entry = {
    value,
    freshUntil: now + ttlSeconds * 1000,
    staleUntil: now + (ttlSeconds + STALE_SECONDS) * 1000,
  };
  memory.set(key, entry);
  await writeEdge(key, entry);
  return value;
}

export async function cached<T>(
  key: string,
  load: () => Promise<T>,
  ttlSeconds: number = TTL_SECONDS,
  fallback?: () => T,
  options?: CacheOptions<T>,
): Promise<T> {
  const now = Date.now();
  let hit = memory.get(key) ?? null;
  /* No fresh value in this isolate's memory: another isolate in the data
     centre may have refreshed it already, so the shared edge cache is
     consulted before anything is treated as stale. */
  if (!hit || hit.freshUntil <= now) {
    const fromEdge = await readEdge(key);
    if (fromEdge && fromEdge.staleUntil > now && (!hit || fromEdge.freshUntil > hit.freshUntil)) {
      memory.set(key, fromEdge);
      hit = fromEdge;
    }
  }

  if (hit && hit.freshUntil > now) return hit.value as T;

  if (hit && hit.staleUntil > now) {
    /* Stale: this visitor gets the old value at once; the next gets a fresh one. */
    if (!inflight.has(key)) {
      const work = refresh(key, load, ttlSeconds, options, true)
        .catch((err) => console.error(`[cached ${key}] refresh`, err))
        .then(() => {
          inflight.delete(key);
        });
      inflight.set(key, work);
      inBackground(work);
    }
    return hit.value as T;
  }

  try {
    return await refresh(key, load, ttlSeconds, options, hit !== null);
  } catch (err) {
    if (hit) return hit.value as T; // expired, but better than empty
    if (!fallback) throw err;
    console.error(`[cached ${key}]`, err);
    const value = fallback();
    memory.set(key, {
      value,
      freshUntil: now + ERROR_TTL_SECONDS * 1000,
      staleUntil: now + ERROR_TTL_SECONDS * 1000,
    });
    return value;
  }
}

/** For tests. */
export function clearMemoryCache() {
  memory.clear();
  inflight.clear();
}
