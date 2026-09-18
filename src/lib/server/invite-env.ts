import { getRequestHeader } from "@tanstack/react-start/server";

/** 32 random bytes, base64. Generate with:
 *  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" */
export function inviteLinkKey(): string {
  const key = process.env.INVITE_LINK_KEY;
  if (!key) throw new Error("INVITE_LINK_KEY not configured");
  return key;
}

/** Where links point. PUBLIC_SITE_URL wins; otherwise the address this request came in on. */
export function siteBase(): string {
  const configured = process.env.PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const host = getRequestHeader("x-forwarded-host") ?? getRequestHeader("host") ?? "localhost";
  const local = /^(localhost|127\.|192\.168\.|10\.)/.test(host);
  const proto = getRequestHeader("x-forwarded-proto") ?? (local ? "http" : "https");
  return `${proto}://${host}`;
}
