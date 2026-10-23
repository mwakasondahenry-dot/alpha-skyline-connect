import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  alumniCsv,
  facetCounts,
  filterAlumni,
  filtersFromParams,
  filtersToParams,
  mergeAlumni,
  type AlumniFilters,
  type AlumniPerson,
  type AlumniStoryRow,
  type InviteRow,
} from "./alumni-directory";

function invite(o: Partial<InviteRow> = {}): InviteRow {
  return {
    id: "i1",
    full_name: "Asha Invite",
    phone: "+255712345678",
    email: null,
    school_slug: "alpha-high",
    grad_year: 2019,
    status: "submitted",
    created_at: "2026-01-01T00:00:00Z",
    submitted_at: null,
    ...o,
  };
}

function story(o: Partial<AlumniStoryRow> = {}): AlumniStoryRow {
  return {
    id: "s1",
    author_name: "Asha Story",
    relationship: "Engineer",
    company: "EY Tanzania",
    city_country: "Dar es Salaam",
    school_slug: "alpha-high",
    grad_year: 2019,
    status: "live",
    photo_url: "p.jpg",
    answers: null,
    invite_id: null,
    created_at: "2026-02-01T00:00:00Z",
    ...o,
  };
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

describe("mergeAlumni", () => {
  it("joins a story to its invite by invite_id", () => {
    const out = mergeAlumni([invite()], [story({ invite_id: "i1" })]);
    expect(out).toHaveLength(1);
    expect(out[0].key).toBe("story:s1");
    expect(out[0].inviteStatus).toBe("submitted");
    expect(out[0].storyStatus).toBe("live");
    expect(out[0].name).toBe("Asha Story");
    expect(out[0].inviteId).toBe("i1");
  });

  it("joins by normalised phone when there is no invite_id", () => {
    const out = mergeAlumni(
      [invite()],
      [story({ answers: { phone: "0712 345 678", email: "a@b.co" } })],
    );
    expect(out).toHaveLength(1);
    expect(out[0].inviteId).toBe("i1");
    expect(out[0].email).toBe("a@b.co");
    expect(out[0].phone).toBe("+255712345678");
  });

  it("keeps an unmatched story as its own person", () => {
    const out = mergeAlumni([], [story()]);
    expect(out).toHaveLength(1);
    expect(out[0].inviteStatus).toBe("not-invited");
    expect(out[0].inviteId).toBeNull();
  });

  it("keeps an unmatched invite with key invite:<id>", () => {
    const out = mergeAlumni([invite({ status: "pending" })], []);
    expect(out[0].key).toBe("invite:i1");
    expect(out[0].storyStatus).toBeNull();
    expect(out[0].inviteStatus).toBe("pending");
  });

  it("fills phone and email from story answers, tolerating junk answers", () => {
    const out = mergeAlumni(
      [invite({ email: "inv@x.co" })],
      [
        story({ id: "a", invite_id: "i1", answers: { phone: 5, email: null } }),
        story({ id: "b", answers: { email: "only@x.co", phone: "0755 111 222" } }),
        story({ id: "c", answers: null }),
      ],
    );
    const a = out.find((p) => p.storyId === "a")!;
    expect(a.phone).toBe("+255712345678");
    expect(a.email).toBe("inv@x.co");
    const b = out.find((p) => p.storyId === "b")!;
    expect(b.email).toBe("only@x.co");
    expect(b.phone).toBe("+255755111222");
  });

  it("prefers the newer source for school and year", () => {
    const out = mergeAlumni(
      [invite({ grad_year: 2018, created_at: "2026-03-01T00:00:00Z" })],
      [story({ invite_id: "i1", grad_year: 2019 })],
    );
    expect(out[0].grad_year).toBe(2018);
    const out2 = mergeAlumni(
      [invite({ grad_year: 2018 })],
      [story({ invite_id: "i1", grad_year: null })],
    );
    expect(out2[0].grad_year).toBe(2018);
  });
});

describe("filterAlumni", () => {
  const people = [
    person({
      key: "a",
      name: "José Mwakasonda",
      phone: "+255712345678",
      email: "j@x.co",
      grad_year: 2019,
      photo_url: "p",
    }),
    person({
      key: "b",
      name: "Mary O’Brien",
      grad_year: 2015,
      company: "EY Tanzania",
      storyStatus: "live",
      storyId: "s",
    }),
    person({ key: "c", name: "Zed", grad_year: 2014 }),
    person({ key: "d", name: "Anna", grad_year: null }),
    person({ key: "e", name: "Ben", grad_year: 2024 }),
  ];
  const keys = (l: AlumniPerson[]) => l.map((p) => p.key).sort();
  const f = (o: Partial<AlumniFilters>): AlumniFilters => ({ ...EMPTY_FILTERS, ...o });

  it("searches name, accents, apostrophes, company, phone", () => {
    expect(keys(filterAlumni(people, f({ q: "jose" })))).toEqual(["a"]);
    expect(keys(filterAlumni(people, f({ q: "o'brien" })))).toEqual(["b"]);
    expect(keys(filterAlumni(people, f({ q: "EY" })))).toEqual(["b"]);
    expect(keys(filterAlumni(people, f({ q: "0712345678" })))).toEqual(["a"]);
  });

  it("year range is inclusive and excludes null years", () => {
    expect(keys(filterAlumni(people, f({ yearFrom: 2015, yearTo: 2019 })))).toEqual(["a", "b"]);
  });

  it("story none, has email", () => {
    expect(keys(filterAlumni(people, f({ story: ["none"] })))).toEqual(["a", "c", "d", "e"]);
    expect(keys(filterAlumni(people, f({ has: ["email"] })))).toEqual(["a"]);
  });

  it("sorts by year newest first with nulls last, and by name", () => {
    expect(filterAlumni(people, f({})).map((p) => p.key)).toEqual(["e", "a", "b", "c", "d"]);
    expect(filterAlumni(people, f({ sort: "name" })).map((p) => p.name)).toEqual([
      "Anna",
      "Ben",
      "José Mwakasonda",
      "Mary O’Brien",
      "Zed",
    ]);
  });
});

describe("facetCounts", () => {
  const people = [
    person({ key: "a", grad_year: 2019, school_slug: "alpha-high" }),
    person({ key: "b", grad_year: 2019, school_slug: "alpha-high" }),
    person({ key: "c", grad_year: 2015, school_slug: "alpha-girls" }),
    person({ key: "d", grad_year: null, school_slug: null }),
  ];
  it("school ignores its own filter but respects year", () => {
    const c = facetCounts(people, {
      ...EMPTY_FILTERS,
      schools: ["alpha-girls"],
      yearFrom: 2019,
      yearTo: 2019,
    });
    expect(c.school).toEqual({ "alpha-high": 2 });
  });
  it("year ignores the year range but respects school", () => {
    const c = facetCounts(people, {
      ...EMPTY_FILTERS,
      schools: ["alpha-high"],
      yearFrom: 2015,
      yearTo: 2015,
    });
    expect(c.year["2019"]).toBe(2);
    expect(c.year["2015"]).toBeUndefined();
  });
  it("counts people with no year and no school under none", () => {
    const c = facetCounts(people, EMPTY_FILTERS);
    expect(c.year.none).toBe(1);
    expect(c.school.none).toBe(1);
    expect(c.story.none).toBe(4);
    expect(c.invite["not-invited"]).toBe(4);
  });
});

describe("params", () => {
  it("round-trips a fully populated filter set", () => {
    const full: AlumniFilters = {
      q: "ey, tz",
      schools: ["alpha-high", "none"],
      yearFrom: 2010,
      yearTo: 2019,
      story: ["live", "none"],
      invite: ["pending", "not-invited"],
      cities: ["Dar es Salaam, Tanzania", "London"],
      has: ["photo", "email", "phone"],
      sort: "recent",
    };
    expect(filtersFromParams(filtersToParams(full))).toEqual(full);
  });
  it("omits defaults", () => {
    expect(filtersToParams(EMPTY_FILTERS)).toEqual({});
    expect(filtersFromParams({})).toEqual(EMPTY_FILTERS);
  });
  it("tolerates junk", () => {
    const r = filtersFromParams({ yearFrom: "x", story: "live,bogus", sort: "zzz", has: 4 });
    expect(r.yearFrom).toBeNull();
    expect(r.story).toEqual(["live"]);
    expect(r.sort).toBe("year");
    expect(r.has).toEqual([]);
    expect(filtersFromParams({ yearFrom: 2015 }).yearFrom).toBe(2015);
  });
});

describe("alumniCsv formula safety", () => {
  it("prefixes risky cells but keeps phones and years", () => {
    const csv = alumniCsv([
      person({
        name: '=HYPERLINK("http://x","y")',
        phone: "+255712345678",
        company: "-Acme",
      }),
    ]);
    const row = csv.split("\r\n")[1];
    expect(row.startsWith(`"'=HYPERLINK(""http://x"",""y"")",+255712345678,`)).toBe(true);
    expect(row).toContain(",'-Acme,");
    expect(row).toContain("Alpha High,2019");
  });
});

describe("params extras", () => {
  it("accepts a numeric q", () => {
    expect(filtersFromParams({ q: 2019 }).q).toBe("2019");
  });
  it("swaps a reversed year range", () => {
    const r = filtersFromParams({ yearFrom: "2019", yearTo: "2010" });
    expect([r.yearFrom, r.yearTo]).toEqual([2010, 2019]);
  });
});

describe("alumniCsv", () => {
  it("writes the header, quotes, and CRLF", () => {
    const csv = alumniCsv([
      person({
        name: 'Mwakasonda, "Henry"',
        phone: "+255712345678",
        storyStatus: "live",
        inviteStatus: "submitted",
      }),
    ]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe(
      "Name,Phone,Email,School,Class of,Role,Company,City or country,Story,Invite",
    );
    expect(lines[1].startsWith('"Mwakasonda, ""Henry""",+255712345678,')).toBe(true);
    expect(lines[1]).toContain("Alpha High,2019");
    expect(csv.endsWith("\r\n")).toBe(true);
  });
});
