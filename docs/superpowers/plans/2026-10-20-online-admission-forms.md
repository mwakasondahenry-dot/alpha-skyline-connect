# Online Admission Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Parents on a desktop fill in one of four Alpha admission forms step by step and download a clean PDF to print, sign and hand in; phones and tablets download blank copies of the same PDFs.

**Architecture:** Form content lives as data (`src/lib/admission-forms/forms.ts`). A pure layout function turns a form plus answers into draw operations; a thin pdf-lib writer turns those into a PDF. The same code renders filled PDFs in the browser (lazy-loaded on Download) and blank PDFs ahead of time via a vite-node script into `public/forms/`. The wizard reuses the story wizard's step indicator and field pieces; answers live only in `localStorage`.

**Tech Stack:** TanStack Start (file routes), React, Tailwind v4 tokens, vitest, `pdf-lib@1.17.1` (new, exact version), vite-node (already installed with vitest).

**Spec:** `docs/superpowers/specs/2026-10-20-online-admission-forms-design.md`

## Global Constraints

- Nothing the parent types is sent anywhere: no server function, no fetch with answers, no analytics.
- pdf-lib must not load on `/admission` or on phones. Import `src/lib/admission-forms/pdf.ts` only via `await import(...)` inside the Download click handler.
- Desktop = `matchMedia("(min-width: 1024px) and (pointer: fine)")`. Everything else is "phone/tablet": download-only.
- Website printed on every PDF: `www.alphaschools.co.tz`. Never `ac.tz`.
- Wording on the PDF is word for word from the source PDFs (Task 1 tables), only obvious typos fixed.
- Colours via `src/styles.css` tokens only; in the PDF, use `#002e6a` (deep-blue) for headings and black/grey for everything else, readable in black-and-white print.
- Brand ALPHA everywhere; ALFA EDUCATION CENTRE appears only if a legal/operator line is added (none is planned).
- Placeholder copy stays bracketed: `[Nursery & Primary application form — to be provided]`.
- Never force push, rebase or amend pushed commits.

## Review Focus

1. **Characters the PDF font can't draw** (curly quotes are fine, but emoji, Arabic or Chinese script, `ŋ`): expect the download to still work, with those characters dropped or transliterated, never an exception. → Task 2 `sanitizeForPdf` test.
2. **Very long answers** (a 120-character place of work, a long email): expect the text to shrink to a 7pt minimum, then get cut with "…" inside its box, never overflowing into the next box. → Task 3 `fitText` test.
3. **A stale or corrupt draft in localStorage** (older than 7 days, invalid JSON, a draft saved under a different form's shape): expect a fresh empty form, no crash. → Task 2 `readDraft` tests.
4. **The blank PDFs in `public/forms/` drifting from the definitions** after someone edits `forms.ts`: expect a failing test telling them to run `npm run forms:blank`. → Task 4 staleness test.
5. **An unknown form id in the URL** (`/admission/apply/form-iii`): expect the site's 404, not a blank wizard. → Task 5 route uses `notFound()`; checked in Task 7.

---

## File structure

| File | Responsibility |
|---|---|
| `src/lib/admission-forms/forms.ts` | The four form definitions (data only) and lookup |
| `src/lib/admission-forms/answers.ts` | Pure rules: download gate, soft checks, sanitising, file name, draft read/expiry |
| `src/lib/admission-forms/layout.ts` | Pure: form + answers → pages of draw ops |
| `src/lib/admission-forms/pdf.ts` | pdf-lib writer: draw ops + crest bytes → `Uint8Array` |
| `scripts/generate-blank-forms.ts` | Writes `public/forms/<id>.pdf` from the definitions |
| `public/forms/crests/alpha-high.jpg`, `alpha-schools.png` | Crest images for the PDF header |
| `src/components/admission-forms/use-form-draft.ts` | localStorage draft hook with expiry |
| `src/components/admission-forms/use-is-desktop.ts` | desktop detection hook |
| `src/components/admission-forms/application-wizard.tsx` | The four-step wizard and download |
| `src/components/admission-forms/form-picker.tsx` | "Choose your form" block for the Admission page |
| `src/routes/admission.apply.$form.tsx` | `/admission/apply/:form` |
| `src/components/alumni/story-wizard/wizard-frame.tsx` | Modify: export `StepIndicator` |
| `src/routes/admission.tsx` | Modify: hero CTA + new forms section |

---

### Task 1: Form definitions and crests

**Files:**
- Create: `src/lib/admission-forms/forms.ts`
- Create: `public/forms/crests/alpha-high.jpg`, `public/forms/crests/alpha-schools.png`
- Test: `src/lib/admission-forms/forms.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type FormId = "alpha-high-form-1" | "alpha-girls-form-1" | "alpha-high-transfer" | "alpha-girls-transfer";
  export type FieldKind = "text" | "date" | "phone" | "email" | "gender";
  export type Field = { key: string; label: string; kind: FieldKind; width: 1 | 2 | 3 };   // width = share of a 3-column row on the PDF
  export type Question = { n: number; fields: Field[] };   // one numbered line of the source form
  export type Part = { title: string; questions: Question[] };
  export type WizardStep = "pupil" | "parents" | "school";
  export type FormDef = {
    id: FormId; school: "alpha-high" | "alpha-girls"; kind: "form-1" | "transfer";
    schoolName: string;            // "ALPHA HIGH SCHOOL" | "ALPHA GIRLS' HIGH SCHOOL"
    shortName: string;             // "Alpha High" | "Alpha Girls"
    title: string;                 // "APPLICATION FORM FOR ADMISSION" | "TRANSFER APPLICATION FORM"
    entryClass: string | null;     // "FORM I 2027" for form-1, null for transfer
    entryFields: Field[];          // transfer only: entryForm, combination, entryYear
    headerLines: string[];         // address + contact lines, last line is the website/email line
    crest: "alpha-high.jpg" | "alpha-schools.png";
    partA: Part; partB: Part;
    steps: Record<WizardStep, string[]>;   // field keys asked on each wizard step
    partC: string[];               // paragraphs, verbatim
    partD: string;                 // declaration, verbatim
    hasPartE: boolean;
    blankPdfPath: string;          // "/forms/<id>.pdf"
  };
  export const FORMS: FormDef[];
  export function getForm(id: string): FormDef | undefined;
  ```

**Content (verbatim; source PDFs in `design/admission-forms/`):**

Website line for all four: `Website: www.alphaschools.co.tz   E-mail: alphaschoolsdsm@gmail.com`

| id | headerLines (before website line) |
|---|---|
| alpha-high-form-1 | `P. O. Box 35136, Dar es Salaam, Tanzania. Mikocheni B Industrial Area` · `Head of School: 0755524961, 0739 924 500, Academic Office: 0672833974` · `Manager: 0734036010; 0784848686; 0653312438; 0716902995.` |
| alpha-high-transfer | `P. O. Box 35136, Dar es Salaam, Tanzania. Mikocheni B Industrial Area` · `Head of School: 0787239803, Academic Supervisor: 0713642873` · `Manager: 0734 036 010; 0784 848 686` |
| alpha-girls-form-1 | `P. O. Box 35136, Dar es Salaam, Tanzania. Kunduchi, Seamic Road.` · `Head of School: 0734 063 653  Administration: 0734 036 704  Academic Office 0756299302` · `Manager: 0734036010, 0784848686, 0653312438` |
| alpha-girls-transfer | `P. O. Box 35136, Dar es Salaam, Tanzania. Kunduchi, Seamic Road.` · `Head of School: 0755 848 142/0734 063 653  Administration: 0734 036 704  Academic Office 0719376409` · `Manager: 0734036010, 0784848686, 0653312438` |

Crest: alpha-high-* → `alpha-high.jpg` (extract `Im1.jpg` from page 1 of `AHS - TRANSFER APPLICATION FORM.pdf` with pypdf, 176×202). alpha-girls-* → `alpha-schools.png` (convert `src/assets/alpha-logo.webp` to PNG, resize to 400×400 with Pillow). These are the crests the source PDFs use.

Part A field keys and labels (all four forms). "Pupil" on form-1, "Student" on transfer:

| n | fields (key: label) |
|---|---|
| 1 | firstName: `{Pupil's/Student's} Name: First Name` · middleName: `Middle Name` · familyName: `Family Name` |
| 2 | dob: `Date of Birth` (date) · gender: `Gender` (gender) |
| 3 | birthPlace: `Place of Birth` · birthDistrict: `District` · birthRegion: `Region` |
| 4 | nationality: `Nationality` |
| 5 | residence: `Place of Residence` · residenceDistrict: `District` · residenceRegion: `Region` |
| 6 | postalAddress: `Postal Address` · email: `Email` (email) |
| 7 | religion: `Religion` · denomination: `Denomination/ Sect` |
| 8 | fatherName: `Name of Father/Guardian` · fatherOccupation: `Occupation` · fatherWork: `Place of Work` · fatherTel: `Tel` (phone) |
| 9 | motherName: `Name of Mother/Guardian` · motherOccupation / motherWork / motherTel as above |

alpha-girls-form-1 differs in numbering and two labels: nationality joins question 3 (so questions run 1–8); `Denomination/ Section`; `Name of the Father/Guardian`.

Part A title: form-1 `PART A: PARTICULARS OF THE PUPIL`; transfer `PART A: PARTICULARS OF THE STUDENT`.

Part B, form-1 (both schools) — title `PART B: PARTICULARS OF PRIMARY SCHOOL`:
1 name repeated (prints firstName/middleName/familyName again; not asked twice) · 2 indexNumber: `Pupil's Index Number: PS` · 3 prem: `PREM NUMBER` · 4 prevContact: `Previous school contact` (phone) · 5 std7Year: `Year of Completion of Standard Seven` · 6 prevSchool: `Name of School` · 7 prevLocation: `School Location` · prevDistrict: `District` · prevRegion: `Region`

Part B, transfer — title `PART B: PARTICULARS OF PREVIOUS SCHOOL`:
1 name repeated · 2 examNumber: `Student's PSLE/FTNA/CSEE number` (source "PLSE" fixed) · 3 prem: `PREM Number` · 4 prevSchool: `School name` (alpha-girls: `Previous school name`) · 5 prevContact: `Previous school contact` · 6 prevLocation: `School Location` (alpha-girls: `Previous School Location`) · prevDistrict · prevRegion

Transfer entryFields: entryForm: `Entry Class: Form` · combination: `Bias/Combination` · entryYear: `Year`.

Wizard steps: `pupil` = entryFields + Part A questions 1–7 (girls form-1: 1–6); `parents` = father and mother questions; `school` = Part B fields.

Part C, form-1 — title `PART C: IMPORTANT INFORMATION`:
1. `Return this form duly filled together with the following items:` `i) Copy of birth certificate` `ii) Two recent passport size of the child` `iii) Standard six and seven results (to be filled under PART E of this form)`
2. alpha-high: `Entrance examination subjects will be ENGLISH, MATHEMATICS, GENERAL KNOWLEDGE.` alpha-girls: `Entrance examination subjects will be ENGLISH, MATHEMATICS, and GENERAL KNOWLEDGE & SCIENCE.`
3. `Date of interview will be on ____________ from 08:00am at {Alpha High School – MIKOCHENI | Alpha Girls High School – KUNDUCHI}`
`NOTE: Interviews will be conducted ONLY on Fridays and Saturdays from 12th September onwards.`

Part C, transfer:
1. as form-1 item 1 but iii) `Results slip (For A-Level)`; alpha-high ii) `Two recent passport size of the student`, alpha-girls ii) `Two recent passport size of the child`
2. `Entrance examination subjects will be ALL SUBJECTS TAKEN IN CLASS OF ADMISSION.`
3. alpha-high: `Date of Examination will be on ____________ from 08:00 am at Alpha High School – Mikocheni.` alpha-girls: `Date of interview will be on ____________ from 08:00am at Alpha Girls High School – KUNDUCHI`

Part D — title `PART D: PARENT'S/ GUARDIAN'S DECLARATION`, text: `I declare that the above information is true and correct. I understand that any false information traced at any time, including during the {pupil's|student's} stay at school, could result in the immediate removal of the {pupil|student} from school.` (`student` only on alpha-high-transfer.)

Part E (form-1 only) — title `PART E: ACADEMIC PROGRESS`; table columns `CLASS`, `Mathematics %`, `Kiswahili %`, `Science %`, `Civic & Moral %`, `Social Studies %`, `English %`; rows `Class 6 Average`, `Class 7 Average`; then lines `School Name`, `Head teacher's Name`, `Sign`, `Date`, `Stamp`. All blank.

- [ ] **Step 1: Write the failing tests** in `forms.test.ts`:
  - `FORMS` has exactly the four ids; `getForm("nope")` is `undefined`.
  - every form's `headerLines.at(-1)` contains `alphaschools.co.tz`; no string anywhere in `JSON.stringify(FORMS)` contains `ac.tz`.
  - `hasPartE` is true exactly for the two form-1 ids; `entryClass === "FORM I 2027"` for form-1, `null` with three `entryFields` for transfer.
  - every key in `steps.*` exists in partA/partB/entryFields; every field in partA/partB/entryFields appears in exactly one step (no orphan, no duplicate).
  - `getForm("alpha-high-transfer")!.partD` contains `student's stay`; `getForm("alpha-girls-form-1")!.partA.questions.length === 8`, other three `=== 9`.
- [ ] **Step 2: Run** `npx vitest run src/lib/admission-forms/forms.test.ts` — expect FAIL (module not found).
- [ ] **Step 3: Write `forms.ts`** from the tables above; extract/convert the two crest files with the Python one-liners noted above.
- [ ] **Step 4: Run** the test — expect PASS.
- [ ] **Step 5: Commit** `git add src/lib/admission-forms/forms.ts src/lib/admission-forms/forms.test.ts public/forms/crests && git commit -m "Define the four admission forms as data"`

---

### Task 2: Answer rules

**Files:**
- Create: `src/lib/admission-forms/answers.ts`
- Test: `src/lib/admission-forms/answers.test.ts`

**Interfaces:**
- Consumes: `FormDef` (Task 1).
- Produces:
  ```ts
  export type Answers = Record<string, string>;
  export type Draft = { formId: FormId; savedAt: number; answers: Answers };
  export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  export function draftKey(id: FormId): string;                          // "alpha-admission-draft:<id>"
  export function readDraft(raw: string | null, id: FormId, now: number): Answers;   // {} if missing/corrupt/expired/other form
  export function downloadProblem(a: Answers): string | null;           // only firstName + familyName required
  export function softProblem(field: Field, value: string, now: Date): string | null;
  export function sanitizeForPdf(s: string): string;
  export function pdfFileName(form: FormDef, a: Answers): string;
  ```

- [ ] **Step 1: Write the failing tests:**
  - `readDraft(null, id, now)` → `{}`; `readDraft("{bad", …)` → `{}`; a draft with `savedAt = now - DRAFT_TTL_MS - 1` → `{}`; one with `formId` of a different form → `{}`; a valid fresh draft → its answers; non-string answer values are dropped.
  - `downloadProblem({})` → `"Enter the pupil's first name and family name to download."`; with both names (whitespace-only counts as empty) → `null`.
  - `softProblem(phoneField, "0754 123 456")` → null; `"+255 754 123 456"` → null; `"12345"` → `"Check this phone number — it looks too short."`; `""` → null.
  - `softProblem(dateField, "2014-03-14", new Date("2026-10-20"))` → null; a future date → `"This date is in the future."`; a date more than 25 years back → `"Check the year."`.
  - `softProblem(emailField, "a@b")` → `"Check this email address."`; `"neema@example.com"` → null.
  - `sanitizeForPdf("Zoë’s 😀 名")` → `"Zoë’s  "` (keeps WinAnsi `ë` and `’`, drops the emoji and CJK, leaves the spaces); `sanitizeForPdf("Ő")` → `"O"` (NFKD base letter before dropping).
  - `pdfFileName(alphaHighForm1, {firstName:"Neema", familyName:"Mushi"})` → `"Alpha-High-Form-I-2027-Neema-Mushi.pdf"`; transfer → `"Alpha-High-Transfer-Neema-Mushi.pdf"`; empty names → `"Alpha-High-Form-I-2027.pdf"`; names with `/` or spaces are hyphenated.
- [ ] **Step 2: Run** `npx vitest run src/lib/admission-forms/answers.test.ts` — FAIL.
- [ ] **Step 3: Implement.** `sanitizeForPdf`: for each char, keep it if it is in the WinAnsi set (`pdf-lib`'s `StandardFonts.Helvetica` encoder: build once with `WinAnsiEncoding`-compatible check — import nothing from pdf-lib here; use a hard-coded set of the 0x20–0x7E range plus the 0xA0–0xFF Latin-1 range plus `‘’“”–—…•€`); else try its NFKD base letter; else drop.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `"Add the rules for admission form answers and drafts"`

---

### Task 3: PDF layout and writer

**Files:**
- Create: `src/lib/admission-forms/layout.ts`, `src/lib/admission-forms/pdf.ts`
- Modify: `package.json` (add `"pdf-lib": "1.17.1"`)
- Test: `src/lib/admission-forms/layout.test.ts`, `src/lib/admission-forms/pdf.test.ts`

**Interfaces:**
- Consumes: `FormDef`, `Answers`, `sanitizeForPdf` (Tasks 1–2).
- Produces:
  ```ts
  // layout.ts — pure, no pdf-lib import. Units are PDF points, A4 = 595.28 × 841.89, origin bottom-left.
  export type Op =
    | { t: "text"; x: number; y: number; size: number; bold?: boolean; color?: "ink" | "blue" | "grey"; text: string }
    | { t: "box"; x: number; y: number; w: number; h: number; dashed?: boolean }
    | { t: "line"; x1: number; y1: number; x2: number; y2: number }
    | { t: "crest"; x: number; y: number; w: number; h: number };
  export type Page = Op[];
  export function fitText(text: string, maxWidth: number, size: number, widthOf: (s: string, size: number) => number): { text: string; size: number };
  export function layoutForm(form: FormDef, answers: Answers, widthOf: (s: string, size: number) => number): Page[];   // always 2 pages
  // pdf.ts
  export function renderFormPdf(form: FormDef, answers: Answers, crest: { bytes: Uint8Array; type: "jpg" | "png" }): Promise<Uint8Array>;
  ```

Layout (approved "clean" mockup, see spec §3): page 1 = header (crest left, school name + title + entry class, header lines centred, photo box 85×100pt top-right labelled `Attach recent passport size photo here`), a deep-blue rule, a dashed **For office use** strip (`Serial number`, `Receipt No`, blank), transfer entry fields as a boxed row, Part A, Part B. Page 2 = Part C, Part D (declaration then `Signature`, `Relationship`, `Date` lines, blank), Part E (form-1 only, table + lines, blank). Each Part heading in bold deep blue with its full verbatim title. Each question is a row of boxes: a 7pt grey label (prefixed with the question number on the first field, e.g. `1. Pupil's Name: First Name`) above a 10pt answer. Field `width` sets the box's share of the 3-column row; questions with 4 fields (8, 9) use two rows (name full width; occupation/work/tel thirds). Empty answers leave the box empty, 22pt tall, for handwriting.

- [ ] **Step 1: Write failing tests** (`layout.test.ts`, with `widthOf = (s, size) => s.length * size * 0.5`):
  - `layoutForm(form, {}, widthOf)` has length 2 for every form.
  - With answers `{firstName:"Neema", fatherTel:"0754 123 456"}`: page 1 has a text op `"Neema"` **twice** (Part A and Part B) and one `"0754 123 456"`.
  - Page 1 contains text ops for `"Serial number"` and `"Receipt No"` and no answer text inside the office strip's box.
  - Page 2 contains `"PART E: ACADEMIC PROGRESS"` for form-1 only; no answer values appear on page 2 at all (pass a full answer set and assert none of its values are text ops on page 2).
  - Some text op on page 1 contains `alphaschools.co.tz`.
  - Every op on both pages stays within x ∈ [28, 567] and y ∈ [28, 814] (14mm margins → 28pt min; fails if overflow).
  - `fitText("x".repeat(120), 100, 10, widthOf)` returns `size === 7` and `text` ending in `"…"` with `widthOf(text, 7) <= 100`; `fitText("Moshi", 100, 10, widthOf)` returns `{text:"Moshi", size:10}`.
- [ ] **Step 2: Run** `npx vitest run src/lib/admission-forms/layout.test.ts` — FAIL.
- [ ] **Step 3: Implement `layout.ts`.** All answer text goes through `sanitizeForPdf` then `fitText`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Write failing `pdf.test.ts`:** `renderFormPdf(getForm("alpha-high-form-1")!, {firstName:"Neema"}, {bytes: readFileSync("public/forms/crests/alpha-high.jpg"), type:"jpg"})` resolves to bytes starting with `%PDF-`; `PDFDocument.load(bytes)` has 2 pages of size 595.28×841.89; `getTitle()` is `"ALPHA HIGH SCHOOL — APPLICATION FORM FOR ADMISSION"`. Rendering with `{firstName:"😀"}` does not throw.
- [ ] **Step 6: Implement `pdf.ts`:** `npm install pdf-lib@1.17.1 --save-exact`; embed `StandardFonts.Helvetica` and `HelveticaBold`; pass `font.widthOfTextAtSize` as `widthOf`; set title, `setCreationDate`/`setModificationDate` to `new Date("2026-01-01T00:00:00Z")` and `setProducer("Alpha Schools")` so output is deterministic (Task 4 relies on this). Dashed boxes via `borderDashArray: [3, 2]`.
- [ ] **Step 7: Run** `npx vitest run src/lib/admission-forms` — PASS.
- [ ] **Step 8: Commit** `git add package.json package-lock.json src/lib/admission-forms` — `"Lay out and write the admission form PDF"`

---

### Task 4: Blank PDFs for download

**Files:**
- Create: `scripts/generate-blank-forms.ts`, `public/forms/<id>.pdf` ×4
- Modify: `package.json` scripts: `"forms:blank": "vite-node scripts/generate-blank-forms.ts"`
- Test: `src/lib/admission-forms/blank-forms.test.ts`

**Interfaces:**
- Consumes: `FORMS`, `renderFormPdf`.
- Produces: `export async function blankFormBytes(form: FormDef): Promise<Uint8Array>` in `scripts/generate-blank-forms.ts` (reads the crest from `public/forms/crests/` and renders with `{}`); running the file writes each to `public/forms/<id>.pdf` (= `form.blankPdfPath`).

- [ ] **Step 1: Write failing test:** for each form, `Buffer.from(await blankFormBytes(form)).equals(readFileSync("public" + form.blankPdfPath))`, with failure message `"public/forms is stale — run npm run forms:blank"`. Each file is under 150 KB.
- [ ] **Step 2: Run** — FAIL (no files).
- [ ] **Step 3: Implement the script; run** `npm run forms:blank`.
- [ ] **Step 4: Run** the test twice in a row — PASS both times (proves output is deterministic). Open one blank PDF and check it by eye against the source PDF: same parts, same wording, co.tz, boxes empty.
- [ ] **Step 5: Commit** `"Ship blank copies of the four admission forms"`

---

### Task 5: The online form

**Files:**
- Create: `src/components/admission-forms/use-form-draft.ts`, `use-is-desktop.ts`, `application-wizard.tsx`, `src/routes/admission.apply.$form.tsx`
- Modify: `src/components/alumni/story-wizard/wizard-frame.tsx` (add `export` to `StepIndicator`; no other change)

**Interfaces:**
- Consumes: `getForm`, `FormDef`, `Answers`, `readDraft`, `draftKey`, `downloadProblem`, `softProblem`, `pdfFileName`, `renderFormPdf` (dynamic import), `StepIndicator`, and `CARD`, `BTN_PRIMARY`, `BTN_PRIMARY_STYLE`, `BTN_SECONDARY`, `TextField`, `FieldLabel` from `story-wizard/field-ui.tsx`.
- Produces:
  ```ts
  export function useFormDraft(form: FormDef): { answers: Answers; setAnswer(key: string, v: string): void; clear(): void; restored: boolean };
  export function useIsDesktop(): boolean | null;   // null before mount (SSR)
  export function ApplicationWizard({ form }: { form: FormDef }): JSX.Element;
  ```

Behaviour:
- Route `/admission/apply/$form`: `getForm(params.form)` or `throw notFound()`. Head: title `"{shortName} {Form I 2027 | Transfer} application · Alpha Schools"`, `robots: noindex`. Layout: `StoryShell` with heading `"{shortName} — {Application for admission, Form I 2027 | Transfer application}"`.
- `useIsDesktop() === false` → no wizard: one paragraph `"The online form works on a computer. On this device, download the blank form, print it and fill it in by hand."` and a primary link to `form.blankPdfPath` with `download`. `null` → render nothing below the heading (avoids a flash).
- Desktop: steps `The pupil` / `Parents or guardians` / `Previous school` / `Check and download` (short labels `Pupil`, `Parents`, `School`, `Download`), using `StepIndicator`. Fields from `form.steps[step]`, label from the definition (without the question number), rendered in a 3-column grid by `width`; `kind:"date"` uses `<input type="date">`, `gender` a two-option radio (`Male`, `Female`), others `TextField`. `softProblem` shows under the field after blur, never blocks Next.
- If `restored`, a one-line note at the top: `"We kept your answers from last time on this computer."` with a `Start again` button (calls `clear()` and resets to step 1).
- Step 4 lists every answer grouped by Part with an `Edit` link per part (jumps to its step), shows Part C text, and the `Download PDF` button. On click: `downloadProblem` → show it in the error line and stop; else `const { renderFormPdf } = await import("@/lib/admission-forms/pdf")`, fetch the crest from `/forms/crests/<form.crest>`, render, save via a Blob URL + `<a download={pdfFileName(...)}>`.
- After a successful download: a panel `"Your form is downloaded. Print it, sign Part D, attach a passport photo and bring it to the school with the application fee."` and a secondary button `"Remove my answers from this computer"` with the line `"Do this if you are on a shared or office computer."` → `clear()` and confirm `"Your answers are removed from this computer."`.
- `useFormDraft` saves `{formId, savedAt: Date.now(), answers}` on every change under `draftKey(form.id)`, reads with `readDraft`; every storage call wrapped in try/catch.

- [ ] **Step 1: Export `StepIndicator`;** run `npx vitest run` — all existing tests still pass.
- [ ] **Step 2: Build the hooks, wizard and route** as above.
- [ ] **Step 3: Verify** `npx tsc --noEmit -p .` exits 0 and `npx eslint src/components/admission-forms "src/routes/admission.apply.$form.tsx"` is clean.
- [ ] **Step 4: Verify in a browser** (`npm run dev`) at 1280px: fill all four steps of `alpha-girls-transfer`, reload mid-way (answers restored), download, open the PDF (answers in the right boxes, Part E absent), press Remove, reload (empty). At 375px: the download-only message shows, and the network panel shows no request for pdf-lib on that page.
- [ ] **Step 5: Commit** `"Let parents fill in an admission form on a computer"`

---

### Task 6: Admission page entry point

**Files:**
- Create: `src/components/admission-forms/form-picker.tsx`
- Modify: `src/routes/admission.tsx` (lines 25–28 placeholder constant, 106–124 hero CTA + bracketed note; insert the new section right after the hero section, before the "steps" section at line 130)

**Interfaces:**
- Consumes: `FORMS`, `useIsDesktop`.
- Produces: `export function FormPicker(): JSX.Element` (section `id="forms"`).

Behaviour:
- Hero: the gold button becomes an anchor to `#forms` labelled `Get the application form`; remove `APPLICATION_FORM_URL` and the bracketed Supabase note below the buttons (this spec replaces it). `Book a Visit` unchanged.
- `FormPicker` section: heading `Choose your form`, three school groups in the page's existing card style:
  - Alpha High: `Form I 2027` and `Transfer` rows. Alpha Girls: same.
  - Alpha Nursery & Primary: the bracketed line `[Nursery & Primary application form — to be provided]`.
  - Each form row: when `useIsDesktop() === true`, primary `Fill in online` (Link to `/admission/apply/$form`) + secondary `Download blank form`; otherwise only `Download blank form` (primary style). Under the group list, on non-desktop only: `"You can also fill these forms in online from a computer."`
  - Download links: `href={form.blankPdfPath}` with `download`.
- The `STEPS` copy and every other bracketed placeholder on the page stay untouched.

- [ ] **Step 1: Build `FormPicker` and edit the page.**
- [ ] **Step 2: Verify** typecheck + lint clean on the two files; `grep -n "application-form-placeholder" -r src` returns nothing.
- [ ] **Step 3: Verify in a browser** at 375px (download-only, no horizontal scroll, Nursery placeholder visible) and 1280px (both buttons; Fill in online opens the wizard). Blank PDF downloads and opens.
- [ ] **Step 4: Commit** `"Offer the admission forms on the Admission page"`

---

### Task 7: Whole-feature check

- [ ] **Step 1:** `npx vitest run` — all pass; `npm run build` — exit 0.
- [ ] **Step 2:** `grep -rn "pdf-lib" .output/public/assets/*.js -l` — pdf-lib appears only in a chunk that is not referenced by the admission route's entry (check the admission route chunk's imports don't include it).
- [ ] **Step 3:** `/admission/apply/form-iii` shows the 404 page.
- [ ] **Step 4:** `grep -rn "ac\.tz" src public/forms` returns nothing.
- [ ] **Step 5:** Note in `design/SESSION-BRIEFS.md` under Known follow-ups: `- **Admission form phone numbers** are copied from each source PDF and differ between a school's two forms. The school should confirm they are current before launch.` Commit `"Note the form phone numbers for the school to confirm"`.
