/**
 * Everyone invited, newest first, with the actions staff take on each.
 *
 * "Send on WhatsApp" opens a blank window synchronously inside the click,
 * then points it at wa.me once the link comes back. Opening it after the
 * await would be treated as an unrequested popup and blocked.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { TestimonialInviteRow } from "@/integrations/alpha-supabase/types";
import { useAdminAuth } from "@/lib/admin-auth";
import { getInviteLink, regenerateInvite } from "@/lib/invites.functions";
import { STATUS_LABEL, displayStatus, type DisplayStatus } from "@/lib/invites/status";
import {
  Notice,
  copyText,
  errorText,
  useAccessToken,
  type NoticeState,
} from "./ui";

type Row = Pick<
  TestimonialInviteRow,
  "id" | "full_name" | "phone" | "email" | "status" | "expires_at" | "last_shared_at" | "created_at"
>;

type Filter = DisplayStatus | "all";
const FILTERS: Filter[] = ["all", "pending", "opened", "submitted", "expired"];

const BADGE: Record<DisplayStatus, string> = {
  pending: "bg-[var(--color-deep-blue)]/5 text-[var(--color-deep-blue)]",
  opened: "bg-[var(--color-bright-blue)]/10 text-[var(--color-deep-blue)]",
  submitted: "bg-[var(--color-gold)] text-[var(--color-accent-foreground)]",
  expired: "bg-[var(--color-ink)]/10 text-[var(--color-ink)]/70",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function InviteList({ reloadKey }: { reloadKey: number }) {
  const { client } = useAdminAuth();
  const accessToken = useAccessToken();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: "delete" | "regenerate" } | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);

  const load = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    const { data, error } = await client
      .from("testimonial_invites")
      .select("id,full_name,phone,email,status,expires_at,last_shared_at,created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) {
      setNotice({ tone: "error", text: `Could not load invites: ${error.message}` });
    } else {
      setRows((data ?? []) as Row[]);
    }
    setLoading(false);
  }, [client]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const withStatus = useMemo(() => rows.map((r) => ({ ...r, shown: displayStatus(r) })), [rows]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, pending: 0, opened: 0, submitted: 0, expired: 0 };
    for (const r of withStatus) {
      c.all++;
      c[r.shown]++;
    }
    return c;
  }, [withStatus]);
  const visible = filter === "all" ? withStatus : withStatus.filter((r) => r.shown === filter);

  async function run(id: string, action: () => Promise<void>) {
    setBusyId(id);
    setNotice(null);
    try {
      await action();
    } finally {
      setBusyId(null);
    }
  }

  function share(row: Row) {
    const win = window.open("", "_blank");
    void run(row.id, async () => {
      try {
        const { link, whatsapp } = await getInviteLink({ data: { accessToken, inviteId: row.id } });
        if (win) {
          win.opener = null;
          win.location.href = whatsapp;
        } else {
          const copied = await copyText(link);
          setNotice({
            tone: "error",
            text: copied
              ? "Your browser blocked the WhatsApp window. The link is copied: paste it into WhatsApp."
              : `Your browser blocked the WhatsApp window. Send this link by hand: ${link}`,
          });
        }
        await load();
      } catch (err) {
        win?.close();
        setNotice({ tone: "error", text: errorText(err, "Could not get the link.") });
      }
    });
  }

  function copy(row: Row) {
    void run(row.id, async () => {
      try {
        const { link } = await getInviteLink({ data: { accessToken, inviteId: row.id } });
        const copied = await copyText(link);
        setNotice(
          copied
            ? { tone: "ok", text: `Link for ${row.full_name} copied.` }
            : { tone: "error", text: `Couldn't copy. Here is the link: ${link}` },
        );
        await load();
      } catch (err) {
        setNotice({ tone: "error", text: errorText(err, "Could not get the link.") });
      }
    });
  }

  function regenerate(row: Row) {
    setConfirm(null);
    void run(row.id, async () => {
      try {
        await regenerateInvite({ data: { accessToken, inviteId: row.id } });
        setNotice({
          tone: "ok",
          text: `New link made for ${row.full_name}. Send them the new one; the old link no longer works.`,
        });
        await load();
      } catch (err) {
        setNotice({ tone: "error", text: errorText(err, "Could not make a new link.") });
      }
    });
  }

  function remove(row: Row) {
    setConfirm(null);
    if (!client) return;
    void run(row.id, async () => {
      const { error } = await client.from("testimonial_invites").delete().eq("id", row.id);
      if (error) {
        setNotice({ tone: "error", text: `Could not delete: ${error.message}` });
        return;
      }
      setNotice({ tone: "ok", text: `Invite for ${row.full_name} deleted. Any story they sent is kept.` });
      await load();
    });
  }

  const rowBtn =
    "rounded border border-[var(--color-deep-blue)]/20 px-2.5 py-1 text-xs font-semibold text-[var(--color-deep-blue)] hover:bg-[var(--color-deep-blue)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";
  const dangerBtn =
    "rounded border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-[var(--color-deep-blue)]">Invited</h3>
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                filter === f
                  ? "bg-[var(--color-deep-blue)] text-white"
                  : "text-[var(--color-deep-blue)] hover:bg-[var(--color-deep-blue)]/5"
              }`}
            >
              {f === "all" ? "All" : STATUS_LABEL[f]}{" "}
              <span className="tabular-nums opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <Notice notice={notice} />

      <div className="overflow-hidden rounded-xl border border-[var(--color-deep-blue)]/10 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-[var(--color-deep-blue)]">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-6 text-sm text-[var(--color-ink)]/70">
            {rows.length === 0
              ? "Nobody invited yet. Add someone above."
              : "No invites with this status."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-deep-blue)]/5 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-deep-blue)]">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="hidden px-4 py-2.5 md:table-cell">Last shared</th>
                  <th className="px-4 py-2.5 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-deep-blue)]/5">
                {visible.map((row) => {
                  const busy = busyId === row.id;
                  const confirming = confirm?.id === row.id ? confirm.action : null;
                  const canShare = row.shown === "pending" || row.shown === "opened";
                  return (
                    <tr key={row.id} className="align-top hover:bg-[var(--color-deep-blue)]/[0.03]">
                      <td className="px-4 py-2.5">
                        <span className="font-semibold text-[var(--color-deep-blue)]">
                          {row.full_name}
                        </span>
                        <span className="block break-words text-[var(--color-ink)]/70">
                          {row.phone}
                          {row.email ? `, ${row.email}` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${BADGE[row.shown]}`}>
                          {STATUS_LABEL[row.shown]}
                        </span>
                      </td>
                      <td className="hidden px-4 py-2.5 whitespace-nowrap text-[var(--color-ink)]/70 md:table-cell">
                        {row.last_shared_at ? formatDate(row.last_shared_at) : "Not yet"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {confirming ? (
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className="text-[var(--color-ink)]">
                              {confirming === "delete"
                                ? "Delete this invite?"
                                : "The current link will stop working."}
                            </span>
                            <button
                              type="button"
                              onClick={() => (confirming === "delete" ? remove(row) : regenerate(row))}
                              className={confirming === "delete" ? dangerBtn : rowBtn}
                            >
                              {confirming === "delete" ? "Delete" : "Make new link"}
                            </button>
                            <button type="button" onClick={() => setConfirm(null)} className={rowBtn}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {busy && (
                              <Loader2 className="h-4 w-4 animate-spin text-[var(--color-deep-blue)]" aria-label="Working" />
                            )}
                            {canShare && (
                              <>
                                <button type="button" onClick={() => share(row)} disabled={busy} className={rowBtn}>
                                  Send on WhatsApp
                                </button>
                                <button type="button" onClick={() => copy(row)} disabled={busy} className={rowBtn}>
                                  Copy link
                                </button>
                              </>
                            )}
                            {row.shown !== "submitted" && (
                              <button
                                type="button"
                                onClick={() => setConfirm({ id: row.id, action: "regenerate" })}
                                disabled={busy}
                                className={rowBtn}
                              >
                                New link
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setConfirm({ id: row.id, action: "delete" })}
                              disabled={busy}
                              className={dangerBtn}
                              aria-label={`Delete invite for ${row.full_name}`}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
