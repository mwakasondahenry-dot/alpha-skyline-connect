/**
 * The Worker's `waitUntil` for the request being handled, reachable from
 * anywhere on the server without threading it through every call.
 *
 * Cloudflare ends a request's work when its response is finished unless a
 * promise was handed to `ctx.waitUntil`. The edge cache's background
 * refresh (src/lib/edge-cache.ts) needs exactly that: it runs after the
 * page has been sent. src/server.ts opens this store around every request
 * with the context Cloudflare gave it; outside Workers (tests, local dev)
 * the store is empty and callers fall back to an unawaited promise.
 */
import { AsyncLocalStorage } from "node:async_hooks";

export type WaitUntil = (promise: Promise<unknown>) => void;

const store = new AsyncLocalStorage<WaitUntil>();

export function runWithWaitUntil<T>(waitUntil: WaitUntil | undefined, fn: () => T): T {
  return waitUntil ? store.run(waitUntil, fn) : fn();
}

export function currentWaitUntil(): WaitUntil | undefined {
  return store.getStore();
}

/** Finds `waitUntil` on whatever Cloudflare (or nitro) handed the entry. */
export function waitUntilFrom(request: Request, ctx: unknown): WaitUntil | undefined {
  const fromCtx = (ctx as { waitUntil?: unknown } | null)?.waitUntil;
  if (typeof fromCtx === "function") return fromCtx.bind(ctx) as WaitUntil;
  const fromReq = (request as Request & { waitUntil?: unknown }).waitUntil;
  if (typeof fromReq === "function") return fromReq as WaitUntil;
  return undefined;
}
