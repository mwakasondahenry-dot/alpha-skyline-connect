import { describe, expect, it } from "vitest";
import { dateInputValue, initialValue, saveValue } from "./admin-crud-defaults";

describe("initialValue", () => {
  it("leaves a nullable number empty when there is no value", () => {
    expect(initialValue({ type: "number", nullable: true }, null)).toBe("");
    expect(initialValue({ type: "number", nullable: true }, undefined)).toBe("");
  });

  it("never invents 0 for a number without a declared default", () => {
    expect(initialValue({ type: "number" }, null)).toBe("");
  });

  it("uses a declared defaultValue of 0", () => {
    expect(initialValue({ type: "number", defaultValue: 0 }, null)).toBe(0);
  });

  it("keeps an existing number", () => {
    expect(initialValue({ type: "number", nullable: true }, 5)).toBe(5);
    expect(initialValue({ type: "number", defaultValue: 0 }, 5)).toBe(5);
  });

  it("keeps an existing 0 rather than replacing it", () => {
    expect(initialValue({ type: "number", defaultValue: 3 }, 0)).toBe(0);
  });

  it("gives text an empty string when there is no value", () => {
    expect(initialValue({ type: "text" }, null)).toBe("");
  });

  it("uses a boolean's declared default when there is no value", () => {
    expect(initialValue({ type: "boolean", defaultValue: true }, null)).toBe(true);
  });

  it("keeps an existing false over a true default", () => {
    expect(initialValue({ type: "boolean", defaultValue: true }, false)).toBe(false);
  });

  it("gives a boolean with no default false", () => {
    expect(initialValue({ type: "boolean" }, undefined)).toBe(false);
  });

  it("shows a timestamp as its date in Dar es Salaam for a date input", () => {
    expect(initialValue({ type: "date" }, "2026-10-20T00:00:00+00:00")).toBe("2026-10-20");
    // 22:30 UTC on the 20th is 01:30 on the 21st in Dar es Salaam.
    expect(initialValue({ type: "date" }, "2026-10-20T22:30:00Z")).toBe("2026-10-21");
  });

  it("keeps a plain date as it is", () => {
    expect(initialValue({ type: "date" }, "2026-10-20")).toBe("2026-10-20");
  });

  it("gives an empty date input when there is no value", () => {
    expect(initialValue({ type: "date" }, null)).toBe("");
  });
});

describe("dateInputValue", () => {
  it("returns empty for something that is not a date", () => {
    expect(dateInputValue("not a date")).toBe("");
    expect(dateInputValue(42)).toBe("");
  });
});

describe("saveValue", () => {
  it("saves an emptied nullable number as null, not 0", () => {
    expect(saveValue({ type: "number", nullable: true }, "")).toBeNull();
  });

  it("saves an emptied number that has a default as that default", () => {
    expect(saveValue({ type: "number", defaultValue: 0 }, "")).toBe(0);
  });

  it("turns typed digits into a number", () => {
    expect(saveValue({ type: "number" }, "12")).toBe(12);
  });

  it("saves empty text as null", () => {
    expect(saveValue({ type: "text" }, "")).toBeNull();
  });

  it("keeps the original timestamp when the date was not changed", () => {
    const original = "2026-10-20T09:15:00+00:00";
    expect(saveValue({ type: "date" }, "2026-10-20", original)).toBe(original);
  });

  it("saves a changed date as the picked day", () => {
    expect(saveValue({ type: "date" }, "2026-10-22", "2026-10-20T09:15:00+00:00")).toBe(
      "2026-10-22",
    );
  });
});
