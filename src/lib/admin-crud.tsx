// Reusable admin CRUD: list / create / edit / delete for any of our content tables.
// Uses the authenticated browser Supabase client and RLS to enforce permissions.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAdminAuth } from "@/lib/admin-auth";

type SchoolSlug = "group-wide" | "nursery-primary" | "alpha-high" | "alpha-girls";

export const SCHOOL_OPTIONS: { value: SchoolSlug; label: string }[] = [
  { value: "group-wide", label: "Group-wide" },
  { value: "nursery-primary", label: "Nursery & Primary" },
  { value: "alpha-high", label: "Alpha High" },
  { value: "alpha-girls", label: "Alpha Girls" },
];

export type FieldKind = "text" | "textarea" | "date" | "image" | "school" | "boolean" | "select" | "number";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  defaultValue?: unknown;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
};

export type CrudConfig = {
  table: string;
  title: string;
  description?: string;
  /** Columns shown in the list view + how to render them. */
  listColumns: { key: string; label: string; render?: (v: unknown, row: Record<string, unknown>) => ReactNode }[];
  fields: FieldDef[];
  orderBy?: { column: string; ascending?: boolean };
  /** Optional read-only mode (for messages inbox). */
  readOnlyCreate?: boolean;
};

export function AdminCrud({ config }: { config: CrudConfig }) {
  const { client, session } = useAdminAuth();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [creating, setCreating] = useState(false);

  const order = config.orderBy ?? { column: "created_at", ascending: false };

  async function refresh() {
    if (!client) return;
    setLoading(true);
    setError(null);
    const { data, error } = await client
      .from(config.table)
      .select("*")
      .order(order.column, { ascending: order.ascending ?? false });
    if (error) setError(error.message);
    setRows((data ?? []) as Record<string, unknown>[]);
    setLoading(false);
  }

  useEffect(() => { if (client && session) void refresh(); }, [client, session, config.table]);

  async function handleDelete(id: string) {
    if (!client) return;
    if (!confirm("Delete this item? This cannot be undone.")) return;
    const { error } = await client.from(config.table).delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0C447C]">{config.title}</h1>
          {config.description ? (
            <p className="mt-1 text-sm text-[#2C2C2A]/70">{config.description}</p>
          ) : null}
        </div>
        {!config.readOnlyCreate && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-md bg-[#E8A020] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#d18f15]"
          >
            + New
          </button>
        )}
      </header>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[#0C447C]/10 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-[#0C447C]">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-[#2C2C2A]/70">No items yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0C447C]/5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#0C447C]">
              <tr>
                {config.listColumns.map((c) => (
                  <th key={c.key} className="px-4 py-2.5">{c.label}</th>
                ))}
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0C447C]/5">
              {rows.map((row) => (
                <tr key={String(row.id)} className="hover:bg-[#0C447C]/5">
                  {config.listColumns.map((c) => (
                    <td key={c.key} className="px-4 py-2.5 align-top text-[#2C2C2A]">
                      {c.render ? c.render(row[c.key], row) : renderCell(row[c.key])}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {!config.readOnlyCreate && (
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        className="mr-2 rounded border border-[#0C447C]/20 px-2.5 py-1 text-xs font-semibold text-[#0C447C] hover:bg-[#0C447C] hover:text-white"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(String(row.id))}
                      className="rounded border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(creating || editing) && (
        <CrudForm
          config={config}
          initial={editing ?? undefined}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={async () => { setCreating(false); setEditing(null); await refresh(); }}
        />
      )}
    </div>
  );
}

function renderCell(v: unknown): ReactNode {
  if (v == null || v === "") return <span className="text-[#2C2C2A]/40">—</span>;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string" && /^https?:\/\//.test(v) && /\.(jpg|jpeg|png|webp|gif)$/i.test(v)) {
    return <img src={v} alt="" className="h-10 w-16 rounded object-cover" loading="lazy" />;
  }
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 80 ? s.slice(0, 80) + "…" : s;
}

function CrudForm({
  config,
  initial,
  onClose,
  onSaved,
}: {
  config: CrudConfig;
  initial?: Record<string, unknown>;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const { client } = useAdminAuth();
  const defaults = useMemo(() => {
    const o: Record<string, unknown> = {};
    for (const f of config.fields) {
      const fallback = f.kind === "boolean" ? false : f.kind === "number" ? 0 : "";
      o[f.name] = initial?.[f.name] ?? f.defaultValue ?? fallback;
    }
    return o;
  }, [config.fields, initial]);

  const [form, setForm] = useState<Record<string, unknown>>(defaults);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends string>(k: K, v: unknown) { setForm((p) => ({ ...p, [k]: v })); }

  async function uploadImage(file: File): Promise<string | null> {
    if (!client) return null;
    const path = `${config.table}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await client.storage.from("media").upload(path, file, { upsert: false });
    if (error) { setError(error.message); return null; }
    const { data } = client.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setBusy(true); setError(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of config.fields) {
        let v = form[f.name];
        if (f.required && (v === "" || v == null)) throw new Error(`${f.label} is required.`);
        if (f.kind === "number") v = v === "" || v == null ? null : Number(v);
        if (v === "") v = null;
        payload[f.name] = v;
      }
      const op = initial?.id
        ? client.from(config.table).update(payload).eq("id", initial.id)
        : client.from(config.table).insert(payload);
      const { error } = await op;
      if (error) throw error;
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#0C447C]/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#0C447C]">
            {initial?.id ? "Edit" : "New"} {config.title.replace(/s$/, "").toLowerCase()}
          </h2>
          <button onClick={onClose} className="text-xl leading-none text-[#2C2C2A]/60 hover:text-[#2C2C2A]" aria-label="Close">×</button>
        </header>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5" noValidate>
          {config.fields.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#0C447C]/80">
                {f.label}{f.required ? <span className="text-red-600"> *</span> : null}
              </label>
              {renderInput(f, form, set, uploadImage)}
              {f.helpText ? <p className="mt-1 text-xs text-[#2C2C2A]/60">{f.helpText}</p> : null}
            </div>
          ))}

          {error ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-[#0C447C]/10 pt-4">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-[#2C2C2A] hover:bg-black/5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-[#E8A020] px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function renderInput(
  f: FieldDef,
  form: Record<string, unknown>,
  set: (k: string, v: unknown) => void,
  uploadImage: (file: File) => Promise<string | null>,
) {
  const v = form[f.name];
  const cls = "w-full rounded-lg border border-[#0C447C]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#E8A020] focus:ring-2 focus:ring-[#E8A020]/30";

  if (f.kind === "textarea") {
    return <textarea rows={5} value={(v as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className={cls} placeholder={f.placeholder} />;
  }
  if (f.kind === "date") {
    return <input type="date" value={(v as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className={cls} />;
  }
  if (f.kind === "boolean") {
    return (
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={!!v} onChange={(e) => set(f.name, e.target.checked)} className="h-4 w-4" />
        <span className="text-sm text-[#2C2C2A]">{f.placeholder ?? "Yes"}</span>
      </label>
    );
  }
  if (f.kind === "school" || f.kind === "select") {
    const opts = f.kind === "school" ? SCHOOL_OPTIONS : (f.options ?? []);
    return (
      <select value={(v as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className={cls}>
        {f.kind === "school" ? null : <option value="">—</option>}
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (f.kind === "number") {
    return <input type="number" value={(v as number | string) ?? ""} onChange={(e) => set(f.name, e.target.value)} className={cls} />;
  }
  if (f.kind === "image") {
    return (
      <div className="space-y-2">
        <input
          type="url"
          value={(v as string) ?? ""}
          onChange={(e) => set(f.name, e.target.value)}
          placeholder="https://..."
          className={cls}
        />
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-md border border-dashed border-[#0C447C]/30 px-3 py-1.5 text-xs font-semibold text-[#0C447C] hover:bg-[#0C447C]/5">
            Upload image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadImage(file);
                if (url) set(f.name, url);
                e.target.value = "";
              }}
            />
          </label>
          {v ? <img src={v as string} alt="" className="h-12 w-20 rounded object-cover" /> : null}
        </div>
      </div>
    );
  }
  return <input type="text" value={(v as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} className={cls} />;
}
