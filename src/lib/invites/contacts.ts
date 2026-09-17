/**
 * Contact rows, whichever way they arrive (form, pasted list, CSV).
 *
 * Pure, so the same rules run in the browser for the preview and on the
 * server before anything is written.
 */
import type { SchoolSlug } from "@/integrations/alpha-supabase/types";
import { normalizeTzPhone } from "./phone";

export const MAX_CONTACTS = 500;
const NAME_MAX = 120;
const EMAIL_MAX = 254;

export type AlumniSchool = Exclude<SchoolSlug, "group-wide">;

export const ALUMNI_SCHOOLS: { value: AlumniSchool; label: string }[] = [
  { value: "alpha-high", label: "Alpha High" },
  { value: "alpha-girls", label: "Alpha Girls" },
  { value: "nursery-primary", label: "Nursery & Primary" },
];

export type ContactFields = {
  name: string;
  phone: string;
  email?: string;
  school?: string;
  year?: string;
};

export type RawContact = ContactFields & { line: number; raw: string };

export type InviteDraft = {
  fullName: string;
  phone: string;
  email: string | null;
  schoolSlug: AlumniSchool | null;
  gradYear: number | null;
};

export type RejectedContact = { line: number; raw: string; reason: string };

export type ContactBatch = {
  valid: (InviteDraft & { line: number; raw: string })[];
  invalid: RejectedContact[];
  duplicates: RejectedContact[];
};

/** Loose match on how people write the school names. "girls" is checked
 *  first so "Alpha Girls High" is not read as Alpha High. */
export function schoolFromText(text: string): AlumniSchool | null | "invalid" {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (t.includes("girls")) return "alpha-girls";
  if (t.includes("high")) return "alpha-high";
  if (t.includes("nursery") || t.includes("primary")) return "nursery-primary";
  return "invalid";
}

export function validateContact(
  c: ContactFields,
  thisYear = new Date().getFullYear(),
): { ok: true; draft: InviteDraft } | { ok: false; reason: string } {
  const fullName = c.name.trim().replace(/\s+/g, " ");
  if (!fullName) return { ok: false, reason: "Name is missing." };
  if (fullName.length > NAME_MAX) return { ok: false, reason: "Name is too long." };

  const phone = normalizeTzPhone(c.phone);
  if (!phone.ok) return phone;

  const email = (c.email ?? "").trim().toLowerCase();
  if (email && (email.length > EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return { ok: false, reason: "Email address doesn't look right." };
  }

  const school = schoolFromText(c.school ?? "");
  if (school === "invalid") {
    return { ok: false, reason: "School should be Alpha High, Alpha Girls or Nursery & Primary." };
  }

  const yearText = (c.year ?? "").trim();
  let gradYear: number | null = null;
  if (yearText) {
    const n = /^\d{4}$/.test(yearText) ? Number(yearText) : Number.NaN;
    if (!(n >= 1960 && n <= thisYear + 1)) {
      return { ok: false, reason: `Year should be between 1960 and ${thisYear + 1}.` };
    }
    gradYear = n;
  }

  return {
    ok: true,
    draft: { fullName, phone: phone.phone, email: email || null, schoolSlug: school, gradYear },
  };
}

export function buildBatch(rows: RawContact[], thisYear = new Date().getFullYear()): ContactBatch {
  if (rows.length > MAX_CONTACTS) {
    throw new Error(`Up to ${MAX_CONTACTS} people at a time — this list has ${rows.length}.`);
  }
  const batch: ContactBatch = { valid: [], invalid: [], duplicates: [] };
  const firstLineByPhone = new Map<string, number>();

  for (const r of rows) {
    const result = validateContact(r, thisYear);
    if (!result.ok) {
      batch.invalid.push({ line: r.line, raw: r.raw, reason: result.reason });
      continue;
    }
    const seenAt = firstLineByPhone.get(result.draft.phone);
    if (seenAt !== undefined) {
      batch.duplicates.push({ line: r.line, raw: r.raw, reason: `Same phone number as line ${seenAt}.` });
      continue;
    }
    firstLineByPhone.set(result.draft.phone, r.line);
    batch.valid.push({ ...result.draft, line: r.line, raw: r.raw });
  }
  return batch;
}
