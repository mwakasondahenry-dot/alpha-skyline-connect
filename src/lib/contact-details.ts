/**
 * The school's name, address and phone, in one place.
 *
 * Local ranking depends on these matching wherever they appear — the footer,
 * /contact, and the JSON-LD — and they had drifted into being written out by
 * hand in each. A phone number that reads "+255 (0)22 277 5046" on one page
 * and "+255 22 277 5046" on another is two businesses as far as a search
 * engine is concerned.
 *
 * Naming follows AGENTS.md. The postal address belongs to the legal entity,
 * ALFA EDUCATION CENTRE, so LEGAL_NAME is what sits above it; the brand,
 * ALPHA, is what the rest of the footer says.
 */

/** As a reader should see it. */
export const PHONE_DISPLAY = "+255 (0)22 277 5046";

/** E.164, for tel: links and for schema.org. Same number, no punctuation. */
export const PHONE_E164 = "+255222775046";

export const EMAIL = "info@alphaschools.ac.tz";

export const OFFICE_HOURS = "Mon – Fri · 7:30 – 16:30";

export const POSTAL_ADDRESS = {
  poBox: "P.O. Box 35136",
  locality: "Dar es Salaam",
  country: "Tanzania",
} as const;

/**
 * Which neighbourhood each school is in. This is the local-search surface:
 * a parent types "secondary school Mikocheni", and the word has to be in the
 * visible text of the page that answers it, not only in the markup.
 */
export const CAMPUSES = [
  { locality: "Mikocheni", schools: "Alpha High" },
  { locality: "Kunduchi", schools: "Alpha Girls · Nursery & Primary" },
] as const;
