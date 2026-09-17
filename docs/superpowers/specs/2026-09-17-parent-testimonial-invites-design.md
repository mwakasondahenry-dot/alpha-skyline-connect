# Parent Testimonial Invites — Design

**Date:** 2026-09-17
**Status:** Approved in conversation
**Extends:** `docs/superpowers/specs/2026-09-17-alumni-testimonial-invites-design.md`
(everything there still holds unless this document changes it)
**Brief:** Staff should be able to invite parents to write testimonials the same
way they invite alumni: add one, paste a list or upload a CSV, send a personal
link on WhatsApp, or share a general link. Parents get a step-by-step form like
the alumni one.

## Decisions

| Question | Decision |
|---|---|
| Published attribution | **"Parent, <school>"**, e.g. "Parent, Alpha Girls". No child's name or class is collected. |
| Admin layout | **Two separate panels** on the Testimonials page: "Invite alumni" (unchanged) and "Invite parents" below it. |
| Links | General `/parents/story`; personal `/parents/story/<code>`. |
| Same phone in both lists | Allowed: phone numbers are unique **per audience**. |
| Parent prompts | "Why did you choose Alpha?", "What has changed for your child since joining?", "What would you tell a parent deciding now?" — all optional, never published. |
| WhatsApp message | *"Hello {first name}, Alpha Schools would love to share your experience as a parent on our website. It takes about 5 minutes: {link}"* |
| General-link share message | *"Are you a parent at Alpha? Alpha Schools would love to share your experience on our website. It takes about 5 minutes: {link}"* |

## 1. Data

New migration `alpha_migration_parent_invites.sql`, idempotent, run after
`alpha_migration_testimonial_invites.sql`.

- `testimonial_invites.audience text not null default 'alumni'`, check
  `audience in ('alumni','parent')`. Existing rows become alumni.
- Replace the unique constraint on `phone` with a unique constraint on
  `(audience, phone)`.
- `submit_invited_story` gains `p_audience text`. The old 12-argument version
  is dropped and the new one created, with the same grants (service_role only).
  It returns `'invalid'` when the invite's audience differs from `p_audience`,
  otherwise behaves exactly as before.
- No change to `testimonials`. A parent story is a row with `grad_year` null,
  `relationship` = `"Parent, " || <school label>`, `school_slug` = the chosen
  school, `company` and `city_country` null, `answers` holding the parent
  prompt keys (`chose_alpha`, `changed`, `advice_parents`), `published = false`.
  This is the existing parent-quote shape, so approved stories appear in the
  existing "What parents say" sections with no reader changes. The anon column
  grant from the alumni migration already covers every column these readers use.

## 2. Pure modules

- `src/lib/story/parent-fields.ts`: `PARENT_PROMPTS`, `ParentDraft`
  (`fullName`, `schoolSlug`, `answers`, `quote`, `consent`), `EMPTY_PARENT_DRAFT`,
  `checkParentAbout`, `checkParentPrompts`, reuse `checkQuote`-equivalent and
  `checkConsent`-equivalent rules, `parentDraftToForm`, `validateParentStory`
  returning `ParentStoryInput` (`code`, `fullName`, `schoolSlug`, `relationship`,
  `answers`, `quote`). Limits and consent text come from `fields.ts`.
  The form carries `audience=parent`.
- `src/lib/invites/audience.ts`: `type Audience = "alumni" | "parent"`,
  `AUDIENCES`, `isAudience`.
- `token.ts`: `storyPath(code, audience = "alumni")` returns
  `/parents/story/<code>` for parents.
- `whatsapp.ts`: `parentInviteMessage`, `parentGeneralMessage` with the wording
  above.

## 3. Server

- `submitStory` reads `audience` from the form (missing means alumni, so old
  alumni forms keep working), validates with the matching validator, rate
  limits as today, and passes `p_audience` to the RPC for personal links. The
  general parent link inserts the parent-shaped row directly.
- `openInvite({ code, audience })` returns `invalid` when the audience does
  not match; the `ok` result no longer needs `gradYear` for parents (null).
- `createInvites({ accessToken, audience, rows })`: parent rows always store
  `grad_year` null; the existing-phone lookup is per audience.
- `getInviteLink` builds the link and message from the invite's audience.
- `regenerateInvite` unchanged.

## 4. Parent form

Routes `src/routes/parents.story.index.tsx` and
`src/routes/parents.story.$code.tsx`, `noindex`, same page chrome. The wizard
frame (step indicator, navigation, error line, submit, result cards, saved
draft, focus handling) is shared with alumni; each audience supplies its steps,
checks, intro and form builder. Heading: "Share your experience of Alpha"
("{First name}, share your experience of Alpha" on a personal link). Steps:
About you · Your experience · Your quote · Photo and consent · Check and send.
Draft storage key `alpha-parent-draft:<first 12 chars of code | general>`.

## 5. Admin

- `InvitePanel` takes `audience`. Heading, description, general link, share
  message and invite list follow it. The parent "Add one person" form has no
  class-of field; bulk import ignores a year column for parents.
- `admin.testimonials.tsx` renders the alumni panel, then the parent panel,
  then the moderation queue and the table.
- The moderation queue lists unpublished rows that carry a consent record
  (i.e. submissions), alumni and parents alike. Each row is tagged **Alumnus**
  or **Parent** (from `grad_year`) and **Invited** or **General link**, and
  story answers show under their own prompt labels for either audience.

## 6. Testing

Unit: parent validation and form round trip, `storyPath` per audience, parent
messages, audience helper. By hand after the migration: invite a parent, send
the link, complete the form, approve, and see the quote under "What parents
say" on the homepage and the school page; confirm an alumni code opened at
`/parents/story/<code>` is refused.

## Follow-up (separate change, after this)

Remove the three `[Parent testimonial — to be provided by the school]`
placeholder cards on `/testimonials` at the owner's request, so the page shows
only real quotes (and hides the section when there are none, per PRODUCT.md).
