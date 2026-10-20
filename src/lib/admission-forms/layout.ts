// Where everything goes on the two A4 pages of an admission form PDF. Pure:
// it returns drawing operations and pdf.ts draws them. Units are PDF points,
// origin bottom-left. The look is the approved "clean" layout: labelled boxes
// in the source form's order and wording, not its dotted lines.

import { sanitizeForPdf } from "./answers";
import type { Answers } from "./answers";
import type { Field, FormDef, Part } from "./forms";

export type Color = "ink" | "blue" | "grey";
export type Op =
  | { t: "text"; x: number; y: number; size: number; bold?: boolean; color?: Color; text: string }
  | { t: "box"; x: number; y: number; w: number; h: number; dashed?: boolean }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; color?: Color; thickness?: number }
  | { t: "crest"; x: number; y: number; w: number; h: number };
export type Page = Op[];
/** Width of `s` at `size`; `bold` asks for the bold face. */
export type WidthOf = (s: string, size: number, bold?: boolean) => number;

export const PAGE_WIDTH = 595.28;
export const PAGE_HEIGHT = 841.89;

// Parts C, D and E read the same on every form (ruling R6).
const PART_C_TITLE = "PART C: IMPORTANT INFORMATION";
const PART_D_TITLE = "PART D: PARENT'S/ GUARDIAN'S DECLARATION";
const PART_E_TITLE = "PART E: ACADEMIC PROGRESS";
const PART_E_COLUMNS = [
  "CLASS",
  "Mathematics %",
  "Kiswahili %",
  "Science %",
  "Civic & Moral %",
  "Social Studies %",
  "English %",
];
const PART_E_ROWS = ["Class 6 Average", "Class 7 Average"];
const PHOTO_LABEL = "Attach recent passport size photo here";

const LEFT = 40;
const RIGHT = PAGE_WIDTH - 40;
const WIDTH = RIGHT - LEFT;
const TOP = 806;

const PHOTO_W = 85;
const PHOTO_H = 100;
const CREST = 72;

const GAP = 6;
const UNIT = (WIDTH - 2 * GAP) / 3;
const BOX_H = 25;
const ROW_GAP = 4;
const LABEL_SIZE = 7;
const ANSWER_SIZE = 10;
const MIN_SIZE = 7;

const BODY_SIZE = 9.5;
const BODY_LEADING = 13;

/** Shrinks text to fit `maxWidth`, down to 7pt; below that it is cut and ends in "…". */
export function fitText(
  text: string,
  maxWidth: number,
  size: number,
  widthOf: WidthOf,
  bold = false,
): { text: string; size: number } {
  for (let s = size; s >= MIN_SIZE; s -= 0.5) {
    if (widthOf(text, s, bold) <= maxWidth) return { text, size: s };
  }
  let cut = text;
  while (cut && widthOf(`${cut.trimEnd()}…`, MIN_SIZE, bold) > maxWidth) cut = cut.slice(0, -1);
  return { text: `${cut.trimEnd()}…`, size: MIN_SIZE };
}

/** Breaks text into lines no wider than `maxWidth`. */
function wrap(text: string, maxWidth: number, size: number, widthOf: WidthOf, bold = false) {
  const lines: string[] = [];
  let line = "";
  // Only plain spaces break a line, so a no-break space keeps "Studies %" together.
  for (const word of text.split(/ +/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && widthOf(next, size, bold) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Packs a question's fields into rows whose widths add up to at most 3. */
function rowsOf(fields: Field[]): Field[][] {
  const rows: Field[][] = [];
  let row: Field[] = [];
  let used = 0;
  for (const field of fields) {
    if (row.length && used + field.width > 3) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push(field);
    used += field.width;
  }
  if (row.length) rows.push(row);
  return rows;
}

/** The answer as printed: one line, PDF-safe, dates as DD/MM/YYYY. */
function answerText(answers: Answers, field: Field): string {
  const value = sanitizeForPdf((answers[field.key] ?? "").replace(/\s+/g, " ")).trim();
  const iso = field.kind === "date" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : value;
}

class Sheet {
  ops: Page = [];
  constructor(private widthOf: WidthOf) {}

  text(
    x: number,
    y: number,
    size: number,
    text: string,
    opts: { bold?: boolean; color?: Color } = {},
  ) {
    this.ops.push({ t: "text", x, y, size, text, ...opts });
  }

  line(x1: number, y1: number, x2: number, y2: number, color?: Color, thickness?: number) {
    this.ops.push({ t: "line", x1, y1, x2, y2, color, thickness });
  }

  box(x: number, y: number, w: number, h: number, dashed?: boolean) {
    this.ops.push({ t: "box", x, y, w, h, ...(dashed ? { dashed } : {}) });
  }

  width(text: string, size: number, bold = false) {
    return this.widthOf(text, size, bold);
  }

  fit(text: string, maxWidth: number, size: number, bold = false) {
    return fitText(text, maxWidth, size, this.widthOf, bold);
  }

  wrap(text: string, maxWidth: number, size: number, bold = false) {
    return wrap(text, maxWidth, size, this.widthOf, bold);
  }

  /** A part's title in bold deep blue with a thin rule under it. Returns the next y. */
  heading(title: string, top: number): number {
    const fit = this.fit(title, WIDTH, 10.5, true);
    const base = top - 11;
    this.text(LEFT, base, fit.size, fit.text, { bold: true, color: "blue" });
    this.line(LEFT, base - 4, RIGHT, base - 4, "blue", 0.75);
    return base - 12;
  }

  /** One row of labelled answer boxes. Returns the next y. */
  boxRow(fields: Field[], labels: string[], answers: Answers, top: number): number {
    let x = LEFT;
    fields.forEach((field, i) => {
      const w = field.width * UNIT + (field.width - 1) * GAP;
      const bottom = top - BOX_H;
      this.box(x, bottom, w, BOX_H);
      const label = this.fit(labels[i], w - 8, LABEL_SIZE);
      this.text(x + 4, top - 8.5, label.size, label.text, { color: "grey" });
      const value = answerText(answers, field);
      if (value) {
        const fit = this.fit(value, w - 8, ANSWER_SIZE);
        this.text(x + 4, bottom + 5.5, fit.size, fit.text);
      }
      x += w + GAP;
    });
    return top - BOX_H - ROW_GAP;
  }

  part(part: Part, answers: Answers, top: number): number {
    let y = this.heading(part.title, top);
    for (const q of part.questions) {
      rowsOf(q.fields).forEach((row, r) => {
        const labels = row.map((field, i) =>
          r === 0 && i === 0 ? `${q.n}. ${field.label}` : field.label,
        );
        y = this.boxRow(row, labels, answers, y);
      });
    }
    return y;
  }

  /** "Label:" followed by a line to write on, ending at `end`. */
  writeOn(label: string, x: number, end: number, y: number) {
    this.text(x, y, BODY_SIZE, label);
    this.line(x + this.width(label, BODY_SIZE) + 4, y - 2, end, y - 2, "grey", 0.6);
  }

  /** Wrapped text with a hanging indent. Returns the next baseline. */
  paragraph(text: string, x: number, y: number, bold = false): number {
    for (const line of this.wrap(text, RIGHT - x, BODY_SIZE, bold)) {
      this.text(x, y, BODY_SIZE, line, { bold });
      y -= BODY_LEADING;
    }
    return y;
  }
}

function header(sheet: Sheet, form: FormDef): number {
  const bandBottom = TOP - PHOTO_H;
  sheet.ops.push({
    t: "crest",
    x: LEFT,
    y: bandBottom + (PHOTO_H - CREST) / 2,
    w: CREST,
    h: CREST,
  });

  const tx = LEFT + CREST + 14;
  const maxW = RIGHT - PHOTO_W - 12 - tx;
  const name = sheet.fit(form.schoolName, maxW, 18, true);
  sheet.text(tx, TOP - 32, name.size, name.text, { bold: true, color: "blue" });
  const title = sheet.fit(form.title, maxW, 11, true);
  sheet.text(tx, TOP - 50, title.size, title.text, { bold: true });
  if (form.entryClass) {
    sheet.text(tx, TOP - 66, 10, "ENTRY CLASS: ", {});
    sheet.text(tx + sheet.width("ENTRY CLASS: ", 10), TOP - 66, 10, form.entryClass, {
      bold: true,
    });
  }

  sheet.box(RIGHT - PHOTO_W, bandBottom, PHOTO_W, PHOTO_H);
  let py = TOP - 14;
  for (const line of sheet.wrap(PHOTO_LABEL, PHOTO_W - 12, 8)) {
    sheet.text(RIGHT - PHOTO_W + 6, py, 8, line, { color: "grey" });
    py -= 10;
  }

  let y = bandBottom - 13;
  for (const line of form.headerLines) {
    const fit = sheet.fit(line, WIDTH, 8);
    sheet.text(LEFT + (WIDTH - sheet.width(fit.text, fit.size)) / 2, y, fit.size, fit.text);
    y -= 10;
  }
  const ruleY = y + 2;
  sheet.line(LEFT, ruleY, RIGHT, ruleY, "blue", 2.5);
  return ruleY - 7;
}

function officeStrip(sheet: Sheet, top: number): number {
  const h = 22;
  sheet.box(LEFT, top - h, WIDTH, h, true);
  const base = top - 14;
  sheet.text(LEFT + 8, base, 8, "For office use", { bold: true, color: "grey" });
  sheet.writeOn("Serial number", LEFT + 110, LEFT + 290, base);
  sheet.writeOn("Receipt No", LEFT + 320, RIGHT - 10, base);
  return top - h - 8;
}

function pageOne(form: FormDef, answers: Answers, widthOf: WidthOf): Page {
  const sheet = new Sheet(widthOf);
  let y = officeStrip(sheet, header(sheet, form));
  if (form.entryFields.length) {
    y = sheet.boxRow(
      form.entryFields,
      form.entryFields.map((field) => field.label),
      answers,
      y,
    );
    y -= 4;
  }
  y = sheet.part(form.partA, answers, y);
  sheet.part(form.partB, answers, y - 6);
  return sheet.ops;
}

function partC(sheet: Sheet, items: string[], top: number): number {
  let y = sheet.heading(PART_C_TITLE, top) - 4;
  items.forEach((item, i) => {
    const numbered = /^(\d+\.)\s+(.*)$/.exec(item);
    const roman = /^([ivx]+\))\s+(.*)$/.exec(item);
    if (numbered) {
      if (i > 0) y -= 4;
      sheet.text(LEFT, y, BODY_SIZE, numbered[1], { bold: true });
      y = sheet.paragraph(numbered[2], LEFT + 16, y);
    } else if (roman) {
      sheet.text(LEFT + 16, y, BODY_SIZE, roman[1]);
      y = sheet.paragraph(roman[2], LEFT + 34, y);
    } else {
      y = sheet.paragraph(item, LEFT + 16, y - 2, item.startsWith("NOTE:"));
    }
  });
  return y + BODY_LEADING - 4;
}

function partD(sheet: Sheet, declaration: string, top: number): number {
  let y = sheet.heading(PART_D_TITLE, top) - 4;
  y = sheet.paragraph(declaration, LEFT, y);
  y -= 22;
  const third = WIDTH / 3;
  ["Signature:", "Relationship:", "Date:"].forEach((label, i) => {
    sheet.writeOn(label, LEFT + i * third, LEFT + (i + 1) * third - 12, y);
  });
  return y - 6;
}

function partE(sheet: Sheet, top: number) {
  let y = sheet.heading(PART_E_TITLE, top) - 2;
  const firstCol = 72;
  const col = (WIDTH - firstCol) / (PART_E_COLUMNS.length - 1);
  const rowH = 30;
  const rows = [PART_E_COLUMNS, ...PART_E_ROWS.map((label) => [label])];
  rows.forEach((cells, r) => {
    const bold = r === 0;
    PART_E_COLUMNS.forEach((_, c) => {
      const x = c === 0 ? LEFT : LEFT + firstCol + (c - 1) * col;
      const w = c === 0 ? firstCol : col;
      sheet.box(x, y - rowH, w, rowH);
      let ty = y - 11;
      const cell = (cells[c] ?? "").replace(" %", "\u00a0%");
      for (const line of sheet.wrap(cell, w - 8, 8.5, bold)) {
        sheet.text(x + 4, ty, 8.5, line, { bold });
        ty -= 10;
      }
    });
    y -= rowH;
  });

  y -= 28;
  sheet.writeOn("School Name:", LEFT, RIGHT, y);
  y -= 28;
  sheet.writeOn("Head teacher's Name:", LEFT, LEFT + WIDTH * 0.6, y);
  sheet.writeOn("Sign:", LEFT + WIDTH * 0.6 + 16, RIGHT, y);
  y -= 28;
  sheet.writeOn("Date:", LEFT, LEFT + WIDTH * 0.45, y);
  sheet.writeOn("Stamp:", LEFT + WIDTH * 0.45 + 16, RIGHT, y);
}

function pageTwo(form: FormDef, widthOf: WidthOf): Page {
  const sheet = new Sheet(widthOf);
  let y = partC(sheet, form.partC, TOP);
  y = partD(sheet, form.partD, y - 16);
  if (form.hasPartE) partE(sheet, y - 22);
  return sheet.ops;
}

/** The two pages of the form: header and Parts A–B, then Parts C–E. Answers never reach page 2. */
export function layoutForm(form: FormDef, answers: Answers, widthOf: WidthOf): Page[] {
  return [pageOne(form, answers, widthOf), pageTwo(form, widthOf)];
}
