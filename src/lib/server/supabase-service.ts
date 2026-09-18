/**
 * Service-role Supabase access for server functions. Bypasses RLS, so it is
 * never handed to a route or returned to the browser. Every file under a
 * server/ directory is import-protected from the client bundle by the
 * Lovable Vite config.
 */
import { createClient } from "@supabase/supabase-js";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { supabaseBaseUrl } from "./supabase-url";

export function serviceClient() {
  const url = supabaseBaseUrl(
    process.env.ALPHA_SUPABASE_URL_SERVER ?? process.env.ALPHA_SUPABASE_URL,
  );
  const key = process.env.ALPHA_SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error("ALPHA_SUPABASE_URL_SERVER / ALPHA_SUPABASE_URL is missing or not a URL");
  }
  if (!key) throw new Error("ALPHA_SUPABASE_SERVICE_ROLE_KEY not configured");
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Caller's address, for rate limiting.
 *
 * cf-connecting-ip first: this deploys behind Cloudflare, which sets it and
 * strips any client-supplied copy, so it cannot be spoofed. x-forwarded-for is
 * the fallback and is only as trustworthy as the proxy in front — it is used
 * for the limit, never for anything security-bearing.
 */
export function callerIp(): string {
  return getRequestHeader("cf-connecting-ip") ?? getRequestIP({ xForwardedFor: true }) ?? "unknown";
}
