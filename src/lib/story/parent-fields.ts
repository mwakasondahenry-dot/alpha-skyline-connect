/**
 * The parent story: the one question, the checks, and the server-side
 * validation. Limits and the photo rules are shared with the alumni story.
 *
 * Cut down on 2026-10-22 with the alumni form: one screen, one published
 * question, a minute to complete.
 */
import { ALUMNI_SCHOOLS, type AlumniSchool } from "@/lib/invites/contacts";
import { CODE_PATTERN } from "@/lib/invites/token";
import { NAME_MAX, StoryError, checkConsent, checkQuote } from "./fields";

/**
 * The wording a parent agrees to. It names the school their child attends,
 * because that is published beside the quote as "Parent, <school>", and a
 * consent that did not mention it would not cover it.
 */
export const PARENT_CONSENT_TEXT =
  "I agree that Alpha Schools may publish my name, my message, my photo and " +
  "the school my child attends on its public website. I understand I can " +
  "request removal at any time by contacting the school.";

/** The one question a parent answers. The answer is the published quote. */
export const PARENT_QUESTION = "What has Alpha done for your child?";

/**
 * Labels for the unpublished prompts the old wizard asked. No form asks
 * them any more; the admin queue still uses these to label answers on
 * submissions that arrived before 2026-10-22.
 */
export type ParentPromptKey = "chose_alpha" | "changed" | "advice_parents";
export const PARENT_PROMPTS: readonly { key: ParentPromptKey; label: string }[] = [
  { key: "chose_alpha", label: "Why did you choose Alpha?" },
  { key: "changed", label: "What has changed for your child since joining?" },
  { key: "advice_parents", label: "What would you tell a parent deciding now?" },
];

export type ParentDraft = {
  fullName: string;
  schoolSlug: string;
  quote: string;
  consent: boolean;
};

export const EMPTY_PARENT_DRAFT: ParentDraft = {
  fullName: "",
  schoolSlug: "",
  quote: "",
  consent: false,
};

export type ParentStoryInput = {
  code: string | null;
  fullName: string;
  schoolSlug: AlumniSchool;
  relationship: string;
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

/** Every check, in the order the fields appear on the form. */
export function checkParentStory(d: ParentDraft): string | null {
  return checkParentAbout(d) ?? checkQuote(d) ?? checkConsent(d);
}

export function parentDraftToForm(
  d: ParentDraft,
  code: string | null,
  photo: File | null,
): FormData {
  const form = new FormData();
  form.set("audience", "parent");
  if (code) form.set("code", code);
  form.set("full_name", d.fullName);
  form.set("school", d.schoolSlug);
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
    quote: text(form, "quote"),
    consent: text(form, "consent") === "yes",
  };

  const problem = checkParentStory(d);
  if (problem) throw new StoryError(problem);

  return {
    code: codeText || null,
    fullName: d.fullName.trim(),
    schoolSlug: d.schoolSlug as AlumniSchool,
    relationship: `Parent, ${schoolLabel(d.schoolSlug)}`,
    quote: d.quote.trim(),
  };
}
