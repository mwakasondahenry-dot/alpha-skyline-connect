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

const darDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Dar_es_Salaam",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * The "YYYY-MM-DD" an <input type="date"> needs. A plain date passes through;
 * a timestamp (news.published_at is timestamptz) becomes its calendar day in
 * Dar es Salaam. Anything else is empty.
 */
export function dateInputValue(v: unknown): string {
  if (typeof v !== "string" || !v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : darDay.format(d);
}

/**
 * The form's starting value. An existing value wins (including 0 and false);
 * then the field's declared default; then empty. Never 0 unless declared.
 */
export function initialValue(field: FieldShape, current: unknown): unknown {
  if (current !== null && current !== undefined) {
    return field.type === "date" ? dateInputValue(current) : current;
  }
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
