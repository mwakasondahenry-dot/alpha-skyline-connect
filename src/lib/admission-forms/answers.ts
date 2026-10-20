// Rules for what a parent types into an admission form: saved drafts, the
// download gate, gentle field checks and PDF-safe text. Everything here is
// pure; the caller passes `now`.

import type { Field, FormDef, FormId } from "./forms";

export type Answers = Record<string, string>;
export type Draft = { formId: FormId; savedAt: number; answers: Answers };

export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function draftKey(id: FormId): string {
  return `alpha-admission-draft:${id}`;
}

/** The answers of a usable draft for this form, or null if it is missing, corrupt, stale or for another form. */
function parseDraft(raw: string | null, id: FormId, now: number): Answers | null {
  if (!raw) return null;
  try {
    const draft: unknown = JSON.parse(raw);
    if (typeof draft !== "object" || draft === null) return null;
    const { formId, savedAt, answers } = draft as Record<string, unknown>;
    if (formId !== id || typeof savedAt !== "number") return null;
    if (now - savedAt > DRAFT_TTL_MS) return null;
    if (typeof answers !== "object" || answers === null) return null;
    const clean: Answers = {};
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === "string") clean[key] = value;
    }
    return clean;
  } catch {
    return null;
  }
}

/** The saved answers for this form, or {} if the draft is missing, corrupt, stale or for another form. */
export function readDraft(raw: string | null, id: FormId, now: number): Answers {
  return parseDraft(raw, id, now) ?? {};
}

/**
 * True when something is stored but readDraft would not use it (expired,
 * corrupt, or for another form), so it should be removed. A valid draft with
 * no answers is not stale; nothing stored is not stale.
 */
export function isStaleDraft(raw: string | null, id: FormId, now: number): boolean {
  return raw !== null && parseDraft(raw, id, now) === null;
}

/** Only the pupil's names are required to download. */
export function downloadProblem(a: Answers): string | null {
  if (!a.firstName?.trim() || !a.familyName?.trim()) {
    return "Enter the pupil's first name and family name to download.";
  }
  return null;
}

/** A gentle hint about a value that looks wrong; never blocks anything. */
export function softProblem(field: Field, value: string, now: Date): string | null {
  const v = value.trim();
  if (!v) return null;

  if (field.kind === "phone") {
    return v.replace(/\D/g, "").length < 9 ? "Check this phone number — it looks too short." : null;
  }

  if (field.kind === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Check this email address.";
  }

  if (field.kind === "date") {
    const date = new Date(`${v}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return null;
    if (date.getTime() > now.getTime()) return "This date is in the future.";
    const oldest = new Date(now.getTime());
    oldest.setUTCFullYear(oldest.getUTCFullYear() - 25);
    return date.getTime() < oldest.getTime() ? "Check the year." : null;
  }

  return null;
}

function isPdfSafe(code: number): boolean {
  return (
    (code >= 0x20 && code <= 0x7e) ||
    (code >= 0xa0 && code <= 0xff) ||
    "‘’“”–—…•€".includes(String.fromCodePoint(code))
  );
}

/** Keeps what the standard PDF fonts can draw; other letters fall back to their base letter, else are dropped. */
export function sanitizeForPdf(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0) as number;
    if (isPdfSafe(code)) {
      out += ch;
      continue;
    }
    const base = ch.normalize("NFKD").codePointAt(0) as number;
    if (base !== code && isPdfSafe(base)) out += String.fromCodePoint(base);
  }
  return out;
}

function slug(s: string): string {
  return s
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function pdfFileName(form: FormDef, a: Answers): string {
  const kind = form.kind === "form-1" ? "Form-I-2027" : "Transfer";
  const parts = [slug(form.shortName), kind, slug(a.firstName ?? ""), slug(a.familyName ?? "")];
  return `${parts.filter(Boolean).join("-")}.pdf`;
}
