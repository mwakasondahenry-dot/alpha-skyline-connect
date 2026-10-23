/**
 * What an AdminCrud form field starts with, and what it saves as. Pure, so
 * the rules that broke saves (a nullable number defaulting to 0, a timestamp
 * showing blank in a date input) are tested on their own.
 */

export type FieldShape = {
  /** The field kind: "number", "date", "boolean", "text", … */
  type: string;
  /** An empty value saves as null. Number fields without a defaultValue are treated this way too. */
  nullable?: boolean;
  defaultValue?: unknown;
};

const darParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Dar_es_Salaam",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD" for the calendar day in Dar es Salaam, built from parts, not a locale's layout. */
function darDay(d: Date): string {
  const p: Record<string, string> = {};
  for (const part of darParts.formatToParts(d)) p[part.type] = part.value;
  return `${p.year}-${p.month}-${p.day}`;
}

/** Today's date in Dar es Salaam, read when called (so a form opened tomorrow gets tomorrow). */
export function todayInDar(): string {
  return darDay(new Date());
}

/** A date field's `defaultValue: "today"` resolves to the Dar es Salaam day when the form opens. */
export const TODAY = "today";

/**
 * The "YYYY-MM-DD" an <input type="date"> needs. A plain date passes through;
 * a timestamp (news.published_at is timestamptz) becomes its calendar day in
 * Dar es Salaam. Anything else is empty.
 */
export function dateInputValue(v: unknown): string {
  if (typeof v !== "string" || !v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : darDay(d);
}

/**
 * The form's starting value. An existing value wins (including 0 and false);
 * then the field's declared default; then empty. Never 0 unless declared.
 */
export function initialValue(field: FieldShape, current: unknown): unknown {
  if (current !== null && current !== undefined) {
    return field.type === "date" ? dateInputValue(current) : current;
  }
  if (field.type === "date" && field.defaultValue === TODAY) return todayInDar();
  if (field.defaultValue !== undefined) return field.defaultValue;
  return field.type === "boolean" ? false : "";
}

/**
 * The value written to the table. Empty becomes null, except an emptied
 * number with a declared default (a not-null `sort_order`) saves as that
 * default. An unchanged date keeps the original timestamp, so saving an
 * edit never moves a post's time to midnight.
 */
export function saveValue(field: FieldShape, raw: unknown, original?: unknown): unknown {
  const empty = raw === "" || raw === null || raw === undefined;
  if (field.type === "number") {
    if (empty)
      return field.nullable || field.defaultValue === undefined ? null : field.defaultValue;
    return Number(raw);
  }
  if (empty) return null;
  if (field.type === "date" && original != null && dateInputValue(original) === raw) {
    return original;
  }
  return raw;
}

/** Query key for a table's admin list. Other admin lookups on the same table live under it. */
export function crudKey(table: string) {
  return ["admin", "crud", table] as const;
}

const shortFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});
const longFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * A picked date for a list cell: "1 Oct", or "1 Oct 2025" in another year.
 * No time: a date field's time is midnight or noon, never something staff chose.
 */
export function dateCellLabel(v: unknown, now: Date = new Date()): string {
  const day = dateInputValue(v);
  if (!day) return "";
  const [y, m, d] = day.split("-").map(Number);
  const at = new Date(Date.UTC(y, m - 1, d));
  return (String(y) === darDay(now).slice(0, 4) ? shortFmt : longFmt).format(at);
}

/** Fields that name a row, in order, when the config does not say which. */
export const NAME_KEYS = ["title", "name", "caption", "alt_text"];

export type NamingConfig = {
  /** The column that names a row (Staff: "name", not the role in "title"). */
  nameKey?: string;
  listColumns: { key: string }[];
};

/**
 * The row's own name ("Open day", "Grace Mushi"), if it has one: the
 * config's nameKey, then the first name-like list column, then NAME_KEYS.
 * Slugs, URLs and numbers never name a row.
 */
export function rowName(row: Record<string, unknown>, config: NamingConfig): string | null {
  const firstListed = config.listColumns.find((c) => NAME_KEYS.includes(c.key))?.key;
  const keys = [config.nameKey, firstListed, ...NAME_KEYS].filter((k): k is string => !!k);
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** One item in plain words: the config's itemName, else the title made singular. */
export function itemNameOf(config: { title: string; itemName?: string }): string {
  if (config.itemName) return config.itemName;
  const t = config.title.toLowerCase();
  if (t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.endsWith("s") && !t.endsWith("ss") && t !== "news") return t.slice(0, -1);
  return t;
}

/** A sentence naming the item: `Saved “Open day”.` or `Saved the event.` */
export function outcomeLine(
  verb: string,
  row: Record<string, unknown>,
  item: string,
  config: NamingConfig,
): string {
  const name = rowName(row, config);
  return name ? `${verb} “${name}”.` : `${verb} the ${item}.`;
}
