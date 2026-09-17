# Alumni Testimonial Invites — Design

**Date:** 2026-09-17
**Status:** Awaiting review
**Brief:** On the Testimonials admin page, staff invite alumni to write a
testimonial — by uploading a CSV of names and phone numbers, or by typing one
in (email optional). Each alumnus gets a link that walks them step by step
through questions and ends in a testimonial for moderation.

## Why

The only way in today is `/alumni/submit`: an open, one-page form shared by
word of mouth. Staff cannot tell who was asked, who replied, or who needs a
reminder, and the form gives an alumnus nothing to help them write — a blank
400-character box. The school holds lists of alumni contacts (mostly phone
numbers) and reaches people on WhatsApp.

## Decisions

| Question | Decision |
|---|---|
| How the link reaches the alumnus | A **Send on WhatsApp** button (opens `wa.me` with the message pre-filled; staff tap send) plus **Copy link**. No SMS or email provider. |
| Link shape | **One personal link per invite**, re-shareable: the same link can be sent again as a reminder. |
| Steps | About you → Where you are now → Story prompts → Quote → Photo + consent → Review. |
| Published quote | **Written by the alumnus** in a dedicated step. Prompt answers are kept for staff as background, never published. |
| Existing open form | `/alumni/submit` is unchanged. Invites are a separate route. |

Approach chosen over the alternatives: a dedicated invites table and route
(rather than converting `/alumni/submit` into the wizard, which was kept to one
page deliberately for mobile data, or storing invites as placeholder rows in
`testimonials`, which would mix contact details into public content).

## 1. Data

New migration file `alpha_migration_testimonial_invites.sql` at the repo root,
idempotent, pasted into the Supabase SQL editor like the earlier ones.

### `public.testimonial_invites`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `full_name` | text not null | ≤ 120 chars |
| `phone` | text not null | E.164, e.g. `+255712345678`. **Unique** — one invite per number. |
| `email` | text null | Stored only; nothing is sent to it. |
| `school_slug` | text null → `schools(slug)` | Optional pre-fill. |
| `grad_year` | int null | Optional pre-fill; same range check as `testimonials`. |
| `token_hash` | text not null unique | SHA-256 hex of the link code. Used for lookup. |
| `token_cipher` | text not null | AES-GCM encryption of the link code (`base64(iv ‖ ciphertext)`), so staff can re-share the same link. |
| `status` | text not null default `'pending'` | `pending` \| `opened` \| `submitted` (check constraint). |
| `expires_at` | timestamptz not null | `now() + 60 days` at creation and on regenerate. "Expired" is derived, not a status. |
| `opened_at`, `submitted_at`, `last_shared_at` | timestamptz null | |
| `created_by` | uuid null → `auth.users` | |
| `created_at` | timestamptz not null default now() | |

RLS enabled. Staff (`is_staff()`) may select, update and delete. **No insert
policy and no anon access**: rows are created only by the server function,
because creating one requires the encryption key. `token_hash` and
`token_cipher` are useless without the server key, so staff reads are safe.

### `public.testimonials` — added columns

- `invite_id uuid null → testimonial_invites(id) on delete set null` —
  marks an invited submission. Deleting an invite never deletes a story.
- `answers jsonb null` — `{ "gave_you": "...", "moment": "...", "advice": "..." }`.
- `city_country text null`.

Existing mapping is kept: role → `relationship`, company → `company`,
quote → `quote`, school attended → `school_slug`.

### `public.submit_invited_story(...)` — SECURITY DEFINER, service_role only

Takes the token hash and the validated fields. In one transaction it locks the
invite row (`for update`), rejects it unless it exists, is unexpired and is not
`submitted`, inserts the unpublished `testimonials` row (`published = false`
as a literal), and sets the invite to `submitted` with `submitted_at`. This is
what makes a double-tapped Submit produce exactly one story.

## 2. Server side

### Configuration

- `ALPHA_SUPABASE_SERVICE_ROLE_KEY` — already required, currently empty in
  `.env.local`.
- `INVITE_LINK_KEY` — **new**, server-only, 32 random bytes base64. Encrypts
  link codes. Losing or rotating it makes existing links un-shareable (they
  still open; staff would regenerate to share again).
- `PUBLIC_SITE_URL` — **new, optional**. Base for generated links. Falls back
  to the request origin; the admin panel shows a warning when the base is
  `localhost`, since such links will not work on an alumnus's phone.

### Modules

- `src/lib/invites/phone.ts` — `normalizeTzPhone(input)`: strips spaces,
  dashes and brackets; accepts `07XXXXXXXX`, `7XXXXXXXX`, `255XXXXXXXXX`,
  `+255XXXXXXXXX`; returns E.164 or an error reason. Non-Tanzanian `+` numbers
  are accepted if they are 8–15 digits.
- `src/lib/invites/csv.ts` — dependency-free parser (quoted fields, commas and
  newlines in quotes, BOM, CRLF). Header matching is case- and space-insensitive
  with aliases: name (`name`, `full name`), phone (`phone`, `phone number`,
  `mobile`, `whatsapp`), email, school (`alpha high`/`high` → `alpha-high`,
  `alpha girls`/`girls` → `alpha-girls`, `nursery`/`primary` →
  `nursery-primary`), year (`year`, `class of`, `grad year`). Returns
  `{ valid, invalid: {row, reason}[], duplicatesInFile }`. Cap: 500 rows.
- `src/lib/invites/token.ts` — `newLinkCode()` (32 random bytes, base64url),
  `hashCode()`, `encryptCode()` / `decryptCode()` (Web Crypto AES-GCM; works
  in Node and on Cloudflare Workers).
- `src/lib/invites/whatsapp.ts` — `inviteMessage(name, link)` and
  `whatsappUrl(phone, text)` → `https://wa.me/<digits>?text=<encoded>`.
  Message: *"Hello {first name}, Alpha Schools would love to feature your story
  on our alumni page. It takes about 5 minutes: {link}"*
- `src/lib/image-sniff.ts` — the magic-byte check moved out of
  `alumni.functions.ts` so both flows share it (no behaviour change).
- `src/lib/staff-guard.server.ts` — `requireStaff(accessToken)`: verifies the
  Supabase session token with `auth.getUser` and checks for a `profiles` row.
  Admin server functions receive the browser session's access token as input.

### Server functions — `src/lib/invites.functions.ts`

Staff-only (each calls `requireStaff`):

- `createInvites({ accessToken, rows })` — re-validates every row, skips phones
  already invited (reports them), generates code/hash/cipher, inserts. Returns
  `{ created, skippedExisting, invalid }`.
- `getInviteLink({ accessToken, inviteId })` — decrypts, returns the link and
  the WhatsApp URL, stamps `last_shared_at`. Refuses submitted invites.
- `regenerateInvite({ accessToken, inviteId })` — new code, new expiry,
  status back to `pending`. Refuses submitted invites. Old link stops working.

Public:

- `openInvite({ code })` — looks up by hash. Returns one of
  `{ state: "ok", firstName, fullName, schoolSlug, gradYear }`,
  `{ state: "submitted" }`, `{ state: "invalid" }` (unknown or expired — not
  distinguished, so codes cannot be probed). Sets `opened` / `opened_at` on
  first open. Never returns phone, email or ids.
- `submitInvitedStory(FormData)` — rate-limited through the existing
  `claim_submission_slot` (key `invite:<ip>`), validates all fields with the
  same limits and error-message discipline as `submitAlumniStory`
  (`SubmissionError` for user-facing text, generic text for everything else),
  uploads the optional photo to `alumni-pending`, then calls
  `submit_invited_story`. If the RPC refuses or fails, the uploaded photo is
  removed.

Field limits: name ≤ 120 (required); school one of the three schools
(required); grad year 1960 – next year (required); role ≤ 120 (required);
company ≤ 120; city/country ≤ 80; each prompt ≤ 600; quote ≤ 400 (required);
photo ≤ 5 MB, JPEG/PNG/WebP by magic bytes; consent must be `yes`, stored with
the exact `CONSENT_TEXT`.

## 3. Admin — "Invite alumni" panel

New component `src/components/admin/invite-panel.tsx` (with
`invite-csv-import.tsx`), placed at the top of `admin.testimonials.tsx`, above
the moderation queue.

- **Add one** — name, phone, optional email, school, year. Inline validation
  using the same `normalizeTzPhone`.
- **Upload CSV** — pick file → preview table in three groups: ready, invalid
  (with reason), duplicates (in file or already invited). **Import N invites**
  sends only the ready rows. A **Download template** button produces a CSV with
  the headers `name,phone,email,school,year` from an in-memory Blob.
- **Invite list** — name, phone, status badge (Pending / Opened / Submitted /
  Expired), last shared. Filter by status. Row actions:
  **Send on WhatsApp**, **Copy link**, **Regenerate**, **Delete** (confirm in
  an in-page dialog, not `window.confirm`).
- **WhatsApp popup handling** — the button opens a blank window synchronously
  on click, then points it at the `wa.me` URL once `getInviteLink` returns, so
  popup blockers do not eat it. If the window could not open, the link is
  copied and a toast says so.

The list reads `testimonial_invites` directly through the staff browser
client (RLS), newest first. Delete also goes through the browser client.

`alumni-pending.tsx` gains an **Invited** tag for rows with `invite_id`, and a
collapsible **Story answers** section showing `answers` and `city_country`.
Approve / reject logic is unchanged.

## 4. Alumnus — `/alumni/story/$code`

Route `src/routes/alumni.story.$code.tsx`, `noindex, nofollow`, site header and
footer, mobile-first. Wizard components under
`src/components/alumni/story-wizard/`.

On load it calls `openInvite`. `invalid` → "This link isn't valid any more —
please contact the school" with the school's contact details. `submitted` →
"Thanks — we've already received your story."

Steps, with a "Step n of 7" progress bar and Back / Next:

1. **Welcome** — "Hi {first name}", what the story is for, about 5 minutes.
2. **About you** — name (pre-filled), school (three options), class of
   (pre-filled when known).
3. **Where you are now** — role or studies (required), company or
   institution, city / country.
4. **Your story** — three optional prompts with counters:
   "What did Alpha give you that you still use today?",
   "A teacher or moment you remember",
   "Advice for current students".
5. **Your quote** — "Sum it up in a sentence or two." Required, ≤ 400, counter.
   States plainly that this is the part that will be published.
6. **Photo & consent** — optional photo (client size check), consent checkbox
   with `CONSENT_TEXT`.
7. **Review** — every answer with an **Edit** link back to its step, then
   **Submit**.

Behaviour:

- Next validates the current step only; the server validates everything.
- Text answers are saved to `localStorage` under
  `alpha-story-draft:<first 12 chars of code>` on change (wrapped in
  try/catch) and cleared on success. The photo is not saved — the review step
  says so if one was chosen and the page was reloaded.
- Submit is disabled while in flight. On a network or server failure the draft
  stays and a Retry message is shown.
- Success screen: thanks, and that the school reviews stories before
  publishing.

## 5. Error handling and privacy

- User-facing server errors follow the `SubmissionError` pattern; nothing about
  configuration or the database reaches the browser.
- Invalid and expired links are indistinguishable to the visitor.
- Contact details are readable only by staff; the public route returns only
  the invitee's own name and pre-fills.
- CSV import is all-or-nothing after preview: rows are validated client-side
  for the preview and again server-side, and a server rejection of the batch
  inserts nothing.
- All staff actions report success or failure with a toast.

## 6. Testing

Unit (vitest, alongside the existing `src/lib/*.test.ts`):

- `phone.test.ts` — each accepted Tanzanian format, spacing/dashes, foreign
  `+` numbers, rejects letters and wrong lengths.
- `csv.test.ts` — quoted fields, BOM, CRLF, header aliases, school aliases,
  invalid rows with reasons, duplicates within the file, 500-row cap.
- `token.test.ts` — code length/alphabet, hash stability, encrypt → decrypt
  round trip, tampered cipher and wrong key fail.
- `whatsapp.test.ts` — first-name extraction, URL digits, text encoding.
- Submission validation extracted into a pure `validateInvitedStory(form)` and
  tested for each required field and limit.

Manual, in the running app (requires the service key, `INVITE_LINK_KEY` and
the migration): add an invite, import a CSV with a bad row and a duplicate,
Send on WhatsApp, open the link on a phone-width window, complete all steps,
submit twice quickly (one story), reopen the link (already-received page),
approve it in the queue, regenerate a pending invite and confirm the old link
is invalid.

## Out of scope

Automatic SMS or email sending, bulk "send to all" (WhatsApp requires one tap
per message), scheduled reminders, and editing a story after submission.
