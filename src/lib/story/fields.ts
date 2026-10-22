/**
 * The alumni story: its limits, the one question, and the checks the form
 * runs before Send.
 *
 * Pure. The form runs the checks before Send; the server runs all of them
 * again through validateStory, which is the one that counts.
 *
 * Cut down on 2026-10-22 at the owner's request: the six-step wizard with
 * three unpublished "story" prompts took five minutes, and nobody finished
 * it. The form is now one screen a former student completes in a minute,
 * and everything it asks is published beside their name.
 */
import { ALUMNI_SCHOOLS, type AlumniSchool } from "@/lib/invites/contacts";
import { CODE_PATTERN } from "@/lib/invites/token";

/** The exact wording a submitter agrees to. Stored with every submission. */
export const CONSENT_TEXT =
  "I agree that Alpha Schools may publish my name, message and photo on its " +
  "public website. I understand I can request removal at any time by " +
  "contacting the school.";

/** The one question a former student answers. The answer is the published quote. */
export const ALUMNI_QUESTION = "What did Alpha give you that you still use today?";

export const MESSAGE_MAX = 400;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PENDING_BUCKET = "alumni-pending";
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
export const NAME_MAX = 120;
export const ROLE_MAX = 120;
export const EMAIL_MAX = 160;
export const PHONE_MAX = 32;

/**
 * Contact details the alumni form asks for, so the school can invite the
 * person into the alumni platform and digital network it is building.
 * Required since 2026-10-22, never published, stored in the submission's
 * `answers` beside nothing else; the admin queue labels them with these.
 */
export const CONTACT_FIELDS: readonly { key: "email" | "phone"; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone / WhatsApp" },
];

/**
 * Labels for the unpublished prompts the old wizard asked. No form asks
 * them any more; the admin queue still uses these to label answers on
 * submissions that arrived before 2026-10-22.
 */
export type PromptKey = "gave_you" | "moment" | "advice";
export const STORY_PROMPTS: readonly { key: PromptKey; label: string }[] = [
  { key: "gave_you", label: "What did Alpha give you that you still use today?" },
  { key: "moment", label: "A teacher or moment you remember" },
  { key: "advice", label: "Advice for current students" },
];

export type StoryDraft = {
  fullName: string;
  schoolSlug: string;
  gradYear: string;
  role: string;
  email: string;
  phone: string;
  quote: string;
  consent: boolean;
};

export const EMPTY_DRAFT: StoryDraft = {
  fullName: "",
  schoolSlug: "",
  gradYear: "",
  role: "",
  email: "",
  phone: "",
  quote: "",
  consent: false,
};

export type StoryInput = {
  code: string | null;
  fullName: string;
  schoolSlug: AlumniSchool;
  gradYear: number;
  role: string;
  /** Email and phone. Not published. */
  contact: { email: string; phone: string };
  quote: string;
};

/** A message meant for the person filling in the form. Only these reach the browser. */
export class StoryError extends Error {}

function isAlumniSchool(v: string): v is AlumniSchool {
  return ALUMNI_SCHOOLS.some((s) => s.value === v);
}

export function checkAbout(d: StoryDraft, thisYear = new Date().getFullYear()): string | null {
  const name = d.fullName.trim();
  if (!name) return "Please enter your name.";
  if (name.length > NAME_MAX) return "That name is too long.";
  if (!isAlumniSchool(d.schoolSlug)) return "Please choose the school you attended.";
  const year = /^\d{4}$/.test(d.gradYear.trim()) ? Number(d.gradYear.trim()) : Number.NaN;
  if (!(year >= 1960 && year <= thisYear + 1)) {
    return "Please enter the year you finished, e.g. 2018.";
  }
  return null;
}

export function checkNow(d: { role: string }): string | null {
  const role = d.role.trim();
  if (!role) return "Please tell us what you do now.";
  if (role.length > ROLE_MAX) return "That is too long for one line.";
  return null;
}

/** Both required: they are how the alumni network reaches the person. */
export function checkContact(d: { email: string; phone: string }): string | null {
  const email = d.email.trim();
  if (!email) return "Please enter your email address.";
  if (email.length > EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "That email address doesn't look right.";
  }
  const phone = d.phone.trim();
  if (!phone) return "Please enter your phone number.";
  if (phone.length > PHONE_MAX || (phone.match(/\d/g) ?? []).length < 7) {
    return "That phone number doesn't look right.";
  }
  return null;
}

export function checkQuote(d: { quote: string }): string | null {
  const quote = d.quote.trim();
  if (!quote) return "Please answer the question in a sentence or two.";
  if (quote.length > MESSAGE_MAX) return `Please keep your answer under ${MESSAGE_MAX} characters.`;
  return null;
}

export function checkConsent(d: { consent: boolean }): string | null {
  return d.consent ? null : "Please tick the box to let us publish your answer.";
}

/** Every check, in the order the fields appear on the form. */
export function checkStory(d: StoryDraft, thisYear = new Date().getFullYear()): string | null {
  return (
    checkAbout(d, thisYear) ?? checkNow(d) ?? checkContact(d) ?? checkQuote(d) ?? checkConsent(d)
  );
}

export function draftToForm(d: StoryDraft, code: string | null, photo: File | null): FormData {
  const form = new FormData();
  if (code) form.set("code", code);
  form.set("full_name", d.fullName);
  form.set("school", d.schoolSlug);
  form.set("grad_year", d.gradYear);
  form.set("role", d.role);
  form.set("email", d.email);
  form.set("phone", d.phone);
  form.set("quote", d.quote);
  form.set("consent", d.consent ? "yes" : "no");
  if (photo) form.set("photo", photo);
  return form;
}

function text(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

function formToDraft(form: FormData): StoryDraft {
  return {
    fullName: text(form, "full_name"),
    schoolSlug: text(form, "school"),
    gradYear: text(form, "grad_year"),
    role: text(form, "role"),
    email: text(form, "email"),
    phone: text(form, "phone"),
    quote: text(form, "quote"),
    consent: text(form, "consent") === "yes",
  };
}

export function validateStory(form: FormData, thisYear = new Date().getFullYear()): StoryInput {
  const codeText = text(form, "code").trim();
  if (codeText && !CODE_PATTERN.test(codeText)) {
    throw new StoryError("This link isn't valid any more.");
  }

  const d = formToDraft(form);
  const problem = checkStory(d, thisYear);
  if (problem) throw new StoryError(problem);

  return {
    code: codeText || null,
    fullName: d.fullName.trim(),
    schoolSlug: d.schoolSlug as AlumniSchool,
    gradYear: Number(d.gradYear.trim()),
    role: d.role.trim(),
    contact: { email: d.email.trim(), phone: d.phone.trim() },
    quote: d.quote.trim(),
  };
}
