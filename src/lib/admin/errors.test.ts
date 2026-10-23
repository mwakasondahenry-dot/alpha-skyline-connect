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
  it("falls back for anything else", () => {
    const fallback = "Something went wrong. Nothing was changed. Try again.";
    expect(friendlyError(new Error("boom"))).toBe(fallback);
    expect(friendlyError(null)).toBe(fallback);
    expect(friendlyError("x")).toBe(fallback);
  });
});
