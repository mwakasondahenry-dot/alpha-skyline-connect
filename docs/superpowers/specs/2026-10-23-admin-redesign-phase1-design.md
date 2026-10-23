# Admin redesign, phase 1: Today, Stories, Inbox, Alumni, and a working shell

Date: 2026-10-23. Source: the admin critique of the same day
(`.impeccable/critique/2026-10-23T07-29-46Z__src-routes-admin-tsx.md`, scores
14/40 usability, 6/20 technical) and the owner's answers to four questions.

## Why

The owner said: "I am having a difficult time reviewing and publishing
testimonials. It's not user friendly." The critique found why:

- The review queue is the third block on `/admin/testimonials`, under two full
  invite panels; on a phone it is several screens down a ~20,000px page.
- Editing a story before publishing means finding it in a second table lower on
  the page, whose Edit button is clipped on a phone, and the queue card then
  shows stale text.
- Approve gives no confirmation; the site shows the story up to ~5 minutes
  later (edge cache) and nothing says so.
- Unpublishing returns a story to "Awaiting review", beside a Reject that
  deletes it permanently.
- Contact enquiries cannot be read at all: `/admin/messages` is not in the nav,
  never shows the message body, and only offers Delete.

The people using it are school office staff, non-technical, often on a
mid-range Android phone, interrupted between other duties. Success: a staff
member opens the admin, sees "3 stories waiting, 1 new enquiry", and can
review, fix, publish or decline a story, or read and answer an enquiry, from a
phone, with every action confirming what happened.

## Owner decisions (2026-10-23)

1. **Order:** phase 1 is the shell, Today, Stories and Inbox, plus the fixes
   that make the remaining screens usable on a phone. Phase 2 (News & events,
   Photos, People redesign) is a separate spec.
2. **Declining a story keeps it.** It moves to a Declined tab with an optional
   reason, and can be restored or the person re-invited. No accidental loss.
3. **Alerts are counts inside the admin only.** No email, no WhatsApp sending.
4. **Home ordering is a "Feature on home" pin**, with the few featured stories
   orderable. It replaces the numeric Order box.

## Goals

- One place to review stories, reachable in one tap from anywhere, with a count.
- See each story exactly as it will appear: whole photo (never cropped), the
  text, name, role, school.
- Edit a story's text, name, role and school in the same place you publish it.
- Every action states its outcome next to the thing acted on, and offers Undo
  where the action is reversible.
- Read every enquiry in full and act on it (reply, mark done) from a phone.
- Every admin list usable at 375px; every control at least 44px.

## Non-goals (phase 1)

- Redesigning News, Events, Photos, Hero slides, Staff, Facilities, Gallery.
  They only get the shared shell and the phone-safe list and form fixes below.
- Outside notifications (email, WhatsApp, push).
- Roles and permissions beyond today's single staff role (see Hardening).
- Kiswahili admin UI.

## Anti-goals (would make this a failure even if it works)

- Any path that publishes a story without its photo being copied to public
  storage (today's CRUD Published checkbox does this).
- Any one-tap permanent delete of a submitted story.
- A screen that blanks to "Loading…" after an action and loses the reader's
  place.
- Invented content: the admin never pre-fills quotes or names. Testimonial
  sections on the public site still hide when nothing is published.
- Looping or decorative motion; a JS animation library.

## Constraints

- Stack stays: TanStack Start, React, Tailwind v4, Supabase. `ssr: false` and
  noindex on `/admin` stay.
- Design tokens only (`src/styles.css`); follow DESIGN.md. Gold is a fill with
  `--color-accent-foreground` text, never white text on gold, never small gold
  text on white. The visual model is the School photos page
  (`src/routes/admin.photos.tsx`, `src/components/admin/photo-slot-card.tsx`):
  content shown the way the site shows it, editing in place, 44px targets.
- Motion per the admin motion audit
  (`motion-audits/admin/alpha-admin-motion-audit-2026-10-23.html`): one curve
  `--ease-out`; 120ms press (scale .97) and hover colour; 150ms label swaps and
  all exits; 200ms dialog/sheet and status line (opacity + small rise) and rows
  closing up; 1200ms gold tint fading off a changed row; spinners appear only
  after 300ms. Never animate routes, tabs, filters or first-load rows. Under
  reduced motion: no transitions, static icons, outcomes still announced as text.
  Row collapse may use the Web Animations API (native, not a library).
- Database changes are SQL migration files at the repo root, run by the owner
  in the Supabase SQL editor (as with the four earlier migrations; see
  docs/DEPLOY.md). The code must keep working, read-only at least, before the
  migration is run, or the release notes must say the migration comes first.
- Branch syncs to Lovable: no force push, no history rewriting (AGENTS.md).
- Keep the existing consent and private-photo pipeline intact
  (`src/components/admin/alumni-pending.tsx`): copy photo, then publish, then
  remove the pending copy; consent required to publish; small photo copy made
  on publish (`src/lib/testimonial-photo.ts`).

## Information architecture

Top level, by job, not by table (Alumni sits between Inbox and News & events):

| Area | Route | Contents |
|---|---|---|
| Today | `/admin` | Counts with links: stories waiting, new enquiries, empty photo positions (reuse the tally from `admin.photos.tsx`). Recently published stories. No developer notes. |
| Stories | `/admin/stories` | Tabs: Waiting, Live, Hidden, Declined. Story detail. "Invite people" sub-page. |
| Inbox | `/admin/inbox` | Enquiries: New, Done. Message detail. |
| Alumni | `/admin/alumni` | Every former student the school knows of, searchable and filterable. Person detail. (Added by the owner, 2026-10-23.) |
| News & events | existing `/admin/news`, `/admin/events` | Unchanged screens inside the new shell (phase 2 redesigns). |
| Photos | existing `/admin/photos`, `/admin/hero-slides`, `/admin/facility-photos`, `/admin/facilities`, `/admin/gallery` | Grouped under one menu entry with a small sub-menu; Facilities and Activities gallery become reachable. |
| People | existing `/admin/staff` | Unchanged inside the new shell. |

Old routes `/admin/testimonials` and `/admin/messages` redirect to
`/admin/stories` and `/admin/inbox`.

**Shell.** Desktop: a left sidebar with the six areas, count badges on Today
(total), Stories (waiting) and Inbox (new). Phone (<768px): a fixed bottom bar
with Today, Stories, Inbox and More (More opens a sheet with Alumni, News &
events, Photos, People, Sign out). Badges are numbers in a navy pill, not colour alone.
The current page is marked with `aria-current="page"`.

## Story lifecycle

Explicit states replace the `published` boolean as the thing staff reason
about:

| State | Meaning | Shown on site |
|---|---|---|
| Waiting | Submitted with consent, not yet decided | No |
| Live | Published | Yes |
| Hidden | Was live, taken down by staff | No |
| Declined | Staff decided not to publish; kept with optional reason | No |

Data: add `status text not null` with check in
(`waiting`,`live`,`hidden`,`declined`), `decline_reason text`,
`featured boolean not null default false`, `featured_order int`,
`decided_at timestamptz`. Backfill: `published = true` → `live`;
`published = false and consent_at is not null` → `waiting`; any other
unpublished row (staff-typed drafts) → `hidden`. Keep `published` in sync
(`published = (status = 'live')`) so the public site queries and RLS
(`published = true`) keep working unchanged; simplest is a trigger or a
generated column, builder's choice. The waiting-queue filter becomes
`status = 'waiting'`, which fixes the "unpublished story reappears in the
queue" trap.

Transitions and who does them:

- Waiting → Live: **Publish**. Runs the photo-copy pipeline (copy to public,
  small copy, set `photo_url`, clear `pending_photo_path`), then sets status.
  This is the **only** publish path; no form elsewhere can set Live directly on
  a row that has a `pending_photo_path`.
- Waiting → Declined: **Decline**, with an optional reason. The pending photo is
  kept (private bucket) so Restore works.
- Declined → Waiting: **Restore**.
- Live → Hidden: **Hide from site**. Hidden → Live: **Show on site**.
- Hidden or Declined → deleted: **Delete permanently**, behind a confirmation
  dialog that names the person. This is the only delete.
- Every transition guards on the current state in the update
  (`.eq("status", expected)`) and checks the affected row count, so a stale
  screen or a second staff member cannot act on a story that has moved; the UI
  then says "This story was already published by someone else" and refreshes
  that one card.

Invites: link invite rows to their story and back where `invite_id` exists.

**Re-inviting a declined person** (my call, 2026-10-23): from a Declined story
that came from a personal invite, **Invite again** issues a fresh link on the
same invite row. The declined story is kept but unlinked from the invite
(`invite_id` set to null, the invite's id recorded in its answers for history),
so `testimonials_invite_uniq` still holds and the new submission arrives as a
separate Waiting story. `regenerateInvite` and the submit paths
(`submit_invited_story`, the server function) must allow a `submitted` invite
whose story is Declined. Restore remains possible on the old story
independently. Re-inviting people who used the general link (no invite row) is
out of phase 1.

**Consent on Show on site** (owner decision, 2026-10-23): Waiting → Live
requires a consent record (as today). A New story requires the consent tick.
Hidden → Live is allowed without a consent record, but every story with no
`consent_at` shows a visible "No consent on record" note in the list and the
detail, so staff know.

## Stories screen

**List (each tab).** Cards, not a table, at every width. Each card: whole photo
thumbnail (the `WholePhoto` component from `src/components/testimonials/whole-photo.tsx`,
using the small copy), name, role and class, school label (human name, not
slug), first two lines of the quote, a star if featured, the date submitted or
published. Tap opens the story. Waiting is ordered oldest first (fair queue);
Live newest first, with featured ones on top in their order. Counts on each tab.

**Story detail.** A full page on a phone, a side panel beside the list on
desktop. Top to bottom:

1. The whole photo, large enough to judge (shown uncropped; tap to view full
   size). For waiting stories it comes from a signed URL of the private photo,
   refreshed automatically before it expires (today it breaks after 10 minutes).
2. **Preview**: the quote, name and role rendered with the same component and
   type as the public `/testimonials` card, labelled "How it will look".
3. **Edit** fields, inline (no modal): **Who is speaking** (Parent / Former
   student, explicit; my call, so clearing a year can never silently move a
   story between the alumni and parent sections), Quote (multi-line), Name,
   Role or job, Company, Class of (required for a former student, hidden for a
   parent, never defaults to 0), School (a select with human names: Alpha
   Schools, Nursery & Primary, Alpha High, Alpha Girls), and **Photo**: add,
   replace or remove (my call). An uploaded photo is compressed in the browser
   (`compressImage`) and its small copy made (`makeSmallCopy`,
   `smallPhotoPath`). For Waiting stories a new photo replaces the private
   pending photo; for Live, Hidden and new stories it goes to the public
   `media` bucket at `testimonials/story-<id>` like an approved photo. Changes
   update the preview live. Save is explicit, and leaving with unsaved changes
   asks first.
4. Private details, collapsed: contact details, their answers, consent text and
   time, which invite or link it came from.
5. A sticky action bar at the bottom (thumb reach): for Waiting, **Publish**
   (gold, ink text) and **Decline**; for Live, **Feature on home** toggle and
   **Hide from site**; for Hidden, **Show on site** and **Delete permanently**;
   for Declined, **Restore** and **Delete permanently**. Publish with unsaved
   edits saves first.

**Outcome feedback.** After Publish: the button shows a check, the card leaves
the Waiting list (150ms exit, neighbours close up over 200ms), and a status
line appears where the card was: "Published Keith's story. It will appear on
the website within about 5 minutes. View on site · Undo". Undo reverts within
the same session (Live → Waiting; photo stays public). Decline and Hide get the
same pattern with Undo. Errors appear on the card that failed, in plain
language (a mapping from Supabase/Postgres errors: "Your sign-in has expired,
sign in again and your changes will be kept", "This story was changed by
someone else", "No internet connection, nothing was saved"). All outcomes are
also announced in one always-mounted `aria-live="polite"` region.

When the last waiting story is handled, the Waiting tab shows "All caught up"
with a single gold check that draws once (the one delight moment; static under
reduced motion).

**Feature on home.** Live stories have a star toggle. Featured stories lead the
home page "In their words" in `featured_order`; the rest follow newest first.
A small "Featured on home" strip at the top of the Live tab lists them with
up/down buttons to reorder (each swap animates natively; no drag library). The
public `/testimonials` page keeps its own ordering and the admin says so in one
line under the strip. The numeric Order field disappears from the UI
(`sort_order` stays in the table, unused).

**Adding a story by hand** (office types a quote received on paper): a "New
story" button on the Live and Hidden tabs opens the same detail screen empty,
saved as Hidden until staff press Show on site, with a required checkbox
"This person agreed to have their words on the website" that records consent
text and time. This replaces the CRUD testimonials table and its
published-by-default behaviour.

**Invite people** (`/admin/stories/invite`): the existing invite components,
one audience at a time via a two-option switch (Former students / Parents)
instead of two stacked panels; the general link card on top, the list below.
Fix the small invite row buttons to 44px.

## Inbox screen

**List.** Cards: name, subject (or "No subject"), first line of the message,
school label, received time in Dar es Salaam time and a readable format
("Today 17:02", "18 Oct 2026"). Tabs: New, Done. New messages carry a dot and
bold name. Counts on tabs.

**Message detail.** Full message text, name, phone, email, school, time.
Actions (44px, sticky at the bottom on a phone): **Reply on WhatsApp**
(`wa.me` link with the phone normalised to +255, opened before any await so
popup blockers do not stop it, reusing the invite list's approach), **Call**
(`tel:`), **Email** (`mailto:` with "Re: <subject>"), and **Mark as done**
(status `archived`; "done" in the UI). Opening a message marks it read
(status `read`), shown as no longer bold. Delete is available only from Done,
behind a confirmation dialog. Status changes use the same outcome line with
Undo.

`contact_messages.status` already allows `new`, `read`, `archived`; no schema
change needed for Inbox.

## Alumni screen (owner request, 2026-10-23)

The owner asked for "an alumni section where I can view and search an alumni
list with filters". The school is building an alumni network, and since
2026-10-22 the story form collects former students' email and phone for it
(`alpha_migration_alumni_contact_privacy.sql`). Today that information is only
visible one story at a time in the review queue.

**Who is in the list.** One row per former student, merged from two sources:

- `testimonial_invites` with `audience = 'alumni'`: name, phone, email, school,
  class year, invite status.
- `testimonials` with `grad_year is not null`: name, role, company, city or
  country, school, class year, story status, photo, and the private email and
  phone in `answers`.

Merge rule: a story joins its invite through `invite_id`; otherwise a story and
an invite are the same person when their phone numbers match after
normalising to `+255…`. Anything left unmatched is its own person. Where both
sources give a value, the more recent one wins and the other is not shown
(builder may show both if they differ). Parents are not in this list.

**List.** Search box at the top (name, phone, email, company, role, city;
matches as you type, case and accent insensitive). Filters, as chips that
open a small picker, each showing counts:

- School (Alpha High, Alpha Girls, Nursery & Primary, not recorded)
- Class of / graduation year (owner request): every year present with its
  count, tap one for a single class; or a from–to range, plus quick picks by
  decade
- Story (none, waiting, live, hidden, declined)
- Invite (not invited, invited, opened, submitted)
- City or country (the values present)
- Has photo / has email / has phone

Active filters show as removable chips with a "Clear all". Sort: name A–Z,
class year (newest first, the default), recently added. A result count line
("42 former students · 3 filters"). Filters and search are kept in the URL so
a filtered list can be bookmarked and survives a refresh. Phone: cards (photo,
name, class and school, role at company, **the submitted phone and email,
each tappable to call or email** (owner request), small status labels); desktop: a
table with a sticky header that scrolls sideways if it must, never clips. The
list loads once and filters on the device; it is expected to stay in the low
thousands.

**Person detail.** Photo (whole), name, school, class, role, company, city;
contact with one-tap actions (WhatsApp, Call, Email, using the Inbox
helpers); their story, with its status and a link to it in Stories; their
invite, with its status and a link to the Invite page; dates first invited and
first submitted.

**Export** (my call): "Download list" exports the current filtered list as a
CSV for the office's own use (spreadsheet, WhatsApp broadcast list). It
includes contact details, so it is behind a one-line notice ("This file
contains phone numbers and emails. Keep it inside the school.") and is never
generated server-side or stored.

**Not in phase 1:** editing a person's details here (they are edited through
their story or invite), merging duplicates by hand, adding people who have
neither an invite nor a story (an import of an old class list would be a
phase 2 feature), messaging many people at once.

Alumni contact details stay internal: the screen reads them as staff only, and
nothing about the public site changes.

## Today screen

Three count cards with links (Stories waiting, New enquiries, Photo positions
still empty), each a full-width tappable card on a phone. Under them, the last
five stories published, with who published them only if that is cheap to
record (`decided_by uuid` on the testimonial, optional, builder's call). If all
counts are zero: "Nothing needs you right now." No developer notes.

## Fixes to the remaining screens (inside the new shell, phase 1)

These use `src/lib/admin-crud.tsx` and must stop being broken on a phone:

- Below 768px the list renders as stacked cards (key fields, then Edit and
  Delete at 44px); above, the table scrolls horizontally instead of clipping.
- Form labels are linked to inputs (`htmlFor`/`id`); required fields carry
  `aria-required`; field errors show next to the field and the first error is
  focused and scrolled into view.
- The edit form uses the Radix `Dialog` already in `src/components/ui/`
  (Sheet from the bottom on a phone): focus trap, Esc, focus return, titled.
  Its enter animation follows the motion spec and is removed under reduced
  motion.
- Delete uses an AlertDialog naming the item, not `window.confirm`; errors use
  the plain-language mapping, not `alert()`.
- Nullable number fields default to empty, never 0.
- Image upload runs `compressImage()` (as `photo-slot-card` does), shows a busy
  state, disables Save until the upload finishes, and the file input is
  keyboard reachable (`sr-only`, focus ring on its label).
- After any save or delete, the list updates in place (no full "Loading…"
  swap), the changed row gets the 1200ms gold tint, and the outcome line
  appears.
- Dates show in readable form; slugs and ids show as names (school name,
  facility name).
- Gold buttons use ink text; no gold text on white.

## Technical notes for the builder

- Refreshing must not unmount content: keep previous data while refetching
  (TanStack Query is already in the app; using it for admin data is the
  builder's call) and depend on `session?.user.id`, not the session object.
- Signed URLs for private photos: create them in one `createSignedUrls` call,
  keep them across refreshes, renew before expiry.
- Busy state per row (a Set), not one shared id.
- Session expiry: keep unsaved form state (sessionStorage draft keyed by route
  and record id) and return to the same page after sign-in (`redirect` param on
  `/admin/login`).
- After publish/hide/feature, purging the edge cache for the testimonial keys
  is optional (it only clears one Cloudflare location); the "about 5 minutes"
  line is the required part.
- Error mapping lives in one module and is unit tested.
- Tests: unit tests for the state transitions (allowed moves, guarded update
  builder), the error mapping, the phone-number normaliser, the date formatter,
  and the nullable-number default. Existing 548 tests must stay green.

## Hardening (phase 1, small)

RLS today treats any signed-in account as staff. Sign-ups are disabled in
Supabase (checked 2026-10-23), so this is not exploitable now. Phase 1's
migration should still make `is_staff()` check `profiles.role in
('editor','admin')` and use it in the testimonials and contact_messages
policies it touches, after confirming every current staff account has one of
those roles. Builder to list current profiles' roles before changing the
policy, and stop and ask if any staff account would lose access.

## Left to the builder

- Exact component breakdown, file names, and whether Stories/Inbox share a
  generic "list + detail" layout component (they probably should).
- Whether `published` sync is a trigger or a generated column.
- Visual details within DESIGN.md: spacing, card composition, iconography from
  lucide.
- Whether Today's "recently published" shows who published.

## Done means

- From a 375px phone: open admin, see counts, open a waiting story, see the
  whole photo, fix a typo, publish, see the confirmation, find it under Live,
  feature it, and see it lead "In their words" on the home page after the cache
  window. Decline another with a reason, find it under Declined, restore it.
- Read an enquiry in full and open WhatsApp to reply in two taps; mark it done.
- Find every Alpha High former student of the classes of 2015–2019 who works
  in Dar es Salaam and has an email, in under 30 seconds on a phone; open one
  and call them; download that filtered list as a CSV.
- Every admin list on a 375px phone shows its actions; no control under 44px in
  the new screens; no white text on gold anywhere in admin.
- Typecheck, lint and tests pass; the migration file is in the repo with run
  order noted in docs/DEPLOY.md.
