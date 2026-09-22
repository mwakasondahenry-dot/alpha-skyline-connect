import { describe, it, expect } from "vitest";
import {
  organizationLd,
  schoolLd,
  eventsLd,
  breadcrumbLd,
  type EventLdInput,
} from "./structured-data";
import { SITE_URL } from "./seo";

/**
 * The events on the live site come from Supabase, and at the time of writing
 * none are published — so the one thing these tests are really for is proving
 * the Event branch works before a row ever reaches it, and that the claims
 * design/CONTENT-FROM-SCHOOL.md blocks cannot reappear here.
 */

const EVENT: EventLdInput = {
  id: "abc",
  title: "Annual Sports Day",
  description: "All three schools.",
  event_date: "2026-10-03",
  location: "Kunduchi",
};

describe("organization", () => {
  it("uses the brand for name and the legal entity for legalName", () => {
    const ld = organizationLd();
    expect(ld.name).toBe("Alpha Schools");
    expect(ld.legalName).toBe("ALFA EDUCATION CENTRE");
  });

  it("links only the two confirmed social profiles", () => {
    expect(organizationLd().sameAs).toEqual([
      "https://www.instagram.com/alphaschoolstz",
      "https://www.youtube.com/@alphaschoolstz",
    ]);
  });

  it("carries no rating or review", () => {
    const json = JSON.stringify(organizationLd());
    expect(json).not.toMatch(/aggregateRating|reviewCount|ratingValue|"review"/);
  });
});

describe("schools", () => {
  it("states the campus neighbourhood parents search for", () => {
    expect(schoolLd("alpha-high", "x").address).toMatchObject({
      addressLocality: "Mikocheni",
      addressRegion: "Dar es Salaam",
      addressCountry: "TZ",
    });
    expect(schoolLd("alpha-girls", "x").address).toMatchObject({ addressLocality: "Kunduchi" });
    expect(schoolLd("nursery-primary", "x").address).toMatchObject({ addressLocality: "Kunduchi" });
  });

  it("points every school at the one organization node", () => {
    for (const slug of ["alpha-high", "alpha-girls", "nursery-primary"] as const) {
      expect(schoolLd(slug, "x").parentOrganization).toEqual({ "@id": `${SITE_URL}/#organization` });
    }
  });

  it("gives Alpha Girls no founding date", () => {
    expect(JSON.stringify(schoolLd("alpha-girls", "x"))).not.toMatch(/foundingDate|2020/);
  });
});

describe("events", () => {
  it("marks up a published event with the fields Google asks for", () => {
    const [ld] = eventsLd([EVENT]);
    expect(ld.name).toBe("Annual Sports Day");
    expect(ld.startDate).toBe("2026-10-03");
    expect(ld.eventStatus).toBe("https://schema.org/EventScheduled");
    expect(ld.eventAttendanceMode).toBe("https://schema.org/OfflineEventAttendanceMode");
    expect(ld.location.address).toMatchObject({ addressLocality: "Kunduchi" });
  });

  it("drops a row whose date cannot be read rather than emitting a broken startDate", () => {
    expect(eventsLd([{ ...EVENT, event_date: "sometime in October" }])).toHaveLength(0);
  });

  it("falls back to the city when a row has no location", () => {
    const [ld] = eventsLd([{ ...EVENT, location: null }]);
    expect(ld.location.name).toBe("Alpha Schools");
    expect(ld.location.address.addressRegion).toBe("Dar es Salaam");
  });

  it("omits description entirely when the row has none", () => {
    expect(eventsLd([{ ...EVENT, description: null }])[0]).not.toHaveProperty("description");
  });

  it("returns nothing for no events, so the page emits no Event markup", () => {
    expect(eventsLd([])).toEqual([]);
  });
});

describe("breadcrumbs", () => {
  it("puts Home first and numbers from one", () => {
    const ld = breadcrumbLd([{ name: "Alpha High", path: "/schools/alpha-high" }]);
    expect(ld.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Alpha High",
        item: `${SITE_URL}/schools/alpha-high`,
      },
    ]);
  });
});

describe("blocked claims", () => {
  it("never states a first-in-Tanzania or pioneer claim", () => {
    const all = JSON.stringify([
      organizationLd(),
      schoolLd("alpha-high", "A co-education secondary school in Mikocheni."),
      ...eventsLd([EVENT]),
    ]);
    expect(all).not.toMatch(/first in Tanzania|pioneer|1st in/i);
  });

  it("leaves no bracketed placeholder in any node", () => {
    const all = JSON.stringify([organizationLd(), schoolLd("alpha-girls", "A girls' secondary.")]);
    expect(all).not.toMatch(/\[[^\]]*to be (confirmed|provided)[^\]]*\]/i);
  });
});
