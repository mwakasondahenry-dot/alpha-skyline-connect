# Parent Testimonial Invites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let staff invite parents (one, pasted list, CSV, or a general link) to a step-by-step testimonial form, alongside the existing alumni invites.

**Architecture:** Invites gain an `audience` (`alumni` | `parent`). Parent stories are ordinary parent-quote rows in `testimonials` (`grad_year` null, `relationship` "Parent, <school>"). A shared wizard frame drives both the alumni and the parent forms; the admin page shows one invite panel per audience.

**Tech Stack:** TanStack Start · React 19 · Tailwind v4 tokens · Supabase · Web Crypto · Vitest

**Spec:** `docs/superpowers/specs/2026-09-17-parent-testimonial-invites-design.md` (extends `docs/superpowers/specs/2026-09-17-alumni-testimonial-invites-design.md`). Read both.

## Global Constraints

- Work on branch `alumni-testimonial-invites` in the main checkout. Stage explicit paths only; never `git add -A` or `git add .` (untracked `.impeccable/` and `motion-audits/` belong to the user).
- **Every commit message:** a subject line, a blank line, then exactly `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` as the last line. Use two `-m` flags: `git commit -m "<subject>" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"`.
- Never force push, rebase, or amend a pushed commit. Do not push.
- A dev server runs at http://localhost:8080 from this checkout. Do not start or stop it. Never edit `.env.local`. Never run SQL against Supabase.
- Server-only helpers live under `src/lib/server/` (import-protected from the client bundle). Import them only from server-function handlers.
- `published` is written as a literal `false` on every submission path.
- Only messages from `StoryError`, `InviteError` and `StaffAuthError` reach the browser.
- Copy rules: no emoji, no eyebrow/kicker labels above headings, no em dashes in user-facing copy, no decorative icons on text buttons. Use only tokens from `src/styles.css` and the existing admin classes in `src/components/admin/invites/ui.tsx`.
- Brand: "Alpha Schools" in user-facing copy. No invented content.
- Mobile first: public screens must work at 375px without horizontal scrolling.
- Exact copy from the spec:
  - Parent WhatsApp: `Hello {first name}, Alpha Schools would love to share your experience as a parent on our website. It takes about 5 minutes: {link}`
  - Parent general share: `Are you a parent at Alpha? Alpha Schools would love to share your experience on our website. It takes about 5 minutes: {link}`
  - Parent prompts: `Why did you choose Alpha?`, `What has changed for your child since joining?`, `What would you tell a parent deciding now?`
  - Published attribution: `Parent, <school label>` (school labels from `ALUMNI_SCHOOLS`: "Alpha High", "Alpha Girls", "Nursery & Primary").
- `npm test` and `npm run build` pass at the end of every task. One task per commit unless a task says otherwise. `src/routeTree.gen.ts` is committed only in the task that adds routes.

## File Structure

**Created**

| File | Responsibility |
|---|---|
| `alpha_migration_parent_invites.sql` | `audience` column, per-audience phone uniqueness, audience-aware `submit_invited_story`. |
| `src/lib/invites/audience.ts` (+ test) | `Audience` type, `isAudience`, `formAudience`. |
| `src/lib/story/parent-fields.ts` (+ test) | Parent prompts, draft, checks, form builder, `validateParentStory`. |
| `src/components/alumni/story-wizard/wizard-frame.tsx` | Shared frame: step indicator, navigation, errors, submit, result cards. |
| `src/components/alumni/story-wizard/parent-steps.tsx` | Parent About and Experience steps, parent review. |
| `src/components/alumni/story-wizard/parent-story-wizard.tsx` | Parent wizard (steps + submit). |
| `src/routes/parents.story.index.tsx`, `src/routes/parents.story.$code.tsx` | Parent general and personal links. |

**Modified**

| File | Change |
|---|---|
| `src/integrations/alpha-supabase/types.ts` | `InviteAudience`; `audience` on `TestimonialInviteRow`; `answers` widened. |
| `src/lib/invites/token.ts` (+ test) | `storyPath(code, audience)`. |
| `src/lib/invites/whatsapp.ts` (+ test) | Parent messages. |
| `src/lib/story/fields.ts` | `checkQuote` / `checkConsent` accept any object with `quote` / `consent`. |
| `src/lib/alumni.functions.ts` | `submitStory` handles both audiences. |
| `src/lib/invites.functions.ts` | Audience on create / link / open. |
| `src/components/alumni/story-wizard/use-story-draft.ts` | Generic over the draft type. |
| `src/components/alumni/story-wizard/steps.tsx` | Quote/photo steps take plain props; shared `ReviewList` and `usePreviewUrl` exported. |
| `src/components/alumni/story-wizard/story-wizard.tsx` | Alumni wizard on the shared frame. |
| `src/components/alumni/story-wizard/story-shell.tsx` | Heading passed in. |
| `src/routes/alumni.story.index.tsx`, `src/routes/alumni.story.$code.tsx` | New shell/open props. |
| `src/components/admin/invites/*` | Audience-aware panel, forms, list. |
| `src/routes/admin.testimonials.tsx` | Two panels. |
| `src/components/admin/alumni-pending.tsx` | Queue shows parent submissions; audience tag; both prompt sets. |
| `README.md` | Parent links and migration order. |

---

### Task 1: Migration and types

**Files:**
- Create: `alpha_migration_parent_invites.sql`
- Modify: `src/integrations/alpha-supabase/types.ts`

**Interfaces:**
- Produces: column `testimonial_invites.audience`; unique `(audience, phone)`; RPC `submit_invited_story(p_token_hash text, p_audience text, p_author_name text, p_school_slug text, p_grad_year int, p_relationship text, p_company text, p_city_country text, p_answers jsonb, p_quote text, p_pending_photo_path text, p_consent_text text, p_submitted_ip inet) returns text`; TS `InviteAudience`, `TestimonialInviteRow.audience`.

- [ ] **Step 1: Write the migration**

`alpha_migration_parent_invites.sql`:

```sql
-- ============================================================
-- ALPHA SCHOOLS — INCREMENTAL migration
-- Parent testimonial invites: invites gain an audience.
-- Requires alpha_migration_testimonial_invites.sql. Run this file AFTER it
-- (and again after any re-run of it). Safe to run more than once.
-- ============================================================


-- ---- 1. Audience
--
-- Existing invites were all for alumni, so the default fills them in.
alter table public.testimonial_invites
  add column if not exists audience text not null default 'alumni';

alter table public.testimonial_invites
  drop constraint if exists testimonial_invites_audience_check;
alter table public.testimonial_invites
  add constraint testimonial_invites_audience_check
  check (audience in ('alumni', 'parent'));


-- ---- 2. One invite per phone per audience
--
-- A parent can also be a former student, so the same number may appear once
-- in each list. The inline unique on phone from the earlier migration is
-- named testimonial_invites_phone_key by Postgres.
alter table public.testimonial_invites
  drop constraint if exists testimonial_invites_phone_key;
alter table public.testimonial_invites
  drop constraint if exists testimonial_invites_audience_phone_key;
alter table public.testimonial_invites
  add constraint testimonial_invites_audience_phone_key unique (audience, phone);


-- ---- 3. Audience-aware invited submission
--
-- Same behaviour as before, plus: an invite for one audience cannot be used
-- to submit the other audience's form. The 12-argument version is dropped so
-- no caller can reach the unchecked path.
drop function if exists public.submit_invited_story(
  text, text, text, int, text, text, text, jsonb, text, text, text, inet
);

create or replace function public.submit_invited_story(
  p_token_hash         text,
  p_audience           text,
  p_author_name        text,
  p_school_slug        text,
  p_grad_year          int,
  p_relationship       text,
  p_company            text,
  p_city_country       text,
  p_answers            jsonb,
  p_quote              text,
  p_pending_photo_path text,
  p_consent_text       text,
  p_submitted_ip       inet
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.testimonial_invites%rowtype;
begin
  select * into v_invite
    from public.testimonial_invites
    where token_hash = p_token_hash
    for update;

  if not found
     or v_invite.expires_at < now()
     or v_invite.audience is distinct from p_audience then
    return 'invalid';
  end if;
  if v_invite.status = 'submitted' then
    return 'submitted';
  end if;

  insert into public.testimonials (
    school_slug, author_name, relationship, company, city_country,
    grad_year, quote, answers, photo_url, pending_photo_path,
    published, consent_at, consent_text, submitted_ip, sort_order, invite_id
  ) values (
    p_school_slug, p_author_name, p_relationship, p_company, p_city_country,
    p_grad_year, p_quote, p_answers, null, p_pending_photo_path,
    false, now(), p_consent_text, p_submitted_ip, 0, v_invite.id
  );

  update public.testimonial_invites
    set status = 'submitted', submitted_at = now()
    where id = v_invite.id;

  return 'ok';
end;
$$;

revoke all on function public.submit_invited_story(
  text, text, text, text, int, text, text, text, jsonb, text, text, text, inet
) from public, anon, authenticated;
grant execute on function public.submit_invited_story(
  text, text, text, text, int, text, text, text, jsonb, text, text, text, inet
) to service_role;
```

- [ ] **Step 2: Update the types**

In `src/integrations/alpha-supabase/types.ts`:

1. After `export type InviteStatus = ...`, add:

```ts
export type InviteAudience = "alumni" | "parent";
```

2. In `TestimonialInviteRow`, after `phone: string;` add:

```ts
  /** Who the invite is for. Phone numbers are unique per audience. */
  audience: InviteAudience;
```

3. In `TestimonialRow`, replace the `answers` line and its comment with:

```ts
  /** Story prompt answers keyed by prompt (alumni or parent prompts). Staff only; never published. */
  answers: Record<string, string> | null;
```

- [ ] **Step 3: Verify and commit**

Run: `npm test && npm run build` — expect both to pass. Re-read the SQL against spec §1.

```bash
git add alpha_migration_parent_invites.sql src/integrations/alpha-supabase/types.ts
git commit -m "Give testimonial invites an audience" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Pure modules for parents

**Files:**
- Create: `src/lib/invites/audience.ts`, `src/lib/invites/audience.test.ts`
- Create: `src/lib/story/parent-fields.ts`, `src/lib/story/parent-fields.test.ts`
- Modify: `src/lib/invites/token.ts`, `src/lib/invites/token.test.ts`
- Modify: `src/lib/invites/whatsapp.ts`, `src/lib/invites/whatsapp.test.ts`
- Modify: `src/lib/story/fields.ts`

**Interfaces:**
- Consumes: `InviteAudience` (Task 1); `ALUMNI_SCHOOLS`, `AlumniSchool` (`contacts.ts`); `CODE_PATTERN` (`token.ts`); `MESSAGE_MAX`, `NAME_MAX`, `PROMPT_MAX`, `StoryError`, `checkQuote`, `checkConsent` (`fields.ts`).
- Produces:
  - `audience.ts`: `type Audience = InviteAudience`; `AUDIENCES: readonly Audience[]`; `isAudience(v: unknown): v is Audience`; `formAudience(form: FormData): Audience` (anything but `"parent"` is `"alumni"`).
  - `token.ts`: `storyPath(code: string, audience: Audience = "alumni"): string`.
  - `whatsapp.ts`: `parentInviteMessage(fullName: string, link: string): string`; `parentGeneralMessage(link: string): string`.
  - `fields.ts`: `checkQuote(d: { quote: string })`, `checkConsent(d: { consent: boolean })` (same messages).
  - `parent-fields.ts`: `type ParentPromptKey = "chose_alpha" | "changed" | "advice_parents"`; `PARENT_PROMPTS`; `type ParentDraft = { fullName: string; schoolSlug: string; answers: Record<ParentPromptKey, string>; quote: string; consent: boolean }`; `EMPTY_PARENT_DRAFT`; `checkParentAbout(d)`, `checkParentPrompts(d)`; `parentDraftToForm(d, code: string | null, photo: File | null): FormData`; `type ParentStoryInput = { code: string | null; fullName: string; schoolSlug: AlumniSchool; relationship: string; answers: Partial<Record<ParentPromptKey, string>> | null; quote: string }`; `validateParentStory(form: FormData): ParentStoryInput` (throws `StoryError`).

- [ ] **Step 1: Write the failing tests**

`src/lib/invites/audience.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { AUDIENCES, formAudience, isAudience } from "./audience";

describe("audience", () => {
  it("lists both audiences", () => {
    expect(AUDIENCES).toEqual(["alumni", "parent"]);
  });

  it.each([
    ["alumni", true],
    ["parent", true],
    ["parents", false],
    ["", false],
    [null, false],
  ])("isAudience(%j) is %s", (v, expected) => {
    expect(isAudience(v)).toBe(expected);
  });

  it("reads the form, defaulting to alumni", () => {
    const f = new FormData();
    expect(formAudience(f)).toBe("alumni");
    f.set("audience", "parent");
    expect(formAudience(f)).toBe("parent");
    f.set("audience", "teacher");
    expect(formAudience(f)).toBe("alumni");
  });
});
```

Append to `src/lib/invites/token.test.ts` (inside the existing `describe("link codes", ...)` block, next to the existing `storyPath` test):

```ts
  it("build the parent story path", () => {
    expect(storyPath("abc", "parent")).toBe("/parents/story/abc");
    expect(storyPath("abc", "alumni")).toBe("/alumni/story/abc");
  });
```

Append to `src/lib/invites/whatsapp.test.ts` (inside the existing `describe`):

```ts
  it("writes the parent invite message", () => {
    expect(parentInviteMessage("Asha Mushi", "https://x.test/parents/story/abc")).toBe(
      "Hello Asha, Alpha Schools would love to share your experience as a parent on our website. " +
        "It takes about 5 minutes: https://x.test/parents/story/abc",
    );
  });

  it("writes the parent general message", () => {
    expect(parentGeneralMessage("https://x.test/parents/story")).toBe(
      "Are you a parent at Alpha? Alpha Schools would love to share your experience on our website. " +
        "It takes about 5 minutes: https://x.test/parents/story",
    );
  });
```

and add `parentGeneralMessage, parentInviteMessage` to that file's import from `./whatsapp`.

`src/lib/story/parent-fields.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { StoryError } from "./fields";
import {
  EMPTY_PARENT_DRAFT,
  PARENT_PROMPTS,
  checkParentAbout,
  checkParentPrompts,
  parentDraftToForm,
  validateParentStory,
  type ParentDraft,
} from "./parent-fields";

const CODE = "b".repeat(43);

const good: ParentDraft = {
  ...EMPTY_PARENT_DRAFT,
  fullName: " Grace Mollel ",
  schoolSlug: "alpha-girls",
  answers: { chose_alpha: "The aviation programme.", changed: "", advice_parents: "" },
  quote: "Our daughter found her confidence here.",
  consent: true,
};

describe("parent prompts", () => {
  it("uses the agreed questions", () => {
    expect(PARENT_PROMPTS.map((p) => p.label)).toEqual([
      "Why did you choose Alpha?",
      "What has changed for your child since joining?",
      "What would you tell a parent deciding now?",
    ]);
  });
});

describe("parent checks", () => {
  it("pass a complete draft", () => {
    expect(checkParentAbout(good)).toBeNull();
    expect(checkParentPrompts(good)).toBeNull();
  });

  it.each([
    [{ fullName: " " }, "Please enter your name."],
    [{ fullName: "x".repeat(121) }, "That name is too long."],
    [{ schoolSlug: "" }, "Please choose your child's school."],
    [{ schoolSlug: "group-wide" }, "Please choose your child's school."],
  ])("checkParentAbout rejects %j", (patch, message) => {
    expect(checkParentAbout({ ...good, ...patch })).toBe(message);
  });

  it("limits each answer", () => {
    const answers = { ...good.answers, changed: "x".repeat(601) };
    expect(checkParentPrompts({ ...good, answers })).toBe(
      "Please keep each answer under 600 characters.",
    );
  });
});

describe("validateParentStory", () => {
  it("round-trips a draft and builds the attribution", () => {
    const form = parentDraftToForm(good, CODE, null);
    expect(form.get("audience")).toBe("parent");
    expect(validateParentStory(form)).toEqual({
      code: CODE,
      fullName: "Grace Mollel",
      schoolSlug: "alpha-girls",
      relationship: "Parent, Alpha Girls",
      answers: { chose_alpha: "The aviation programme." },
      quote: "Our daughter found her confidence here.",
    });
  });

  it("treats no code as the general link and blank answers as null", () => {
    const draft = { ...good, answers: { chose_alpha: " ", changed: "", advice_parents: "" } };
    const input = validateParentStory(parentDraftToForm(draft, null, null));
    expect(input.code).toBeNull();
    expect(input.answers).toBeNull();
  });

  it.each([
    [{ quote: "" }, "Please write a sentence or two for your quote."],
    [{ quote: "x".repeat(401) }, "Please keep your quote under 400 characters."],
    [{ consent: false }, "Please agree to the consent statement to submit."],
    [{ schoolSlug: "" }, "Please choose your child's school."],
  ])("rejects %j", (patch, message) => {
    const form = parentDraftToForm({ ...good, ...patch }, null, null);
    expect(() => validateParentStory(form)).toThrow(new StoryError(message));
  });

  it("rejects a malformed code", () => {
    expect(() => validateParentStory(parentDraftToForm(good, "short", null))).toThrow(
      new StoryError("This link isn't valid any more."),
    );
  });

  it("carries the photo", () => {
    const photo = new File([new Uint8Array([1])], "me.jpg");
    expect(parentDraftToForm(good, null, photo).get("photo")).toBeInstanceOf(File);
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run src/lib/invites src/lib/story`
Expected: FAIL (missing modules / exports).

- [ ] **Step 3: Implement**

`src/lib/invites/audience.ts`:

```ts
/** Who an invite or a story is for. */
import type { InviteAudience } from "@/integrations/alpha-supabase/types";

export type Audience = InviteAudience;

export const AUDIENCES: readonly Audience[] = ["alumni", "parent"];

export function isAudience(v: unknown): v is Audience {
  return v === "alumni" || v === "parent";
}

/** The form's audience. Missing or unknown means alumni, so older forms keep working. */
export function formAudience(form: FormData): Audience {
  return form.get("audience") === "parent" ? "parent" : "alumni";
}
```

In `src/lib/invites/token.ts`, replace `storyPath` with:

```ts
export function storyPath(code: string, audience: Audience = "alumni"): string {
  return `${audience === "parent" ? "/parents/story" : "/alumni/story"}/${code}`;
}
```

and add at the top: `import type { Audience } from "./audience";`

In `src/lib/invites/whatsapp.ts`, append:

```ts
const PARENT_PITCH =
  "Alpha Schools would love to share your experience as a parent on our website. It takes about 5 minutes:";

export function parentInviteMessage(fullName: string, link: string): string {
  return `Hello ${firstName(fullName)}, ${PARENT_PITCH} ${link}`;
}

export function parentGeneralMessage(link: string): string {
  return `Are you a parent at Alpha? Alpha Schools would love to share your experience on our website. It takes about 5 minutes: ${link}`;
}
```

In `src/lib/story/fields.ts`, change only the two signatures:

```ts
export function checkQuote(d: { quote: string }): string | null {
```

```ts
export function checkConsent(d: { consent: boolean }): string | null {
```

`src/lib/story/parent-fields.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/lib`
Expected: PASS (all existing tests too).

- [ ] **Step 5: Commit**

Run `npm test && npm run build` first.

```bash
git add src/lib/invites/audience.ts src/lib/invites/audience.test.ts src/lib/invites/token.ts src/lib/invites/token.test.ts src/lib/invites/whatsapp.ts src/lib/invites/whatsapp.test.ts src/lib/story/fields.ts src/lib/story/parent-fields.ts src/lib/story/parent-fields.test.ts
git commit -m "Add parent story fields and audience helpers" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Server functions for both audiences

**Files:**
- Modify: `src/lib/alumni.functions.ts`
- Modify: `src/lib/invites.functions.ts`

**Interfaces:**
- Consumes: Task 1 RPC signature; Task 2 `formAudience`, `isAudience`, `Audience`, `validateParentStory`, `storyPath(code, audience)`, `parentInviteMessage`.
- Produces:
  - `submitStory({ data: FormData })` — unchanged signature; reads `audience` from the form.
  - `createInvites({ data: { accessToken: string; audience: Audience; rows: InviteDraft[] } })` → `{ created: number; skippedExisting: string[] }`.
  - `getInviteLink` — unchanged signature; link and message follow the invite's audience.
  - `openInvite({ data: { code: string; audience: Audience } })` → `OpenInviteResult` (unchanged shape).

- [ ] **Step 1: `submitStory` handles both audiences**

In `src/lib/alumni.functions.ts`:

1. Update the imports:

```ts
import { formAudience, type Audience } from "@/lib/invites/audience";
import { validateParentStory } from "@/lib/story/parent-fields";
```

2. Update the top comment's first line to: `Server function for the story wizards: alumni (/alumni/story) and parents (/parents/story), general and personal links.`

3. Above `export const submitStory`, add:

```ts
/** One shape for both audiences, matching the testimonials columns. */
type StoryRow = {
  audience: Audience;
  code: string | null;
  schoolSlug: string;
  fullName: string;
  relationship: string;
  company: string | null;
  cityCountry: string | null;
  gradYear: number | null;
  answers: Record<string, string> | null;
  quote: string;
};

/** Validates with the audience's own rules. Throws StoryError. */
function readStory(form: FormData): StoryRow {
  if (formAudience(form) === "parent") {
    const p = validateParentStory(form);
    return {
      audience: "parent",
      code: p.code,
      schoolSlug: p.schoolSlug,
      fullName: p.fullName,
      relationship: p.relationship,
      company: null,
      cityCountry: null,
      gradYear: null,
      answers: p.answers,
      quote: p.quote,
    };
  }
  const a = validateStory(form);
  return {
    audience: "alumni",
    code: a.code,
    schoolSlug: a.schoolSlug,
    fullName: a.fullName,
    relationship: a.role,
    company: a.company,
    cityCountry: a.cityCountry,
    gradYear: a.gradYear,
    answers: a.answers,
    quote: a.quote,
  };
}
```

4. Inside the handler:
   - Replace `const input = validateStory(data);` with `const input = readStory(data);`.
   - Replace the rate-limit key line with:
     ```ts
     p_key: `${input.code ? "invite" : input.audience}:${ip}`,
     ```
     (general alumni keeps the `alumni:` bucket it had; general parents get `parent:`.)
   - In the RPC call, add `p_audience: input.audience,` directly after `p_token_hash`, and change `p_relationship: input.role,` to `p_relationship: input.relationship,`.
   - In the general-link insert, change `relationship: input.role,` to `relationship: input.relationship,`.

Everything else in `submitStory` stays as it is.

- [ ] **Step 2: Invite functions take an audience**

In `src/lib/invites.functions.ts`:

1. Imports: add `import { isAudience, type Audience } from "@/lib/invites/audience";` and add `parentInviteMessage` to the `@/lib/invites/whatsapp` import.

2. `createInvites`:
   - Input validator type: `(data: { accessToken: string; audience: Audience; rows: InviteDraft[] }) => data`.
   - Directly after `requireStaff`, add:
     ```ts
     if (!isAudience(data.audience)) throw new InviteError("Choose who you are inviting.");
     const audience = data.audience;
     ```
   - In the `validateContact` call, change the `year` line to:
     ```ts
     year: audience === "parent" || r?.gradYear == null ? "" : String(r.gradYear),
     ```
   - In the existing-phone lookup, add `.eq("audience", audience)` before `.in("phone", phones)`.
   - In the insert object, add `audience,` after `phone: c.phone,`.

3. `getInviteLink`:
   - Add `audience` to the select: `.select("id,full_name,phone,status,expires_at,token_cipher,audience")`.
   - Replace the link and return lines with:
     ```ts
     const audience: Audience = row.audience === "parent" ? "parent" : "alumni";
     const link = `${siteBase()}${storyPath(code, audience)}`;
     ```
     (keep the `last_shared_at` stamp between them unchanged) and
     ```ts
     const message =
       audience === "parent" ? parentInviteMessage(row.full_name, link) : inviteMessage(row.full_name, link);
     return { link, whatsapp: whatsappUrl(row.phone, message) };
     ```

4. `openInvite`:
   - Input validator type: `(data: { code: string; audience: Audience }) => data`.
   - Add `audience` to the select: `.select("id,full_name,school_slug,grad_year,status,expires_at,audience")`.
   - Replace the invalid check with:
     ```ts
     const audience = isAudience(data?.audience) ? data.audience : "alumni";
     if (!row || row.audience !== audience || new Date(row.expires_at).getTime() < Date.now()) {
       return { state: "invalid" };
     }
     ```
   - In the `ok` result, use `gradYear: audience === "parent" ? null : row.grad_year`.

- [ ] **Step 3: Keep the existing callers compiling**

`createInvites` and `openInvite` now require `audience`. Until Tasks 4–5 update their callers, pass the alumni audience explicitly:

- `src/routes/alumni.story.$code.tsx`: `openInvite({ data: { code, audience: "alumni" } })`.
- `src/components/admin/invites/add-invite-form.tsx` and `bulk-import.tsx`: add `audience: "alumni"` to the `createInvites` data.

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build && (grep -rl "SERVICE_ROLE_KEY\|INVITE_LINK_KEY" .output/public || echo clean)`
Expected: pass, build succeeds, `clean`.

Then check the running dev server still serves the alumni form: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/alumni/story` → `200`.

```bash
git add src/lib/alumni.functions.ts src/lib/invites.functions.ts 'src/routes/alumni.story.$code.tsx' src/components/admin/invites/add-invite-form.tsx src/components/admin/invites/bulk-import.tsx
git commit -m "Let the story and invite functions serve parents" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Shared wizard frame, parent form and routes

**Files:**
- Create: `src/components/alumni/story-wizard/wizard-frame.tsx`
- Create: `src/components/alumni/story-wizard/invite-gate.tsx`
- Create: `src/components/alumni/story-wizard/parent-steps.tsx`
- Create: `src/components/alumni/story-wizard/parent-story-wizard.tsx`
- Create: `src/routes/parents.story.index.tsx`, `src/routes/parents.story.$code.tsx`
- Replace: `src/components/alumni/story-wizard/use-story-draft.ts`, `steps.tsx`, `story-wizard.tsx`, `story-shell.tsx`
- Modify: `src/routes/alumni.story.index.tsx`, `src/routes/alumni.story.$code.tsx`, `src/routeTree.gen.ts` (regenerated)

**Interfaces:**
- Consumes: Task 2 parent fields; Task 3 `openInvite({ code, audience })`, `submitStory`; `field-ui.tsx` (`BTN_PRIMARY`, `BTN_PRIMARY_STYLE`, `BTN_SECONDARY`, `CARD`, `CountedTextArea`, `FieldLabel`, `TextField` — unchanged).
- Produces: `StoryWizardFrame`, `DoneCard`, `AlreadyReceivedCard`, `InvalidLinkCard` (`wizard-frame.tsx`); `InviteGate` (`invite-gate.tsx`); `StoryWizard({ code, initial })`; `ParentStoryWizard({ code, initial })`; `StoryShell({ heading, children })`, `MessageCard({ title, children })`; routes `/parents/story/` and `/parents/story/$code`.

The visual result for alumni must stay exactly as it is today (same copy, same steps, same classes). This task is a refactor for alumni plus a new parent form on the same frame.

- [ ] **Step 1: Replace `use-story-draft.ts`**

```ts
/**
 * Wizard answers, kept in localStorage so a closed tab or a dropped
 * connection does not lose them. Consent is never restored: it is given
 * fresh each time. The photo is not stored at all.
 *
 * Loaded in an effect, not in useState's initialiser, because the general
 * routes are server-rendered and localStorage does not exist there.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type DraftShape = { consent: boolean; answers: Record<string, string> };

export function useStoryDraft<D extends DraftShape>(storageKey: string, initial: D) {
  const [draft, setDraft] = useState<D>(initial);
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<D>;
        setDraft(
          (d) =>
            ({
              ...d,
              ...saved,
              answers: { ...d.answers, ...(saved.answers ?? {}) },
              consent: false,
            }) as D,
        );
        setRestored(true);
      }
    } catch {
      /* Storage blocked or corrupt: start fresh. */
    }
    loaded.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      const { consent: _consent, ...rest } = draft;
      localStorage.setItem(storageKey, JSON.stringify(rest));
    } catch {
      /* Storage full or blocked: the draft just isn't kept. */
    }
  }, [draft, storageKey]);

  /* Spreading a generic loses its type in TypeScript; the casts restore it. */
  const update = useCallback((patch: Partial<D>) => {
    setDraft((d) => ({ ...d, ...patch }) as D);
  }, []);

  const setAnswer = useCallback((key: string, value: string) => {
    setDraft((d) => ({ ...d, answers: { ...d.answers, [key]: value } }) as D);
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* Nothing to clear. */
    }
  }, [storageKey]);

  return { draft, update, setAnswer, clear, restored };
}
```

- [ ] **Step 2: Replace `story-shell.tsx`**

```tsx
/** Page chrome for the story routes: site header, heading, footer. */
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SHELL, T } from "@/components/type-roles";
import { CARD } from "./field-ui";

export function StoryShell({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />
      <main className={`${SHELL} py-[var(--space-section-y)]`}>
        <div className="mx-auto max-w-2xl">
          <h1
            className="font-display tracking-tight text-balance text-[var(--color-deep-blue)]"
            style={T.section}
          >
            {heading}
          </h1>
          <span
            aria-hidden
            className="mt-[var(--heading-rule-gap)] block"
            style={{
              width: "var(--heading-rule-w)",
              height: "var(--heading-rule-h)",
              background: "var(--heading-rule-color)",
              borderRadius: "var(--heading-rule-radius)",
            }}
          />
          <div className="mt-5">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function MessageCard({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={CARD} role="status">
      <h2 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
        {title}
      </h2>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `wizard-frame.tsx`**

The step state, focus handling, indicator, navigation, error line, submit and result cards move here unchanged from today's `story-wizard.tsx`. Copy is identical.

```tsx
/**
 * The frame both story wizards share: named steps, Back/Next, the error
 * line, submit, and the result cards. Each wizard supplies its steps, their
 * checks, the step bodies and the submit call.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { T } from "@/components/type-roles";
import type { StorySubmissionResult } from "@/lib/alumni.functions";
import { BTN_PRIMARY, BTN_PRIMARY_STYLE, BTN_SECONDARY, CARD } from "./field-ui";
import { MessageCard } from "./story-shell";

export type FrameStep = {
  title: string;
  short: string;
  /** Returns the first problem with this step, or null. */
  check?: () => string | null;
};

const BodyText = ({ children }: { children: ReactNode }) => (
  <p className="mt-2 max-w-[60ch] text-[var(--color-ink-soft)]" style={T.body}>
    {children}
  </p>
);

const HomeLink = () => (
  <Link to="/" className={`mt-5 ${BTN_PRIMARY}`} style={BTN_PRIMARY_STYLE}>
    Back to Alpha Schools
  </Link>
);

export function InvalidLinkCard() {
  return (
    <MessageCard title="This link no longer works">
      <BodyText>
        It may have expired, or the school may have sent you a newer one. Contact the school and
        we will send you a fresh link.
      </BodyText>
      <Link to="/contact" className={`mt-5 ${BTN_PRIMARY}`} style={BTN_PRIMARY_STYLE}>
        Contact the school
      </Link>
    </MessageCard>
  );
}

export function AlreadyReceivedCard() {
  return (
    <MessageCard title="We already have your story">
      <BodyText>Thank you. To change or withdraw it, contact the school and we will help.</BodyText>
      <HomeLink />
    </MessageCard>
  );
}

export function DoneCard() {
  return (
    <MessageCard title="Thank you. Your story is with us.">
      <BodyText>
        A member of staff will read it before anything is published, so it will not appear on the
        site straight away. To change or withdraw it later, contact the school.
      </BodyText>
      <HomeLink />
    </MessageCard>
  );
}

/**
 * Where the reader is. Named steps on wider screens, where they fit and
 * show what is still to come; a single line on phones.
 */
function StepIndicator({ steps, step }: { steps: FrameStep[]; step: number }) {
  return (
    <>
      <p className="text-[var(--color-ink-soft)] sm:hidden" style={T.body}>
        Step {step + 1} of {steps.length}
      </p>
      <ol
        className="hidden gap-1 sm:grid"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        aria-label="Steps"
      >
        {steps.map((s, i) => (
          <li
            key={s.title}
            aria-current={i === step ? "step" : undefined}
            className={`border-t-2 pt-2 text-sm ${
              i === step
                ? "border-[var(--color-gold)] font-semibold text-[var(--color-deep-blue)]"
                : i < step
                  ? "border-[var(--color-deep-blue)] text-[var(--color-deep-blue)]"
                  : "border-[var(--color-deep-blue)]/15 text-[var(--color-ink-soft)]"
            }`}
          >
            {s.short}
          </li>
        ))}
      </ol>
    </>
  );
}

export function StoryWizardFrame({
  intro,
  steps,
  renderStep,
  submit,
  onSent,
}: {
  intro: string;
  steps: FrameStep[];
  renderStep: (index: number, goTo: (index: number) => void) => ReactNode;
  submit: () => Promise<StorySubmissionResult>;
  /** Called once the story is stored, or found to be stored already. */
  onSent: () => void;
}) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"done" | "invalid" | "submitted" | null>(null);

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const moved = useRef(false);

  /* Move focus to the new step's heading, but not on first render. */
  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "nearest" });
  }, [step]);

  function goTo(next: number) {
    moved.current = true;
    setError(null);
    setStep(next);
  }

  function onNext() {
    const problem = steps[step].check?.() ?? null;
    if (problem) {
      setError(problem);
      return;
    }
    goTo(step + 1);
  }

  async function onSubmit() {
    /* Re-check everything; jump to the first step with a problem. */
    for (let i = 0; i < steps.length; i++) {
      const problem = steps[i].check?.() ?? null;
      if (problem) {
        goTo(i);
        setError(problem);
        return;
      }
    }

    setBusy(true);
    setError(null);
    try {
      const res = await submit();
      if (res.ok) {
        onSent();
        setResult("done");
      } else {
        if (res.state === "submitted") onSent();
        setResult(res.state);
      }
    } catch (err) {
      /* The draft stays in storage, so a retry loses nothing. */
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not send your story. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (result === "done") return <DoneCard />;
  if (result === "submitted") return <AlreadyReceivedCard />;
  if (result === "invalid") return <InvalidLinkCard />;

  const last = step === steps.length - 1;

  return (
    <>
      <p className="max-w-[60ch] text-[var(--color-ink-soft)]" style={T.body}>
        {intro}
      </p>

      <div className={`${CARD} mt-[var(--space-block-y)]`}>
        <StepIndicator steps={steps} step={step} />

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 font-display text-[var(--color-deep-blue)] focus:outline-none"
          style={T.cardTitle}
        >
          {steps[step].title}
        </h2>

        <div className="mt-4">{renderStep(step, goTo)}</div>

        {error && (
          <p
            className="mt-5 rounded-[var(--radius-btn)] bg-[var(--color-danger)]/10 p-3 text-[var(--color-danger)]"
            style={T.body}
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap-reverse items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => goTo(step - 1)} className={BTN_SECONDARY} style={T.body}>
              Back
            </button>
          ) : (
            <span />
          )}
          {last ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={busy}
              aria-busy={busy}
              className={`${BTN_PRIMARY} w-full sm:w-auto`}
              style={BTN_PRIMARY_STYLE}
            >
              {busy ? "Sending…" : "Send my story"}
            </button>
          ) : (
            <button type="button" onClick={onNext} className={BTN_PRIMARY} style={BTN_PRIMARY_STYLE}>
              Next: {steps[step + 1].title.toLowerCase()}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Replace `steps.tsx`**

Shared pieces are exported; alumni-only steps keep their current markup and copy.

```tsx
/** Step bodies for the story wizards, and the pieces both audiences share. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Upload } from "lucide-react";
import { T } from "@/components/type-roles";
import { ALUMNI_SCHOOLS } from "@/lib/invites/contacts";
import {
  CONSENT_TEXT,
  COMPANY_MAX,
  MESSAGE_MAX,
  NAME_MAX,
  PHOTO_ACCEPT,
  PHOTO_MAX_BYTES,
  PLACE_MAX,
  PROMPT_MAX,
  ROLE_MAX,
  STORY_PROMPTS,
  type PromptKey,
  type StoryDraft,
} from "@/lib/story/fields";
import { BTN_SECONDARY, CountedTextArea, FieldLabel, TextField } from "./field-ui";

export function StepText({ children }: { children: ReactNode }) {
  return (
    <p className="text-[var(--color-ink-soft)]" style={T.body}>
      {children}
    </p>
  );
}

/** A local preview of the chosen photo. Nothing is uploaded until Send. */
export function usePreviewUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

/** The chosen photo, with the client-side size check. */
export function usePhoto() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const onPickPhoto = useCallback((file: File | null) => {
    setPhotoError(null);
    if (file && file.size > PHOTO_MAX_BYTES) {
      setPhoto(null);
      setPhotoError("That photo is larger than 5 MB. Please choose a smaller one.");
      return;
    }
    setPhoto(file);
  }, []);
  return { photo, photoError, onPickPhoto };
}

export function SchoolChoice({
  legend,
  name,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <fieldset>
      <legend>
        <FieldLabel required>{legend}</FieldLabel>
      </legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {ALUMNI_SCHOOLS.map((s) => (
          <label
            key={s.value}
            className="flex min-h-[var(--btn-primary-min-h)] cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-deep-blue)]/15 bg-[var(--color-off-white)] px-4 has-[:checked]:border-[var(--color-bright-blue)] has-[:checked]:bg-[var(--color-surface-muted)]"
            style={T.body}
          >
            <input
              type="radio"
              name={name}
              value={s.value}
              checked={value === s.value}
              onChange={() => onChange(s.value)}
              className="h-5 w-5 shrink-0 accent-[var(--color-bright-blue)]"
            />
            {s.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type DraftProps = {
  draft: StoryDraft;
  update: (patch: Partial<StoryDraft>) => void;
};

export function AboutStep({ draft, update }: DraftProps) {
  return (
    <div className="space-y-5">
      <TextField
        label="Your full name"
        required
        value={draft.fullName}
        onChange={(fullName) => update({ fullName })}
        maxLength={NAME_MAX}
        autoComplete="name"
      />
      <SchoolChoice
        legend="School you attended"
        name="school"
        value={draft.schoolSlug}
        onChange={(schoolSlug) => update({ schoolSlug })}
      />
      <TextField
        label="Year you finished"
        required
        numeric
        placeholder="2018"
        value={draft.gradYear}
        onChange={(gradYear) => update({ gradYear })}
      />
    </div>
  );
}

export function NowStep({ draft, update }: DraftProps) {
  return (
    <div className="space-y-5">
      <TextField
        label="What you do now (job or studies)"
        required
        placeholder="Software engineer"
        value={draft.role}
        onChange={(role) => update({ role })}
        maxLength={ROLE_MAX}
      />
      <TextField
        label="Company, organisation or university"
        value={draft.company}
        onChange={(company) => update({ company })}
        maxLength={COMPANY_MAX}
      />
      <TextField
        label="City and country"
        placeholder="Dar es Salaam, Tanzania"
        value={draft.cityCountry}
        onChange={(cityCountry) => update({ cityCountry })}
        maxLength={PLACE_MAX}
      />
    </div>
  );
}

/** Optional questions, for either audience. */
export function PromptsStep({
  prompts,
  answers,
  onAnswer,
}: {
  prompts: readonly { key: string; label: string }[];
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <StepText>
        Answer any you like, or none. These are for the school to read and are not published.
      </StepText>
      {prompts.map((p) => (
        <CountedTextArea
          key={p.key}
          id={`prompt-${p.key}`}
          label={p.label}
          value={answers[p.key] ?? ""}
          onChange={(value) => onAnswer(p.key, value)}
          max={PROMPT_MAX}
          rows={3}
        />
      ))}
    </div>
  );
}

export function QuoteStep({
  lead,
  quote,
  onChange,
}: {
  lead: string;
  quote: string;
  onChange: (quote: string) => void;
}) {
  return (
    <div className="space-y-4">
      <StepText>{lead}</StepText>
      <CountedTextArea
        id="quote"
        label="Your quote"
        required
        value={quote}
        onChange={onChange}
        max={MESSAGE_MAX}
        rows={5}
      />
    </div>
  );
}

export function PhotoConsentStep({
  consent,
  onConsent,
  photo,
  photoError,
  onPickPhoto,
}: {
  consent: boolean;
  onConsent: (consent: boolean) => void;
  photo: File | null;
  photoError: string | null;
  onPickPhoto: (file: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const preview = usePreviewUrl(photo);

  function clearPhoto() {
    onPickPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Photo (optional)</FieldLabel>
        {preview && (
          <img
            src={preview}
            alt="Your chosen photo"
            className="mt-2 aspect-square w-32 rounded-xl object-cover ring-1 ring-[var(--color-deep-blue)]/10"
          />
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label
            className={`${BTN_SECONDARY} cursor-pointer focus-within:ring-2 focus-within:ring-[var(--color-bright-blue)]`}
            style={T.body}
          >
            <Upload className="h-4 w-4" aria-hidden />
            {photo ? "Choose a different photo" : "Choose a photo"}
            <input
              ref={fileRef}
              type="file"
              accept={PHOTO_ACCEPT}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onPickPhoto(file);
                if (!file && fileRef.current) fileRef.current.value = "";
              }}
            />
          </label>
          {photo && (
            <button
              type="button"
              onClick={clearPhoto}
              className="text-[var(--color-deep-blue)] underline underline-offset-2 hover:text-[var(--color-bright-blue)]"
              style={T.body}
            >
              Remove photo
            </button>
          )}
        </div>
        <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
          A clear photo of you. JPEG, PNG or WebP, up to 5 MB.
        </p>
        {photoError && (
          <p className="mt-2 text-[var(--color-danger)]" style={T.body} role="alert">
            {photoError}
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-[var(--radius-btn)] bg-[var(--color-surface-muted)] p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => onConsent(e.target.checked)}
          required
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-bright-blue)]"
        />
        <span className="text-[var(--color-ink)]" style={T.body}>
          {CONSENT_TEXT}
        </span>
      </label>
    </div>
  );
}

export type ReviewItem = { label?: string; value: string };
export type ReviewSection = { step: number; title: string; items: ReviewItem[] };

/** The photo section's lines: empty when there is a photo (the preview shows instead). */
export function photoItems(photo: File | null, lostOnReload: boolean): ReviewItem[] {
  if (photo) return [];
  return [
    {
      value: lostOnReload
        ? "No photo attached. If you chose one before the page reloaded, choose it again."
        : "No photo.",
    },
  ];
}

/** Answered prompts as review lines, or "Not answered." */
export function answerItems(
  prompts: readonly { key: string; label: string }[],
  answers: Record<string, string>,
): ReviewItem[] {
  const answered = prompts.filter((p) => (answers[p.key] ?? "").trim());
  return answered.length
    ? answered.map((p) => ({ label: p.label, value: answers[p.key].trim() }))
    : [{ value: "Not answered." }];
}

export function ReviewList({
  sections,
  photo,
  photoStep,
  onEdit,
}: {
  sections: ReviewSection[];
  photo: File | null;
  photoStep: number;
  onEdit: (step: number) => void;
}) {
  const preview = usePreviewUrl(photo);
  return (
    <dl className="divide-y divide-[var(--color-deep-blue)]/10 border-y border-[var(--color-deep-blue)]/10">
      {sections.map((s) => (
        <div key={s.title} className="py-4">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[var(--color-deep-blue)]" style={T.label}>
              {s.title}
            </dt>
            <button
              type="button"
              onClick={() => onEdit(s.step)}
              aria-label={`Change ${s.title.toLowerCase()}`}
              className="text-[var(--color-bright-blue)] underline underline-offset-2 hover:text-[var(--color-deep-blue)]"
              style={T.body}
            >
              Change
            </button>
          </div>
          {s.step === photoStep && preview && (
            <dd className="mt-2">
              <img
                src={preview}
                alt="Your chosen photo"
                className="aspect-square w-20 rounded-lg object-cover ring-1 ring-[var(--color-deep-blue)]/10"
              />
            </dd>
          )}
          {s.items.map((item, i) => (
            <dd key={i} className={i === 0 ? "mt-1" : "mt-3"}>
              {item.label && (
                <span className="block text-[var(--color-ink-soft)]" style={T.body}>
                  {item.label}
                </span>
              )}
              <span className="block whitespace-pre-line break-words text-[var(--color-ink)]" style={T.body}>
                {item.value}
              </span>
            </dd>
          ))}
        </div>
      ))}
    </dl>
  );
}

export function ReviewStep({
  draft,
  photo,
  photoLostOnReload,
  onEdit,
}: {
  draft: StoryDraft;
  photo: File | null;
  photoLostOnReload: boolean;
  onEdit: (step: number) => void;
}) {
  const school = ALUMNI_SCHOOLS.find((s) => s.value === draft.schoolSlug)?.label ?? "";
  const now = [draft.role, draft.company, draft.cityCountry].map((s) => s.trim()).filter(Boolean);
  const sections: ReviewSection[] = [
    {
      step: 0,
      title: "About you",
      items: [{ value: `${draft.fullName.trim()}, ${school}, class of ${draft.gradYear}` }],
    },
    { step: 1, title: "Where you are now", items: [{ value: now.join(", ") }] },
    {
      step: 2,
      title: "Your story",
      items: answerItems(STORY_PROMPTS, draft.answers as Record<PromptKey, string>),
    },
    { step: 3, title: "Your quote", items: [{ value: draft.quote.trim() }] },
    { step: 4, title: "Photo", items: photoItems(photo, photoLostOnReload) },
  ];
  return <ReviewList sections={sections} photo={photo} photoStep={4} onEdit={onEdit} />;
}
```

- [ ] **Step 5: Replace `story-wizard.tsx` (alumni)**

```tsx
/**
 * The alumni story wizard, for the general link (code = null) and personal
 * links. Each step's check runs before Next; the server runs all of them
 * again. Nothing is uploaded until Send, to keep mobile data use down.
 */
import { submitStory } from "@/lib/alumni.functions";
import {
  STORY_PROMPTS,
  checkAbout,
  checkConsent,
  checkNow,
  checkPrompts,
  checkQuote,
  draftToForm,
  type StoryDraft,
} from "@/lib/story/fields";
import {
  AboutStep,
  NowStep,
  PhotoConsentStep,
  PromptsStep,
  QuoteStep,
  ReviewStep,
  usePhoto,
} from "./steps";
import { useStoryDraft } from "./use-story-draft";
import { StoryWizardFrame, type FrameStep } from "./wizard-frame";

const INTRO =
  "We would like to feature former students on our alumni page. It takes about five minutes, " +
  "you can change any answer before you send it, and a member of staff reads every story " +
  "before it is published.";

export function StoryWizard({ code, initial }: { code: string | null; initial: StoryDraft }) {
  const storageKey = `alpha-story-draft:${code ? code.slice(0, 12) : "general"}`;
  const { draft, update, setAnswer, clear, restored } = useStoryDraft(storageKey, initial);
  const { photo, photoError, onPickPhoto } = usePhoto();

  const steps: FrameStep[] = [
    { title: "About you", short: "You", check: () => checkAbout(draft) },
    { title: "Where you are now", short: "Now", check: () => checkNow(draft) },
    { title: "Your story", short: "Story", check: () => checkPrompts(draft) },
    { title: "Your quote", short: "Quote", check: () => checkQuote(draft) },
    { title: "Photo and consent", short: "Photo", check: () => checkConsent(draft) },
    { title: "Check and send", short: "Send" },
  ];

  return (
    <StoryWizardFrame
      intro={INTRO}
      steps={steps}
      submit={() => submitStory({ data: draftToForm(draft, code, photo) })}
      onSent={clear}
      renderStep={(step, goTo) => (
        <>
          {step === 0 && <AboutStep draft={draft} update={update} />}
          {step === 1 && <NowStep draft={draft} update={update} />}
          {step === 2 && (
            <PromptsStep prompts={STORY_PROMPTS} answers={draft.answers} onAnswer={setAnswer} />
          )}
          {step === 3 && (
            <QuoteStep
              lead="In a sentence or two, what did Alpha mean to you? This is the part we publish, next to your name."
              quote={draft.quote}
              onChange={(quote) => update({ quote })}
            />
          )}
          {step === 4 && (
            <PhotoConsentStep
              consent={draft.consent}
              onConsent={(consent) => update({ consent })}
              photo={photo}
              photoError={photoError}
              onPickPhoto={onPickPhoto}
            />
          )}
          {step === 5 && (
            <ReviewStep
              draft={draft}
              photo={photo}
              photoLostOnReload={restored && !photo}
              onEdit={goTo}
            />
          )}
        </>
      )}
    />
  );
}
```

- [ ] **Step 6: Create `parent-steps.tsx` and `parent-story-wizard.tsx`**

`parent-steps.tsx`:

```tsx
/** Step bodies specific to the parent story. */
import { ALUMNI_SCHOOLS } from "@/lib/invites/contacts";
import { NAME_MAX } from "@/lib/story/fields";
import { PARENT_PROMPTS, type ParentDraft } from "@/lib/story/parent-fields";
import { TextField } from "./field-ui";
import { ReviewList, SchoolChoice, answerItems, photoItems, type ReviewSection } from "./steps";

export function ParentAboutStep({
  draft,
  update,
}: {
  draft: ParentDraft;
  update: (patch: Partial<ParentDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <TextField
        label="Your full name"
        required
        value={draft.fullName}
        onChange={(fullName) => update({ fullName })}
        maxLength={NAME_MAX}
        autoComplete="name"
      />
      <SchoolChoice
        legend="Your child's school"
        name="parent-school"
        value={draft.schoolSlug}
        onChange={(schoolSlug) => update({ schoolSlug })}
      />
    </div>
  );
}

export function ParentReviewStep({
  draft,
  photo,
  photoLostOnReload,
  onEdit,
}: {
  draft: ParentDraft;
  photo: File | null;
  photoLostOnReload: boolean;
  onEdit: (step: number) => void;
}) {
  const school = ALUMNI_SCHOOLS.find((s) => s.value === draft.schoolSlug)?.label ?? "";
  const sections: ReviewSection[] = [
    { step: 0, title: "About you", items: [{ value: `${draft.fullName.trim()}, parent at ${school}` }] },
    { step: 1, title: "Your experience", items: answerItems(PARENT_PROMPTS, draft.answers) },
    { step: 2, title: "Your quote", items: [{ value: draft.quote.trim() }] },
    { step: 3, title: "Photo", items: photoItems(photo, photoLostOnReload) },
  ];
  return <ReviewList sections={sections} photo={photo} photoStep={3} onEdit={onEdit} />;
}
```

`parent-story-wizard.tsx`:

```tsx
/** The parent story wizard, for /parents/story and personal parent links. */
import { submitStory } from "@/lib/alumni.functions";
import { checkConsent, checkQuote } from "@/lib/story/fields";
import {
  PARENT_PROMPTS,
  checkParentAbout,
  checkParentPrompts,
  parentDraftToForm,
  type ParentDraft,
} from "@/lib/story/parent-fields";
import { ParentAboutStep, ParentReviewStep } from "./parent-steps";
import { PhotoConsentStep, PromptsStep, QuoteStep, usePhoto } from "./steps";
import { useStoryDraft } from "./use-story-draft";
import { StoryWizardFrame, type FrameStep } from "./wizard-frame";

const INTRO =
  "We would like to share parents' experiences of Alpha on our website. It takes about five " +
  "minutes, you can change any answer before you send it, and a member of staff reads every " +
  "story before it is published.";

export function ParentStoryWizard({ code, initial }: { code: string | null; initial: ParentDraft }) {
  const storageKey = `alpha-parent-draft:${code ? code.slice(0, 12) : "general"}`;
  const { draft, update, setAnswer, clear, restored } = useStoryDraft(storageKey, initial);
  const { photo, photoError, onPickPhoto } = usePhoto();

  const steps: FrameStep[] = [
    { title: "About you", short: "You", check: () => checkParentAbout(draft) },
    { title: "Your experience", short: "Experience", check: () => checkParentPrompts(draft) },
    { title: "Your quote", short: "Quote", check: () => checkQuote(draft) },
    { title: "Photo and consent", short: "Photo", check: () => checkConsent(draft) },
    { title: "Check and send", short: "Send" },
  ];

  return (
    <StoryWizardFrame
      intro={INTRO}
      steps={steps}
      submit={() => submitStory({ data: parentDraftToForm(draft, code, photo) })}
      onSent={clear}
      renderStep={(step, goTo) => (
        <>
          {step === 0 && <ParentAboutStep draft={draft} update={update} />}
          {step === 1 && (
            <PromptsStep prompts={PARENT_PROMPTS} answers={draft.answers} onAnswer={setAnswer} />
          )}
          {step === 2 && (
            <QuoteStep
              lead="In a sentence or two, what has Alpha meant for your family? This is the part we publish, next to your name."
              quote={draft.quote}
              onChange={(quote) => update({ quote })}
            />
          )}
          {step === 3 && (
            <PhotoConsentStep
              consent={draft.consent}
              onConsent={(consent) => update({ consent })}
              photo={photo}
              photoError={photoError}
              onPickPhoto={onPickPhoto}
            />
          )}
          {step === 4 && (
            <ParentReviewStep
              draft={draft}
              photo={photo}
              photoLostOnReload={restored && !photo}
              onEdit={goTo}
            />
          )}
        </>
      )}
    />
  );
}
```

- [ ] **Step 7: Create `invite-gate.tsx`**

```tsx
/**
 * Loads a personal invite in the browser and shows the matching state.
 * Runs after load rather than in a route loader, so WhatsApp's link preview
 * (which runs no JavaScript) does not mark the invite as opened.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { T } from "@/components/type-roles";
import { openInvite, type OpenInviteResult } from "@/lib/invites.functions";
import type { Audience } from "@/lib/invites/audience";
import { firstName } from "@/lib/invites/whatsapp";
import { BTN_PRIMARY, BTN_PRIMARY_STYLE } from "./field-ui";
import { MessageCard, StoryShell } from "./story-shell";
import { AlreadyReceivedCard, InvalidLinkCard } from "./wizard-frame";

type Ok = Extract<OpenInviteResult, { state: "ok" }>;
type LoadState = { kind: "loading" } | { kind: "error" } | { kind: "loaded"; invite: OpenInviteResult };

export function InviteGate({
  code,
  audience,
  heading,
  children,
}: {
  code: string;
  audience: Audience;
  /** The page heading, given the invitee's first name once known. */
  heading: (name: string | null) => string;
  children: (invite: Ok) => ReactNode;
}) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(() => {
    setState({ kind: "loading" });
    openInvite({ data: { code, audience } }).then(
      (invite) => setState({ kind: "loaded", invite }),
      () => setState({ kind: "error" }),
    );
  }, [code, audience]);

  useEffect(() => {
    load();
  }, [load]);

  const ok = state.kind === "loaded" && state.invite.state === "ok" ? state.invite : null;

  return (
    <StoryShell heading={heading(ok ? firstName(ok.fullName) : null)}>
      {state.kind === "loading" && <MessageCard title="Loading your invitation…" />}
      {state.kind === "error" && (
        <MessageCard title="We couldn't load your invitation">
          <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
            Please check your connection and try again.
          </p>
          <button type="button" onClick={load} className={`mt-5 ${BTN_PRIMARY}`} style={BTN_PRIMARY_STYLE}>
            Try again
          </button>
        </MessageCard>
      )}
      {state.kind === "loaded" && state.invite.state === "invalid" && <InvalidLinkCard />}
      {state.kind === "loaded" && state.invite.state === "submitted" && <AlreadyReceivedCard />}
      {ok && children(ok)}
    </StoryShell>
  );
}
```

- [ ] **Step 8: Routes**

`src/routes/alumni.story.index.tsx` — keep its header comment and `head`; the component becomes:

```tsx
function GeneralStoryPage() {
  return (
    <StoryShell heading="Share your Alpha story">
      <StoryWizard code={null} initial={EMPTY_DRAFT} />
    </StoryShell>
  );
}
```

`src/routes/alumni.story.$code.tsx` — replace the whole file:

```tsx
/**
 * A personal alumni story link. The code in the URL is the only credential.
 * The referrer policy keeps the code out of any request to another site.
 */
import { createFileRoute } from "@tanstack/react-router";
import { EMPTY_DRAFT } from "@/lib/story/fields";
import { InviteGate } from "@/components/alumni/story-wizard/invite-gate";
import { StoryWizard } from "@/components/alumni/story-wizard/story-wizard";

export const Route = createFileRoute("/alumni/story/$code")({
  head: () => ({
    meta: [
      { title: "Share your story · Alpha Schools" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: PersonalStoryPage,
});

function PersonalStoryPage() {
  const { code } = Route.useParams();
  return (
    <InviteGate
      code={code}
      audience="alumni"
      heading={(name) => (name ? `${name}, share your Alpha story` : "Share your Alpha story")}
    >
      {(invite) => (
        <StoryWizard
          code={code}
          initial={{
            ...EMPTY_DRAFT,
            fullName: invite.fullName,
            schoolSlug: invite.schoolSlug ?? "",
            gradYear: invite.gradYear ? String(invite.gradYear) : "",
          }}
        />
      )}
    </InviteGate>
  );
}
```

`src/routes/parents.story.index.tsx`:

```tsx
/**
 * The general parent story link. Unlisted: shared by staff, kept out of
 * search. Personal parent links live at /parents/story/$code.
 */
import { createFileRoute } from "@tanstack/react-router";
import { EMPTY_PARENT_DRAFT } from "@/lib/story/parent-fields";
import { ParentStoryWizard } from "@/components/alumni/story-wizard/parent-story-wizard";
import { StoryShell } from "@/components/alumni/story-wizard/story-shell";

export const Route = createFileRoute("/parents/story/")({
  head: () => ({
    meta: [
      { title: "Share your experience · Alpha Schools" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "For Alpha parents: tell us about your family's experience of the school.",
      },
    ],
  }),
  component: GeneralParentStoryPage,
});

function GeneralParentStoryPage() {
  return (
    <StoryShell heading="Share your experience of Alpha">
      <ParentStoryWizard code={null} initial={EMPTY_PARENT_DRAFT} />
    </StoryShell>
  );
}
```

`src/routes/parents.story.$code.tsx`:

```tsx
/**
 * A personal parent story link. The code in the URL is the only credential.
 * An alumni code opened here is refused (the invite's audience must match).
 */
import { createFileRoute } from "@tanstack/react-router";
import { EMPTY_PARENT_DRAFT } from "@/lib/story/parent-fields";
import { InviteGate } from "@/components/alumni/story-wizard/invite-gate";
import { ParentStoryWizard } from "@/components/alumni/story-wizard/parent-story-wizard";

export const Route = createFileRoute("/parents/story/$code")({
  head: () => ({
    meta: [
      { title: "Share your experience · Alpha Schools" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: PersonalParentStoryPage,
});

function PersonalParentStoryPage() {
  const { code } = Route.useParams();
  return (
    <InviteGate
      code={code}
      audience="parent"
      heading={(name) =>
        name ? `${name}, share your experience of Alpha` : "Share your experience of Alpha"
      }
    >
      {(invite) => (
        <ParentStoryWizard
          code={code}
          initial={{
            ...EMPTY_PARENT_DRAFT,
            fullName: invite.fullName,
            schoolSlug: invite.schoolSlug ?? "",
          }}
        />
      )}
    </InviteGate>
  );
}
```

- [ ] **Step 9: Verify**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "story-wizard|alumni.story|parents.story" ; npm test && npm run build`
Expected: no type errors in these files; tests and build pass; `src/routeTree.gen.ts` lists `/parents/story/` and `/parents/story/$code`.

`grep -rn "greetingName\|StoryShell>" src || echo ok` → `ok` (no stale props).

Against the running dev server:
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/parents/story` → 200, and the HTML contains `Share your experience of Alpha`.
- `curl -s http://localhost:8080/alumni/story | grep -c "Share your Alpha story"` → at least 1.
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/parents/story/not-a-code` → 200.

Record in the report which browser-only checks remain (step navigation, drafts, photo preview, focus, 375px) for Task 6.

- [ ] **Step 10: Commit**

```bash
git add src/components/alumni/story-wizard src/routes/alumni.story.index.tsx 'src/routes/alumni.story.$code.tsx' src/routes/parents.story.index.tsx 'src/routes/parents.story.$code.tsx' src/routeTree.gen.ts
git commit -m "Add the parent story form on a shared wizard frame" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Admin — parent panel and moderation queue

**Files:**
- Modify: `src/components/admin/invites/invite-panel.tsx`, `general-link-card.tsx`, `add-invite-form.tsx`, `bulk-import.tsx`, `invite-list.tsx`
- Modify: `src/routes/admin.testimonials.tsx`
- Modify: `src/components/admin/alumni-pending.tsx`

**Interfaces:**
- Consumes: `Audience` (Task 2); `createInvites({ accessToken, audience, rows })` (Task 3); `generalMessage`, `parentGeneralMessage`, `whatsappUrl`; `STORY_PROMPTS`, `PARENT_PROMPTS`.
- Produces: `InvitePanel({ audience })`, `GeneralLinkCard({ base, audience })`, `AddInviteForm({ audience, onCreated })`, `BulkImport({ audience, onImported })`, `InviteList({ audience, reloadKey })`.

Keep today's layout and classes. Only the audience-dependent pieces change.

- [ ] **Step 1: `InvitePanel` takes an audience**

In `invite-panel.tsx`:

```tsx
import type { Audience } from "@/lib/invites/audience";

const COPY: Record<Audience, { id: string; heading: string; description: string }> = {
  alumni: {
    id: "invite-alumni",
    heading: "Invite alumni",
    description:
      'Each former student gets their own link to a short form. When they send it, their story waits under "Awaiting review" below.',
  },
  parent: {
    id: "invite-parents",
    heading: "Invite parents",
    description:
      'Each parent gets their own link to a short form. Their quote is published as "Parent, <school>". When they send it, it waits under "Awaiting review" below.',
  },
};
```

Change the signature to `export function InvitePanel({ audience }: { audience: Audience })`, use `COPY[audience].id` for the section's `aria-labelledby` and the heading's `id`, `COPY[audience].heading` and `COPY[audience].description` for the text, and pass `audience` to `GeneralLinkCard`, `AddInviteForm`, `BulkImport` and `InviteList`. Update the file's top comment to say it serves either audience.

- [ ] **Step 2: `GeneralLinkCard`**

Signature `({ base, audience }: { base: string | null; audience: Audience })`. Then:

```tsx
const path = audience === "parent" ? "/parents/story" : "/alumni/story";
const link = base ? `${base}${path}` : "";
const inputId = `general-story-link-${audience}`;
const share = audience === "parent" ? parentGeneralMessage : generalMessage;
const who =
  audience === "parent"
    ? "For any parent without a personal invite: class WhatsApp groups, newsletters."
    : "For anyone without a personal invite: WhatsApp groups, status, newsletters.";
```

Use `inputId` for the label's `htmlFor` and the input's `id`, `{who}` for the label's second sentence, and `whatsappUrl(null, share(link))` for the share link. Import `parentGeneralMessage` and `type Audience`.

- [ ] **Step 3: `AddInviteForm`**

Signature `({ audience, onCreated }: { audience: Audience; onCreated: () => void })`.

- Validate with `validateContact(audience === "parent" ? { ...fields, year: "" } : fields)`.
- Send `createInvites({ data: { accessToken, audience, rows: [checked.draft] } })` (replacing the temporary `audience: "alumni"` from Task 3).
- Render the "Class of" field only when `audience === "alumni"`.
- Change the school field's label to `audience === "parent" ? "Child's school" : "School"`.

- [ ] **Step 4: `BulkImport`**

Signature `({ audience, onImported }: { audience: Audience; onImported: () => void })`.

- In `preview`, add `.eq("audience", audience)` before `.in("phone", ...)` in the already-invited lookup.
- In `importNow`, build rows as:
  ```ts
  const rows = batch.valid.map(({ line: _line, raw: _raw, ...draft }) =>
    audience === "parent" ? { ...draft, gradYear: null } : draft,
  );
  ```
  and send `createInvites({ data: { accessToken, audience, rows } })`.
- CSV help text: for parents render `Columns: name, phone, and optionally email and school (the child's school).` instead of the alumni sentence; keep the "Save from Excel or Google Sheets as CSV." sentence for both.
- Give the file input's surrounding ids (if any) and the tab buttons unique keys per audience if React warns; no other change.

- [ ] **Step 5: `InviteList`**

Signature `({ audience, reloadKey }: { audience: Audience; reloadKey: number })`.

- Add `.eq("audience", audience)` to the load query (before `.order`), and add `audience` to the `useCallback` dependency list.
- Empty-state text: `Nobody invited yet. Add someone above.` stays.
- Delete notice: `Invite for ${row.full_name} deleted. Any story they sent is kept.` stays.

- [ ] **Step 6: Two panels on the page**

In `src/routes/admin.testimonials.tsx`:

```tsx
    <div className="space-y-8">
      <InvitePanel audience="alumni" />
      <InvitePanel audience="parent" />
      <AlumniPendingQueue onChanged={() => setVersion((v) => v + 1)} />
      <AdminCrud key={version} config={CONFIG} />
    </div>
```

Update the component comment's first paragraph to: "Two invite panels sit on top, one for alumni and one for parents: invitations go out from there and come back as submissions in the queue." and replace "the alumni moderation queue" with "the moderation queue".

- [ ] **Step 7: Moderation queue shows parent submissions**

In `src/components/admin/alumni-pending.tsx`:

1. `PendingRow.answers` becomes `Record<string, string> | null`.
2. The load query: replace `.not("grad_year", "is", null)` with `.not("consent_at", "is", null)` (a submission is a row with a consent record; staff-typed rows have none).
3. Import `PARENT_PROMPTS` from `@/lib/story/parent-fields` and add at module level:
   ```ts
   const ALL_PROMPTS = [...STORY_PROMPTS, ...PARENT_PROMPTS];
   ```
   and use `ALL_PROMPTS` wherever the answers block currently uses `STORY_PROMPTS`.
4. Replace the single tag with two:
   ```tsx
   <span className="ml-1 rounded-full bg-[var(--color-deep-blue)]/5 px-2 py-0.5 text-xs font-bold text-[var(--color-deep-blue)]">
     {row.grad_year == null ? "Parent" : "Alumnus"}
   </span>
   <span className="ml-1 rounded-full bg-[var(--color-deep-blue)]/5 px-2 py-0.5 text-xs font-bold text-[var(--color-deep-blue)]">
     {row.invite_id ? "Invited" : "General link"}
   </span>
   ```
5. Empty state: `No stories waiting for review.`
6. Top comment: say the queue holds alumni and parent submissions (rows with a consent record), not only rows with a `grad_year`.

- [ ] **Step 8: Verify and commit**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "admin/invites|alumni-pending|admin.testimonials" ; npm test && npm run build && (grep -rl "SERVICE_ROLE_KEY\|INVITE_LINK_KEY" .output/public || echo clean)`
Expected: no type errors in these files; pass; `clean`.

`curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/admin/testimonials` → 200.

```bash
git add src/components/admin/invites src/routes/admin.testimonials.tsx src/components/admin/alumni-pending.tsx
git commit -m "Add the parent invite panel and queue parent stories" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Docs, setup and end-to-end check

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README**

In the "Alumni invites — setup" section:
- Rename the heading to `## Alumni and parent invites — setup`.
- In the migrations step, add `alpha_migration_parent_invites.sql` as the last file to run, and note it must be run again after any re-run of `alpha_migration_testimonial_invites.sql`.
- In "where things are", add: admin → Testimonials → "Invite parents"; general parent link `/parents/story`; personal parent links `/parents/story/<code>`; parent quotes publish as "Parent, <school>".

Commit:

```bash
git add README.md
git commit -m "Document parent invites setup" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 2: User setup (the user does this)**

Ask the user to run `alpha_migration_parent_invites.sql` in the Supabase SQL editor. Then confirm with the anon key that the private columns are still refused and the invites table is still closed (the checks from the alumni plan's Task 11).

- [ ] **Step 3: End-to-end, by hand**

1. Admin → Testimonials shows "Invite alumni" then "Invite parents"; each list shows only its own audience.
2. Add the same phone number to both panels: both succeed.
3. Parent: Copy link → the link is `/parents/story/<code>`; opening it greets the parent by first name with name and school pre-filled; complete all five steps and send.
4. The queue shows the story tagged **Parent** and **Invited**, with the three parent answers under their questions. Approve it: it appears under "What parents say" on the homepage and on that school's page as "Parent, <school>", and not on `/alumni`.
5. Open the parent code at `/alumni/story/<code>` → "This link no longer works". Open an alumni code at `/parents/story/<code>` → same.
6. General parent link `/parents/story` → submit → queue shows **Parent** and **General link**.
7. The alumni flow still works end to end (invite, send, queue shows **Alumnus**).
8. Send on WhatsApp for a parent opens the parent message.
9. 375px: both forms and both admin panels fit without horizontal scrolling.
