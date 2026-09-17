/**
 * CSV import for invites. No dependency: the files are small (≤ 500 rows)
 * and come from Excel or Google Sheets.
 */
import { buildBatch, type ContactBatch, type RawContact } from "./contacts";

/** Headers only. An example row would be imported by anyone who forgot to delete it. */
export const CSV_TEMPLATE = "name,phone,email,school,year\r\n";

export function parseCsvRows(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

type Column = "name" | "phone" | "email" | "school" | "year";

const ALIASES: Record<string, Column> = {
  name: "name",
  fullname: "name",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  whatsapp: "phone",
  email: "email",
  emailaddress: "email",
  school: "school",
  year: "year",
  classof: "year",
  gradyear: "year",
  graduationyear: "year",
};

function columnFor(header: string): Column | undefined {
  return ALIASES[header.toLowerCase().replace(/[^a-z]/g, "")];
}

export function parseInviteCsv(text: string, thisYear = new Date().getFullYear()): ContactBatch {
  const rows = parseCsvRows(text);
  if (rows.length === 0) throw new Error("The file is empty.");

  const index: Partial<Record<Column, number>> = {};
  rows[0].forEach((header, i) => {
    const col = columnFor(header);
    if (col && index[col] === undefined) index[col] = i;
  });
  if (index.name === undefined || index.phone === undefined) {
    throw new Error("The file needs a name column and a phone column.");
  }

  const cell = (cells: string[], col: Column) => {
    const i = index[col];
    return i === undefined ? "" : (cells[i] ?? "").trim();
  };

  const contacts: RawContact[] = [];
  rows.slice(1).forEach((cells, i) => {
    if (cells.every((c) => c.trim() === "")) return;
    contacts.push({
      line: i + 2,
      raw: cells.map((c) => c.trim()).filter(Boolean).join(", "),
      name: cell(cells, "name"),
      phone: cell(cells, "phone"),
      email: cell(cells, "email"),
      school: cell(cells, "school"),
      year: cell(cells, "year"),
    });
  });

  return buildBatch(contacts, thisYear);
}
