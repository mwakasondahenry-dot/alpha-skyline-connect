# ALPHA SCHOOLS WEBSITE — MASTER BUILD DOCUMENT

**This is the single source of truth for the Alpha Schools website build.** It combines the project spec, the verified site architecture, the real content, and the database notes. Hand this to Claude Code together with `alpha_schema.sql`. Where this document and any older note disagree, THIS document wins.

Three companion files travel with this one:
- `alpha_schema.sql` — run in Supabase first (creates all tables, RLS, storage).
- `alpha_content_reference.md` — the full real-content detail (longer-form source text).
- The approved design — screenshots + the standalone `dist/index.html` (visual source of truth for look & feel).

---

# PART 1 — WHAT WE'RE BUILDING

A modern website for **Alpha Schools** (Alpha Education Centre Limited), Dar es Salaam — replacing their dated existing site. It covers **three schools across two campus locations** under one Alpha brand, and includes an admin dashboard so staff keep it updated themselves.

**The three schools (VERIFIED — note the campuses):**
| School | Type | Campus | Ages |
|---|---|---|---|
| Nursery & Primary | Combined | **Kunduchi** | 2–12 |
| Alpha High | Mixed secondary | **Mikocheni** | Form 1–6 |
| Alpha Girls | Girls' secondary | **Kunduchi** | Form 1–6 |

⚠️ **Two schools share the Kunduchi campus** (Nursery & Primary, and Alpha Girls). Only Alpha High is in Mikocheni. So the site says **"3 schools"** or **"2 campuses"** — NEVER "3 campuses" (the brochure contradicts it).

**The hook:** Alpha is the **first school in Tanzania to teach aviation** (real, official claim). Aviation is the #1 differentiator and gets a full, prominent page. Coding is the secondary pillar.

**Stack:** Next.js (App Router, TypeScript) + Supabase (DB, Auth, Storage) + Tailwind + deploy to Vercel.

**Audience:** Mostly parents on mid-range Android phones / mobile data. Mobile-first and fast-loading are non-negotiable. No heavy animation. **Images load from Supabase Storage via next/image — never base64-inlined.**

---

# PART 2 — CRITICAL CORRECTIONS (apply these — they override the design & earlier assumptions)

1. **NECTA ONLY — no Cambridge.** The approved design wrongly shows "Two pathways: NECTA + Cambridge." This is FALSE. Remove every mention of Cambridge/IGCSE (Alpha High page, Alpha Girls page, homepage stat bar). Replace with an accurate NECTA section: full CSEE (O-Level) and ACSEE (A-Level), highlighting the **11 A-Level combinations**. Differentiators are aviation + coding, not a second exam board.
2. **Campuses:** Nursery & Primary is in **Kunduchi**, not a separate campus. Fix `schools.campus` and all footers.
3. **"3 schools / 2 campuses"** — never "3 campuses."
4. **Aviation partner is KSOF** (Kenya School of Flying), Nairobi.
5. **Testimonials:** the design's "Neema P. / Hamisi M." quotes are placeholders. Use ONLY real consented parent quotes. If none available at build, HIDE the testimonial section entirely. (The old site died on fake testimonials — do not repeat.)
6. **Six design fixes** still apply (see Part 6).

---

# PART 3 — SITE ARCHITECTURE

```
/                          Homepage — routes 4 audiences to 3 schools
│
├── /schools/nursery-primary   Nursery & Primary (early-years template, Kunduchi)
├── /schools/alpha-high        Alpha High (secondary template, Mikocheni, deep blue)
├── /schools/alpha-girls       Alpha Girls (secondary template, Kunduchi, blue-violet)
│
├── /aviation                 Aviation programme (flagship — KSOF, PPL, modules, simulator)
├── /coding                   Coding & digital skills (secondary schools)
├── /admission                How to apply (5-step process)
├── /about                    Mission, vision, values, the crest
├── /news                     "What's New" — full news + events listing
├── /news/[id]                Individual news post
├── /gallery                  Campus photos
├── /contact                  Phone, WhatsApp, map, enquiry form
│
└── /admin                    PRIVATE — staff login
    ├── /admin/login
    ├── news      (create/edit/delete · cover image · school tag · publish toggle)
    ├── events    (date · location · school tag · publish toggle)
    ├── gallery   (image upload · caption · school tag)
    └── staff     (name · title · photo · school tag)
```

**Content scope rule:** The dashboard manages the *frequently-changing* content only — news, events, gallery, staff. Static page content (mission, academics, aviation details, fees) is built directly into the pages by Claude Code, NOT editable via the dashboard. Set this expectation with Alpha: no "edit the about page" feature in this build.

**Aviation/coding placement:** these apply to the SECONDARY schools (High, Girls). Show them in secondary sub-nav; do NOT make aviation prominent on the Nursery & Primary page — it's irrelevant to a nursery parent.

**Homepage sections (match the approved design):** hero "Learning that takes off" + aviation badge + real student photos → "Find the right campus" 3-school router → aviation feature block → stat bar (fix to "3 schools / 2 campuses", "ages 2–18", "1st in Tanzania for aviation", "11 A-Level combinations") → "What's New" (news left, events right) → testimonials (real only) → gallery peek.

---

# PART 4 — BRAND SYSTEM (design tokens — use everywhere, no off-palette colours)

| Token | Hex | Use |
|---|---|---|
| deep-blue | `#0C447C` | Headers, nav, primary headings |
| brand-blue | `#185FA5` | Buttons, links |
| bright-blue | `#1E7FC2` | Nursery & Primary accent |
| blue-violet | `#3C3489` | Alpha Girls accent |
| gold | `#E8A020` | Sparing accent, aviation, CTAs (NOT raw logo yellow #FFE760) |
| off-white | `#F7F5EF` | Page background |
| ink | `#2C2C2A` | Body text |

- Red `#E22321` / green `#00923F` are **logo-only — never UI colours.**
- Per-school accent: Nursery & Primary → bright-blue; Alpha High → deep-blue; Alpha Girls → blue-violet. All pair with gold.
- Two template families: early-years (warm, rounded, image-led) for Nursery & Primary; secondary (sharp, typographic, results-led) for High + Girls.
- Logo: only the dense circular crest exists. Use the white-container + "ALPHA SCHOOLS · [school]" text lockup; the crest is illegible small. Full crest can live on the About page. (A simplified web logo is still outstanding.)

---

# PART 5 — REAL CONTENT (use this, not placeholder text)

**Mission:** To enable pupils to prosper academically by solving their intellectual and environmental challenges, to enable them to become good citizens, responsible to their society.
**Vision:** To strive for excellence.
**Core values:** Integrity · Excellence · Innovation · Discipline · Service.
**Org summary (About):** Alpha Schools comprises Alpha High (Mikocheni), Alpha Girls High (Kunduchi), and Alpha Nursery & Primary (Kunduchi), Dar es Salaam — founded to enable students to achieve their best intellectually and physically, and become responsible citizens. Alpha High established 19 March 2007.

**Aviation page (flagship):**
- First school in Tanzania to introduce aviation & flying.
- Partner: Kenya School of Flying (KSOF) — pilot courses + ground school.
- Qualification: Private Pilot Licence (PPL) for Form 4 and Form 6 leavers.
- Requirement: min 40 flying hours via holiday programs. O-Level: start at Form 1, finish before CSEE. A-Level joining Form 5: accelerated.
- 11 modules: Aviation Technology, Basic Aeronautics, Flight Operations & Regulations, Safety in Aviation, Meteorology, Aircraft Engineering & Maintenance, Air Traffic Control, Electrical Systems, Flight Dispatch, Cabin Crew, Aerodynamics.
- Simulator: CAE 7000XR Series Level D full-flight simulator.
- Proof: "Alpha Flying Students Class of 2022" (named students, real flight photos) — use WITH consent.

**Academics (secondary pages):**
- Modern science labs; computer literacy for all; computer studies examined.
- O-Level: Science (Phys, Chem, Bio, Basic Maths); Arts (History, Geog, English, Civics, Kiswahili); Business (Book-Keeping, Commerce); Optional (Add Maths, Literature, French, ICS).
- **11 A-Level combinations:** PCM, PCB, PGM, PMC, CBG, HGL, HKL, KLF, EGM, ECA, HGE.
- Exams: CSEE (O-Level), ACSEE (A-Level).

**Clubs:** News Bulletin, Aviation, Art & Drawing, UN, Drama, Music & Dance, Music & Singing, Debate, Modeling, Cookery, Environment, Scout, Public Speaking. Weekly; termly showcase (Sports Bonanza, graduations).
**Sports:** football, basketball, volleyball, netball, athletics — boys & girls.
**Counselling:** confidential dept, self/teacher/parent referral.
**Facilities:** Labs, Library, Sports field, Boarding.

**Staff (seed):** Richard Gatere Maina — Head Teacher (headshot pending).

**Admission page:**
- Entry: 2 yrs (Nursery), 5 yrs (Primary).
- Documents: application form, birth certificate, passport-size photos.
- Process: 1) obtain & complete form → 2) submit academic documents → 3) interview/assessment (per school schedule) → 4) admission offer → 5) registration & fee payment.
- Intake: rolling, January–December.

**Contact / footer:**
- Address: Kunduchi, Dar es Salaam.
- Phone/WhatsApp: 0734 036 010 · Admissions also: 0756 299 302.
- Email: alphaschoolsdsm@gmail.com *(recommend upgrading to admissions@alphaschools.ac.tz)*.
- Instagram: @alphaschoolstz · YouTube: active (events, graduations, promos).
- WhatsApp groups managed by office. No Facebook/X/TikTok/LinkedIn.

---

# PART 6 — THE SIX DESIGN FIXES (bake in during build)

1. **Aviation homepage block:** headline must not collide with photo/logo — use a dark scrim or a solid panel beside the image. White text must be readable. (Most important block.)
2. **Alpha High hero:** add top padding so the headline clears the navbar (match Alpha Girls spacing).
3. **No layout artifacts:** remove stray dashed guide borders.
4. **What's New cards:** show full cover, school tag, relative date, title, excerpt — not cut off.
5. **Buttons:** standardize to "Apply Now", "Book a Visit", "Explore the School" — title case everywhere.
6. **Testimonials:** real consented quotes only, else hide the section.

---

# PART 7 — BUILD ORDER

1. **Database first** — run `alpha_schema.sql` in Supabase; confirm `media` bucket; wire Next.js via `@supabase/ssr`; seed a few real news/events rows by hand; confirm server-side reads work.
2. **Public site** — match the approved design (use `dist/index.html` + screenshots as visual source of truth), wire dynamic sections to Supabase, apply Part 2 corrections + Part 5 real content. Order: homepage → 3 school pages → aviation → coding → admission/about/contact/gallery → news.
3. **Admin dashboard** — `/admin` with Supabase Auth (several staff logins, created manually in Supabase — no public signup). One reusable pattern (list + form + delete + image upload) applied to news, events, gallery, staff. Loud publish/draft toggle; required school dropdown. Must be usable by a non-technical secretary.
4. **Apply the six fixes** throughout.
5. **Polish & deploy** — mobile QA on a real Android viewport; next/image + compression; allowed hover effects only (scale, shadow, fade — no parallax); SEO (titles, meta, OG, sitemap); accessibility (alt text, contrast); deploy to Vercel; connect domain.

**Out of scope (Phase 2 — keep schema clean of these):** parent/student results portal, online payments, per-school admin permissions, editable static-page CMS.

---

# PART 8 — PRE-LAUNCH CHECKLIST (gather in parallel — content is the real bottleneck)

- [ ] Confirm NECTA-only with the school (DONE — confirmed NECTA only) ✅
- [ ] Real consented parent testimonials (else section stays hidden)
- [ ] Media-release consent for Class of 2022 aviation students before their photos go public
- [ ] Real campus photos per school (consent for identifiable children)
- [ ] Head Teacher professional headshot (min 500×500px)
- [ ] Google Maps share links per campus
- [ ] Fee structures per school
- [ ] Simplified web logo (horizontal lockup from the crest)
- [ ] Recommend institutional email (admissions@alphaschools.ac.tz) over gmail
