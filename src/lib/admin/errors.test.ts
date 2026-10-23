import { describe, expect, it } from "vitest";
import { friendlyError } from "./errors";

const EXPIRED = "Your sign-in has expired. Sign in again and your changes will be kept.";

describe("friendlyError", () => {
  it("maps known failures", () => {
    expect(friendlyError({ message: "JWT expired" })).toBe(EXPIRED);
    expect(friendlyError({ code: "PGRST301" })).toBe(EXPIRED);
    expect(friendlyError(new TypeError("Failed to fetch"))).toBe(
      "No internet connection. Nothing was saved.",
    );
    expect(friendlyError({ code: "42501" })).toBe("You do not have permission to do that.");
    expect(friendlyError({ message: "new row violates row-level security policy" })).toBe(
      "You do not have permission to do that.",
    );
    expect(friendlyError({ code: "23514" })).toBe(
      "One of the values is not allowed. Check the form and try again.",
    );
    expect(friendlyError({ message: "Object not found" })).toBe(
      "The photo could not be found. It may have been removed.",
    );
    expect(friendlyError({ kind: "conflict" })).toBe(
      "This story was changed by someone else. It has been refreshed.",
    );
  });
  it("treats network failures as offline whatever shape they arrive in", () => {
    const OFFLINE = "No internet connection. Nothing was saved.";
    // supabase-js postgrest returns a plain object, not a TypeError.
    expect(
      friendlyError({ message: "TypeError: Failed to fetch", details: "", hint: "", code: "" }),
    ).toBe(OFFLINE);
    // storage-js wraps the fetch failure in a StorageUnknownError.
    const storageErr = Object.assign(new Error("Failed to fetch"), {
      name: "StorageUnknownError",
      originalError: new TypeError("Failed to fetch"),
    });
    expect(friendlyError(storageErr)).toBe(OFFLINE);
    expect(friendlyError({ message: "NetworkError when attempting to fetch resource." })).toBe(
      OFFLINE,
    );
    expect(friendlyError({ message: "Network request failed" })).toBe(OFFLINE);
    expect(friendlyError(new TypeError("Load failed"))).toBe(OFFLINE);
  });
  it("names the thing that changed in a conflict", () => {
    expect(friendlyError({ kind: "conflict", what: "message" })).toBe(
      "This message was changed by someone else. It has been refreshed.",
    );
  });
  it("falls back for anything else", () => {
    const fallback = "Something went wrong. Nothing was changed. Try again.";
    expect(friendlyError(new Error("boom"))).toBe(fallback);
    expect(friendlyError(null)).toBe(fallback);
    expect(friendlyError("x")).toBe(fallback);
  });
});
