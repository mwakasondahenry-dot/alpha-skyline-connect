/**
 * Reusable admin CRUD: list / create / edit / delete for any of our content
 * tables (News, Events, Staff, Hero slides, Facilities and the two galleries).
 * Uses the authenticated browser Supabase client and RLS to enforce
 * permissions.
 *
 * Phone (< 768px): one card per item, key fields then Edit and Delete at
 * 44px. From 768px: a table that scrolls sideways in its own frame instead of
 * clipping the action column. The form is an AdminSheet (Radix Dialog, a
 * bottom sheet on a phone). The list keeps its rows while it refreshes, and
 * the row that changed flashes gold.
 */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AlertCircle, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  AdminButton,
  AdminSheet,
  ConfirmDialog,
  EmptyState,
  ListCard,
  adminButtonBase,
  collapseAndRemove,
  prefersReducedMotion,
  useOutcome,
} from "@/components/admin/kit";
import { friendlyError } from "@/lib/admin/errors";
import { formatAdminDate, schoolLabel } from "@/lib/admin/format";
import { compressImage } from "@/lib/image-compress";
import {
  NAME_KEYS,
  crudKey,
  dateCellLabel,
  initialValue,
  itemNameOf,
  outcomeLine,
  rowName,
  saveValue,
  type FieldShape,
} from "@/lib/admin-crud-defaults";
import { cn } from "@/lib/utils";

type SchoolSlug = "group-wide" | "nursery-primary" | "alpha-high" | "alpha-girls";

export const SCHOOL_OPTIONS: { value: SchoolSlug; label: string }[] = (
  ["group-wide", "nursery-primary", "alpha-high", "alpha-girls"] as const
).map((value) => ({ value, label: schoolLabel(value) }));

export type FieldKind =
  | "text"
  | "textarea"
  | "date"
  | "image"
  | "school"
  | "boolean"
  | "select"
  | "number"
  | "dynamicSelect";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  defaultValue?: unknown;
  /** For kind === "number": an emptied box saves as null. Implied when there is no defaultValue. */
  nullable?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
  /** For kind === "dynamicSelect": reload options when these field names change. */
  dependsOn?: string[];
  /** For kind === "dynamicSelect": returns options given the current form + supabase client. */
  loadOptions?: (
    form: Record<string, unknown>,
    client: SupabaseClient,
  ) => Promise<{ value: string; label: string }[]>;
};

export type CrudConfig = {
  table: string;
  title: string;
  description?: string;
  /** One item in plain words, e.g. "news post". Names the form and the outcome lines. */
  itemName?: string;
  /** The column that names a row in confirms and outcome lines (Staff: "name", not the role). */
  nameKey?: string;
  /** Columns shown in the list view + how to render them. */
  listColumns: {
    key: string;
    label: string;
    render?: (v: unknown, row: Record<string, unknown>) => ReactNode;
  }[];
  fields: FieldDef[];
  orderBy?: { column: string; ascending?: boolean };
  /** Optional read-only mode (for messages inbox). */
  readOnlyCreate?: boolean;
};

type Row = Record<string, unknown>;

function shape(f: FieldDef): FieldShape {
  return { type: f.kind, nullable: f.nullable, defaultValue: f.defaultValue };
}

export function AdminCrud({ config }: { config: CrudConfig }) {
  const { client, session } = useAdminAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const outcome = useOutcome();
  const key = crudKey(config.table);
  const order = config.orderBy ?? { column: "created_at", ascending: false };
  const item = itemNameOf(config);

  const query = useQuery({
    queryKey: key,
    enabled: !!client && !!userId,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await client!
        .from(config.table)
        .select("*")
        .order(order.column, { ascending: order.ascending ?? false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
  const rows = query.data;

  // The form: which row (null = new), open or closing, and a fresh key per open.
  const [sheet, setSheet] = useState<{ row: Row | null; n: number } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [flash, setFlash] = useState<Record<string, number>>({});
  const els = useRef(new Map<string, HTMLElement>());

  function openSheet(row: Row | null) {
    setSheet((s) => ({ row, n: (s?.n ?? 0) + 1 }));
    setSheetOpen(true);
  }

  function flashRow(id: string) {
    setFlash((f) => ({ ...f, [id]: Date.now() }));
  }

  function register(id: string, where: "card" | "row") {
    return (el: HTMLElement | null) => {
      if (el) els.current.set(`${id}:${where}`, el);
      else els.current.delete(`${id}:${where}`);
    };
  }

  function onSaved(saved: Row, isNew: boolean) {
    const id = String(saved.id);
    queryClient.setQueryData<Row[]>(key, (old) => {
      if (!old) return [saved];
      return isNew ? [saved, ...old] : old.map((r) => (String(r.id) === id ? saved : r));
    });
    setSheetOpen(false);
    flashRow(id);
    outcome.show({ text: outcomeLine(isNew ? "Added" : "Saved", saved, item, config) });
    // Refetch puts the row in its sorted place; the list stays on screen meanwhile.
    void queryClient.invalidateQueries({ queryKey: key });
  }

  async function confirmDelete(row: Row) {
    if (!client) return;
    const { error } = await client.from(config.table).delete().eq("id", row.id);
    if (error) throw error;
    const id = String(row.id);
    void (async () => {
      const visible = [els.current.get(`${id}:card`), els.current.get(`${id}:row`)].find(
        (el) => el && el.getClientRects().length > 0,
      );
      if (visible) await collapseAndRemove(visible);
      queryClient.setQueryData<Row[]>(key, (old) => old?.filter((r) => String(r.id) !== id));
      outcome.show({ text: outcomeLine("Deleted", row, item, config) });
      void queryClient.invalidateQueries({ queryKey: key });
    })();
  }

  const imageCol = config.listColumns.find(
    (c) =>
      config.fields.some((f) => f.name === c.key && f.kind === "image") || c.key.endsWith("_url"),
  );
  const nameCol =
    (config.nameKey ? config.listColumns.find((c) => c.key === config.nameKey) : undefined) ??
    config.listColumns.find((c) => NAME_KEYS.includes(c.key)) ??
    config.listColumns.find((c) => c !== imageCol);
  const restCols = config.listColumns.filter((c) => c !== imageCol && c !== nameCol);

  function cell(c: CrudConfig["listColumns"][number], row: Row): ReactNode {
    return c.render ? c.render(row[c.key], row) : renderCell(c.key, row[c.key], config.fields);
  }

  const toDeleteName = toDelete ? rowName(toDelete, config) : null;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-[var(--color-deep-blue)]">
            {config.title}
          </h1>
          {config.description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              {config.description}
            </p>
          ) : null}
        </div>
        {!config.readOnlyCreate && (
          <AdminButton variant="primary" icon={Plus} onClick={() => openSheet(null)}>
            Add {item}
          </AdminButton>
        )}
      </header>

      {query.error && rows ? (
        <ErrorLine message={`Could not refresh the list. ${friendlyError(query.error)}`} />
      ) : null}

      {query.isPending ? (
        <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
      ) : !rows ? (
        <ErrorLine message={friendlyError(query.error)} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={`No ${config.title.toLowerCase()} yet.`}
          action={
            config.readOnlyCreate ? undefined : (
              <AdminButton variant="secondary" icon={Plus} onClick={() => openSheet(null)}>
                Add {item}
              </AdminButton>
            )
          }
        />
      ) : (
        <>
          {/* Phone: cards. */}
          <ul className="space-y-2 md:hidden">
            {rows.map((row) => {
              const id = String(row.id);
              return (
                <li key={id}>
                  <ListCard ref={register(id, "card")} highlight={flash[id]}>
                    <div className="flex gap-3">
                      {imageCol && row[imageCol.key] ? (
                        <div className="shrink-0">{cell(imageCol, row)}</div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        {nameCol ? (
                          <p className="break-words font-semibold text-[var(--color-deep-blue)]">
                            {cell(nameCol, row)}
                          </p>
                        ) : null}
                        {restCols.length > 0 ? (
                          <dl className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                            {restCols.map((c) => (
                              <div key={c.key} className="contents">
                                <dt className="text-[var(--color-ink-soft)]">{c.label}</dt>
                                <dd className="min-w-0 break-words text-[var(--color-ink)]">
                                  {cell(c, row)}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                      </div>
                    </div>
                    <RowActions
                      name={rowName(row, config)}
                      readOnly={!!config.readOnlyCreate}
                      onEdit={() => openSheet(row)}
                      onDelete={() => setToDelete(row)}
                      className="mt-3 border-t border-[var(--color-hairline)] pt-3"
                    />
                  </ListCard>
                </li>
              );
            })}
          </ul>

          {/* From 768px: a table that scrolls sideways rather than clipping. */}
          <div
            role="region"
            aria-label={`${config.title}, scrolls sideways`}
            tabIndex={0}
            className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] md:block"
          >
            <table className="w-full border-separate border-spacing-0 text-left text-sm">
              <caption className="sr-only">{config.title}</caption>
              <thead>
                <tr>
                  {config.listColumns.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className="whitespace-nowrap border-b border-[var(--color-hairline)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-deep-blue)]"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="whitespace-nowrap border-b border-[var(--color-hairline)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-right text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-deep-blue)]"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = String(row.id);
                  return (
                    // A new key per flash remounts the row, which replays the tint.
                    <tr
                      key={`${id}-${flash[id] ?? 0}`}
                      ref={register(id, "row")}
                      className={cn("align-top", flash[id] ? "admin-flash" : null)}
                    >
                      {config.listColumns.map((c) => (
                        <td
                          key={c.key}
                          className="border-b border-[var(--color-hairline)] px-3 py-2.5 text-[var(--color-ink)]"
                        >
                          {cell(c, row)}
                        </td>
                      ))}
                      <td className="border-b border-[var(--color-hairline)] px-3 py-1.5">
                        <RowActions
                          name={rowName(row, config)}
                          readOnly={!!config.readOnlyCreate}
                          onEdit={() => openSheet(row)}
                          onDelete={() => setToDelete(row)}
                          className="justify-end"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {sheet ? (
        <AdminSheet
          open={sheetOpen}
          onOpenChange={(next) => {
            if (!next && saving) return; // nothing closes it mid-save
            setSheetOpen(next);
          }}
          title={`${sheet.row ? "Edit" : "New"} ${item}`}
          wide
        >
          <CrudForm
            key={sheet.n}
            config={config}
            initial={sheet.row ?? undefined}
            onBusyChange={setSaving}
            onCancel={() => setSheetOpen(false)}
            onSaved={onSaved}
          />
        </AdminSheet>
      ) : null}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(next) => {
          if (!next) setToDelete(null);
        }}
        title={toDeleteName ? `Delete “${toDeleteName}”?` : `Delete this ${item}?`}
        body="It is removed from the admin and the public site. This cannot be undone."
        confirmLabel={`Delete ${item}`}
        busyLabel="Deleting…"
        danger
        onConfirm={() => (toDelete ? confirmDelete(toDelete) : undefined)}
      />
    </div>
  );
}

function RowActions({
  name,
  readOnly,
  onEdit,
  onDelete,
  className,
}: {
  name: string | null;
  readOnly: boolean;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {!readOnly && (
        <AdminButton
          variant="secondary"
          icon={Pencil}
          onClick={onEdit}
          aria-label={name ? `Edit “${name}”` : undefined}
        >
          Edit
        </AdminButton>
      )}
      <AdminButton
        variant="quiet"
        icon={Trash2}
        onClick={onDelete}
        aria-label={name ? `Delete “${name}”` : undefined}
        className="text-[var(--color-danger)]"
      >
        Delete
      </AdminButton>
    </div>
  );
}

function ErrorLine({ message, id }: { message: string; id?: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="flex gap-1.5 rounded-[var(--radius-btn)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2 text-sm leading-snug text-[var(--color-danger)]"
    >
      <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      <span>{message}</span>
    </p>
  );
}

const Soft = ({ children }: { children: ReactNode }) => (
  <span className="text-[var(--color-ink-soft)]">{children}</span>
);

/** Plain "YYYY-MM-DD" (a date column) or a full timestamp. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function renderCell(key: string, v: unknown, fields: FieldDef[]): ReactNode {
  const field = fields.find((f) => f.name === key);
  if (key === "school_slug" || field?.kind === "school") {
    return v == null || v === "" ? <Soft>—</Soft> : schoolLabel(v as string);
  }
  if (v == null || v === "") return <Soft>—</Soft>;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (field?.kind === "select" && field.options) {
    const opt = field.options.find((o) => o.value === v);
    if (opt) return opt.label;
  }
  if (typeof v === "string" && /^https?:\/\//.test(v) && /\.(jpg|jpeg|png|webp|gif)$/i.test(v)) {
    return (
      <img
        src={v}
        alt=""
        className="h-12 w-16 rounded-[var(--radius-btn)] object-cover"
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (field?.kind === "date" || (typeof v === "string" && DATE_ONLY.test(v))) {
    // A picked date: the day only; its time was never chosen by anyone.
    return <span className="whitespace-nowrap">{dateCellLabel(v) || <Soft>—</Soft>}</span>;
  }
  if (typeof v === "string" && TIMESTAMP.test(v)) {
    return <span className="whitespace-nowrap">{formatAdminDate(v)}</span>;
  }
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 80 ? s.slice(0, 80) + "…" : s;
}

const INPUT =
  "block min-h-11 w-full rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2 text-base text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30 aria-[invalid=true]:border-[var(--color-danger)] disabled:opacity-60 sm:text-sm";

type FieldCtx = {
  id: (name: string, part?: string) => string;
  form: Record<string, unknown>;
  set: (k: string, v: unknown) => void;
  errors: Record<string, string>;
  uploading: Record<string, boolean>;
  pickImage: (f: FieldDef, file: File) => void;
  client: SupabaseClient | null;
};

function CrudForm({
  config,
  initial,
  onBusyChange,
  onCancel,
  onSaved,
}: {
  config: CrudConfig;
  initial?: Row;
  onBusyChange: (busy: boolean) => void;
  onCancel: () => void;
  onSaved: (row: Row, isNew: boolean) => void;
}) {
  const { client } = useAdminAuth();
  const base = useId();
  const id = (name: string, part?: string) => `${base}-${name}${part ? `-${part}` : ""}`;

  const defaults = useMemo(() => {
    const o: Record<string, unknown> = {};
    for (const f of config.fields) o[f.name] = initialValue(shape(f), initial?.[f.name]);
    return o;
  }, [config.fields, initial]);

  const [form, setForm] = useState<Record<string, unknown>>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const anyUploading = Object.values(uploading).some(Boolean);

  // An upload in flight also holds the sheet open, so no file is left orphaned.
  useEffect(() => {
    onBusyChange(busy || anyUploading);
  }, [busy, anyUploading, onBusyChange]);
  useEffect(() => () => onBusyChange(false), [onBusyChange]);

  function set(k: string, v: unknown) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => {
      if (!e[k]) return e;
      const next = { ...e };
      delete next[k];
      return next;
    });
  }

  async function pickImage(f: FieldDef, file: File) {
    if (!client) return;
    setUploading((u) => ({ ...u, [f.name]: true }));
    setErrors((e) => {
      const next = { ...e };
      delete next[f.name];
      return next;
    });
    try {
      let prepared;
      try {
        prepared = await compressImage(file);
      } catch (err) {
        // compressImage's own messages are written for staff already.
        throw Object.assign(new Error("compress"), {
          staff: err instanceof Error ? err.message : "That image could not be prepared.",
        });
      }
      const rand = Math.random().toString(36).slice(2, 8);
      const path = `${config.table}/${Date.now()}-${rand}.${prepared.ext}`;
      const up = await client.storage
        .from("media")
        .upload(path, prepared.blob, { upsert: false, contentType: prepared.blob.type });
      if (up.error) throw up.error;
      const { data } = client.storage.from("media").getPublicUrl(path);
      set(f.name, data.publicUrl);
    } catch (err) {
      const staff = (err as { staff?: string }).staff;
      setErrors((e) => ({
        ...e,
        [f.name]: staff ?? `The photo did not upload. ${friendlyError(err)}`,
      }));
    } finally {
      setUploading((u) => ({ ...u, [f.name]: false }));
    }
  }

  function focusField(name: string) {
    requestAnimationFrame(() => {
      const el = document.getElementById(id(name));
      if (!el) return;
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client || busy || anyUploading) return;

    const errs: Record<string, string> = {};
    for (const f of config.fields) {
      const v = form[f.name];
      if (f.required && (v === "" || v == null)) {
        errs[f.name] = f.kind === "image" ? `Add a ${f.label.toLowerCase()}.` : "Required.";
      }
    }
    setErrors(errs);
    const first = config.fields.find((f) => errs[f.name]);
    if (first) {
      focusField(first.name);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of config.fields) {
        payload[f.name] = saveValue(shape(f), form[f.name], initial?.[f.name]);
      }
      const isNew = !initial?.id;
      const res = isNew
        ? await client.from(config.table).insert(payload).select("*").single()
        : await client
            .from(config.table)
            .update(payload)
            .eq("id", initial!.id)
            .select("*")
            .single();
      if (res.error) throw res.error;
      setBusy(false);
      onSaved(res.data as Row, isNew);
    } catch (err) {
      setBusy(false);
      setError(friendlyError(err));
    }
  }

  const ctx: FieldCtx = { id, form, set, errors, uploading, pickImage, client };
  const hasRequired = config.fields.some((f) => f.required);

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {hasRequired ? (
        <p className="text-sm text-[var(--color-ink-soft)]">
          Fields marked <span className="text-[var(--color-danger)]">*</span> are required.
        </p>
      ) : null}

      {config.fields.map((f) => (
        <FieldRow key={f.name} f={f} ctx={ctx} />
      ))}

      {error ? <ErrorLine message={error} /> : null}

      <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-hairline)] pt-4 sm:flex-row sm:justify-end">
        <AdminButton variant="secondary" onClick={onCancel} disabled={busy || anyUploading}>
          Cancel
        </AdminButton>
        <AdminButton
          type="submit"
          variant="primary"
          busy={busy}
          busyLabel="Saving…"
          disabled={anyUploading}
        >
          {anyUploading ? "Waiting for the photo…" : "Save"}
        </AdminButton>
      </div>
    </form>
  );
}

function FieldRow({ f, ctx }: { f: FieldDef; ctx: FieldCtx }) {
  const err = ctx.errors[f.name];
  const helpId = f.helpText ? ctx.id(f.name, "help") : undefined;
  const errId = err ? ctx.id(f.name, "error") : undefined;
  const describedBy = [errId, helpId].filter(Boolean).join(" ") || undefined;
  const a11y = {
    id: ctx.id(f.name),
    "aria-required": f.required || undefined,
    "aria-invalid": !!err || undefined,
    "aria-describedby": describedBy,
  };
  const required = f.required ? (
    <span aria-hidden className="text-[var(--color-danger)]">
      {" "}
      *
    </span>
  ) : null;

  const below = (
    <>
      {err ? (
        <p id={errId} className="mt-1.5 flex gap-1.5 text-sm text-[var(--color-danger)]">
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{err}</span>
        </p>
      ) : null}
      {f.helpText ? (
        <p id={helpId} className="mt-1.5 text-sm leading-snug text-[var(--color-ink-soft)]">
          {f.helpText}
        </p>
      ) : null}
    </>
  );

  if (f.kind === "boolean") {
    return (
      <div>
        <label
          htmlFor={a11y.id}
          className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-3 text-sm leading-snug text-[var(--color-ink)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-gold)]"
        >
          <input
            type="checkbox"
            {...a11y}
            checked={!!ctx.form[f.name]}
            onChange={(e) => ctx.set(f.name, e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-deep-blue)]"
          />
          <span>
            <span className="font-semibold text-[var(--color-deep-blue)]">
              {f.label}
              {required}
            </span>
            {f.placeholder ? (
              <span className="block text-[var(--color-ink-soft)]">{f.placeholder}</span>
            ) : null}
          </span>
        </label>
        {below}
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor={a11y.id}
        className="mb-1.5 block text-sm font-semibold text-[var(--color-deep-blue)]"
      >
        {f.label}
        {required}
      </label>
      <FieldInput f={f} ctx={ctx} a11y={a11y} />
      {below}
    </div>
  );
}

type A11y = {
  id: string;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

function FieldInput({ f, ctx, a11y }: { f: FieldDef; ctx: FieldCtx; a11y: A11y }) {
  const v = ctx.form[f.name];
  const str = v == null ? "" : String(v);
  const set = (value: unknown) => ctx.set(f.name, value);

  if (f.kind === "textarea") {
    return (
      <textarea
        {...a11y}
        rows={5}
        value={str}
        onChange={(e) => set(e.target.value)}
        placeholder={f.placeholder}
        className={cn(INPUT, "leading-relaxed")}
      />
    );
  }
  if (f.kind === "date") {
    return (
      <input
        {...a11y}
        type="date"
        value={str}
        onChange={(e) => set(e.target.value)}
        className={INPUT}
      />
    );
  }
  if (f.kind === "school" || f.kind === "select") {
    const opts = f.kind === "school" ? SCHOOL_OPTIONS : (f.options ?? []);
    return (
      <select {...a11y} value={str} onChange={(e) => set(e.target.value)} className={INPUT}>
        {f.kind === "school" ? null : <option value="">—</option>}
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (f.kind === "dynamicSelect") {
    return (
      <DynamicSelect field={f} form={ctx.form} set={ctx.set} client={ctx.client} a11y={a11y} />
    );
  }
  if (f.kind === "number") {
    return (
      <input
        {...a11y}
        type="number"
        inputMode="numeric"
        value={str}
        onChange={(e) => set(e.target.value)}
        className={cn(INPUT, "max-w-40")}
      />
    );
  }
  if (f.kind === "image") {
    const busy = !!ctx.uploading[f.name];
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          {str ? (
            <img
              src={str}
              alt=""
              className="h-16 w-24 rounded-[var(--radius-btn)] border border-[var(--color-hairline)] object-cover"
            />
          ) : null}
          <label
            className={cn(
              adminButtonBase,
              "border border-dashed border-[var(--color-deep-blue)]/30 bg-[var(--color-surface)] text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-gold)]",
              busy && "cursor-progress opacity-70",
            )}
          >
            <Upload aria-hidden className="h-4 w-4" strokeWidth={2} />
            <span aria-live="polite">
              {busy ? "Preparing and uploading…" : str ? "Replace photo" : "Upload photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) ctx.pickImage(f, file);
              }}
            />
          </label>
        </div>
        <input
          {...a11y}
          type="url"
          inputMode="url"
          value={str}
          onChange={(e) => set(e.target.value)}
          placeholder="Or paste a link: https://…"
          className={INPUT}
          disabled={busy}
        />
      </div>
    );
  }
  return (
    <input
      {...a11y}
      type="text"
      value={str}
      onChange={(e) => set(e.target.value)}
      placeholder={f.placeholder}
      className={INPUT}
    />
  );
}

function DynamicSelect({
  field,
  form,
  set,
  client,
  a11y,
}: {
  field: FieldDef;
  form: Record<string, unknown>;
  set: (k: string, v: unknown) => void;
  client: SupabaseClient | null;
  a11y: A11y;
}) {
  const [opts, setOpts] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const deps = field.dependsOn ?? [];
  const depKey = deps.map((k) => String(form[k] ?? "")).join("|");
  const depsMissing = deps.some((k) => !form[k]);
  const value = form[field.name] == null ? "" : String(form[field.name]);

  useEffect(() => {
    if (!client || !field.loadOptions) {
      setOpts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    field
      .loadOptions(form, client)
      .then((rows) => {
        if (!cancelled) setOpts(rows);
      })
      .catch((err) => {
        console.error("[dynamicSelect]", err);
        if (!cancelled) setOpts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, depKey]);

  // Clear the current value if it's no longer a valid option after deps change.
  useEffect(() => {
    if (!value) return;
    if (opts.length > 0 && !opts.some((o) => o.value === value)) set(field.name, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts]);

  const emptyLabel = loading
    ? "Loading…"
    : depsMissing
      ? "Choose a school first"
      : opts.length === 0
        ? "Nothing to choose for this school yet"
        : "—";

  return (
    <select
      {...a11y}
      value={value}
      onChange={(e) => set(field.name, e.target.value)}
      className={INPUT}
      disabled={loading || opts.length === 0}
    >
      <option value="">{emptyLabel}</option>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
