/**
 * Turns whatever is in a Supabase URL environment variable into the project
 * base URL supabase-js expects, or null if it is not a usable URL.
 *
 * This is stricter than a trim because of how the value travels: the Supabase
 * dashboard copies the URL with `/rest/v1/` on the end, `.env` files keep the
 * quotes around it, and a value pasted into `wrangler secret put` can carry a
 * trailing newline. Any of those reached createClient as-is and failed every
 * request with "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL" —
 * which the server functions then reported to readers as a generic failure.
 */
export function supabaseBaseUrl(raw: string | undefined | null): string | null {
  const cleaned = (raw ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/, "");
  if (!cleaned) return null;

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  return cleaned;
}
