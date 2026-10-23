import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, type AlumniFilters, type AlumniPerson } from "./alumni-directory";
import {
  ALUMNI_PAGE,
  DECADES,
  alumniPage,
  activeChips,
  activeFilterCount,
  alumniCsvFilename,
  alumniSearch,
  cityRows,
  classAndSchool,
  formatPhoneDisplay,
  hasCounts,
  inviteLabel,
  personSchoolLabel,
  resultLine,
  roleAtCompany,
  schoolRows,
  storyLabel,
  toggle,
  yearChipLabel,
  yearRows,
} from "./alumni-view";

function f(o: Partial<AlumniFilters> = {}): AlumniFilters {
  return { ...EMPTY_FILTERS, ...o };
}

function person(o: Partial<AlumniPerson> = {}): AlumniPerson {
  return {
    key: "story:x",
    name: "Person",
    phone: null,
    email: null,
    school_slug: "alpha-high",
    grad_year: 2019,
    role: null,
    company: null,
    city: null,
    photo_url: null,
    storyId: null,
    storyStatus: null,
    inviteId: null,
    inviteStatus: "not-invited",
    firstSeen: "2026-01-01T00:00:00Z",
    ...o,
  };
}

describe("formatPhoneDisplay", () => {
  it("groups a Tanzanian number as +255 712 345 678", () => {
    expect(formatPhoneDisplay("+255712345678")).toBe("+255 712 345 678");
    expect(formatPhoneDisplay("0712 345678")).toBe("+255 712 345 678");
  });
  it("leaves other international numbers in their checked form", () => {
    expect(formatPhoneDisplay("+44 7700-900123")).toBe("+447700900123");
  });
  it("leaves a number it cannot read as it was written", () => {
    expect(formatPhoneDisplay(" 12-34 ")).toBe("12-34");
  });
  it("gives null for nothing", () => {
    expect(formatPhoneDisplay(null)).toBeNull();
    expect(formatPhoneDisplay("  ")).toBeNull();
  });
});

describe("yearChipLabel", () => {
  it("names one class or a range", () => {
    expect(yearChipLabel(2019, 2019)).toBe("Class of 2019");
    expect(yearChipLabel(2015, 2019)).toBe("Class of 2015–2019");
  });
  it("names an open-ended range", () => {
    expect(yearChipLabel(2015, null)).toBe("Class of 2015 or later");
    expect(yearChipLabel(null, 2019)).toBe("Class of 2019 or earlier");
  });
  it("is null when there is no year filter", () => {
    expect(yearChipLabel(null, null)).toBeNull();
  });
});

describe("yearRows", () => {
  it("lists every year present, newest first, as '2019 · 14', without the unknown bucket", () => {
    expect(yearRows({ "2015": 3, none: 9, "2019": 14, "2008": 1 })).toEqual([
      { year: 2019, count: 14, label: "2019 · 14" },
      { year: 2015, count: 3, label: "2015 · 3" },
      { year: 2008, count: 1, label: "2008 · 1" },
    ]);
  });
});

describe("DECADES", () => {
  it("offers the 2020s, 2010s and 2000s as ranges", () => {
    expect(DECADES).toEqual([
      { label: "2020s", from: 2020, to: 2029 },
      { label: "2010s", from: 2010, to: 2019 },
      { label: "2000s", from: 2000, to: 2009 },
    ]);
  });
});

describe("school and status labels", () => {
  it("names schools, with nothing recorded as 'Not recorded'", () => {
    expect(personSchoolLabel("alpha-high")).toBe("Alpha High");
    expect(personSchoolLabel(null)).toBe("Not recorded");
    expect(personSchoolLabel("none")).toBe("Not recorded");
  });
  it("names story and invite states", () => {
    expect(storyLabel(null)).toBe("No story");
    expect(storyLabel("none")).toBe("No story");
    expect(storyLabel("live")).toBe("Story live");
    expect(inviteLabel("pending")).toBe("Invited");
    expect(inviteLabel("not-invited")).toBe("Not invited");
  });
  it("puts class and school on one line", () => {
    expect(classAndSchool(person())).toBe("Class of 2019 · Alpha High");
    expect(classAndSchool(person({ grad_year: null, school_slug: null }))).toBe(
      "Class not recorded · Not recorded",
    );
  });
  it("writes role at company", () => {
    expect(roleAtCompany(person({ role: "Engineer", company: "EY" }))).toBe("Engineer at EY");
    expect(roleAtCompany(person({ role: "Engineer" }))).toBe("Engineer");
    expect(roleAtCompany(person({ company: "EY" }))).toBe("EY");
    expect(roleAtCompany(person())).toBeNull();
  });
});

describe("schoolRows / cityRows", () => {
  it("always offers the three schools and Not recorded, with counts", () => {
    expect(schoolRows({ "alpha-high": 4, none: 1 })).toEqual([
      { value: "alpha-high", label: "Alpha High", count: 4 },
      { value: "alpha-girls", label: "Alpha Girls", count: 0 },
      { value: "nursery-primary", label: "Nursery & Primary", count: 0 },
      { value: "none", label: "Not recorded", count: 1 },
    ]);
  });
  it("adds any other school value present", () => {
    expect(schoolRows({ "group-wide": 2 }).map((r) => r.value)).toContain("group-wide");
  });
  it("lists cities present, most first then A–Z, keeping chosen ones with no matches", () => {
    expect(cityRows({ Arusha: 2, "Dar es Salaam": 5, Dodoma: 2 }, ["Mwanza"])).toEqual([
      { value: "Dar es Salaam", label: "Dar es Salaam", count: 5 },
      { value: "Arusha", label: "Arusha", count: 2 },
      { value: "Dodoma", label: "Dodoma", count: 2 },
      { value: "Mwanza", label: "Mwanza", count: 0 },
    ]);
  });
});

describe("hasCounts", () => {
  it("counts who would match with each 'has' added", () => {
    const people = [
      person({ key: "a", email: "a@x.tz", phone: "+255712345678" }),
      person({ key: "b", email: "b@x.tz" }),
      person({ key: "c", photo_url: "p.jpg", grad_year: 2001 }),
    ];
    expect(hasCounts(people, f({ yearFrom: 2019, yearTo: 2019 }))).toEqual({
      photo: 0,
      email: 2,
      phone: 1,
    });
  });
});

describe("active chips", () => {
  it("makes one removable chip per value and one for the year range", () => {
    const filters = f({
      q: "asha",
      schools: ["alpha-high"],
      yearFrom: 2015,
      yearTo: 2019,
      story: ["none"],
      invite: ["pending"],
      cities: ["Dar es Salaam"],
      has: ["email"],
      sort: "name",
    });
    const chips = activeChips(filters);
    expect(chips.map((c) => c.label)).toEqual([
      "Alpha High",
      "Class of 2015–2019",
      "No story",
      "Invited",
      "Dar es Salaam",
      "Has email",
    ]);
    expect(activeFilterCount(filters)).toBe(6);
    const noYear = chips[1].remove(filters);
    expect(noYear.yearFrom).toBeNull();
    expect(noYear.yearTo).toBeNull();
    expect(noYear.schools).toEqual(["alpha-high"]);
    expect(chips[0].remove(filters).schools).toEqual([]);
    expect(chips[5].remove(filters).has).toEqual([]);
    expect(chips[0].remove(filters).q).toBe("asha");
  });
  it("has no chips for search or sort alone", () => {
    expect(activeChips(f({ q: "x", sort: "recent" }))).toEqual([]);
    expect(activeFilterCount(f({ q: "x" }))).toBe(0);
  });
});

describe("resultLine", () => {
  it("counts people and filters", () => {
    expect(resultLine(42, 3)).toBe("42 former students · 3 filters");
    expect(resultLine(1, 1)).toBe("1 former student · 1 filter");
    expect(resultLine(7, 0)).toBe("7 former students");
  });
});

describe("toggle", () => {
  it("adds or removes a value", () => {
    expect(toggle(["a"], "b")).toEqual(["a", "b"]);
    expect(toggle(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("alumniSearch", () => {
  it("is filtersToParams with the years as numbers, for a readable address", () => {
    expect(alumniSearch(f({ yearFrom: 2015, yearTo: 2019, schools: ["alpha-high"] }))).toEqual({
      schools: "alpha-high",
      yearFrom: 2015,
      yearTo: 2019,
    });
    expect(alumniSearch(EMPTY_FILTERS)).toEqual({});
  });
});

describe("alumniCsvFilename", () => {
  it("dates the file in Dar es Salaam", () => {
    // 22:30 UTC on the 23rd is already the 24th in Dar es Salaam (UTC+3).
    expect(alumniCsvFilename(new Date("2026-10-23T22:30:00Z"))).toBe("alpha-alumni-2026-10-24.csv");
    expect(alumniCsvFilename(new Date("2026-01-05T08:00:00Z"))).toBe("alpha-alumni-2026-01-05.csv");
  });
});

describe("alumniPage", () => {
  const list = (n: number) => Array.from({ length: n }, (_, i) => i);
  it("shows everything, with no line or button, when it fits", () => {
    expect(ALUMNI_PAGE).toBe(200);
    const p = alumniPage(list(200), ALUMNI_PAGE);
    expect(p.visible).toHaveLength(200);
    expect(p.showing).toBeNull();
    expect(p.moreLabel).toBeNull();
  });
  it("shows the first 200 of a longer list and offers 200 more", () => {
    const p = alumniPage(list(512), ALUMNI_PAGE);
    expect(p.visible).toEqual(list(200));
    expect(p.showing).toBe("Showing 200 of 512");
    expect(p.moreLabel).toBe("Show 200 more");
    expect(p.nextLimit).toBe(400);
  });
  it("offers only what is left on the last page", () => {
    const p = alumniPage(list(512), 400);
    expect(p.visible).toHaveLength(400);
    expect(p.showing).toBe("Showing 400 of 512");
    expect(p.moreLabel).toBe("Show 112 more");
    expect(alumniPage(list(512), 600).moreLabel).toBeNull();
  });
});
