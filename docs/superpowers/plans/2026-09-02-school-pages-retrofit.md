# School Pages Retrofit & Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retrofit the three school pages onto the session-1 design system, and split Alpha High and Alpha Girls from one duplicated file into two genuinely distinct pages.

**Architecture:** Share *presentation* (components that take data as props), never *content* (the copy stays per-page). A new `SchoolSubNav` restores in-page wayfinding on all three long pages. Each page keeps its own section order and hero treatment, drawn from the same token set.

**Tech Stack:** TanStack Start · Vite · Tailwind v4 · tokens in `src/styles.css`

**Spec:** This plan implements the user's brief of 2026-09-02, `design/README.md`, `design/SESSION-BRIEFS.md` (Session 3), `design/CONTENT-FROM-SCHOOL.md`, and `motion-audits/tanstack-start-ts-2026-09-02.html`.

## Global Constraints

- Only tokens from `src/styles.css`. No new colours, type sizes or component shapes. If a page seems to need one, **stop and ask**.
- Only component patterns already established on `src/routes/index.tsx`.
- Use **"Co-education"**, never "Mixed".
- Red `#E22321` and green `#00923F` are logo-only, never UI colour.
- Gold is a fill, a rule and a figure colour on dark. Never small text on a light ground (1.91:1).
- Preserve every `[bracketed placeholder]` verbatim; add new ones in the same house style.
- Never render invented names, quotes or statistics. Testimonial sections hide entirely when empty.
- The year figure is calculated from the founding year, never hardcoded.
- Verify at 375px before moving on. `npm run build` after each page.
- One page per commit. Report design-system token adoption before and after.

## Blockers — do not publish until resolved

**B1 · A-Level combinations are unverified on both pages.** The live site publishes 12 codes including `PMC`, `KLF` and `ECA`. `KLF` and `ECA` appear in **no** school document. Alpha High's document lists 12 (`PMCs`, `ECsM`, `EBuAC`, `BUAcM`, …); Alpha Girls' lists 14 (adds `BUAcCs`, `MEBu`). `design/CONTENT-FROM-SCHOOL.md` states: *"Parents choose schools on this information. Confirm which combinations each school actually offers before publishing either list."*

**B2 · O-Level subject grouping is unverified.** The live "Science / Arts / Business / Optional" four-way grouping matches neither school's document. Alpha High's document lists 17 subjects; Alpha Girls' lists 15, and the two lists genuinely differ (High has Civics, ICS, Additional Mathematics; Girls has Basic Mathematics).

**B3 · Alpha Girls founding year.** Timeline says 2020; the school's document implies a 5th Form VI graduation in 2026. Do not publish a founding year or a derived "years" figure on the Alpha Girls page.

**B4 · Aviation positioning wording.** Keep `[Aviation positioning statement — wording to be confirmed]` verbatim.

**B5 · Club images.** No image exists for Driving or Entrepreneurship; `club-un` appears in no document. Do not invent image pairings.

**Consequence for this plan:** B1 and B2 mean the O-Level and A-Level blocks must not be extracted into a shared component asserting the two schools are the same, and must not be republished as fact. Tasks 4 and 5 render them behind a house-style placeholder until the school confirms. This is the one place the plan deliberately removes currently-visible content — because it is unverified, not because it is unwanted.

---

## File Structure

- **Create** `src/components/school/school-sub-nav.tsx` — sticky in-page anchor strip. Used by all three school pages. Replaces the four anchors lost when `NurseryHeader` was deleted.
- **Create** `src/components/school/school-blocks.tsx` — shared *presentational* primitives, all data-driven via props: `SchoolSectionHeading`, `FactRow`, `PillList`, `UnconfirmedNote`. No copy lives here.
- **Modify** `src/routes/schools.nursery-primary.tsx` — retrofit onto tokens.
- **Modify** `src/routes/schools.alpha-high.tsx` — rebuild with its own section order.
- **Modify** `src/routes/schools.alpha-girls.tsx` — rebuild with its own section order and the school-supplied content.

Content stays in each route file. Only presentation is shared. This is the specific decision that prevents the two secondary pages drifting back into one file.

---

### Task 1: Shared school sub-nav

**Files:**
- Create: `src/components/school/school-sub-nav.tsx`
- Test: manual at 375px + `npm run build`

**Interfaces:**
- Produces: `SchoolSubNav({ items }: { items: { label: string; href: string }[] })`

- [ ] **Step 1: Create the component**

Sticky below the site header, horizontally scrollable at 375px so any number of anchors fits without wrapping. Tokens only.

```tsx
export function SchoolSubNav({ items }: { items: { label: string; href: string }[] }) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="On this page"
      className="sticky top-[var(--sub-nav-top,4rem)] z-30 border-b border-[var(--color-hairline)] bg-[var(--color-surface)]/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-[var(--container-max)] gap-1 overflow-x-auto px-[var(--container-gutter)] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((i) => (
          <li key={i.href} className="shrink-0">
            <a
              href={i.href}
              className="inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-btn)] px-3 text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-deep-blue)] active:scale-[0.97] motion-reduce:transition-none"
              style={{ fontSize: "var(--text-label)", fontWeight: "var(--weight-label)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit && npm run build`
Expected: exit 0 both.

- [ ] **Step 3: Commit**

```bash
git add src/components/school/school-sub-nav.tsx
git commit -m "Add shared school sub-nav component"
```

---

### Task 2: Nursery & Primary retrofit

**Files:**
- Modify: `src/routes/schools.nursery-primary.tsx`

**Interfaces:**
- Consumes: `SchoolSubNav` from Task 1.

- [ ] **Step 1: Record the before count**

```bash
grep -oE 'var\(--(text|leading|weight|tracking|space|container|radius|shadow|btn|card|chip|stat|heading-rule)[a-z-]*\)' src/routes/schools.nursery-primary.tsx | wc -l
```
Expected: `0`

- [ ] **Step 2: Mount the sub-nav** with the page's four existing anchors (`#our-days`, `#early-years`, `#primary`, `#admission`), restoring what was lost with `NurseryHeader`.

- [ ] **Step 3: Replace arbitrary type sizes with tokens.** Every `text-4xl`/`text-5xl` heading becomes `style={T.section}`; card titles `T.cardTitle`; body `T.body`; the uppercase eyebrows `T.label`. Copy the `T` object pattern verbatim from `src/routes/index.tsx`.

- [ ] **Step 4: Replace hardcoded spacing and radii** with `--space-section-y`, `--space-card-gap`, `--space-card-pad`, `--radius-card`, `--shadow-card`, and the container shell `mx-auto w-full max-w-[var(--container-max)] px-[var(--container-gutter)]`.

- [ ] **Step 5: Verify at 375px** — no horizontal overflow, sub-nav scrolls, nav reachable.

- [ ] **Step 6: Record the after count and commit** (same command as Step 1).

---

### Task 3: Alpha High rebuild

**Files:**
- Modify: `src/routes/schools.alpha-high.tsx`

**Own identity — section order distinct from Alpha Girls:**
1. Hero — co-education, Mikocheni, the long climb
2. Academic pathway (O-Level → A-Level → aviation)
3. Entry & admission process (the school's four documented steps)
4. Life at Mikocheni
5. Clubs & sports
6. Facilities
7. Apply

- [ ] **Step 1:** Record before count (expected `0`).
- [ ] **Step 2:** Replace "Mixed" with "Co-education" everywhere.
- [ ] **Step 3:** Delete `ClubsRibbon`'s marquee in favour of the shared swipeable rail; remove the remaining `<Reveal>` wrappers.
- [ ] **Step 4:** Render the documented admission process — application fee TSh 35,000, entrance exam, 55% school average, TSh 500,000 first instalment — with the house-style note that this is **not** a fee structure.
- [ ] **Step 5:** Replace the O-Level and A-Level blocks with the B1/B2 placeholder: `[A-Level combinations for Alpha High — to be confirmed by the school]`.
- [ ] **Step 6:** Retrofit type/spacing/radius onto tokens as Task 2.
- [ ] **Step 7:** Verify at 375px, record after count, commit.

---

### Task 4: Alpha Girls rebuild

**Files:**
- Modify: `src/routes/schools.alpha-girls.tsx`

**Own identity — deliberately different order and hero from Alpha High:**
1. Hero — girls-only, Kunduchi, "mean to lead"
2. What's distinctive: Driving Club, Entrepreneurship Club, the cookery enterprise pathway
3. Where the girls compete: Pan African Schools Championship, national debate championships
4. The school year: Alpha Girls High School Week, Sports Day, field trips
5. Academic pathway
6. Facilities
7. Apply

- [ ] **Step 1:** Record before count (expected `0`).
- [ ] **Step 2:** Render the cookery enterprise pathway as an ordered sequence — learn → practise → produce → package → market → sell → account — using `PillList`. This is the page's strongest genuine differentiator.
- [ ] **Step 3:** Render Driving Club and Entrepreneurship Club. Do **not** reproduce the "Scientific inquiry" focus (a documented copy-paste error). Do not pair with invented images (B5).
- [ ] **Step 4:** Render the three upcoming 2026 dates only — September field trip, 3 Oct Sports Day, 5–9 Oct Alpha Girls High School Week. A list of only past dates reads as abandoned.
- [ ] **Step 5:** Mark all school-supplied content as unconfirmed via `UnconfirmedNote`.
- [ ] **Step 6:** Publish **no** founding year and no derived years figure (B3).
- [ ] **Step 7:** Apply the B1/B2 placeholder for combinations.
- [ ] **Step 8:** Retrofit onto tokens, verify at 375px, record after count, commit.

---

## Self-Review

**Spec coverage:** sub-nav (T1) · Nursery retrofit (T2) · High rebuild (T3) · Girls rebuild (T4) · shared presentation not content (File Structure) · Co-education wording (Global) · no invented differences (B1–B5) · token counts (each task) · one page per commit (each task). Covered.

**Placeholder scan:** the only "TBD"-shaped strings are deliberate house-style content placeholders required by AGENTS.md.

**Type consistency:** `SchoolSubNav({ items })` in T1 matches its use in T2–T4.
