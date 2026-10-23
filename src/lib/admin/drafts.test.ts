import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearDraft, draftKey, loginRedirect, readDraft, safeRedirect, saveDraft } from "./drafts";

const g = globalThis as unknown as { sessionStorage?: unknown };
let original: unknown;

beforeEach(() => {
  original = g.sessionStorage;
});
afterEach(() => {
  g.sessionStorage = original;
});

function stub() {
  const m = new Map<string, string>();
  g.sessionStorage = {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
  return m;
}

describe("drafts", () => {
  it("builds keys", () => {
    expect(draftKey("stories", "7")).toBe("alpha-admin-draft:stories:7");
  });
  it("round-trips and clears", () => {
    stub();
    const k = draftKey("stories", "7");
    saveDraft(k, { a: 1 });
    expect(readDraft<{ a: number }>(k)).toEqual({ a: 1 });
    clearDraft(k);
    expect(readDraft(k)).toBeNull();
  });
  it("returns null for corrupt JSON", () => {
    const m = stub();
    m.set("k", "{nope");
    expect(readDraft("k")).toBeNull();
  });
  it("never throws when storage throws", () => {
    const boom = () => {
      throw new Error("denied");
    };
    g.sessionStorage = { getItem: boom, setItem: boom, removeItem: boom };
    expect(() => saveDraft("k", 1)).not.toThrow();
    expect(readDraft("k")).toBeNull();
    expect(() => clearDraft("k")).not.toThrow();
  });
});

describe("redirects", () => {
  it("builds the login redirect", () => {
    expect(loginRedirect("/admin/stories/abc")).toBe(
      "/admin/login?redirect=%2Fadmin%2Fstories%2Fabc",
    );
  });
  it("only allows /admin/ paths", () => {
    expect(safeRedirect("/admin/stories/1")).toBe("/admin/stories/1");
    for (const bad of ["https://evil.com", "//evil", "/contact", null, undefined, "/admin//evil"]) {
      expect(safeRedirect(bad)).toBe("/admin");
    }
  });
});
