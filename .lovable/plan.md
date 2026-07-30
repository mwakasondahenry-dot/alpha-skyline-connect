# Alpha Schools — client feedback round

Sixteen changes: a critical mobile-nav fix, a vibrant blue redesign, copy corrections, and several new/reworked sections. Two new database tables (hero slides, testimonials) with admin screens.

## 1. Mobile navigation (top priority)

The header nav is currently `hidden lg:flex`, so on phones there is no navigation at all. Add a hamburger button visible below `lg` that opens a full-screen slide-in panel containing: About Us, Schools (expandable to the three schools), Admission, Contacts, Testimonials, Aviation, plus the Enroll Now button. Closes on link tap, Escape, and backdrop tap; locks body scroll while open; respects reduced motion. Verified at 375px width with a screenshot.

## 2. Vibrant blue direction

Revert the white/grey minimal pass. Rebuild the palette around deep blue #0C447C and brand blue #185FA5 with gold #E8A020 accents and per-school accents (bright blue, blue-violet):

- Deep-blue header and footer instead of white/grey.
- Alternating section backgrounds: white, soft blue tint, and full deep-blue bands with gold detailing.
- Blue-to-gold gradient accents on cards, stat figures, buttons and dividers, replacing hairline grey.
- All values stay as tokens in `src/styles.css`; no hardcoded colours in components.

Kept modern and clean — more colour and contrast, not more clutter.

## 3. Navigation items

Header and mobile menu become exactly: About Us, Schools, Admission, Contacts, Testimonials, Aviation. "Contacts" points to /contact; "Testimonials" to the new /testimonials page.

## 4–5. Copy changes site-wide

- Testimonials heading → "Parent Testimonials"
- "Aviation, taught here" → "Aviation Program in Alpha Schools"
- "Mixed" / "Mixed Secondary" → "Co-education"
- "Owned by" → "Operated by"
- Motto/tagline → "Your Child's Education is Our Priority"
- Founding line rewritten to begin "We were founded to enable..."
- "Alpha Education Centre Limited" → "ALFA EDUCATION CENTRE" (footer, about, contact, school page footers)

## 6. Stat bar → vertical

Homepage stat bar becomes a vertical stacked list (one stat per row, figure + label, gold rule between) instead of the horizontal strip. Count-up animation kept.

## 7. Hero slideshow on all pages

A shared `HeroSlideshow` component replaces the single hero image on the homepage, three school pages, aviation, about and admission. Auto-advances every ~6s with a cross-fade, pauses on hover/focus, freezes on `prefers-reduced-motion`, has dot controls and swipe on touch. Slides come from a new `hero_slides` table (page key, image URL, alt, sort order, active) with images in a Supabase Storage bucket; the current hero image on each page stays as the fallback until you upload real photos.

New admin screen "Hero slides" lets you pick the page, upload the photo, set alt text and order.

## 8. Footer social links

Instagram (@alphaschoolstz) and YouTube added to the footer with icons, plus dimmed placeholder slots for Facebook, X and LinkedIn ready to switch on when you have the handles.

## 9–11. Nursery & Primary page

- Nursery levels listed: Day Care, Baby Class, Middle Class, Pre-Unit. Primary shown as ages 6–12.
- "What they'll explore" replaced with the nine given items (Reading & Writing, Science & Technology, Arithmetic, Environmental Care, Life Skills, Social Studies, Vocational Skills, Foreign Languages, Introduction to Aviation).
- New "Outstanding Extracurriculum" section with the eight given activities as illustrated tiles.

## 12. Admission process

The step list is replaced by the six given steps, rendered as a numbered visual flow.

## 13. Requirements on school pages

Each of the three school pages gains a Requirements section with the placeholder text "[Entry requirements — to be confirmed with academic offices]". The Admission page keeps its own requirements summary.

## 14. About timeline

Redesigned as a clean vertical (mobile) / horizontal (desktop) visual timeline with year markers on a gold rail: Alpha High School 2007, Alpha Girls 2020, Alpha Nursery & Primary 2022, Aviation programme 2022.

## 15–16. Aviation claims and modules

- The 11-module list is removed and replaced with "[Aviation modules — to be provided by school]" in a clearly-marked placeholder card.
- Every "first/1st in Tanzania to teach aviation" claim (homepage stat bar, aviation page, about page, meta descriptions) is replaced with "[Aviation positioning statement — wording to be confirmed]".

## 17. Testimonials page + admin

New `/testimonials` page with a "Parent Testimonials" heading and quote cards, backed by a new `testimonials` table (name, relationship, school, quote, photo, published, sort order) and a matching admin screen. Ships with clearly-marked placeholder quotes until you add real ones.

## Technical notes

- Stack is TanStack Start, not Next.js, so images use plain `<img>` with lazy loading and explicit sizing (there is no `next/image` here). Reduced-motion and mobile-first are respected throughout.
- Two new tables (`hero_slides`, `testimonials`) and one storage bucket are needed. Because this site uses your own external Supabase project, I will give you a single SQL snippet to paste into its SQL editor, and create the bucket instructions alongside it. Admin screens reuse the existing `admin-crud` engine and auth gate.
- Colour work is confined to `src/styles.css` tokens plus component classes; no data or business logic changes.

## What you'll see at the end

Screenshots of the homepage (desktop and phone width, with the mobile menu open) and the Nursery & Primary school page.
