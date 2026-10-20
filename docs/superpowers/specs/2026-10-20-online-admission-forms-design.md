# Online admission forms — design

Date: 2026-10-20 · Status: awaiting approval

## Why

The school's application forms are Word-made PDFs that parents print and fill
in by hand. On a computer, a parent should be able to type the answers and
get a neat, legible form to print. The paper is still the application: the
parent signs it, glues on a passport photo, attaches documents, and hands it
in at the school with the application fee. The website only helps produce the
paper.

## Source forms

`design/admission-forms/` holds four PDFs, two pages each. They are the source
of truth for questions, wording, parts and per-school contact details:

| Form | File | School |
|---|---|---|
| Form I 2027 — new admission | `Form I - 2027 APPLICATION FORM FOR ADMISSION-NEW, 2027..pdf` | Alpha High (Mikocheni) |
| Form I 2027 — new admission | `FORM I - 2027 APPLICATION FORM FOR ADMISSION.pdf` | Alpha Girls (Kunduchi) |
| Transfer | `AHS - TRANSFER APPLICATION FORM.pdf` | Alpha High |
| Transfer | `ALPHA GIRLS HIGH SCHOOL - TRANSFER IN APPLICATION FORM 2.pdf` | Alpha Girls |

Parts on every form: **A** particulars of the pupil/student (incl. father and
mother/guardian), **B** previous/primary school, **C** important information
(documents to bring, exam subjects, interview date), **D** parent's
declaration. Form I forms also have **E** academic progress (Standard 6 and 7
grades table, signed and stamped by the primary head teacher).

Differences that must be kept per form, not flattened:

- Form I part B asks for the PSLE index number (`PS…/…`), year of completing
  Standard Seven, and school name. Transfer part B asks for PSLE/FTNA/CSEE
  number and previous school name.
- Transfer forms ask the parent for entry class (Form …), bias/combination,
  and year. Form I fixes the entry class as FORM I 2027.
- Part C wording differs: exam subjects (Form I: English, Mathematics,
  General Knowledge — Alpha Girls adds "& Science"; Transfer: all subjects of
  the class of admission), results slip for A-Level transfers, interview
  venue, and the Form I note about Friday/Saturday interviews from
  12 September.
- Header contact numbers and address differ per school, and even between
  one school's two forms (e.g. Alpha High's Head of School number). Copy
  them from each PDF exactly (user's decision); the school is to confirm
  they are current before launch.

Fix while transcribing: the PDFs print the website as `alphaschools.ac.tz`.
The correct address is **alphaschools.co.tz** (confirmed by the user). Obvious
typos in the source (e.g. "KNOWLEGE") are corrected.

**Wording (builder's call, made by Claude):** question labels, part titles and
Part C/D text are transcribed word for word from each PDF, numbering
included — "PART A: PARTICULARS OF THE PUPIL", "Pupil" on Form I and
"Student" on transfer forms, as each source has it. The approved clean look
is about layout (boxes instead of dotted lines), not shorter labels. Only
obvious typos are fixed.

**Part C dates (Claude's call):** the Form I note "Interviews will be
conducted ONLY on Fridays and Saturdays from 12th September onwards" is
still true during the 2027 intake and prints as written. The Alpha High
transfer form's "Date of Examination" stays "Examination", as its source
says.

**Crests (Claude's call):** each source PDF carries its school's crest.
Extract them from the PDFs for the matching school's header; fall back to
`src/assets/alpha-logo.webp` only if extraction gives an unusable image.

## What gets built

### 1. Admission page entry point

The Admission page hero currently has a "Download Application Form" button
pointing at a placeholder PDF, with a bracketed placeholder note beneath it.
Replace that with a "Choose your form" block listing the four forms, grouped
by school.

- **Desktop** (wide screen, fine pointer — tablets and phones are *not*
  desktop): each form offers **Fill in online** as the primary action, and
  **Download blank form** as a secondary one.
- **Phone and tablet:** only **Download blank form**. No online form, no
  link to it. A one-line note says the form can be filled in online from a
  computer.
- **Alpha Nursery & Primary** has no form yet. Show it in the list with the
  placeholder `[Nursery & Primary application form — to be provided]`, per
  the AGENTS.md placeholder rule. Do not invent a form.

### 2. The online form (desktop only)

One route per form. Step-by-step, using the existing story wizard frame
(`src/components/alumni/story-wizard/wizard-frame.tsx`) or a shared extraction
of it, so it looks and behaves like the testimonial story forms:

1. **The pupil** — part A pupil fields (and, for transfers, entry class,
   bias/combination, year).
2. **Parents or guardians** — father/guardian and mother/guardian: name,
   occupation, place of work, phone.
3. **Previous school** — part B fields for that form. The pupil's name is
   repeated on the paper form in part B; on screen it is asked once and
   printed in both places.
4. **Check and download** — a read-through of every answer grouped by part,
   with an edit link per part, the part C information to read, and the
   **Download PDF** button.

If the route is opened on a small screen anyway, show a short message and
the blank-form download instead of the wizard.

Answers are saved in the browser as the parent types (same approach as
`use-story-draft.ts`), one draft per form, so a closed tab loses nothing.
There is a "Start again" that clears the draft.

**Shared computers (Claude's call):** many parents will use an office or
cyber-café machine. After the PDF downloads, the final step shows a clear
"Remove my answers from this computer" button and says why. Drafts also
expire on their own 7 days after the last edit. **Nothing is sent to any
server** — no server function, no database, no analytics of answers.

Validation is light: the pupil's first and family name are required to
download. Phone numbers and dates of birth get a gentle format check with a
message, but do not block. Everything else is optional — the parent may
prefer to finish some fields by hand.

### 3. The PDF

Generated in the browser on **Download PDF**. Approved look: the "clean"
mockup — boxed fields, same questions and part order as the original, not a
replica of the dotted-line Word layout.

Each PDF has:

- Header: Alpha crest, the school name (ALPHA HIGH SCHOOL / ALPHA GIRLS' HIGH
  SCHOOL), form title and entry class, the school's address, phone numbers,
  email and **alphaschools.co.tz**, and an empty box labelled "Attach recent
  passport size photo here".
- A clearly marked **For office use** strip: serial number, receipt number.
  Blank.
- Parts A and B as labelled boxes holding the parent's typed answers. Empty
  answers print as empty boxes with room to handwrite.
- Part C as text, with the interview date line left blank.
- Part D: the declaration text, and blank lines for signature, relationship
  and date.
- Part E (Form I only): the grades table and the school name, head teacher,
  sign, date and stamp lines, **all blank** — the primary head teacher fills
  this in.
- A4, prints cleanly in black and white, two pages like the original.

Legal-name rule (AGENTS.md): the school brand is ALPHA. If the PDF footer
names the operator, it is ALFA EDUCATION CENTRE. Nowhere else.

### 4. Blank forms for download

Phones and tablets, and the secondary desktop action, download a blank copy
of each form **in the new clean layout** (user's decision), with the correct
co.tz address. The blanks come from the same form definitions and PDF
generator as the filled-in version, generated ahead of time (a build or
one-off script) and shipped as small static files in `public/`, so phones
download only the PDF itself and never load the generator. Regenerate them
whenever a form definition changes. The placeholder link and the
bracketed "[Application form PDF — upload to Supabase Storage…]" note on
the Admission page are replaced by these files.

## Constraints

- Mobile audience on mid-range Android and mobile data: the PDF library and
  form code must not load on the Admission page or on phones. Load the PDF
  generator only when Download PDF is pressed.
- Colours from `src/styles.css` tokens only. Gold never as small text on
  white.
- Never force push or rewrite history (Lovable sync).
- The Admission page keeps its other bracketed placeholders untouched.

## Non-goals

- Online submission, payment, or any copy of answers reaching the school.
- A Nursery & Primary form.
- Uploading a photo or documents.
- Filling the form on phones.
- An admin screen for editing form questions.

## Anti-goals

- A PDF the office would not recognise as their form (missing parts, renamed
  questions, wrong school details).
- Personal data leaving the parent's browser.
- Making the Admission page heavier for phone visitors.

## Left to the builder

- Route names and file layout.
- PDF library choice (must be client-side and lazily loaded).
- How "desktop" is detected, within the rule above.
- Field-level layout within each step.
