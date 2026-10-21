# Prospectus Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Alpha High and Alpha Girls pages in prospectus order (about, academics, results, student life, people, admission), fix the cropped home video and make the home page bolder.

**Architecture:** Each school route stays a single file owning its composition and data; shared pieces are the existing `SubjectExplorer`, `ResultsChart`, `SchoolSubNav`, `ParentVoices` and a new `src/lib/high-results.ts` data module. The home video frame changes from cover-cropped to a 16:9 box; two new home sections are added inline in `index.tsx`.

**Tech Stack:** TanStack Start, React, Tailwind v4, Vitest.

**Spec:** docs/superpowers/specs/2026-10-22-prospectus-order-design.md

## Global Constraints

- ALPHA is the brand; ALFA EDUCATION CENTRE only in legal lines.
- Square-bracket placeholders stay visible; no invented copy, names, numbers.
- Colours from `var(--color-*)` tokens only; no new hex values.
- Type through `T.*` roles; no kicker labels above headings.
- Verify at 375px and 1440px; reduced motion collapses all motion.
- Never force-push; commit on the worktree branch, merge to main locally.

## Review Focus

- A bundle with no staff and no parent quotes: People section still renders the Head Teacher placeholder and hides parent voices (Alpha High `Staff` seed; `ParentVoices` returns null).
- `photo_slots` row missing for a club: `slotPhoto` fallback renders, never a broken image (covered by `photo-slots.test.ts`).
- Results divisions must add up to candidates (test in Task 1).
- The video at 390px must not overflow horizontally and must keep a 16:9 box (checked in the screenshot round).
- The sticky sub-nav anchors must clear the header + nav (ANCHOR scroll margin on every section id).

---

### Task 1: Alpha High NECTA results data

**Files:**
- Create: `src/lib/high-results.ts`
- Test: `src/lib/high-results.test.ts`

**Interfaces:**
- Produces: `CSEE_2025`, `CSEE_2024`, `ACSEE_2026`, `CSEE_2025_ENGLISH` typed as `Sitting` from `girls-results.ts`; reuse `squares`, `DIVISIONS`.

- [ ] **Step 1: Write the failing test** (same assertions as `girls-results.test.ts`, centre `s2549`, CSEE 2025 has 92 candidates and 60 leading `I` squares).
- [ ] **Step 2: Run it** `npx vitest run src/lib/high-results.test.ts` — fails: module not found.
- [ ] **Step 3: Write the module** with the spec's table and NECTA source URLs.
- [ ] **Step 4: Run it** — passes.
- [ ] **Step 5: Commit** `git add src/lib/high-results.ts src/lib/high-results.test.ts && git commit -m "Add Alpha High's NECTA results as data"`.

### Task 2: Alpha High page in prospectus order

**Files:**
- Modify: `src/routes/schools.alpha-high.tsx` (rewrite composition; keep all data constants and assets)

- [ ] **Step 1:** Replace the feed with the seven sections of the spec: `Hero`, `About`, `Academics` (SubjectExplorer), `Results` (ResultsChart × 3 + beyond the exam hall), `StudentLife`, `People` (Staff + ParentVoices), `Admission`, then ApplyBanner, facilities, footer. SUB_NAV: About, Academics, Results, Student life, People, Admission.
- [ ] **Step 2:** `npx tsc --noEmit` and `npx vitest run` pass.
- [ ] **Step 3:** Commit.

### Task 3: Alpha Girls page in prospectus order

**Files:**
- Modify: `src/routes/schools.alpha-girls.tsx`

- [ ] **Step 1:** Same seven sections; results keep the existing charts; journey milestones move into About; competitions into Results; enterprise pathway, clubs, campus, portraits and calendar into Student life; entry criteria into Admission.
- [ ] **Step 2:** `npx tsc --noEmit` and `npx vitest run` pass.
- [ ] **Step 3:** Commit.

### Task 4: Home page video frame and bolder bands

**Files:**
- Modify: `src/components/home-video.tsx`, `src/styles.css` (`.home-video-frame`), `src/routes/index.tsx`

- [ ] **Step 1:** Video section → navy band, 16:9 frame at shell width, poster and iframe inside the frame, heading and controls outside it.
- [ ] **Step 2:** Add `ResultsBand` (both schools' headline NECTA figures from the two data modules, linking to `/schools/alpha-high#results` and `/schools/alpha-girls#results`) and turn `AviationBanner` into a full-bleed chapter.
- [ ] **Step 3:** `npx tsc --noEmit`, `npx vitest run` pass. Commit.

### Task 5: Inspect, review, document

- [ ] **Step 1:** Build, serve, capture desktop (1440) and mobile (390) of all three pages into `.impeccable/review/`; check scrollWidth; fix in one batch; recapture once.
- [ ] **Step 2:** `impeccable detect --json` on the three routes; fix mechanical findings.
- [ ] **Step 3:** Spawn `impeccable-finish-reviewer`; act on the disposition; `impeccable-documenter` for DESIGN.md.
- [ ] **Step 4:** Full test suite; merge to main; report.
