/**
 * What the Stories screens show, as pure functions: which stories sit in each
 * tab and in what order, which buttons a story's action bar offers, the
 * sentence an outcome line says, and the edit form's values and checks.
 *
 * Kept free of React and Supabase so every rule here is unit tested; the
 * components in src/components/admin/stories only render what these return.
 */
import type { AdminButtonVariant } from "@/components/admin/kit/button-class";
import type { AdminStory, StoryEdit } from "@/lib/admin/stories-data";
import { actionsFor, type StoryAction, type StoryStatus } from "@/lib/admin/story-status";
import { formatAdminDate } from "@/lib/admin/format";

export const STORY_TABS: readonly StoryStatus[] = ["waiting", "live", "hidden", "declined"];

export function isStoryTab(v: unknown): v is StoryStatus {
  return typeof v === "string" && (STORY_TABS as readonly string[]).includes(v);
}

export function tabCounts(stories: AdminStory[]): Record<StoryStatus, number> {
  const counts: Record<StoryStatus, number> = { waiting: 0, live: 0, hidden: 0, declined: 0 };
  for (const s of stories) if (s.status in counts) counts[s.status]++;
  return counts;
}

/** When the story last changed state, or when it arrived if it never has. */
function decidedOrCreated(s: AdminStory): string {
  return s.decided_at ?? s.created_at;
}

const newestFirst = (a: AdminStory, b: AdminStory) =>
  decidedOrCreated(b).localeCompare(decidedOrCreated(a));

/**
 * One tab's stories. Waiting is oldest first, a fair queue. Live puts the
 * stories featured on the home page first, in their home-page order, then the
 * rest newest first. Hidden and Declined are newest first.
 */
export function storiesForTab(
  stories: AdminStory[],
  tab: StoryStatus,
): { featured: AdminStory[]; rest: AdminStory[] } {
  const inTab = stories.filter((s) => s.status === tab);
  if (tab === "waiting") {
    return {
      featured: [],
      rest: inTab.slice().sort((a, b) => a.created_at.localeCompare(b.created_at)),
    };
  }
  if (tab === "live") {
    const featured = inTab
      .filter((s) => s.featured)
      .sort(
        (a, b) =>
          (a.featured_order ?? Number.MAX_SAFE_INTEGER) -
            (b.featured_order ?? Number.MAX_SAFE_INTEGER) || newestFirst(a, b),
      );
    return { featured, rest: inTab.filter((s) => !s.featured).sort(newestFirst) };
  }
  return { featured: [], rest: inTab.slice().sort(newestFirst) };
}

/** The place a newly featured story takes: after the last one. */
export function nextFeaturedOrder(stories: AdminStory[]): number {
  let max = 0;
  for (const s of stories) {
    if (s.featured && s.featured_order != null && s.featured_order > max) max = s.featured_order;
  }
  return max + 1;
}

type MoveAction = "publish" | "decline" | "restore" | "hide" | "show";

/**
 * Fields a state move sets beside the status. Hiding a story takes it off the
 * home page too, in the same guarded update, so a hidden story is never left
 * featured.
 */
export function moveExtra(action: MoveAction): Record<string, unknown> {
  return action === "hide" ? { featured: false, featured_order: null } : {};
}

/** Fields the Undo of a move puts back: Undo of Hide restores the featured place it had. */
export function undoMoveExtra(
  action: MoveAction,
  before: Pick<AdminStory, "featured" | "featured_order">,
): Record<string, unknown> {
  return action === "hide"
    ? { featured: before.featured, featured_order: before.featured_order }
    : {};
}

/**
 * The place an unfeatured story takes again on Undo: its old place while no
 * other featured story has taken it, otherwise after the last one.
 */
export function refeatureOrder(id: string, previous: number | null, stories: AdminStory[]): number {
  const taken =
    previous != null &&
    stories.some((s) => s.id !== id && s.featured && s.featured_order === previous);
  return previous != null && !taken
    ? previous
    : nextFeaturedOrder(stories.filter((s) => s.id !== id));
}

/**
 * The photo to show for a story: the private submitted photo (by its signed
 * URL) while there is one, otherwise the public photo. Null while the signed
 * URL is still on its way.
 */
export function shownPhoto(story: AdminStory, signed: Record<string, string>): string | null {
  if (story.pending_photo_path) return signed[story.pending_photo_path] ?? null;
  return story.photo_url;
}

export type BarActionKind = StoryAction | "feature" | "invite-again";

export type BarAction = {
  kind: BarActionKind;
  label: string;
  variant: AdminButtonVariant;
  /** For the Feature on home toggle: whether it is on. */
  pressed?: boolean;
};

const ACTION_BUTTON: Record<StoryAction, Omit<BarAction, "kind">> = {
  publish: { label: "Publish", variant: "primary" },
  decline: { label: "Decline", variant: "secondary" },
  restore: { label: "Restore", variant: "secondary" },
  hide: { label: "Hide from site", variant: "secondary" },
  show: { label: "Show on site", variant: "primary" },
  delete: { label: "Delete permanently", variant: "danger" },
};

/**
 * The sticky action bar's buttons, in order: the state's moves from
 * actionsFor(), with the Feature on home toggle first on a live story and
 * Invite again before Delete on a declined story that came from an invite.
 */
export function barActions(story: AdminStory): BarAction[] {
  const out: BarAction[] = [];
  if (story.status === "live") {
    out.push({
      kind: "feature",
      label: "Feature on home",
      variant: "secondary",
      pressed: story.featured,
    });
  }
  for (const action of actionsFor(story.status)) {
    if (action === "delete" && story.status === "declined" && story.invite_id) {
      out.push({ kind: "invite-again", label: "Invite again", variant: "secondary" });
    }
    out.push({ kind: action, ...ACTION_BUTTON[action] });
  }
  return out;
}

/** "Keith's", from the first name. */
export function possessive(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first ? `${first}'s` : "this person's";
}

const CACHE_WINDOW = "within about 5 minutes";

export type OutcomeKind =
  | "publish"
  | "decline"
  | "restore"
  | "hide"
  | "show"
  | "delete"
  | "feature"
  | "unfeature"
  | "save"
  | "create";

/** The outcome line after an action, in one plain sentence or two. */
export function outcomeText(kind: OutcomeKind, fullName: string): string {
  const p = possessive(fullName);
  switch (kind) {
    case "publish":
      return `Published ${p} story. It will appear on the website ${CACHE_WINDOW}.`;
    case "decline":
      return `Declined ${p} story. It is kept under Declined.`;
    case "restore":
      return `Moved ${p} story back to Waiting.`;
    case "hide":
      return `Took ${p} story off the website. It will be gone ${CACHE_WINDOW}.`;
    case "show":
      return `Put ${p} story back on the website. It will appear ${CACHE_WINDOW}.`;
    case "delete":
      return `Deleted ${p} story.`;
    case "feature":
      return `Featured ${p} story on the home page. It will lead "In their words" ${CACHE_WINDOW}.`;
    case "unfeature":
      return `${capitalise(p)} story is no longer featured on the home page.`;
    case "save":
      return `Saved the changes to ${p} story.`;
    case "create":
      return `Saved ${p} story under Hidden. Press Show on site when it is ready.`;
  }
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The card's second line (role and class) and its date line. */
export function cardLines(
  story: AdminStory,
  now: Date = new Date(),
): { role: string; date: string } {
  const role =
    story.grad_year != null
      ? [story.relationship, `Class of ${story.grad_year}`].filter(Boolean).join(" · ")
      : (story.relationship ?? "Parent");
  let date: string;
  switch (story.status) {
    case "waiting":
      date = `Sent ${formatAdminDate(story.created_at, now)}`;
      break;
    case "live":
      date = `Published ${formatAdminDate(decidedOrCreated(story), now)}`;
      break;
    case "hidden":
      date = story.decided_at
        ? `Hidden ${formatAdminDate(story.decided_at, now)}`
        : `Added ${formatAdminDate(story.created_at, now)}`;
      break;
    case "declined":
      date = `Declined ${formatAdminDate(decidedOrCreated(story), now)}`;
      break;
  }
  return { role, date };
}

/** The consent wording recorded when staff type in a story by hand. */
export const STAFF_CONSENT_TEXT = "This person agreed to have their words on the website.";

/** Where the story came from, for the private details. */
export function storySource(story: AdminStory): string {
  if (story.invite_id) return "Personal invite";
  if (story.answers && typeof story.answers.previous_invite_id === "string") {
    return "Personal invite (a new link has since been sent)";
  }
  if (story.consent_text === STAFF_CONSENT_TEXT) return "Typed in by staff";
  if (!story.consent_at) return "Added by staff";
  return "General link";
}

/* ------------------------------------------------------------------ *
 * The edit form
 * ------------------------------------------------------------------ */

export type Speaker = "parent" | "alumni";

export type StoryFormValues = {
  /** Explicit, so clearing a year can never move a story between sections. */
  speaker: Speaker | "";
  author_name: string;
  relationship: string;
  company: string;
  quote: string;
  /** Text while typing; only checked and converted for a former student. */
  grad_year: string;
  school_slug: string;
  /** New stories only: the person agreed to be on the website. */
  consent: boolean;
};

export const EMPTY_STORY_FORM: StoryFormValues = {
  speaker: "",
  author_name: "",
  relationship: "",
  company: "",
  quote: "",
  grad_year: "",
  school_slug: "group-wide",
  consent: false,
};

export const SCHOOL_OPTIONS: readonly string[] = [
  "group-wide",
  "nursery-primary",
  "alpha-high",
  "alpha-girls",
];

export function storyToForm(story: AdminStory): StoryFormValues {
  return {
    speaker: story.grad_year != null ? "alumni" : "parent",
    author_name: story.author_name,
    relationship: story.relationship ?? "",
    company: story.company ?? "",
    quote: story.quote,
    grad_year: story.grad_year != null ? String(story.grad_year) : "",
    school_slug: story.school_slug ?? "group-wide",
    consent: false,
  };
}

export type StoryFormErrors = Partial<Record<keyof StoryFormValues, string>>;

export function validateStoryForm(
  form: StoryFormValues,
  { isNew, thisYear = new Date().getFullYear() }: { isNew: boolean; thisYear?: number },
): StoryFormErrors {
  const errors: StoryFormErrors = {};
  if (form.speaker !== "parent" && form.speaker !== "alumni") {
    errors.speaker = "Choose who is speaking.";
  }
  if (!form.author_name.trim()) errors.author_name = "Enter the person's name.";
  if (!form.quote.trim()) errors.quote = "Enter their words.";
  if (!SCHOOL_OPTIONS.includes(form.school_slug)) errors.school_slug = "Choose a school.";
  if (form.speaker === "alumni") {
    const t = form.grad_year.trim();
    const year = /^\d{4}$/.test(t) ? Number(t) : Number.NaN;
    if (!(year >= 1960 && year <= thisYear + 1)) {
      errors.grad_year = "Enter the year they finished, for example 2018.";
    }
  }
  if (isNew && !form.consent) {
    errors.consent = "Tick the box to confirm this person agreed.";
  }
  return errors;
}

/** The story form's fields in the order it shows them. */
const FORM_ORDER: (keyof StoryFormValues)[] = [
  "speaker",
  "author_name",
  "quote",
  "relationship",
  "company",
  "grad_year",
  "school_slug",
  "consent",
];

/** The first field on screen with a problem, to move the cursor to; null when there is none. */
export function firstInvalidField(errors: StoryFormErrors): keyof StoryFormValues | null {
  return FORM_ORDER.find((k) => errors[k]) ?? null;
}

/** The fields to save. A parent never keeps a class year. Run validateStoryForm first. */
export function formToEdit(form: StoryFormValues): StoryEdit {
  const year = Number(form.grad_year.trim());
  return {
    author_name: form.author_name,
    relationship: form.relationship,
    company: form.company,
    quote: form.quote,
    grad_year: form.speaker === "alumni" && Number.isFinite(year) && year > 0 ? year : null,
    school_slug: form.school_slug,
  };
}

const COMPARED: (keyof StoryFormValues)[] = [
  "speaker",
  "author_name",
  "relationship",
  "company",
  "quote",
  "grad_year",
  "school_slug",
];

/** Has the form changed from the story it was opened on (or from empty, for a new one)? */
export function isFormDirty(form: StoryFormValues, story: AdminStory | null): boolean {
  const original = story ? storyToForm(story) : EMPTY_STORY_FORM;
  return COMPARED.some((k) => form[k] !== original[k]);
}
