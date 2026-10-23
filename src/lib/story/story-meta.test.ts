import { describe, expect, it } from "vitest";
import { alumniMeta, parentMeta, storyMeta, storySchoolLabel } from "./story-meta";

const base = {
  relationship: null as string | null,
  company: null as string | null,
  grad_year: null as number | null,
  school_slug: null as string | null,
};

describe("storySchoolLabel", () => {
  it("names each school and treats missing or group-wide as Alpha Schools", () => {
    expect(storySchoolLabel("alpha-high")).toBe("Alpha High");
    expect(storySchoolLabel("alpha-girls")).toBe("Alpha Girls");
    expect(storySchoolLabel("nursery-primary")).toBe("Nursery & Primary");
    expect(storySchoolLabel("group-wide")).toBe("Alpha Schools");
    expect(storySchoolLabel(null)).toBe("Alpha Schools");
    expect(storySchoolLabel("unknown")).toBe("Alpha Schools");
  });
});

describe("parentMeta", () => {
  it("uses the relationship when there is one", () => {
    expect(parentMeta({ ...base, relationship: "Parent, Form 3" })).toEqual(["Parent, Form 3"]);
  });
  it("falls back to Parent, <school>", () => {
    expect(parentMeta({ ...base, school_slug: "alpha-girls" })).toEqual(["Parent, Alpha Girls"]);
  });
});

describe("alumniMeta", () => {
  it("gives school and class, then role at company", () => {
    expect(
      alumniMeta({
        ...base,
        school_slug: "alpha-high",
        grad_year: 2018,
        relationship: "Pilot",
        company: "Air Tanzania",
      }),
    ).toEqual(["Alpha High, class of 2018", "Pilot at Air Tanzania"]);
  });
  it("leaves out parts that are missing", () => {
    expect(alumniMeta({ ...base, grad_year: 2015 })).toEqual(["Alpha Schools, class of 2015"]);
  });
});

describe("storyMeta", () => {
  it("picks alumni meta when there is a class year, parent meta otherwise", () => {
    expect(storyMeta({ ...base, grad_year: 2019 })).toEqual(["Alpha Schools, class of 2019"]);
    expect(storyMeta(base)).toEqual(["Parent, Alpha Schools"]);
  });
});
