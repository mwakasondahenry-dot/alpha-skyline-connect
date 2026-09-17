import { describe, it, expect } from "vitest";
import { AUDIENCES, formAudience, isAudience } from "./audience";

describe("audience", () => {
  it("lists both audiences", () => {
    expect(AUDIENCES).toEqual(["alumni", "parent"]);
  });

  it.each([
    ["alumni", true],
    ["parent", true],
    ["parents", false],
    ["", false],
    [null, false],
  ])("isAudience(%j) is %s", (v, expected) => {
    expect(isAudience(v)).toBe(expected);
  });

  it("reads the form, defaulting to alumni", () => {
    const f = new FormData();
    expect(formAudience(f)).toBe("alumni");
    f.set("audience", "parent");
    expect(formAudience(f)).toBe("parent");
    f.set("audience", "teacher");
    expect(formAudience(f)).toBe("alumni");
  });
});
