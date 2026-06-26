
## Why the sections look empty

The server functions ran fine (HTTP 200) but returned `news: []` and `events: []`. Since you've confirmed published rows exist, the most likely cause is **Supabase RLS / grants blocking the anon role** that the server publishable client uses. The current homepage also hides both sections entirely when arrays are empty, so there's no visible signal anything is wrong.

## Plan

### 1. Diagnose the data path
- Query Supabase directly using the same anon key the server uses to confirm whether rows come back.
- If rows are blocked: the `news` and `events` tables need either a `TO anon` SELECT policy (e.g. `USING (published = true)`) plus `GRANT SELECT ... TO anon`, or we switch the reads to use a service-role client server-side. I'll report findings and recommend the smaller fix. (Schema changes require you to run SQL on your external Supabase project — I'll provide it.)
- Add a temporary `console.log` in `getHomeWhatsNew` / `getHomeUpcomingEvents` so server logs show row counts and any Supabase error returned, making future diagnosis instant.

### 2. Friendly empty states (UI only, `src/routes/index.tsx`)
- **Updates section**: always render the section header; when `news.length === 0`, show a centered card: "No updates yet — check back soon." with a subtle icon.
- **Events rail**: always render the dark section; when `events.length === 0`, show a single placeholder card: "No upcoming events scheduled — stay tuned."
- Keep the slideshow / rail behaviors unchanged when data is present.

### 3. Verify
- Reload preview, confirm empty states render.
- Once RLS/grants are fixed on your end, confirm real data appears without further code changes.

## Technical notes
- No changes to data shape or query keys, so SSR + Query cache continue to work.
- Empty-state copy uses existing typography tokens (Fredoka heading, Hanken body) — no new fonts or colors.
