---
name: Alpha Schools
description: Three schools and an aviation programme in Dar es Salaam, set as deep navy fields, gold rules and real photography under a guaranteed scrim.
colors:
  deep-blue: "#002e6a"
  deep-blue-dark: "#08305a"
  scrim-navy: "#001a3c"
  brand-blue: "#004a98"
  bright-blue: "#0470cc"
  girls-teal: "#0e6e70"
  girls-teal-deep: "#0a5254"
  girls-teal-tint: "#e6f2f2"
  gold: "#f2b012"
  gold-dark: "#d68f1c"
  gold-light: "#f0b240"
  accent-foreground: "#1a1a18"
  ink: "#1d2a3a"
  foreground: "#16233a"
  ink-soft: "#3f5670"
  surface: "#ffffff"
  off-white: "#fafafa"
  surface-muted: "#e9f2fc"
  surface-soft: "#d8e8f8"
  hairline: "#cfe1f4"
  danger: "#dc2626"
typography:
  display:
    fontFamily: "Mulish, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 1.15rem + 4.15vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Mulish, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.25rem + 1.07vw, 1.875rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Mulish, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.32vw, 1.25rem)"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"ss01\", \"cv11\""
  label:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.14em"
  stat:
    fontFamily: "Mulish, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1rem + 1.07vw, 1.5rem)"
    fontWeight: 800
    lineHeight: 1.1
  stat-label:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  result-square: "4px"
  btn: "8px"
  chip: "10px"
  card: "16px"
  photo-inset: "20px"
  photo: "24px"
  panel: "28px"
  pill: "999px"
spacing:
  section-y: "clamp(3rem, 2rem + 4vw, 5rem)"
  block-y: "clamp(1.5rem, 1rem + 2vw, 2.5rem)"
  card-gap: "24px"
  card-pad: "28px"
  card-pad-sm: "20px"
  container-max: "1200px"
  container-gutter: "clamp(1.25rem, 0.5rem + 2vw, 2.5rem)"
  header-h: "68px"
  sub-nav-h: "56px"
  anchor-offset: "calc(68px + 60px)"
  life-heading-col: "224px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.gold}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.deep-blue}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-muted}"
  button-ghost-on-navy:
    backgroundColor: "transparent"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  chip-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.deep-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.btn}"
    padding: "8px 14px"
  chip-filter-active:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.surface}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.btn}"
    padding: "10px 12px"
  chapter-rail:
    backgroundColor: "{colors.deep-blue}"
    textColor: "{colors.surface}"
    height: "56px"
  stat-bar:
    backgroundColor: "{colors.deep-blue}"
    textColor: "{colors.gold}"
    rounded: "{rounded.panel}"
  sub-nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.btn}"
    padding: "0 12px"
    height: "44px"
  sub-nav-link-hover:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.deep-blue}"
  result-square:
    backgroundColor: "{colors.gold}"
    rounded: "{rounded.result-square}"
  club-pill:
    backgroundColor: "{colors.deep-blue}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  club-pill-outline:
    backgroundColor: "transparent"
    textColor: "{colors.deep-blue}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  sticker-tag:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  video-frame:
    backgroundColor: "{colors.deep-blue-dark}"
    rounded: "{rounded.panel}"
---

# Design System: Alpha Schools

## Overview

**Creative North Star: "The Navy Field and the Gold Line"**

Alpha's site is built from three materials: a deep navy field, a gold line drawn through it, and real photographs of the schools' own students held legible under a navy scrim. Navy carries the heavy surfaces (header, footer, stat bars, chapter rails, alternate chapters, the coordinator panel, the results chapter). Gold is never a background for reading; it is the line, the figure and the button fill: the rule under a heading, the second line of every hero headline, the stroke behind one chosen word, the progress line a plane flies along, the square that stands for one Division I candidate. Everything else is white or a cool off-white page with blue-tinted hairlines.

The register is a confident, warm prospectus for parents on a mid-range Android phone. Type is heavy (Mulish at 800 for display) over a quiet humanist body (Hanken Grotesk at 16px, 1.6 leading). Density is generous: sections breathe on an 8px-derived rhythm that grows from 48px to 80px between sections. Depth is mostly tonal (navy against white), with a small set of navy-tinted shadows for cards and buttons. Photography is the content, not the decoration: it is the school's own, set in large rounded frames with a bold caption and a source line, and a chapter is led by its pictures before its paragraphs.

Motion is budgeted. Buttons press and lift, sections rise once as they arrive, the opening hero assembles itself in about 1.2 seconds, hand-drawn marks draw on once and result squares fill in once. Nothing loops, and everything collapses to its finished state under reduced motion. Two exemplars: the aviation page (`src/routes/aviation.tsx`) for a chapter sequence with a rail, and the two secondary school pages (`src/routes/schools.alpha-high.tsx`, `src/routes/schools.alpha-girls.tsx`) for the six-chapter prospectus under a sticky sub-nav. Alpha Girls runs the same prospectus in its sea-green register.

**Key Characteristics:**
- Deep navy fields, gold as line, figure and fill, white and cool off-white grounds.
- Mulish 800 display over Hanken Grotesk body; two-tone hero headlines, white then gold.
- Full-bleed real photography, always under a guaranteed navy scrim.
- Photo stories: the school's own pictures in 24px frames with a bold caption and a source line.
- Hairline borders in pale blue; shadows tinted navy, never neutral black.
- Pill-shaped buttons with a 2px lift on hover and a 0.97 press; no looping motion.

## Colors

A two-colour brand (navy and gold) with a family of supporting blues, one school accent in sea-green, and a cool blue-tinted neutral scale.

### Primary
- **Alpha Deep Navy** (deep-blue): The brand's field colour. Header when solid, footer, stat bars, the chapter rail, the navy chapter in a chapter sequence, the coordinator panel, Alpha High's academics head band and results chapter, the home results band, and headings on light grounds.
- **Night Navy** (deep-blue-dark): The darker end of navy gradients, the ground of quote sections that need to sit below the main navy, and the ground of the home video frame while its poster loads.
- **Scrim Navy** (scrim-navy): Never a solid fill. Used only as translucent washes (`rgba(0, 26, 60, 0.1–0.94)`) over photography: hero scrims, the transparent header's top fade, photo-chapter feet, gallery captions, the hero credential strip (0.72), programme-tile feet.

### Secondary
- **Alpha Gold** (gold): Button fill (with near-black text), the second hero line, stat figures, short rules under headings, the hand-drawn mark behind a word, the chapter rail's progress line and plane, the active chapter label on navy, focus borders on inputs, the Division I square, the heavy numeral leading an admission step, the border of one tilted inset.
- **Burnt Gold** (gold-dark): Gold's hover and the foot of gold gradients.
- **Honey Gold** (gold-light): The head of gold gradients only.
- **Ink on Gold** (accent-foreground): The only text colour allowed on a gold fill (9.12:1).

### Tertiary
- **Alpha Blue** (brand-blue): Primary in the token map; link blue, focus ring, the default accent on filter chips, tiles and disclosure cards.
- **Sky Blue** (bright-blue): The Nursery & Primary accent and the cool end of the `alpha-band-blue` gradient.
- **Kunduchi Sea-Green** (girls-teal, girls-teal-deep, girls-teal-tint): The Alpha Girls accent. Passes 4.9:1 on white, so unlike gold it can carry text. On the Alpha Girls page it takes every role Deep Navy takes on Alpha High: `girls-teal` for chapter heads, club panels and the hero credential strip; `girls-teal-deep` for the hero field, the academics head band and the results chapter; `girls-teal-tint` for the people chapter and calendar cards. It replaced the blue-violet recorded in PRODUCT.md on the user's instruction; school sign-off is still owed.

### Neutral
- **White** (surface): Default page ground, card fill, text on navy, the Division II square.
- **Cool Off-White** (off-white): Alternate page ground; the light chapters and gallery bands.
- **Mist Blue** (surface-muted) and **Pale Sky** (surface-soft): Tinted bands, ghost-button hover, sub-nav link hover, light icon discs.
- **Blue Hairline** (hairline): Every 1px border on light grounds: cards, chips, tiles, dividers, the sub-nav's foot, the top rule of each life group.
- **Navy Ink** (foreground, ink): Body text on light grounds.
- **Slate Ink** (ink-soft): Secondary copy, leads, captions and source lines on light grounds, sub-nav links at rest.
- **Error Red** (danger): Form errors only. Deliberately not the logo red.

### Named Rules
**The Gold Is a Fill Rule.** Gold is a fill, a rule and a large figure. It measures 1.91:1 on white and is never small text on a light ground. Text on gold is always Ink on Gold. Gold text appears only on navy or under a scrim.

**The Logo Colours Stay in the Logo Rule.** Logo red `#E22321` and logo green `#00923F` never appear as UI colour. Errors use Error Red.

**The Tokens Only Rule.** Every colour lives in `src/styles.css` as a custom property. Routes and components reference `var(--color-*)`, never a new hex.

**The Division Colours Rule.** A NECTA result is drawn one square per candidate on a navy or deep sea-green field: Division I is Alpha Gold, Division II is White, Division III is white at 45%, Division IV is white at 22%, and a zero is transparent. The scale never changes between schools or years, so a parent reads two charts without a second legend.

## Typography

**Display Font:** Mulish (with Hanken Grotesk, system-ui)
**Body Font:** Hanken Grotesk (with system-ui, -apple-system), stylistic sets `ss01` and `cv11` on

**Character:** A heavy, open geometric display at 800 that reads as confident from across a room, over a calm humanist body that stays readable at 16px on a small phone. Headings track in slightly (-0.01em) and use `text-wrap: balance`.

### Hierarchy
Pages never restate a size. Each role is bound once in `src/components/type-roles.ts` (`T.hero`, `T.section`, `T.cardTitle`, `T.body`, `T.label`, `T.stat`, `T.statLabel`) and applied with `style={T.role}`.
- **Display** (Mulish 800, 34px → 60px, 1.08): Hero headlines, always two lines, line one white, line two gold. Also the chapter head on a prospectus page (one colour: the school accent on light grounds, white on dark), and the large numeral leading an admission step (gold, line-height 1).
- **Headline** (Mulish 800, 24px → 30px, 1.2): Section headings, in Deep Navy on light grounds and white on navy; the heading column of a life group; the sentence above each results chart, pushed to 900 with its figure in gold.
- **Title** (Mulish 700, 18px → 20px, 1.3): Card titles, list headings, join steps, credential labels, the caption line under a photo story.
- **Body** (Hanken Grotesk 400, 16px, 1.6): All running copy, held to roughly 36–48rem measures (`max-w-[36rem]`–`[48rem]`). At 800 in Mulish it is the fact-row key and the text link; at 700 it is the club pill.
- **Label** (Hanken Grotesk 700, 12px, 0.14em, uppercase): Filter chips, stickers and tags, credential sub-lines, sub-nav links.
- **Stat** (Mulish 800, 20px → 24px, 1.1) with **Stat label** (600, 12px): Gold figures on navy stat bars.

### Named Rules
**The Two-Tone Headline Rule.** Every CinematicHero headline is two spans: line one in white, line two in gold. The gold line is the payoff, so it carries the shorter phrase.

**The One Marked Word Rule.** A heading may carry one hand-drawn gold stroke (`Marked`: underline, ring, or sweep on dark grounds) behind one word. One per heading, never a whole line.

**The Chapter Head Rule.** A prospectus chapter opens with its heading alone: Display size in the school accent (white on a dark chapter), one Marked word or one gold span, a Body lead at 85% beneath it, `max-w-3xl`. Nothing sits above the heading; no label, no eyebrow, no rule. The heading carries the chapter.

## Layout

The page is a stack of full-width bands, each holding a centred shell: max 1200px (`--container-max`) with a fluid 20px → 40px gutter (`SHELL`). Bands alternate ground (white, off-white, navy, night navy) to mark section changes instead of dividers. Vertical rhythm comes from two fluid tokens: 48px → 80px between sections (`--space-section-y`) and 24px → 40px within them (`--space-block-y`). Card grids use a 24px gutter.

Mobile is the reference width: everything is verified at 375px, and breakpoints are Tailwind's `sm` 640px, `md` 768px, `lg` 1024px. The opening screen fills the viewport (`100svh`, with `100vh` fallback) and insets its copy by the header's height (68px) so an overlaid header never sits on the headline.

**Chapter sequences.** A page that walks through places or stages uses full-bleed two-column chapters (`PlaceChapter` on /aviation): on `lg` the photograph bleeds to the viewport edge and sticks below the header and rail while the text scrolls past; the text column aligns its outer edge with the shell. On phones the photo sits above the text at 4:3. Chapters alternate side and alternate off-white and navy grounds.

**Prospectus chapters.** A secondary school page is six chapters in a fixed order a parent reads top to bottom: About, Academics, Results, Student life, People, Admission, followed by the gold apply banner and the facilities section. A sticky sub-nav (`SchoolSubNav`) sits directly under the hero and stays pinned below the header for the rest of the page; every chapter is an `id`'d section with `scroll-margin-top: calc(var(--header-h) + 3.75rem)` (`ANCHOR`, 128px) so a jump lands below both bars. Grounds alternate white, off-white (with a solid accent head band for Academics), accent-deep for Results, white, off-white or tint for People, white for Admission. Two-column chapters split `1fr 1.1fr` (About, Admission) or `1.1fr 1fr` (Academics head) at `lg` with a 64px gap; the Results chapter splits `1.4fr 1fr` (Alpha High) or `1.5fr 1fr` (Alpha Girls) so the larger Form Four chart gets the wider column.

**Life groups.** Within Student life, each sub-chapter is a row with a hairline on top (`pt-10`) and, at `lg`, a 224px (`14rem`) heading column beside a content grid (`gap-14`); the content grid goes two-up at `md` with a 40px gap. The heading column holds a Headline-size title in the accent and a Slate Ink lead.

**Ruled lists.** A long list of named things (modules, facts, joining steps, mission points, GPA rows) is set as rows divided by hairlines (`--color-hairline` on light, `white/20` on navy and sea-green), not as a card per item. A short gold dash (16 × 6px pill) may lead each row; numbered steps lead with a Display-size gold numeral in a 48px column.

## Elevation & Depth

Depth is tonal first: navy bands against white and photography under navy scrims do most of the work. Where an object must lift off a light page (cards, gold buttons, stat bars, stickers, lead photographs, tilted insets, the video frame), it uses a small vocabulary of shadows tinted with the brand navy, never neutral black.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 1px 2px rgba(0,46,106,0.06), 0 8px 24px -12px rgba(0,46,106,0.18)`): Cards and gold buttons at rest.
- **Card hover** (`box-shadow: 0 2px 4px rgba(0,46,106,0.08), 0 16px 32px -12px rgba(0,46,106,0.24)`): Gold buttons and cards on hover; the two tilted insets at rest, so they read as laid on top of the lead photograph.
- **Banner** (`box-shadow: 0 12px 32px -16px rgba(0,46,106,0.35)`): Large navy banners and panels, the lead photograph of a tilted-inset composition, the video frame.
- **Accent glow** (`0 8px 20px -8px` of the accent at 35%): Tiles and filter chips on hover or when active, in the card's own accent.

### Named Rules
**The Guaranteed Scrim Rule.** Text over a photograph always sits on a scrim that guarantees legibility over any frame: the hero's gold glow plus a navy wash (horizontal on desktop, vertical on mobile), or a bottom-up navy gradient for captions. Never rely on a photo being dark enough.

**The Navy Shadow Rule.** Shadows are tinted with navy `rgba(0,46,106,…)`. A black shadow on a light surface is off-system.

## Shapes

Soft and rounded, never sharp, with one exception: full-bleed photography and bands run edge to edge with no radius. Buttons are pills (999px). Cards, gallery tiles and the coordinator panel use a 16px corner. Large navy panels, stat bars, lead photographs and programme tiles use 28px. Photo-story frames use 24px for the lead picture and 20px for its companions and for tilted insets; the video frame uses 20px on phones and 28px from `sm`. Small interactive pieces (filter chips, subject tiles, inputs, sub-nav links, ruled list rows that highlight) use 8px; date chips 10px; result squares 4px. Icon discs are full circles at 52px (40px inline). Borders are 1px Blue Hairline on light grounds and white at 15–40% on navy. Rules under headings are short gold bars (32–48px wide, 3px tall, pill ends).

**Photo aspect ratios.** Lead photographs are 16:10 (campus from the air) or 4:5 (a portrait-format lead); photo-story pictures are 3:2 wide, 4:3 companions, 4:5 pairs and trios, 4:5 → 3:4 tall; tilted insets are 3:2; graduation portraits are 5:7; the home video frame is 16:9 and shows its whole picture (`aspect-video`, poster 1280 × 720, nothing cropped).

**The tilt.** Two insets, and only two, may be laid over a lead photograph at ±2° (`-rotate-2` left, `rotate-2` right), each with a 4px border, one white and one gold, 20px corners, card-hover shadow, sized 38–52% of the lead's width and anchored to its foot. The lead carries a bottom padding (64–96px) so the insets have room to hang below it.

## Components

### Buttons
Rounded, solid, and alive to touch.
- **Shape:** Pill (999px), minimum 44px tall for the touch target, 28px horizontal padding, Mulish 700 at 16px.
- **Primary (`GoldButton`):** Alpha Gold fill, Ink on Gold text, card-rest shadow. The page's one call to act.
- **Ghost (`GhostButton`):** Transparent with a Blue Hairline border and Deep Navy text; hover fills Mist Blue. `onNavy` swaps to a white 40% border and white text, hover white at 10%. Used for the secondary action beside a gold button, and for any action on navy or a photograph.
- **On gold:** On the gold apply banner the pair inverts: a solid accent pill with white text, and an outlined 2px accent pill that hovers to white at 40%.
- **Hover / Press:** Lift 2px over 150ms with `cubic-bezier(0.22, 1, 0.36, 1)`; press scales to 0.97 over 120ms. Transform only; no motion under reduced motion.
- **Text link CTA:** Deep Navy Mulish 800 with a 2px gold underline offset 6px, for a quiet closing action. On navy the same link is gold with an arrow.

### Chips
- **Filter chip:** White, Blue Hairline border, Deep Navy label type (12px, uppercase, 0.14em), 8px corner. Hover borders in the accent and lifts 1px. Active (`aria-pressed`) fills with the accent and white text plus an accent glow.
- **Sticker:** A tilted pill badge in label type, gold or navy, that pops in once.
- **Tag:** An untilted gold pill in label type with Ink on Gold text (6 × 12px padding) that names the field and year under an achievement photo story ("Engineering · 2024"). It follows the story; it never sits above a heading.
- **Club pill:** A name set as a pill in Mulish 700 Body size (8 × 16px padding): accent fill with white text for a club, accent 1px outline with accent text for a sport. Used only while the school has not yet uploaded a photograph; once one exists the club shows as a 4:5 picture at 20px with its name in Mulish 800 beneath.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** White on light grounds.
- **Shadow Strategy:** Card rest, card hover on interaction (see Elevation).
- **Border:** 1px Blue Hairline.
- **Internal Padding:** 28px (20px on mobile).
- **Disclosure card:** A card with a solid gradient header band in its accent, a white count disc and a ringed chevron disc; collapsed on phones, open on desktop, with no JS needed.
- **Portrait card:** The people chapter's card: 24px corner, white, 1px hairline ring, a 4:5 portrait when one exists, name in Title size in the accent, role in Slate Ink, and a visible `[Photograph to be provided by the school]` line when it does not.
- **Programme tile:** A 28px photo tile at least 18rem tall (22rem from `sm`) with a bottom-up Scrim Navy gradient (0.9 → 0.45 → clear at 75%), a 40px gold icon disc, a Headline title, body at 90% and a gold "Read more" line; it lifts 2px and its photo scales 1.03 on hover.

### Inputs / Fields
- **Style:** White fill, 1px Deep Navy border at 15%, 8px corner, 10px × 12px padding, Navy Ink text.
- **Focus:** Border turns Alpha Gold with a 2px gold ring at 30%.

### Navigation
- **Header:** Overlaid on hero pages: transparent with a navy top fade, turning Deep Navy at 95% with backdrop blur once scrolled. Logo in a white disc, "ALPHA SCHOOLS" wordmark, nav links in white at 85% turning gold on hover, and a gold call-to-action. Below `lg` a full-screen navy menu replaces the links.
- **School sub-nav (`SchoolSubNav`):** A white 95% bar with backdrop blur and a hairline foot, sticky at `top: var(--header-h)` for the length of a school page and placed below the hero, never above it. Links are label type (12px, uppercase, 0.14em) in Slate Ink, 44px tall, 12px side padding, 8px corner; hover fills Mist Blue and turns Deep Navy; press scales 0.97. On phones the row scrolls horizontally with its scrollbar hidden rather than wrapping.
- **Footer:** Deep Navy with a 4px gold–sky–gold gradient rule across its top.

### Cinematic Hero (signature)
The opening screen on every major page: full-bleed photography or slideshow, the guaranteed scrim, a two-tone Display headline lower left, a body blurb, then a gold button and a ghost-on-navy button. It assembles once on load (photo settles from 1.06, scrim fades, then each line rises 16px on a staggered 180–840ms schedule) and finishes by about 1160ms. It can carry a desktop stat rail or a credential strip pinned to its foot. An optional `srLead` prefixes the headline with a visually hidden line (the school's full name and place) so the `h1` reads whole to a screen reader without a visible kicker.

### Hero Credentials (signature)
The strip pinned to a hero's foot: Scrim Navy at 72% with backdrop blur and a gold 30% hairline on top; one item per fact, each a 40px (48px from `sm`) gold-tinted disc with a gold icon, a white Title label and a label-type sub-line. From `sm` it is a grid of as many columns as it has items (two columns between 640 and 1023px); on phones it is a single horizontally scrolling row with the sub-lines hidden and a right-edge fade (`mask-image: linear-gradient(to right, black 68%, transparent 97%)`, `.hero-cred-strip`) so the cut-off item reads as scrollable.

### Stat Bar (signature)
A Deep Navy panel with a 28px corner and a 6px gold rule along its foot; gold Stat figures over white Stat labels, divided by white 15% hairlines; two columns on mobile, four on desktop.

### Chapter Rail (signature, /aviation)
A 56px Deep Navy bar that sticks directly below the header for the length of a chapter sequence and leaves with the last chapter. It holds numbered chapter links (Mulish 700, 15px; numerals white at 55%) with the current chapter in gold (`aria-current="step"`). Along its foot runs a 2px white 15% track; a gold line fills it to the middle of the current chapter and a filled gold plane rides its head, moving over 700ms with `cubic-bezier(0.16, 1, 0.3, 1)`. One IntersectionObserver drives it; under reduced motion it jumps without travel.

### Photo Chapter (signature, /aviation)
See Layout. The photo's foot carries a bottom-up navy scrim with a large gold Mulish 900 numeral (64px → 120px) and a white caption. The chapter title uses the Display weight at 36px → 56px.

### Results Chart (signature, `ResultsChart`)
NECTA's published results drawn as a unit chart on the accent-deep results chapter (Deep Navy on Alpha High and the home results band, Kunduchi Sea-Green deep on Alpha Girls). One 4px-rounded square per candidate in a fixed-column grid (23–24 columns for Alpha High's larger sittings, 15 and 10 for Alpha Girls') with a 5–6px gap, best division first, coloured by The Division Colours Rule. The chapter leads with the newest Form Four sitting in the wider column and the newest Form Six beside it, then a white 20% hairline, the previous Form Four square for square so the rise is seen, and a ruled `dl` of GPA rows (gold Mulish 800 key, white 90% value) ending in NECTA source links (white, underlined, gold on hover, external-link icon). Each chart's sentence is Headline size at 900 with its figure in gold. Squares scale in from 0 over 300ms with a 22ms stagger capped at 900ms, once, when the chart scrolls in; server HTML, reduced motion and no-JS all show them filled. The legend is a row of buttons; hovering or focusing a division dims the others to 18%.

### Photo Story (signature, `PhotoStory`)
The unit of a prospectus chapter: a set of the school's own photographs, then a bold caption line in Title size, a Body sentence at 85%, and a Slate Ink (white 75% on dark) source line naming where the pictures came from ("Alpha Schools on Instagram, 22 August 2024"; "Alpha High, school photographs"). Four layouts: **wide** (one 3:2 at 24px over two 4:3 at 20px), **pair** (two 4:5 at 24px), **trio** (one 4:5 spanning two columns and two rows at 24px beside two 4:5 at 20px) and **tall** (one 4:5, 3:4 from `sm`, at 24px, cropped to the top). Gaps are 8px (12px from `sm`). A tag may follow the story; a label never precedes it.

### Tilted Inset (signature)
A lead photograph (16:10 or 4:5, 28px corner, banner shadow) with one or two 3:2 insets laid over its foot at ±2°, 4px white or gold borders, 20px corners and card-hover shadow. The About chapter of Alpha High, the About page and the home aviation chapter all use it; it is the composition that says "a real place" before the paragraphs do.

### Life Group (signature, `LifeGroup`)
See Layout. A hairline-topped row with a 14rem heading column (Headline in the accent, Slate Ink lead) and a content grid of photo stories, pills or ruled rows; two-up at `md`.

### Video Frame (signature, `HomeVideo`)
A 16:9 frame at 20px (28px from `sm`) on a Night Navy ground with banner shadow. The full picture is shown, never cropped to cover: a blurred inline placeholder sits under the site-served 1280 × 720 poster, and the player cross-fades in over 400ms only once it is playing. Controls are 48px navy 60% pills with white icons.

## Do's and Don'ts

### Do:
- **Do** put text on gold only in Ink on Gold (`#1a1a18`), and keep gold text to navy or scrimmed grounds.
- **Do** put every photograph that carries text under a navy scrim built from Scrim Navy, and use the school's own real photography.
- **Do** bind type through `T.*` roles and colours through `var(--color-*)` tokens.
- **Do** set long lists of named things as hairline-ruled rows, led by a short gold dash or a heavy numeral.
- **Do** pair one GoldButton with one GhostButton; on navy or photography use the ghost's `onNavy` tone.
- **Do** keep motion to button press and hover, one-shot reveals (420ms, stagger capped at 320ms), the hero entrance and the one-shot result-square fill, all transform and opacity, all collapsing under `prefers-reduced-motion`.
- **Do** keep square-bracket placeholders visible in Slate Ink body type, e.g. `[To be confirmed]`.
- **Do** keep a secondary school page in the six-chapter order (About, Academics, Results, Student life, People, Admission) under the sticky sub-nav, with `ANCHOR` scroll margins on every chapter.
- **Do** give every photo story a caption line and a source line, and show a club as a name pill until the school has uploaded its photograph.
- **Do** draw results with `ResultsChart` from `src/lib/*-results.ts`, newest Form Four first, Form Six beside it, the previous year below, GPA rows and NECTA source links after.

### Don't:
- **Don't** use gold for small text on white or off-white.
- **Don't** use logo red `#E22321` or logo green `#00923F` anywhere in the UI.
- **Don't** use black or neutral grey shadows on light surfaces; tint them navy.
- **Don't** loop motion: no bobbing cues, pulsing badges, floating cards or drifting clouds. No parallax, scroll-jacking or autoplay video outside the home-page video section.
- **Don't** fill a hero eyebrow slot or add an uppercase kicker above a heading; the heading and its gold rule or mark carry the section. A chapter head stands alone.
- **Don't** add new hex values in routes or components.
- **Don't** crop the 16:9 video frame to cover its section, and don't tilt more than two insets or tilt them past 2°.
- **Don't** invent a division colour: Division I gold, II white, III white 45%, IV white 22%, on navy or deep sea-green only.
