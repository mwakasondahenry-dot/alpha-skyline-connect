/**
 * The parent story: prompts, the per-step checks, and the server-side
 * validation. Limits and consent wording are shared with the alumni story.
 */
import { ALUMNI_SCHOOLS, type AlumniSchool } from "@/lib/invites/contacts";
import { CODE_PATTERN } from "@/lib/invites/token";
import { NAME_MAX, PROMPT_MAX, StoryError, checkConsent, checkQuote } from "./fields";

export type ParentPromptKey = "chose_alpha" | "changed" | "advice_parents";

export const PARENT_PROMPTS: readonly { key: ParentPromptKey; label: string }[] = [
  { key: "chose_alpha", label: "Why did you choose Alpha?" },
  { key: "changed", label: "What has changed for your child since joining?" },
  { key: "advice_parents", label: "What would you tell a parent deciding now?" },
];

export type ParentDraft = {
  fullName: string;
  schoolSlug: string;
  answers: Record<ParentPromptKey, string>;
  quote: string;
  consent: boolean;
};

export const EMPTY_PARENT_DRAFT: ParentDraft = {
  fullName: "",
  schoolSlug: "",
  answers: { chose_alpha: "", changed: "", advice_parents: "" },
  quote: "",
  consent: false,
};

export type ParentStoryInput = {
  code: string | null;
  fullName: string;
  schoolSlug: AlumniSchool;
  relationship: string;
  answers: Partial<Record<ParentPromptKey, string>> | null;
  quote: string;
};

function schoolLabel(slug: string): string | null {
  return ALUMNI_SCHOOLS.find((s) => s.value === slug)?.label ?? null;
}

export function checkParentAbout(d: ParentDraft): string | null {
  const name = d.fullName.trim();
  if (!name) return "Please enter your name.";
  if (name.length > NAME_MAX) return "That name is too long.";
  if (!schoolLabel(d.schoolSlug)) return "Please choose your child's school.";
  return null;
}

export function checkParentPrompts(d: ParentDraft): string | null {
  const tooLong = PARENT_PROMPTS.some((p) => d.answers[p.key].trim().length > PROMPT_MAX);
  return tooLong ? `Please keep each answer under ${PROMPT_MAX} characters.` : null;
}

export function parentDraftToForm(d: ParentDraft, code: string | null, photo: File | null): FormData {
  const form = new FormData();
  form.set("audience", "parent");
  if (code) form.set("code", code);
  form.set("full_name", d.fullName);
  form.set("school", d.schoolSlug);
  for (const p of PARENT_PROMPTS) form.set(p.key, d.answers[p.key]);
  form.set("quote", d.quote);
  form.set("consent", d.consent ? "yes" : "no");
  if (photo) form.set("photo", photo);
  return form;
}

function text(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

export function validateParentStory(form: FormData): ParentStoryInput {
  const codeText = text(form, "code").trim();
  if (codeText && !CODE_PATTERN.test(codeText)) {
    throw new StoryError("This link isn't valid any more.");
  }

  const d: ParentDraft = {
    fullName: text(form, "full_name"),
    schoolSlug: text(form, "school"),
    answers: {
      chose_alpha: text(form, "chose_alpha"),
      changed: text(form, "changed"),
      advice_parents: text(form, "advice_parents"),
    },
    quote: text(form, "quote"),
    consent: text(form, "consent") === "yes",
  };

  const problem = checkParentAbout(d) ?? checkParentPrompts(d) ?? checkQuote(d) ?? checkConsent(d);
  if (problem) throw new StoryError(problem);

  const answers: Partial<Record<ParentPromptKey, string>> = {};
  for (const p of PARENT_PROMPTS) {
    const a = d.answers[p.key].trim();
    if (a) answers[p.key] = a;
  }

  return {
    code: codeText || null,
    fullName: d.fullName.trim(),
    schoolSlug: d.schoolSlug as AlumniSchool,
    relationship: `Parent, ${schoolLabel(d.schoolSlug)}`,
    answers: Object.keys(answers).length ? answers : null,
    quote: d.quote.trim(),
  };
}
