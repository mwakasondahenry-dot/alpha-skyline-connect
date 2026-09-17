/**
 * The alumni story: its limits, prompts, and the checks each wizard step runs.
 *
 * Pure. The wizard runs a step's check before Next; the server runs all of
 * them again through validateStory, which is the one that counts.
 */
import { ALUMNI_SCHOOLS, type AlumniSchool } from "@/lib/invites/contacts";
import { CODE_PATTERN } from "@/lib/invites/token";

/** The exact wording a submitter agrees to. Stored with every submission. */
export const CONSENT_TEXT =
  "I agree that Alpha Schools may publish my name, message and photo on its " +
  "public website. I understand I can request removal at any time by " +
  "contacting the school.";

export const MESSAGE_MAX = 400;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PENDING_BUCKET = "alumni-pending";
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
export const NAME_MAX = 120;
export const ROLE_MAX = 120;
export const COMPANY_MAX = 120;
export const PLACE_MAX = 80;
export const PROMPT_MAX = 600;

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
  company: string;
  cityCountry: string;
  answers: Record<PromptKey, string>;
  quote: string;
  consent: boolean;
};

export const EMPTY_DRAFT: StoryDraft = {
  fullName: "",
  schoolSlug: "",
  gradYear: "",
  role: "",
  company: "",
  cityCountry: "",
  answers: { gave_you: "", moment: "", advice: "" },
  quote: "",
  consent: false,
};

export type StoryInput = {
  code: string | null;
  fullName: string;
  schoolSlug: AlumniSchool;
  gradYear: number;
  role: string;
  company: string | null;
  cityCountry: string | null;
  answers: Partial<Record<PromptKey, string>> | null;
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

export function checkNow(d: StoryDraft): string | null {
  const role = d.role.trim();
  if (!role) return "Please tell us what you do now.";
  if (role.length > ROLE_MAX) return "That role is too long.";
  if (d.company.trim().length > COMPANY_MAX) return "That company name is too long.";
  if (d.cityCountry.trim().length > PLACE_MAX) return "That place name is too long.";
  return null;
}

export function checkPrompts(d: StoryDraft): string | null {
  const tooLong = STORY_PROMPTS.some((p) => d.answers[p.key].trim().length > PROMPT_MAX);
  return tooLong ? `Please keep each answer under ${PROMPT_MAX} characters.` : null;
}

export function checkQuote(d: StoryDraft): string | null {
  const quote = d.quote.trim();
  if (!quote) return "Please write a sentence or two for your quote.";
  if (quote.length > MESSAGE_MAX) return `Please keep your quote under ${MESSAGE_MAX} characters.`;
  return null;
}

export function checkConsent(d: StoryDraft): string | null {
  return d.consent ? null : "Please agree to the consent statement to submit.";
}

export function draftToForm(d: StoryDraft, code: string | null, photo: File | null): FormData {
  const form = new FormData();
  if (code) form.set("code", code);
  form.set("full_name", d.fullName);
  form.set("school", d.schoolSlug);
  form.set("grad_year", d.gradYear);
  form.set("role", d.role);
  form.set("company", d.company);
  form.set("city_country", d.cityCountry);
  for (const p of STORY_PROMPTS) form.set(p.key, d.answers[p.key]);
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
    company: text(form, "company"),
    cityCountry: text(form, "city_country"),
    answers: {
      gave_you: text(form, "gave_you"),
      moment: text(form, "moment"),
      advice: text(form, "advice"),
    },
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
  const problem =
    checkAbout(d, thisYear) ?? checkNow(d) ?? checkPrompts(d) ?? checkQuote(d) ?? checkConsent(d);
  if (problem) throw new StoryError(problem);

  const answers: Partial<Record<PromptKey, string>> = {};
  for (const p of STORY_PROMPTS) {
    const a = d.answers[p.key].trim();
    if (a) answers[p.key] = a;
  }

  return {
    code: codeText || null,
    fullName: d.fullName.trim(),
    schoolSlug: d.schoolSlug as AlumniSchool,
    gradYear: Number(d.gradYear.trim()),
    role: d.role.trim(),
    company: d.company.trim() || null,
    cityCountry: d.cityCountry.trim() || null,
    answers: Object.keys(answers).length ? answers : null,
    quote: d.quote.trim(),
  };
}
