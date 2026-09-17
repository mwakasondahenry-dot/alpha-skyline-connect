import { describe, it, expect } from "vitest";
import { CODE_PATTERN, decryptCode, encryptCode, hashCode, newLinkCode, storyPath } from "./token";

function randomKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

describe("link codes", () => {
  it("are 43 url-safe characters and differ each time", () => {
    const a = newLinkCode();
    const b = newLinkCode();
    expect(a).toMatch(CODE_PATTERN);
    expect(b).toMatch(CODE_PATTERN);
    expect(a).not.toBe(b);
  });

  it("hash stably to 64 hex characters", async () => {
    const h1 = await hashCode("abc");
    expect(h1).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(await hashCode("abc")).toBe(h1);
  });

  it("round-trip through encryption", async () => {
    const key = randomKey();
    const code = newLinkCode();
    const cipher = await encryptCode(code, key);
    expect(cipher).not.toContain(code);
    expect(await decryptCode(cipher, key)).toBe(code);
  });

  it("encrypt the same code differently each time", async () => {
    const key = randomKey();
    expect(await encryptCode("same", key)).not.toBe(await encryptCode("same", key));
  });

  it("refuse the wrong key", async () => {
    const cipher = await encryptCode("secret", randomKey());
    await expect(decryptCode(cipher, randomKey())).rejects.toThrow();
  });

  it("refuse a tampered cipher", async () => {
    const key = randomKey();
    const cipher = await encryptCode("secret", key);
    const bytes = Uint8Array.from(atob(cipher), (c) => c.charCodeAt(0));
    bytes[bytes.length - 1] ^= 1;
    await expect(decryptCode(btoa(String.fromCharCode(...bytes)), key)).rejects.toThrow();
  });

  it("refuse a key that is not 32 bytes", async () => {
    await expect(encryptCode("x", btoa("short"))).rejects.toThrow(
      "INVITE_LINK_KEY must be 32 bytes, base64-encoded.",
    );
  });

  it("build the story path", () => {
    expect(storyPath("abc")).toBe("/alumni/story/abc");
  });
});
