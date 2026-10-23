# Admin Redesign Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin's testimonials, messages and dashboard screens with phone-first Today, Stories, Inbox and Alumni screens inside a new shell, and make every remaining admin list usable at 375px.

**Architecture:** Pure, unit-tested logic lives in `src/lib/admin/*` (story states, error wording, formatting, alumni merging and filtering, the publish pipeline against an injected Supabase client). Screens live in `src/routes/admin.*.tsx` and `src/components/admin/**`, built from a small shared kit (`src/components/admin/kit/*`) that owns buttons, the outcome line with Undo, confirm dialogs, sheets and motion. One SQL migration adds explicit story states; a `published` sync trigger keeps the public site and RLS unchanged.

**Tech Stack:** TanStack Start/Router (file routes), React 19, TanStack Query (already a dependency), Supabase JS, Tailwind v4 with tokens in `src/styles.css`, Radix via `src/components/ui/{dialog,alert-dialog,sheet,tabs}.tsx`, lucide-react, vitest (node environment; no DOM testing library is installed, so UI is verified by typecheck and screenshots).

**Spec:** `docs/superpowers/specs/2026-10-23-admin-redesign-phase1-design.md` (read it first; this plan does not repeat its copy or layouts).

## Global Constraints

- Design tokens only (`var(--color-*)`, `--radius-*`, `T.*` from `src/components/type-roles.ts`); no new hex; no raw `red-*`, `white`, `black/*` Tailwind colours in admin code (use `--color-danger`, `--color-surface`).
- Gold fills carry `--color-accent-foreground` text. Never white text on gold, never gold text smaller than 24px on a light ground.
- Every interactive control in new or touched admin screens is at least 44×44px (`min-h-11 min-w-11`).
- Motion: one curve `var(--ease-out)`; 120ms press `scale(.97)` and hover colour; 150ms label swaps and all exits; 200ms dialog/sheet, status line (opacity + 4–8px rise) and rows closing up; 1200ms gold tint fading off a changed row; spinners only after 300ms. Never animate routes, tabs, filters or first-load rows. Under `prefers-reduced-motion: reduce` no transitions, static icons, outcomes still announced. No JS animation library; the Web Animations API is allowed.
- Lists never unmount to "Loading…" on refetch: keep previous data (`placeholderData: keepPreviousData` / no `setLoading(true)` on refresh).
- Plain-language errors only, via `friendlyError()` (Task 2). No `alert()`, no `window.confirm()`.
- Admin stays `ssr: false` and noindex. Dates shown in `Africa/Dar_es_Salaam`.
- No invented content; public testimonial sections still hide when empty.
- Git: commit per task on `main` locally; never force push, rebase or amend pushed commits (AGENTS.md). Do not push until the owner asks.
- `npx tsc --noEmit -p .`, `npx eslint <changed files>`, `npx vitest run` green at the end of every task.

## Review Focus

1. **A story moved by someone else** (second phone, stale tab): Publish/Decline/Hide on it must not act; the card says "This story was changed by someone else" and refreshes. Tested in Task 4 (`guardedUpdate` returns `conflict` on 0 rows).
2. **Session expires mid-edit** (phone asleep): the typed quote survives sign-in and the user returns to the same story. Tested in Task 2 (`draftKey`, `loginRedirect`) and checked in Task 13's walkthrough.
3. **Photos in any shape or size** (5712×4284 JPEG, transparent PNG, HEIC rejected): shown whole, compressed before upload, small copy made. Tested in Task 4 (pipeline order with a fake client) and existing `image-compress` tests.
4. **Phone numbers as people write them** (`0712 345 678`, `+255 712…`, `255712…`, a UK number, empty) for WhatsApp/Call and for alumni merging. Tested in Task 3 (`contactLinks`) and Task 5 (`mergeAlumni` phone matching).
5. **Empty and huge lists** (0 stories, 0 enquiries, 2,000 alumni, a 400-word quote, a name with an apostrophe or accent): each list shows its empty line, search is accent-insensitive, nothing overflows at 375px. Tested in Task 5 (`filterAlumni` accent and apostrophe cases) and Task 13's screenshots.

---

## File Structure

```
alpha_migration_admin_stories.sql            Task 1   states, featured, sync trigger, anon grants
alpha_migration_staff_role.sql               Task 12  is_staff() by role (run after a check)
docs/DEPLOY.md                               Task 1, 12  run order
src/lib/admin/story-status.ts (+ .test)      Task 2   states, actions, transitions, consent rule
src/lib/admin/errors.ts (+ .test)            Task 2   friendlyError
src/lib/admin/drafts.ts (+ .test)            Task 2   draftKey, saveDraft/readDraft/clearDraft, loginRedirect
src/lib/admin/format.ts (+ .test)            Task 3   formatAdminDate, schoolLabel, contactLinks
src/lib/admin/stories-data.ts (+ .test)      Task 4   all story reads/writes incl. publish pipeline
src/lib/admin/alumni-directory.ts (+ .test)  Task 5   mergeAlumni, filterAlumni, facetCounts, alumniCsv, URL params
src/lib/admin/inbox-data.ts                  Task 9   enquiry reads/writes
src/lib/admin/counts.ts                      Task 7   useAdminCounts
src/lib/invites.functions.ts                 Task 8   + reissueDeclinedInvite
src/lib/alpha-content.functions.ts (+ test)  Task 6   featured-first home order
src/components/admin/kit/*.tsx               Task 6a  Button, OutcomeProvider/useOutcome, ConfirmDialog, AdminSheet, CountBadge, EmptyState, ListCard
src/styles.css                               Task 6a  admin motion classes
src/routes/admin.tsx                         Task 7   shell: sidebar / bottom bar / More sheet
src/routes/admin.index.tsx                   Task 7   Today
src/routes/admin.login.tsx                   Task 7   redirect param, readable button
src/routes/admin.stories.tsx                 Task 8   tabs + list (+ detail panel on desktop)
src/routes/admin.stories.$id.tsx             Task 8   story detail ($id = "new" creates)
src/routes/admin.stories.invite.tsx          Task 8   invite page, audience switch
src/components/admin/stories/*.tsx           Task 8   StoryCard, StoryDetail, StoryPreview, FeaturedStrip, ActionBar
src/routes/admin.inbox.tsx, admin.inbox.$id.tsx       Task 9
src/routes/admin.alumni.tsx, admin.alumni.$key.tsx    Task 10
src/routes/admin.testimonials.tsx, admin.messages.tsx Task 8/9  become redirects
src/lib/admin-crud.tsx                       Task 11  phone cards, labels, Dialog, compression, no-0 default
src/components/admin/alumni-pending.tsx      Task 8   deleted (logic moved to stories-data)
```

---

### Task 1: Story states migration

**Files:**
- Create: `alpha_migration_admin_stories.sql`
- Modify: `docs/DEPLOY.md` (migration list near line 95), `src/integrations/alpha-supabase/types.ts` (testimonials Row/Insert/Update)

**Interfaces:**
- Produces columns on `public.testimonials`: `status text not null default 'waiting' check (status in ('waiting','live','hidden','declined'))`, `decline_reason text`, `featured boolean not null default false`, `featured_order int`, `decided_at timestamptz`, `decided_by uuid references auth.users(id) on delete set null`.

- [ ] **Step 1: Write the migration.** Header comment in the style of the existing migrations ("Run once in the Supabase SQL editor … after alpha_migration_alumni_contact_privacy.sql"). Contents, in order:
  1. `add column if not exists` for the six columns above (status first without `not null`, then backfill, then `set not null` and `set default 'waiting'` and the check).
  2. Backfill: `published` → `live`; `not published and consent_at is not null` → `waiting`; else → `hidden`.
  3. Trigger `testimonials_sync_published` (before insert or update) with this rule:
     ```sql
     if tg_op = 'INSERT' then
       if new.status is null then new.status := case when new.published then 'live' else 'waiting' end; end if;
       new.published := (new.status = 'live');
     elsif new.status is distinct from old.status then
       new.published := (new.status = 'live');
     elsif new.published is distinct from old.published then
       new.status := case when new.published then 'live' else 'hidden' end;
     end if;
     ```
  4. Index `testimonials_status_idx on (status, created_at)`.
  5. `grant select (featured, featured_order) on public.testimonials to anon;` (column grants from `alpha_migration_alumni_contact_privacy.sql` otherwise hide them).
  6. A commented "Check:" block: counts by status must equal the old published/unpublished counts; `insert … published=false, consent_at=now()` lands as `waiting`.
- [ ] **Step 2: Update types** in `src/integrations/alpha-supabase/types.ts` for the six columns (Row required, Insert/Update optional).
- [ ] **Step 3: Add the file to the run-order list in `docs/DEPLOY.md`** with one line: "Run before deploying the admin redesign; the old admin keeps working after it (the trigger keeps `published` and `status` in step)."
- [ ] **Step 4: Verify** `npx tsc --noEmit -p .` passes. Ask the owner to run the migration and the Check block in Supabase; do not continue to Task 4's live verification until they confirm.
- [ ] **Step 5: Commit** `git commit -m "Admin stories: explicit story states migration"`.

### Task 2: Story states, error wording and drafts (pure logic)

**Files:**
- Create: `src/lib/admin/story-status.ts`, `src/lib/admin/story-status.test.ts`, `src/lib/admin/errors.ts`, `src/lib/admin/errors.test.ts`, `src/lib/admin/drafts.ts`, `src/lib/admin/drafts.test.ts`

**Interfaces (Produces):**
```ts
export type StoryStatus = "waiting" | "live" | "hidden" | "declined";
export type StoryAction = "publish" | "decline" | "restore" | "hide" | "show" | "delete";
export const STATUS_LABEL: Record<StoryStatus, string>; // "Waiting","Live","Hidden","Declined"
export function actionsFor(status: StoryStatus): StoryAction[];
export function transition(action: Exclude<StoryAction, "delete">): { from: StoryStatus; to: StoryStatus };
export function needsConsentRecord(action: StoryAction): boolean; // true only for "publish"
export const UNDO: Record<"publish" | "decline" | "hide" | "show" | "restore", { from: StoryStatus; to: StoryStatus }>;

export function friendlyError(err: unknown): string;

export function draftKey(route: string, id: string): string;          // "alpha-admin-draft:<route>:<id>"
export function saveDraft<T>(key: string, value: T): void;              // sessionStorage, swallow errors
export function readDraft<T>(key: string): T | null;
export function clearDraft(key: string): void;
export function loginRedirect(pathname: string): string;                // "/admin/login?redirect=<encoded>", only for /admin paths
export function safeRedirect(param: string | null | undefined): string; // returns "/admin" unless param starts with "/admin/"
```

- [ ] **Step 1: Write failing tests.**
  - `actionsFor`: waiting → `["publish","decline"]`; live → `["hide"]`; hidden → `["show","delete"]`; declined → `["restore","delete"]`.
  - `transition("publish")` → `{from:"waiting",to:"live"}`; decline waiting→declined; restore declined→waiting; hide live→hidden; show hidden→live.
  - `needsConsentRecord("publish") === true`, `needsConsentRecord("show") === false`.
  - `UNDO`: publish `{from:"live",to:"waiting"}`, decline `{from:"declined",to:"waiting"}`, hide `{from:"hidden",to:"live"}`, show `{from:"live",to:"hidden"}`, restore `{from:"waiting",to:"declined"}`. Test all five.
  - `friendlyError`: `{message:"JWT expired"}` → "Your sign-in has expired. Sign in again and your changes will be kept."; `{code:"PGRST301"}` same; `new TypeError("Failed to fetch")` → "No internet connection. Nothing was saved."; `{code:"42501"}` or message containing "row-level security" → "You do not have permission to do that."; `{code:"23514"}` → "One of the values is not allowed. Check the form and try again."; `{message:"Object not found"}` → "The photo could not be found. It may have been removed."; a `{kind:"conflict"}` object → "This story was changed by someone else. It has been refreshed."; anything else → "Something went wrong. Nothing was changed. Try again."
  - `safeRedirect("/admin/stories/1")` keeps it; `safeRedirect("https://evil.com")`, `safeRedirect("//evil")`, `safeRedirect("/contact")`, `safeRedirect(null)` → "/admin". `loginRedirect("/admin/stories/abc")` → "/admin/login?redirect=%2Fadmin%2Fstories%2Fabc".
  - Drafts: with a stubbed `globalThis.sessionStorage` (Map-backed), save/read round-trips; read of corrupt JSON returns null; a throwing storage does not throw.
- [ ] **Step 2: Run** `npx vitest run src/lib/admin` → FAIL (modules missing).
- [ ] **Step 3: Implement** the three modules to the interfaces above.
- [ ] **Step 4: Run** `npx vitest run src/lib/admin` → PASS.
- [ ] **Step 5: Commit** `git commit -m "Admin: story states, plain-language errors, drafts"`.

### Task 3: Formatting and contact links

**Files:** Create `src/lib/admin/format.ts`, `src/lib/admin/format.test.ts`

**Interfaces (Produces):**
```ts
export function formatAdminDate(iso: string, now?: Date): string;
// Dar es Salaam time. Same day → "Today 17:02"; previous day → "Yesterday 09:15";
// same year → "18 Oct"; else "18 Oct 2025". Invalid → "".
export function schoolLabel(slug: string | null | undefined): string;
// "group-wide"|null → "Alpha Schools", "nursery-primary" → "Nursery & Primary",
// "alpha-high" → "Alpha High", "alpha-girls" → "Alpha Girls", unknown → "Not recorded".
export type ContactLinks = { whatsapp: string | null; tel: string | null; mailto: string | null };
export function contactLinks(p: { phone?: string | null; email?: string | null; name?: string; subject?: string | null }): ContactLinks;
// phone via normalizeTzPhone (src/lib/invites/phone.ts); whatsapp via whatsappUrl (src/lib/invites/whatsapp.ts) with text "Hello <firstName>," ;
// mailto subject "Re: <subject>" when given.
```

- [ ] **Step 1: Write failing tests** with `now = new Date("2026-10-23T09:00:00Z")` (12:00 in Dar): `"2026-10-23T14:02:00Z"` → "Today 17:02"; `"2026-10-22T06:15:00Z"` → "Yesterday 09:15"; `"2026-10-18T14:02:22Z"` → "18 Oct"; `"2025-03-01T10:00:00Z"` → "1 Mar 2025"; `"nope"` → "". Each `schoolLabel` case above. `contactLinks({phone:"0712 345 678", email:"a@b.co", name:"Frank Joseph", subject:"Fees"})` → whatsapp `https://wa.me/255712345678?text=Hello%20Frank%2C`, tel `tel:+255712345678`, mailto `mailto:a@b.co?subject=Re%3A%20Fees`; `{phone:"+44 7700 900123"}` → tel `tel:+447700900123`; `{phone:"abc"}` → whatsapp and tel null; `{}` → all null.
- [ ] **Step 2: Run** `npx vitest run src/lib/admin/format.test.ts` → FAIL.
- [ ] **Step 3: Implement** with `Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Dar_es_Salaam", … })`; reuse `normalizeTzPhone`, `whatsappUrl`, `firstName`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git commit -m "Admin: readable dates, school names, contact links"`.

### Task 4: Stories data layer with the single publish path

**Files:** Create `src/lib/admin/stories-data.ts`, `src/lib/admin/stories-data.test.ts`. Read `src/components/admin/alumni-pending.tsx:117-224` first; its copy-then-publish-then-remove order and its comments move here.

**Interfaces:**
- Consumes: `StoryStatus`, `transition`, `UNDO`, `needsConsentRecord` (Task 2); `makeSmallCopy` (`src/lib/image-compress.ts`), `compressImage`, `SMALL_EDGE`, `smallPhotoPath` (`src/lib/testimonial-photo.ts`).
- Produces:
```ts
export type AdminStory = { id: string; status: StoryStatus; author_name: string; relationship: string | null;
  company: string | null; quote: string; grad_year: number | null; school_slug: string | null;
  photo_url: string | null; pending_photo_path: string | null; consent_at: string | null; consent_text: string | null;
  answers: Record<string, unknown> | null; invite_id: string | null; featured: boolean; featured_order: number | null;
  decline_reason: string | null; created_at: string; decided_at: string | null; city_country: string | null };
export type StoryEdit = Pick<AdminStory, "author_name"|"relationship"|"company"|"quote"|"grad_year"|"school_slug">;
export type MoveResult = { ok: true } | { ok: false; conflict: true } | { ok: false; error: unknown };
export const STORY_COLUMNS: string; // explicit column list, never "*"
export async function listStories(sb: SupabaseClient): Promise<AdminStory[]>;
export async function signPendingPhotos(sb: SupabaseClient, paths: string[]): Promise<Record<string, string>>; // one createSignedUrls call, 3600s
export async function guardedMove(sb: SupabaseClient, id: string, from: StoryStatus, to: StoryStatus, extra?: Record<string, unknown>): Promise<MoveResult>;
// update … .eq("id", id).eq("status", from).select("id"); 0 rows → {ok:false, conflict:true}; sets decided_at = now ISO.
export async function publishStory(sb: SupabaseClient, story: AdminStory): Promise<MoveResult>;
// refuses (error) when !story.consent_at; if pending_photo_path: download → upload public testimonials/story-<id>.<ext> (upsert)
// → makeSmallCopy + upload smallPhotoPath (failure logged, not fatal) → guardedMove waiting→live with {photo_url, pending_photo_path:null}
// → remove pending file (failure ignored). Without a pending photo: guardedMove only.
export async function saveStoryEdit(sb: SupabaseClient, id: string, edit: StoryEdit, expectedStatus: StoryStatus): Promise<MoveResult>;
export async function replaceStoryPhoto(sb: SupabaseClient, story: AdminStory, file: File): Promise<MoveResult>;
// compressImage first; waiting → overwrite private pending path; otherwise public testimonials/story-<id>.<ext> + small copy, set photo_url.
export async function removeStoryPhoto(sb: SupabaseClient, story: AdminStory): Promise<MoveResult>;
export async function createStory(sb: SupabaseClient, edit: StoryEdit, consent: { text: string }): Promise<{ ok: true; id: string } | { ok: false; error: unknown }>;
// inserts status "hidden", consent_at now, consent_text.
export async function deleteStory(sb: SupabaseClient, story: AdminStory): Promise<MoveResult>;
// only when status hidden|declined (guarded delete .in("status",["hidden","declined"])); removes public, small and pending photo files after the row is gone.
export async function setFeatured(sb: SupabaseClient, id: string, featured: boolean, order: number | null): Promise<MoveResult>;
export async function swapFeaturedOrder(sb: SupabaseClient, a: {id: string; order: number}, b: {id: string; order: number}): Promise<MoveResult>;
```

- [ ] **Step 1: Write failing tests** using a hand-written fake client (record every call in an array; configurable responses). Tests:
  - `guardedMove` returns `{ok:false, conflict:true}` when the update returns `[]`, `{ok:true}` with one row; the recorded filter includes `status = from`.
  - `publishStory` with a pending photo calls, in this exact order: storage download (pending bucket), upload public `testimonials/story-<id>.jpg`, upload `testimonials/small/story-<id>.webp`, update guarded on `status = waiting` with `photo_url` set and `pending_photo_path: null`, remove pending. (Stub `makeSmallCopy` via `vi.mock("@/lib/image-compress")`.)
  - `publishStory` when the public upload fails: no update call, returns error, pending file not removed.
  - `publishStory` when the small copy fails: still publishes.
  - `publishStory` with `consent_at: null` returns error and makes no calls.
  - `publishStory` on conflict (update returns `[]`): returns conflict, pending file NOT removed.
  - `deleteStory` on a `live` story makes no calls and returns error.
  - `saveStoryEdit` with `grad_year: null` sends `null`, never `0`.
- [ ] **Step 2: Run** `npx vitest run src/lib/admin/stories-data.test.ts` → FAIL.
- [ ] **Step 3: Implement** to the interfaces. Buckets: private `alumni-pending` (constant name from `alumni-pending.tsx`), public `media`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git commit -m "Admin stories: data layer with one guarded publish path"`.

### Task 5: Alumni directory logic

**Files:** Create `src/lib/admin/alumni-directory.ts`, `src/lib/admin/alumni-directory.test.ts`

**Interfaces (Produces):**
```ts
export type InviteRow = { id: string; full_name: string; phone: string; email: string | null; school_slug: string | null;
  grad_year: number | null; status: "pending"|"opened"|"submitted"; created_at: string; submitted_at: string | null };
export type AlumniStoryRow = Pick<AdminStory, "id"|"author_name"|"relationship"|"company"|"city_country"|"school_slug"|"grad_year"|"status"|"photo_url"|"answers"|"invite_id"|"created_at">;
export type AlumniPerson = { key: string; name: string; phone: string | null; email: string | null; school_slug: string | null;
  grad_year: number | null; role: string | null; company: string | null; city: string | null; photo_url: string | null;
  storyId: string | null; storyStatus: StoryStatus | null; inviteId: string | null;
  inviteStatus: "not-invited"|"pending"|"opened"|"submitted"; firstSeen: string };
export function mergeAlumni(invites: InviteRow[], stories: AlumniStoryRow[]): AlumniPerson[];
export type AlumniFilters = { q: string; schools: string[]; yearFrom: number | null; yearTo: number | null;
  story: Array<StoryStatus | "none">; invite: AlumniPerson["inviteStatus"][]; cities: string[];
  has: Array<"photo"|"email"|"phone">; sort: "year"|"name"|"recent" };
export const EMPTY_FILTERS: AlumniFilters; // sort "year"
export function filterAlumni(people: AlumniPerson[], f: AlumniFilters): AlumniPerson[];
export function facetCounts(people: AlumniPerson[], f: AlumniFilters): Record<"school"|"story"|"invite"|"city", Record<string, number>>;
// counts for each facet computed with every OTHER active filter applied (standard faceting).
export function filtersToParams(f: AlumniFilters): Record<string, string>;   // omit defaults; arrays comma-joined
export function filtersFromParams(p: Record<string, unknown>): AlumniFilters; // tolerant of junk
export function alumniCsv(people: AlumniPerson[]): string;
// header: Name,Phone,Email,School,Class of,Role,Company,City or country,Story,Invite ; CRLF; RFC 4180 quoting; school via schoolLabel.
```
Merge rule (spec): a story joins its invite by `invite_id`; otherwise by phone normalised with `normalizeTzPhone` from the invite's `phone` and the story's `answers.phone`; else its own person. Prefer the story's values for name/role/company/city/photo, the newer source for phone/email/school/year. `key` = `story:<id>` or `invite:<id>` (story wins when merged). Only invites with `audience='alumni'` are passed in (caller filters).

- [ ] **Step 1: Write failing tests.**
  - Invite + story linked by `invite_id` → 1 person, `inviteStatus:"submitted"`, `storyStatus` from story.
  - Invite `+255712345678` + story with `answers.phone:"0712 345 678"`, no invite_id → merged.
  - Unmatched story with no phone → own person, `inviteStatus:"not-invited"`.
  - `filterAlumni` `q:"jose"` matches "José Mwakasonda"; `q:"o'brien"` matches "O’Brien"; `q:"EY"` matches company "EY Tanzania"; `q:"0712345678"` matches `+255712345678`.
  - Year range 2015–2019 inclusive excludes 2014 and null years; `story:["none"]` returns people with no story; `has:["email"]`.
  - Sort `year` puts 2024 before 2015, nulls last; `name` is locale A–Z.
  - `facetCounts` school counts ignore the active school filter but respect the year filter.
  - `filtersFromParams(filtersToParams(f))` deep-equals `f` for a fully populated `f`; `filtersFromParams({yearFrom:"x", story:"live,bogus"})` → `yearFrom:null, story:["live"]`.
  - `alumniCsv` quotes a name with a comma and a quote mark (`"Mwakasonda, ""Henry"""`), ends lines with `\r\n`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** (normalise text with `.normalize("NFD").replace(/\p{Diacritic}/gu,"").replace(/[’']/g,"'").toLowerCase()`; phone search on digits only). **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git commit -m "Admin alumni: merge, search, filters, CSV"`.

### Task 6: Home page uses "Feature on home"

**Files:** Modify `src/lib/alpha-content.functions.ts:490-509`; Create `src/lib/home-voices-order.ts`, `src/lib/home-voices-order.test.ts`; Modify `TestimonialItem` to include `featured`, `featured_order`.

**Interfaces (Produces):** `export function orderForHome<T extends {featured?: boolean|null; featured_order?: number|null; created_at: string}>(items: T[]): T[]` — featured first by `featured_order` ascending (nulls after numbered), then everything else newest `created_at` first.

- [ ] **Step 1: Failing test:** three unfeatured (dates 1, 3, 2) + two featured (orders 2, 1) → featured(1), featured(2), date 3, date 2, date 1.
- [ ] **Step 2: Run** → FAIL. **Step 3:** implement; `getTestimonials` selects `featured,featured_order` too and the home route (`src/routes/index.tsx` `Testimonials`) passes `orderForHome(items)` to `VoicesSpotlight`. `/testimonials` and `/alumni` orders are unchanged. Keep `.order("sort_order")` removed from `getTestimonials` (ordering now happens in `orderForHome`). **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git commit -m "Home voices: featured stories lead"`.

### Task 6a: Admin kit and motion

**Files:** Create `src/components/admin/kit/button.tsx`, `outcome.tsx`, `confirm-dialog.tsx`, `admin-sheet.tsx`, `count-badge.tsx`, `empty-state.tsx`, `list-card.tsx`, `index.ts`; Modify `src/styles.css` (append an "Admin" section).

**Interfaces (Produces):**
```ts
<AdminButton variant="primary"|"secondary"|"danger"|"quiet" busy?: boolean busyLabel?: string icon?: LucideIcon …button props/>
// primary = gold fill + ink text; 44px min; press class "admin-press"; busy shows label immediately, spinner after 300ms (static under reduced motion).
<OutcomeProvider> wraps the admin shell; useOutcome(): { show(o: { text: string; undo?: () => Promise<void>; link?: { to: string; label: string } }): void }
// renders the status line (role="status" container always mounted, text swapped) near the bottom on phone / top-right on desktop; auto-clears after 8s; Undo runs once.
<ConfirmDialog open title body confirmLabel danger? onConfirm onOpenChange/> // Radix AlertDialog from src/components/ui/alert-dialog.tsx
<AdminSheet open onOpenChange title>{…}</AdminSheet> // Radix Dialog; bottom sheet < 768px, centred panel ≥ 768px
<CountBadge n={number} label="waiting"/> // navy pill with number; sr text "<n> <label>"; renders nothing at 0
<EmptyState title body? action?/>
<ListCard onClick? selected? highlight?>…</ListCard> // full-width tappable card; highlight → class "admin-flash" (1200ms gold tint fade)
export function collapseAndRemove(el: HTMLElement): Promise<void>; // WAAPI: opacity 150ms then height→0 200ms, resolves at end; instant under reduced motion
```
CSS (append to `src/styles.css`): `.admin-press` (120ms `transform: scale(.97)` on `:active`), `.admin-flash` keyframe (gold 18% → transparent, 1200ms), `.admin-rise` (200ms opacity + `translateY(6px)` enter), overrides on `src/components/ui/dialog.tsx`/`alert-dialog.tsx`/`sheet.tsx` animation classes scoped under `[data-admin]` to 200ms `--ease-out`, and a reduced-motion block removing all of them.

- [ ] **Step 1:** Implement the kit. **Step 2:** `npx tsc --noEmit -p .` and `npx eslint src/components/admin/kit` pass. **Step 3: Commit** `git commit -m "Admin kit: buttons, outcome line, dialogs, motion"`.

### Task 7: Shell, Today, login

**Files:** Modify `src/routes/admin.tsx`, `src/routes/admin.index.tsx`, `src/routes/admin.login.tsx`; Create `src/lib/admin/counts.ts`, `src/components/admin/shell/{sidebar,bottom-bar,more-sheet}.tsx`.

**Interfaces:**
- Consumes: kit (Task 6a), `safeRedirect`/`loginRedirect` (Task 2), `slotsBySection`/photo tally logic from `src/routes/admin.photos.tsx:49-55`.
- Produces: `export function useAdminCounts(): { storiesWaiting: number; inboxNew: number; photosEmpty: number; loading: boolean }` (TanStack Query key `["admin","counts"]`, `count: "exact", head: true` queries; refetch on window focus and every 60s); `ADMIN_NAV: { to: string; label: string; icon: LucideIcon; count?: "storiesWaiting"|"inboxNew"; phone: "bar"|"more" }[]` in order Today, Stories, Inbox, Alumni, News & events (`/admin/news`, sub-link Events), Photos (`/admin/photos`, sub-links Hero slides, Facilities, Facilities gallery, Activities gallery), People (`/admin/staff`).

- [ ] **Step 1:** Shell per spec "Shell": sidebar ≥ 768px; fixed bottom bar < 768px with Today, Stories, Inbox, More (sheet with the rest + Sign out); `aria-current="page"`; content gets bottom padding equal to the bar. `QueryClientProvider` for admin if the root does not already provide one (check `src/routes/__root.tsx`). `OutcomeProvider` wraps the outlet. When `session` becomes null on a non-login page, navigate to `loginRedirect(pathname)`.
- [ ] **Step 2:** Login: gold button with ink text; after sign-in navigate to `safeRedirect(search.redirect)`; copy "Sign in to manage stories, enquiries, news and photos."
- [ ] **Step 3:** Today per spec (three count cards linking to `/admin/stories`, `/admin/inbox`, `/admin/photos`; last five live stories by `decided_at`; "Nothing needs you right now." when all zero). Remove the developer note.
- [ ] **Step 4:** Verify `npx tsc --noEmit -p .`; run the dev server and capture `/admin/login` at 375 and 1280 with `scratchpad/shot-section.mjs` (signed-out screens only).
- [ ] **Step 5: Commit** `git commit -m "Admin shell: sidebar, phone bottom bar, Today"`.

### Task 8: Stories screens and Invite page

**Files:** Create `src/routes/admin.stories.tsx`, `src/routes/admin.stories.$id.tsx`, `src/routes/admin.stories.invite.tsx`, `src/components/admin/stories/{story-card,story-detail,story-preview,featured-strip,action-bar,story-form}.tsx`; Modify `src/routes/admin.testimonials.tsx` (redirect to `/admin/stories`), `src/lib/invites.functions.ts` (add `reissueDeclinedInvite`), `src/components/admin/invites/invite-panel.tsx` / `invite-list.tsx` (audience prop already exists; 44px row buttons, link to story); Delete `src/components/admin/alumni-pending.tsx`.

**Interfaces:**
- Consumes: Tasks 2–4, 6a; `WholePhoto` (`src/components/testimonials/whole-photo.tsx`), `StoryList` card markup for the preview (`src/components/testimonials/story-list.tsx`).
- Produces: `reissueDeclinedInvite = createServerFn({method:"POST"}).validator((d:{storyId:string})=>d)` — service role: load story (must be `declined` with `invite_id`), set story `invite_id = null` and `answers = answers || {"previous_invite_id": <id>}`, then reset that invite to `status 'pending'`, new token (reuse the token helpers `regenerateInvite` uses at `src/lib/invites.functions.ts:205-237`), clear `opened_at/submitted_at`, new `expires_at`; returns `{ link: string }`. Requires a signed-in staff session exactly as `regenerateInvite` does.

- [ ] **Step 1:** `admin.stories.tsx`: Radix Tabs Waiting / Live / Hidden / Declined with counts; search param `tab` (default `waiting`); list of `StoryCard` (whole photo via signed URL for waiting, small copy otherwise; name; role · class; school label; two-line quote; star if featured; "No consent on record" note when `consent_at` null; date via `formatAdminDate`). Waiting oldest first; Live: `FeaturedStrip` (featured, up/down buttons → `swapFeaturedOrder`, one-line note "The testimonials page lists stories newest first; this order is for the home page.") then the rest newest first. Desktop ≥ 1024px: list left, `<Outlet/>` detail right; phone: detail is its own page. "New story" button on Live and Hidden → `/admin/stories/new`. Empty Waiting: "All caught up" with one gold check drawn once (`stroke-dashoffset`, 600ms, static under reduced motion).
- [ ] **Step 2:** `admin.stories.$id.tsx` + `StoryDetail` per spec "Story detail": whole photo (tap → full-size in `AdminSheet`), `StoryPreview` (same markup and type as the public card) labelled "How it will look", `StoryForm` (Who is speaking Parent/Former student; Class of required for former students and hidden for parents; school select via `schoolLabel` options; Company; photo add/replace/remove) updating the preview live, draft saved with `draftKey("stories", id)` on change and cleared on save, `beforeunload` + router blocker when dirty; private details collapsed (contact, answers using labels from `src/lib/story/fields.ts`, consent text and time, invite link); sticky `ActionBar` with buttons from `actionsFor(status)` (+ Feature toggle for live, + "Invite again" for declined with `invite_id`). Decline opens `AdminSheet` with optional reason. Delete uses `ConfirmDialog` naming the person. After each action: `collapseAndRemove` the card, `useOutcome().show({ text, undo, link })` with copy from the spec ("Published Keith's story. It will appear on the website within about 5 minutes."; link "View on site" → `/testimonials#story-<id>`). Conflicts show `friendlyError({kind:"conflict"})` on the card and refetch that story. Per-row busy state is a `Set<string>`. Signed URLs refreshed by refetching every 50 minutes.
- [ ] **Step 3:** `admin.stories.invite.tsx`: two-option switch Former students / Parents (search param `audience`), one `InvitePanel` at a time; rows that produced a story link to `/admin/stories/<id>`.
- [ ] **Step 4:** Old route redirects: `/admin/testimonials` → `/admin/stories` (`beforeLoad` `throw redirect`). Delete `alumni-pending.tsx` and its imports.
- [ ] **Step 5:** Verify typecheck, lint, all tests. With the owner signed in on the local dev server (ask them to sign in at `http://localhost:5180/admin/login`), walk the spec's "Done means" story steps at 375px using a test story the owner names; never act on real stories without their say-so.
- [ ] **Step 6: Commit** `git commit -m "Admin stories: review, edit, publish, feature, decline, invite"`.

### Task 9: Inbox

**Files:** Create `src/lib/admin/inbox-data.ts`, `src/routes/admin.inbox.tsx`, `src/routes/admin.inbox.$id.tsx`; Modify `src/routes/admin.messages.tsx` (redirect to `/admin/inbox`).

**Interfaces (Produces):** `type Enquiry = { id; name; email; phone: string|null; school_slug: string|null; subject: string|null; message: string; status: "new"|"read"|"archived"; created_at }`; `listEnquiries(sb)`, `setEnquiryStatus(sb, id, from, to): Promise<MoveResult>` (guarded like `guardedMove`), `deleteEnquiry(sb, id)` (guarded `.eq("status","archived")`).

- [ ] **Step 1:** Tabs New (status `new` or `read`, new ones bold with a dot) and Done (`archived`); cards per spec. Opening a `new` message moves it to `read` silently. Detail: full message (`whitespace-pre-line`), contact rows, sticky actions Reply on WhatsApp / Call / Email (from `contactLinks`; the WhatsApp link is an `<a target="_blank">`, so no popup blocker issue) and Mark as done (outcome line with Undo → `read`). Delete only in Done, behind `ConfirmDialog`.
- [ ] **Step 2:** Verify typecheck/lint/tests; screenshot the inbox at 375 and 1280 with the owner signed in.
- [ ] **Step 3: Commit** `git commit -m "Admin inbox: read and answer enquiries"`.

### Task 10: Alumni screens

**Files:** Create `src/routes/admin.alumni.tsx`, `src/routes/admin.alumni.$key.tsx`, `src/components/admin/alumni/{filter-bar,filter-picker,person-card,person-table}.tsx`.

**Interfaces:** Consumes Task 5 entirely, `contactLinks`, `formatAdminDate`, `schoolLabel`, `WholePhoto`.

- [ ] **Step 1:** Load invites (`audience = 'alumni'`, explicit columns) and stories (`grad_year is not null`, explicit columns incl. `answers`) once with TanStack Query; `mergeAlumni`. Search param schema = `filtersToParams` / `filtersFromParams` (route `validateSearch`). Search input (debounced 150ms, `type="search"`), filter chips opening `AdminSheet` pickers with `facetCounts`, removable active chips, "Clear all", sort select, result line "<n> former students · <k> filters". Phone: `PersonCard` list; ≥ 768px: `PersonTable` with sticky header in an `overflow-x-auto` wrapper. **Every row shows the submitted phone and email** (owner request 2026-10-23): on `PersonCard` as two tappable lines (`tel:` and `mailto:` from `contactLinks`, 44px tall, the card's own tap still opens the person), in `PersonTable` as Phone and Email columns with the same links; "Not given" in `--color-ink-soft` when absent. The phone is displayed in a readable form (e.g. `+255 712 345 678`). Empty result: "No former students match. Clear filters".
- [ ] **Step 2:** "Download list" → `ConfirmDialog` with "This file contains phone numbers and emails. Keep it inside the school." → `Blob` of `alumniCsv(filtered)` downloaded as `alpha-alumni-YYYY-MM-DD.csv`. Nothing server-side.
- [ ] **Step 3:** Person detail `admin.alumni.$key.tsx` per spec (photo whole, facts, WhatsApp/Call/Email, story with status and link, invite with status and link, first invited/submitted dates).
- [ ] **Step 4:** Verify typecheck/lint/tests; with the owner signed in, run the spec's alumni "Done means" search at 375px and time it.
- [ ] **Step 5: Commit** `git commit -m "Admin alumni: searchable, filterable directory with export"`.

### Task 11: Make the remaining CRUD screens phone-safe

**Files:** Modify `src/lib/admin-crud.tsx`; Create `src/lib/admin-crud-defaults.ts`, `src/lib/admin-crud-defaults.test.ts`; touch route configs only for labels (`admin.facility-photos.tsx` shows facility name via `loadOptions` lookup).

**Interfaces (Produces):** `export function initialValue(field: {type: string; nullable?: boolean; defaultValue?: unknown}, current: unknown): unknown` — nullable number → `""` when current is null/undefined; never `0` unless the field declares `defaultValue: 0`.

- [ ] **Step 1: Failing tests** for `initialValue`: nullable number with null → `""`; number with `defaultValue: 0` and null → `0`; number with 5 → 5; text null → `""`; boolean null with `defaultValue: true` → true.
- [ ] **Step 2: Run** → FAIL. **Step 3:** Implement and use it in the form; on save convert `""` to `null` for nullable numbers. **Step 4: Run** → PASS.
- [ ] **Step 5:** In `admin-crud.tsx`: < 768px render `ListCard`s (key columns + Edit/Delete 44px); ≥ 768px table inside `overflow-x-auto`; form in `AdminSheet` with linked labels (`useId`), `aria-required`, inline field errors with first error focused; image field uses `compressImage` then upload, busy state, Save disabled during upload, `sr-only` input with focus ring on its label; Delete via `ConfirmDialog`; errors via `friendlyError`; refetch keeps rows (no "Loading…" swap) and flashes the changed row; dates through `formatAdminDate`; school slugs through `schoolLabel`; gold buttons with ink text.
- [ ] **Step 6:** Verify typecheck/lint/tests; screenshot News and Staff lists at 375 (signed in) and confirm Edit/Delete visible.
- [ ] **Step 7: Commit** `git commit -m "Admin lists and forms: phone-safe, labelled, compressed uploads"`.

### Task 12: Staff role hardening (gated on the owner)

**Files:** Create `alpha_migration_staff_role.sql`; Modify `docs/DEPLOY.md`.

- [ ] **Step 1:** Write the file with, first, a read-only check query (`select id, email, role from profiles join auth.users using (id)`) and a comment: "Every staff account must show role editor or admin before you run the rest." Then `create or replace function public.is_staff()` returning `exists (select 1 from profiles where id = auth.uid() and role in ('editor','admin'))`, and replace the testimonials and contact_messages staff policies to use `is_staff()`.
- [ ] **Step 2:** Ask the owner to run only the check query and report the rows. If any staff account lacks a role, stop and ask before continuing. Otherwise ask them to run the rest.
- [ ] **Step 3: Commit** `git commit -m "Staff-only access checks the profile role"`.

### Task 13: Whole-portal verification

- [ ] **Step 1:** `npx tsc --noEmit -p .`, `npx eslint src/routes/admin* src/components/admin src/lib/admin src/lib/admin-crud.tsx`, `npx vitest run` all green.
- [ ] **Step 2:** `sh /c/Users/Henry/.claude/skills/impeccable/scripts/impeccable detect --json src/routes/admin*.tsx src/components/admin src/lib/admin-crud.tsx`; fix every non-advisory finding.
- [ ] **Step 3:** With the owner signed in locally, capture every admin screen at 375 and 1280 (Today, Stories each tab, a story detail, Invite, Inbox list and detail, Alumni list with filters and a person, News, Photos, Staff) and check: no clipped content, no control under 44px, no white-on-gold, outcome lines appear, reduced-motion emulation (`Emulation.setEmulatedMedia` `prefers-reduced-motion: reduce`) shows no motion.
- [ ] **Step 4:** Walk every "Done means" item in the spec and record the result in the final report to the owner.
- [ ] **Step 5: Commit** any fixes `git commit -m "Admin redesign phase 1: verification fixes"`.
