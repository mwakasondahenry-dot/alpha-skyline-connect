/**
 * Personal link codes.
 *
 * The code is 256 random bits, which is what makes an unguessable link safe
 * to use as the only credential. The database keeps two derived forms and
 * never the code itself: a SHA-256 hash to find the invite when the link is
 * opened, and an AES-GCM ciphertext so staff can share the same link again.
 * Web Crypto only, so this runs in Node and on Cloudflare Workers.
 */
import type { Audience } from "./audience";

export const CODE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const encoder = new TextEncoder();

function toBase64(data: Uint8Array): string {
  let s = "";
  for (const b of data) s += String.fromCharCode(b);
  return btoa(s);
}

function fromBase64(text: string): Uint8Array {
  const bin = atob(text);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function newLinkCode(): string {
  const raw = new Uint8Array(32);
  crypto.getRandomValues(raw);
  return toBase64(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function storyPath(code: string, audience: Audience = "alumni"): string {
  return `${audience === "parent" ? "/parents/story" : "/alumni/story"}/${code}`;
}

export async function hashCode(code: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(code)));
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function importKey(keyB64: string): Promise<CryptoKey> {
  let raw: Uint8Array;
  try {
    raw = fromBase64(keyB64.trim());
  } catch {
    raw = new Uint8Array(0);
  }
  if (raw.byteLength !== 32) {
    throw new Error("INVITE_LINK_KEY must be 32 bytes, base64-encoded.");
  }
  return crypto.subtle.importKey("raw", raw as BufferSource, "AES-GCM", false, ["encrypt", "decrypt"]);
}

/** base64(iv ‖ ciphertext), with a fresh 12-byte IV each time. */
export async function encryptCode(code: string, keyB64: string): Promise<string> {
  const key = await importKey(keyB64);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(code)),
  );
  const out = new Uint8Array(iv.length + sealed.length);
  out.set(iv);
  out.set(sealed, iv.length);
  return toBase64(out);
}

export async function decryptCode(cipher: string, keyB64: string): Promise<string> {
  const key = await importKey(keyB64);
  const data = fromBase64(cipher);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: data.slice(0, 12) },
    key,
    data.slice(12),
  );
  return new TextDecoder().decode(plain);
}
