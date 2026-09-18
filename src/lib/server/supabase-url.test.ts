import { describe, expect, it } from "vitest";
import { supabaseBaseUrl } from "./supabase-url";

describe("supabaseBaseUrl", () => {
  it("keeps a plain project URL", () => {
    expect(supabaseBaseUrl("https://abc.supabase.co")).toBe("https://abc.supabase.co");
  });

  it("drops the REST path the dashboard copies with the URL", () => {
    expect(supabaseBaseUrl("https://abc.supabase.co/rest/v1/")).toBe("https://abc.supabase.co");
    expect(supabaseBaseUrl("https://abc.supabase.co/rest/v1")).toBe("https://abc.supabase.co");
  });

  /* A secret pasted into `wrangler secret put` can pick up a trailing newline
     or carriage return, and a value copied out of an .env file can keep its
     quotes. Either one used to reach createClient and fail the whole request
     with "Invalid supabaseUrl". */
  it("survives whitespace, newlines and quotes around a pasted value", () => {
    expect(supabaseBaseUrl(' "https://abc.supabase.co/rest/v1/" ')).toBe("https://abc.supabase.co");
    expect(supabaseBaseUrl("https://abc.supabase.co/rest/v1/\r\n")).toBe("https://abc.supabase.co");
    expect(supabaseBaseUrl("'https://abc.supabase.co'")).toBe("https://abc.supabase.co");
  });

  it("returns null for anything that is not an http(s) URL", () => {
    expect(supabaseBaseUrl(undefined)).toBeNull();
    expect(supabaseBaseUrl("")).toBeNull();
    expect(supabaseBaseUrl("   ")).toBeNull();
    expect(supabaseBaseUrl("abc.supabase.co")).toBeNull();
    expect(supabaseBaseUrl("ALPHA_SUPABASE_URL=https://abc.supabase.co")).toBeNull();
  });
});
