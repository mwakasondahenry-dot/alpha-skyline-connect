/**
 * Everyone invited, newest first, with the actions staff take on each.
 *
 * "Send on WhatsApp" opens a blank window synchronously inside the click,
 * then points it at wa.me once the link comes back. Opening it after the
 * await would be treated as an unrequested popup and blocked.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Loader2, MessageCircle, RefreshCw, Trash2 } from "lucide-react";
import type { TestimonialInviteRow } from "@/integrations/alpha-supabase/types";
import { useAdminAuth } from "@/lib/admin-auth";
import { getInviteLink, regenerateInvite } from "@/lib/invites.functions";
import { STATUS_LABEL, displayStatus, type DisplayStatus } from "@/lib/invites/status";
import {
  A_BTN_SECONDARY,
  A_CARD,
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
          text: `New link made for ${row.full_name}. The old one no longer works — send the new one.`,
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-2 font-semibold text-[var(--color-deep-blue)]">Invited</h3>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              filter === f
                ? "border-[var(--color-deep-blue)] bg-[var(--color-deep-blue)] text-white"
                : "border-[var(--color-deep-blue)]/20 bg-white text-[var(--color-deep-blue)]"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]} ({counts[f]})
          </button>
        ))}
      </div>

      <Notice notice={notice} />

      {loading ? (
        <div className={`${A_CARD} text-sm text-[var(--color-deep-blue)]`}>Loading…</div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-[var(--color-ink)]/60">
          {rows.length === 0 ? "Nobody invited yet." : "No invites with this status."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((row) => {
            const busy = busyId === row.id;
            const confirming = confirm?.id === row.id ? confirm.action : null;
            const canShare = row.shown === "pending" || row.shown === "opened";
            return (
              <li key={row.id} className={A_CARD}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-deep-blue)]">
                      {row.full_name}{" "}
                      <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${BADGE[row.shown]}`}>
                        {STATUS_LABEL[row.shown]}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--color-ink)]/70 break-words">
                      {row.phone}
                      {row.email ? ` · ${row.email}` : ""}
                    </p>
                    <p className="text-xs text-[var(--color-ink)]/60">
                      {row.last_shared_at ? `Last shared ${formatDate(row.last_shared_at)}` : "Not shared yet"}
                    </p>
                  </div>

                  {confirming ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-[var(--color-ink)]">
                        {confirming === "delete"
                          ? "Delete this invite?"
                          : "Make a new link? The old one stops working."}
                      </span>
                      <button
                        type="button"
                        onClick={() => (confirming === "delete" ? remove(row) : regenerate(row))}
                        className={`${A_BTN_SECONDARY} ${confirming === "delete" ? "text-red-700" : ""}`}
                      >
                        {confirming === "delete" ? "Delete" : "Make new link"}
                      </button>
                      <button type="button" onClick={() => setConfirm(null)} className={A_BTN_SECONDARY}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {busy && <Loader2 className="h-5 w-5 animate-spin self-center" aria-label="Working" />}
                      {canShare && (
                        <>
                          <button type="button" onClick={() => share(row)} disabled={busy} className={A_BTN_SECONDARY}>
                            <MessageCircle className="h-4 w-4" aria-hidden />
                            Send on WhatsApp
                          </button>
                          <button type="button" onClick={() => copy(row)} disabled={busy} className={A_BTN_SECONDARY}>
                            <Copy className="h-4 w-4" aria-hidden />
                            Copy link
                          </button>
                        </>
                      )}
                      {row.shown !== "submitted" && (
                        <button
                          type="button"
                          onClick={() => setConfirm({ id: row.id, action: "regenerate" })}
                          disabled={busy}
                          className={A_BTN_SECONDARY}
                        >
                          <RefreshCw className="h-4 w-4" aria-hidden />
                          Regenerate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirm({ id: row.id, action: "delete" })}
                        disabled={busy}
                        className={`${A_BTN_SECONDARY} text-red-700`}
                        aria-label={`Delete invite for ${row.full_name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
