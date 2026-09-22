/**
 * JSON-LD for the pages that have something true to say in it.
 *
 * The rule here is narrower than "what schema.org allows": mark up only what
 * a reader can already see on the page, and only what the school has
 * confirmed in writing. Google demotes structured data that disagrees with
 * the visible page, and design/CONTENT-FROM-SCHOOL.md lists several things
 * about this site that look like facts and are not.
 *
 * Deliberately absent, and not to be added without a written source:
 *
 * - aggregateRating / review. There are no published testimonials with
 *   consent, and no rating of any kind exists. This is also the markup
 *   Google penalises most aggressively when it is invented.
 * - foundingDate on Alpha Girls. The 2020 date in the /about timeline is a
 *   reading that reconciles the figures, not a confirmation from the school.
 * - Any "first in Tanzania" or pioneer claim about aviation. The client's
 *   written feedback removed it from the site; it does not get to come back
 *   in a script tag where nobody proof-reads it.
 * - The homepage statistics. Only "3 schools" is confirmed.
 * - streetAddress and geo for the campuses. Not supplied — the outstanding
 *   list still has "Google Maps links per campus" on it. addressLocality is
 *   what a parent searching "schools in Mikocheni" matches on anyway, and it
 *   is on the page in visible text.
 *
 * Naming follows AGENTS.md: `name` is the ALPHA brand, `legalName` is ALFA
 * EDUCATION CENTRE, and the postal address belongs to the legal entity.
 */
import { SITE_URL, SITE_NAME, LEGAL_NAME, absoluteUrl } from "./seo";

export const ORG_ID = `${SITE_URL}/#organization`;

/** Confirmed on /contact, and the only phone and postal address the site has. */
const PHONE = "+255222775046";
const EMAIL = "info@alphaschools.ac.tz";

/** Only handles the school has confirmed. Facebook, X and LinkedIn are still outstanding. */
const SAME_AS = [
  "https://www.instagram.com/alphaschoolstz",
  "https://www.youtube.com/@alphaschoolstz",
];

type Campus = { locality: string; name: string; path: string };

const CAMPUSES: Record<string, Campus> = {
  "alpha-high": { locality: "Mikocheni", name: "Alpha High School", path: "/schools/alpha-high" },
  "alpha-girls": { locality: "Kunduchi", name: "Alpha Girls High School", path: "/schools/alpha-girls" },
  "nursery-primary": { locality: "Kunduchi", name: "Alpha Nursery & Primary School", path: "/schools/nursery-primary" },
};

function address(locality?: string) {
  return {
    "@type": "PostalAddress",
    ...(locality ? { addressLocality: locality } : {}),
    addressRegion: "Dar es Salaam",
    addressCountry: "TZ",
  };
}

/**
 * The group. One per site, on the homepage, and the node every School points
 * back to. foundingDate is 2007, which is when Alpha High opened and is the
 * date the /about timeline and the "since 2007" line on /alumni both use.
 */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/og/alpha-logo.png`,
    image: `${SITE_URL}/og/alpha-schools.jpg`,
    foundingDate: "2007",
    email: EMAIL,
    telephone: PHONE,
    address: {
      "@type": "PostalAddress",
      postOfficeBoxNumber: "35136",
      addressLocality: "Dar es Salaam",
      addressCountry: "TZ",
    },
    areaServed: { "@type": "City", name: "Dar es Salaam" },
    sameAs: SAME_AS,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "admissions",
      telephone: PHONE,
      email: EMAIL,
      areaServed: "TZ",
      availableLanguage: ["en", "sw"],
    },
  };
}

/**
 * One school. The campus neighbourhood is the point of this: it is what a
 * parent types, and it is stated in visible text on the same page.
 */
export function schoolLd(slug: keyof typeof CAMPUSES, description: string) {
  const campus = CAMPUSES[slug];
  return {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": `${absoluteUrl(campus.path)}#school`,
    name: campus.name,
    description,
    url: absoluteUrl(campus.path),
    telephone: PHONE,
    email: EMAIL,
    address: address(campus.locality),
    areaServed: { "@type": "City", name: "Dar es Salaam" },
    parentOrganization: { "@id": ORG_ID },
  };
}

export type EventLdInput = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
};

/**
 * Published events only, and only ones whose date parses. The caller passes
 * what the loader already fetched, which is filtered to published rows in
 * getAllEvents; a row with a date the browser cannot read is dropped rather
 * than emitted with a broken startDate.
 *
 * eventAttendanceMode and eventStatus are the two fields Google warns about
 * omitting. location falls back to the campus city when a row has none,
 * because Event.location is required and "Dar es Salaam" is true of every
 * event this school runs.
 */
export function eventsLd(events: Array<EventLdInput>) {
  return events
    .filter((e) => !Number.isNaN(new Date(e.event_date).getTime()))
    .map((e) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      "@id": `${absoluteUrl("/events")}#${e.id}`,
      name: e.title,
      startDate: e.event_date,
      ...(e.description ? { description: e.description } : {}),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: e.location ?? "Alpha Schools",
        address: address(e.location ?? undefined),
      },
      organizer: { "@id": ORG_ID },
    }));
}

/**
 * Home > This page. There is no /schools index route — it 404s — so no
 * intermediate crumb is invented for one.
 */
export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** A WebSite node so the brand name resolves as a site, not just a page. */
export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}
