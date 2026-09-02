# Session briefs

Copy-paste prompts for Claude Code. **One session per brief.** Commit between
each. Do not combine them — handing an agent the whole redesign at once is how
you get fifteen pages that each interpret the design differently.

Every session: never force push, rebase, or amend a pushed commit. This branch
syncs with Lovable and rewriting history destroys the project history there.

---

## Session 0 — Detokenise (prerequisite)

Do this before any visual work.

> Read `AGENTS.md`. This project is TanStack Start + Vite + Tailwind v4. Do not
> migrate frameworks and do not suggest it.
>
> There are roughly 131 hardcoded hex colour values across `src/routes/` and
> `src/components/`, excluding `src/components/ui/`. Find every one and replace
> it with the matching CSS variable from `src/styles.css`.
>
> If a colour has no matching token, list it and stop — do not invent a token
> without asking me.
>
> This is a refactor with **zero visual change**. When finished, run
> `npm run build`, confirm it passes, and report the count of hex values before
> and after.
>
> Do not touch `src/components/ui/`. Do not force push or rewrite history.

---

## Session 1 — Extract the design system

> Read `AGENTS.md` and `design/README.md` first. Then read
> `design/homepage-desktop.png` and `design/homepage-mobile.png`.
>
> Your job this session is to translate the approved design into tokens in
> `src/styles.css`. **Do not edit any route or component file.** Do not build
> any section.
>
> Extract:
>
> 1. **Colour.** The palette is close to what already exists. Compare against
>    the current tokens and report the delta rather than inventing a new
>    palette. Map: header/footer navy → `--color-deep-blue`; primary blue →
>    `--color-brand-blue`; Nursery & Primary card band →
>    `--color-bright-blue`; Alpha Girls card band (purple) →
>    `--color-blue-violet`; CTAs and stat figures → `--color-gold`. The pale
>    blue and pale lavender testimonial card tints are new — add them as
>    `--color-tint-parent` and `--color-tint-alumni`. Check whether the page
>    background should change from the current `#eef4fb` to white.
>
> 2. **Type scale.** Hero headline, section heading, card title, body, small
>    label, stat figure, stat label. Mobile size and desktop size for each.
>    Note the hero headline's two-tone treatment: white line, then gold line.
>
> 3. **Spacing, radius, elevation.** Section rhythm, card padding, gap between
>    cards, corner radii, and the soft card shadow.
>
> 4. **Component tokens** for recurring patterns: primary button (gold fill,
>    dark text), secondary button (outlined, sits on a photo), card, date chip
>    (the blue "18 MAY" block), stat row, section heading with gold underline.
>
> Rules: every value is a CSS variable in `src/styles.css`. Keep existing token
> *names* wherever the mockup matches an existing colour — renaming means
> touching every file that uses them. Red `#E22321` and green `#00923F` are
> logo-only. Gold fails contrast as small text on white.
>
> Deliver the updated `src/styles.css` plus a written summary of what changed
> and anywhere the mockup conflicts with `AGENTS.md`.

---

## Session 2 — Homepage only

> Read `AGENTS.md` and `design/README.md`, including the "Known errors"
> section. Then read `design/homepage-desktop.png` and
> `design/homepage-mobile.png`.
>
> Rebuild `src/routes/index.tsx` to match the design, using only the tokens
> from `src/styles.css`. Sections in order: hero with stat rail, "Find the
> Right School" three cards, aviation banner, two-up testimonials, news and
> events.
>
> Constraints:
>
> - The hero photo rotates through a slideshow of real photos with varying crop
>   and exposure. Headline and stat rail must stay legible over **any** of
>   them — use a guaranteed gradient scrim.
> - At 375px: stat rail becomes a grid below the hero; school cards become
>   horizontal list rows. As shown in the mobile mockup.
> - Test at 375px at every step, not at the end.
> - Testimonial sections hide entirely when no published quotes exist. Never
>   render placeholder names.
> - Stat values come from the existing `STATS` constant. Do not change the
>   numbers, only the layout.
> - No chatbot bubble. No "Watch Our Story" button.
>
> Run `npm run build` when done and confirm it passes.

**Stop here and get client sign-off before session 3.**

---

## Session 3 — Propagate

> Read `AGENTS.md` and `design/README.md`. The homepage in
> `src/routes/index.tsx` is the approved reference implementation.
>
> Apply the same design system to the remaining pages, one page per commit:
> about, admission, aviation, coding, contact, events, facilities, gallery,
> news, scholarships, testimonials, and the three school pages.
>
> Use only tokens from `src/styles.css` and the component patterns already
> established on the homepage. Do not introduce new colours, new type sizes or
> new component shapes — if a page seems to need one, stop and ask.
>
> Preserve every `[bracketed placeholder]` exactly as written. That text marks
> content the school still owes.
>
> Verify each page at 375px before moving to the next. Run `npm run build`
> after each one.

---

## Known follow-ups (not design work)

Track these separately. They are real and they matter before launch.

- **CSRF middleware is missing.** The dev server warns about it on every start.
  Every admin action runs through server functions; without it, a malicious
  page could trigger them using a logged-in staff member's session. Fix before
  going live.
- **`inputValidator()` is deprecated** in `src/lib/alpha-content.functions.ts`
  (6 occurrences). Harmless now, will break on a future upgrade.
- **Images are Lovable-hosted pointers.** Production builds contain zero
  images. `grep -r "__l5e" .output/` must return nothing before deploying.
- **Deploy target** is nitro preset `cloudflare-module`. Cloudflare is already
  wired up; switching to Vercel means changing the preset.
