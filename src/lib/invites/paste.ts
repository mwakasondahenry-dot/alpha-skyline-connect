/**
 * "Paste a list": one person per line, copied from WhatsApp, notes or Excel.
 * The email and phone are recognised by shape wherever they sit on the line;
 * whatever is left is the name.
 */
import { buildBatch, type ContactBatch, type RawContact } from "./contacts";

const EMAIL = /[^\s,;|<>()]+@[^\s,;|<>()]+\.[^\s,;|<>()]+/;
/** A leading + or digit, then digits/spaces/dots/dashes/brackets, ending on a digit. */
const PHONE = /\+?\d[\d\s().-]{7,}\d/;

export function parsePastedList(
  text: string,
  thisYear = new Date().getFullYear(),
  opts?: { ignoreYear?: boolean },
): ContactBatch {
  const contacts: RawContact[] = [];

  text.split(/\r?\n/).forEach((original, i) => {
    const raw = original.trim();
    if (!raw) return;

    let rest = raw;
    const email = rest.match(EMAIL)?.[0] ?? "";
    if (email) rest = rest.replace(email, " ");
    const phone = rest.match(PHONE)?.[0] ?? "";
    if (phone) rest = rest.replace(phone, " ");

    const name = rest
      .replace(/[,;|\t()]/g, " ")
      .replace(/\s-\s/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^-+\s*|\s*-+$/g, "");

    contacts.push({ line: i + 1, raw, name, phone, email });
  });

  return buildBatch(contacts, thisYear, opts);
}
