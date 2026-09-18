import { describe, it, expect } from "vitest";
import { displayStatus, STATUS_LABEL } from "./status";

const now = new Date("2026-09-17T12:00:00Z");
const future = "2026-10-01T00:00:00Z";
const past = "2026-09-01T00:00:00Z";

describe("displayStatus", () => {
  it.each([
    ["pending", future, "pending"],
    ["opened", future, "opened"],
    ["submitted", future, "submitted"],
    ["pending", past, "expired"],
    ["opened", past, "expired"],
    ["submitted", past, "submitted"],
  ] as const)("%s expiring %s → %s", (status, expires_at, expected) => {
    expect(displayStatus({ status, expires_at }, now)).toBe(expected);
  });

  it("labels every status", () => {
    expect(STATUS_LABEL).toEqual({
      pending: "Pending",
      opened: "Opened",
      submitted: "Submitted",
      expired: "Expired",
    });
  });
});
