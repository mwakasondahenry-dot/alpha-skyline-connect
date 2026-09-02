# Design references — Alpha Schools

Client-approved mockups for the redesign. Match layout, spacing, colour,
type hierarchy and component shapes.

**Read the "Known errors" section before building anything.** The mockups
contain factual mistakes the client has already corrected in writing. Copying
them into the build is a regression.

---

## Files

| File | What it shows |
|---|---|
| `homepage-desktop.png` | Homepage, desktop width |
| `homepage-mobile.png` | Homepage at ~375px |

Add a row here whenever a new reference lands. If a page has no reference,
extrapolate from the homepage and the tokens in `src/styles.css` — do not
invent a new visual language.

---

## Known errors in these mockups — DO NOT COPY

### 1. The wordmark is wrong

The mockup header and footer read "ALPHA EDUCATION CENTRE". That company does
not exist. The two names are separate things:

- **ALPHA** — the school brand. Logo, header wordmark, page titles, meta
  descriptions, marketing copy, social handles, the domain, and the three
  school names (Alpha High, Alpha Girls, Alpha Nursery & Primary).
- **ALFA EDUCATION CENTRE** — the legal entity. Footer copyright, postal
  address, "operated by" lines, terms and privacy pages, and the legal name in
  structured data. **Nowhere else.**

The header lockup should read **ALPHA SCHOOLS**, not ALPHA EDUCATION CENTRE.

The existing code already applies this split correctly. Do not "fix" it to
match the mockup.

### 2. The statistics are unverified

The mockup shows 1,800+ Students, 120+ Teachers, 3 Schools, 17+ Years of
Excellence, 20+ Clubs & Activities. Only "3 Schools" is confirmed.

Keep the existing `STATS` values in `src/routes/index.tsx` until the school
confirms new ones in writing. The client recently forced removal of an
unverifiable "1st in Tanzania" claim — do not introduce four more.

"17+ Years" is arithmetically wrong: Alpha High opened in 2007. The site
calculates years from the founding year. **Never hardcode it.**

Adopt the mockup's stat *layout* (vertical rail on desktop, grid on mobile)
with the current stat *values*.

### 3. The testimonial quotes are invented

"Mrs. Rehema M." and "Brian K., Class of 2020" are not real people. No real
testimonials exist yet, and none are in the database.

Both testimonial sections must **hide themselves entirely** when there are no
published quotes. Never render placeholder names or invented quotes on the
public site. This rule is in `AGENTS.md` and it is not negotiable.

### 4. Navigation order

The mockup reads: About Us, Schools, Admission, Aviation, Testimonials, Contacts.

The client's written feedback says: **About Us, Schools, Admission, Contacts,
Testimonials, Aviation.** Follow the written feedback. The code already matches it.

### 5. The chatbot is phase two

The floating chat bubble in the bottom-right of both mockups is not in scope.
Do not build it, do not stub it, do not leave a placeholder button.

### 6. "Watch Our Story" video button

No video exists. Omit this button until told otherwise.

### 7. Social platforms

The footer shows Facebook, Instagram, LinkedIn, YouTube and TikTok. Only
Instagram (@alphaschoolstz) and YouTube have confirmed handles. Render only
confirmed platforms; do not link to profiles that do not exist.

---

## Build constraints

These come from the project spec and the audience, not the mockup.

**Photography.** The hero rotates through a slideshow of real school photos
with varying crop, subject placement and exposure. The headline and the stat
rail must remain legible over **any** of them. Use a guaranteed gradient scrim,
not a hope that the photo is dark enough. If a layout only works with one
perfectly-composed image, it is the wrong layout.

**Mobile first.** The audience is parents on mid-range Android phones on
mobile data in Dar es Salaam. Verify every change at 375px. The previous round
shipped with no mobile navigation at all — that is how easy this is to miss.

**Performance over polish.** Minimal animation. No large images. No video
autoplay. A section that looks 10% better and loads 2 seconds slower is a
net loss.

**Colour lives in tokens.** Every colour goes in `src/styles.css` as a CSS
variable. No hardcoded hex in routes or components. Red `#E22321` and green
`#00923F` are logo-only and must never appear as UI colour. Gold is for large
figures, button fills with dark text, and rules — never small text on white,
it fails contrast.

**Content placeholders stay visible.** Text in square brackets like
`[Fee structure per school — to be provided]` marks content the school still
owes. Keep these clearly marked. Do not invent replacement copy, and do not
quietly delete the section.

---

## Working order

Do not skip ahead. Each step depends on the one before it.

1. **Prerequisite** — replace the ~131 hardcoded hex values in `src/routes/`
   and `src/components/` with tokens. Re-skinning before this is done means
   the old palette leaks across 15 pages.
2. **Tokens** — extract the design system from the mockups into
   `src/styles.css`. No route or component edits.
3. **Homepage** — apply the system to `src/routes/index.tsx` only. Client
   signs off before anything else moves.
4. **Propagate** — apply the same system to the remaining pages.

See `design/SESSION-BRIEFS.md` for the exact brief to use at each step.
