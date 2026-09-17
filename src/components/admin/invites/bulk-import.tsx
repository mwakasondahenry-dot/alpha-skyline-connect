/**
 * Add many alumni at once, from a pasted list or a CSV file. Both go through
 * the same preview: ready, not valid, skipped. Only ready rows are sent, and
 * the server checks them again and writes all or nothing.
 */
import { useRef, useState } from "react";
import { Download, FileUp, ListPlus } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { createInvites } from "@/lib/invites.functions";
import type { ContactBatch, RejectedContact } from "@/lib/invites/contacts";
import { CSV_TEMPLATE, parseInviteCsv } from "@/lib/invites/csv";
import { parsePastedList } from "@/lib/invites/paste";
import {
  A_BTN_PRIMARY,
  A_BTN_SECONDARY,
  A_CARD,
  A_INPUT,
  Notice,
  errorText,
  useAccessToken,
  type NoticeState,
} from "./ui";

type Mode = "paste" | "csv";
const CSV_MAX_BYTES = 1024 * 1024;
const LOOKUP_CHUNK = 100;

function RejectedList({ title, items, unit }: { title: string; items: RejectedContact[]; unit: string }) {
  if (items.length === 0) return null;
  return (
    <details>
      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-deep-blue)]">
        {title} ({items.length})
      </summary>
      <ul className="mt-1 space-y-1 text-sm">
        {items.map((r) => (
          <li key={`${r.line}-${r.raw}`} className="break-words text-[var(--color-ink)]/80">
            {unit} {r.line}: <span className="text-[var(--color-ink)]">{r.raw || "(empty)"}</span> — {r.reason}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function BulkImport({ onImported }: { onImported: () => void }) {
  const { client } = useAdminAuth();
  const accessToken = useAccessToken();
  const [mode, setMode] = useState<Mode>("paste");
  const [pasteText, setPasteText] = useState("");
  const [batch, setBatch] = useState<ContactBatch | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const unit = mode === "csv" ? "Row" : "Line";

  function reset() {
    setBatch(null);
    setPasteText("");
    if (fileRef.current) fileRef.current.value = "";
  }

  /** Parse, then move anyone already invited from "ready" to "skipped". */
  async function preview(parse: () => ContactBatch) {
    setNotice(null);
    setBatch(null);
    setBusy(true);
    try {
      const parsed = parse();
      const taken = new Set<string>();
      if (client) {
        const phones = parsed.valid.map((v) => v.phone);
        for (let i = 0; i < phones.length; i += LOOKUP_CHUNK) {
          const { data, error } = await client
            .from("testimonial_invites")
            .select("phone")
            .in("phone", phones.slice(i, i + LOOKUP_CHUNK));
          if (error) throw new Error(`Could not check existing invites: ${error.message}`);
          for (const r of (data ?? []) as { phone: string }[]) taken.add(r.phone);
        }
      }
      const already = parsed.valid
        .filter((v) => taken.has(v.phone))
        .map((v) => ({ line: v.line, raw: v.raw, reason: "Already invited." }));
      setBatch({
        valid: parsed.valid.filter((v) => !taken.has(v.phone)),
        invalid: parsed.invalid,
        duplicates: [...parsed.duplicates, ...already].sort((a, b) => a.line - b.line),
      });
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err, "Could not read that list.") });
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File | null) {
    if (!file) return;
    if (file.size > CSV_MAX_BYTES) {
      setNotice({ tone: "error", text: "That file is larger than 1 MB. Split it into smaller files." });
      return;
    }
    const text = await file.text();
    await preview(() => parseInviteCsv(text));
  }

  async function importNow() {
    if (!batch || batch.valid.length === 0) return;
    setBusy(true);
    setNotice(null);
    try {
      const rows = batch.valid.map(({ line: _line, raw: _raw, ...draft }) => draft);
      const res = await createInvites({ data: { accessToken, rows } });
      const skipped = res.skippedExisting.length
        ? ` ${res.skippedExisting.length} already had an invite and were skipped.`
        : "";
      setNotice({ tone: "ok", text: `${res.created} invites created.${skipped} Send them from the list below.` });
      reset();
      onImported();
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err, "Could not import. Nothing was added.") });
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "alumni-invites-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => {
        setMode(m);
        reset();
        setNotice(null);
      }}
      className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
        mode === m ? "bg-[var(--color-deep-blue)] text-white" : "text-[var(--color-deep-blue)] hover:bg-[var(--color-deep-blue)]/5"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`${A_CARD} space-y-3`}>
      <h3 className="font-semibold text-[var(--color-deep-blue)]">Add many</h3>
      <div role="tablist" className="flex gap-1">
        {tab("paste", "Paste a list")}
        {tab("csv", "Upload CSV")}
      </div>

      {mode === "paste" ? (
        <div className="space-y-2">
          <label className="block text-sm text-[var(--color-ink)]/70">
            One person per line: name, phone, and email if you have it.
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={6}
              placeholder={"Full name, 0712 345 678\nFull name, 0754 123 456, name@example.com"}
              className={`mt-1 ${A_INPUT} font-mono`}
            />
          </label>
          <button
            type="button"
            onClick={() => preview(() => parsePastedList(pasteText))}
            disabled={busy || !pasteText.trim()}
            className={A_BTN_SECONDARY}
          >
            <ListPlus className="h-4 w-4" aria-hidden />
            Check list
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-ink)]/70">
            Columns: <code>name</code>, <code>phone</code>, and optionally <code>email</code>, <code>school</code>,{" "}
            <code>year</code>. Save from Excel or Google Sheets as CSV.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className={`${A_BTN_SECONDARY} cursor-pointer`}>
              <FileUp className="h-4 w-4" aria-hidden />
              Choose CSV file
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button type="button" onClick={downloadTemplate} className={A_BTN_SECONDARY}>
              <Download className="h-4 w-4" aria-hidden />
              Download template
            </button>
          </div>
        </div>
      )}

      <Notice notice={notice} />

      {batch && (
        <div className="space-y-2 border-t border-[var(--color-deep-blue)]/10 pt-3">
          <p className="text-sm text-[var(--color-ink)]">
            <strong>{batch.valid.length}</strong> ready · {batch.invalid.length} not valid ·{" "}
            {batch.duplicates.length} skipped
          </p>
          {batch.valid.length > 0 && (
            <details open={batch.valid.length <= 10}>
              <summary className="cursor-pointer text-sm font-semibold text-[var(--color-deep-blue)]">
                Ready ({batch.valid.length})
              </summary>
              <ul className="mt-1 space-y-1 text-sm">
                {batch.valid.map((v) => (
                  <li key={v.phone} className="break-words">
                    {v.fullName} — {v.phone}
                    {v.email ? ` · ${v.email}` : ""}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <RejectedList title="Not valid" items={batch.invalid} unit={unit} />
          <RejectedList title="Skipped" items={batch.duplicates} unit={unit} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={importNow}
              disabled={busy || batch.valid.length === 0}
              className={A_BTN_PRIMARY}
            >
              {busy ? "Importing…" : `Import ${batch.valid.length} invites`}
            </button>
            <button type="button" onClick={reset} disabled={busy} className={A_BTN_SECONDARY}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
