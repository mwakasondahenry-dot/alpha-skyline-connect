/**
 * One message, top to bottom: who sent it and when, the subject, the whole
 * message, the contact details, and a sticky bar with Reply on WhatsApp, Call,
 * Email and Mark as done (Move back to New and Delete under Done).
 *
 * Opening a new message marks it read, silently. Every other action reports
 * in three places, like Stories: its button (busy, then a check), the
 * message's card (a plain-language error if it failed), and the shell's
 * outcome line with Undo. A conflict (someone else moved it) refetches it.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import {
  AdminButton,
  ConfirmDialog,
  StickyBar,
  adminButtonClass,
  useOutcome,
  useRowState,
} from "@/components/admin/kit";
import { contactLinks, formatAdminDateTime, schoolLabel } from "@/lib/admin/format";
import { deleteEnquiry, type Enquiry, type EnquiryStatus } from "@/lib/admin/inbox-data";
import {
  enquiryActions,
  enquiryMove,
  enquiryOutcome,
  tabOfStatus,
  type EnquiryMove,
  type InboxTab,
} from "@/lib/admin/inbox-view";
import { possessive } from "@/lib/admin/stories-view";
import { MESSAGE_CONFLICT, useInboxData } from "./use-inbox";

/** How long a button shows its check before the screen moves on. */
const DONE_PAUSE_MS = 400;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const STATUS_PILL: Record<EnquiryStatus, string> = { new: "New", read: "Read", archived: "Done" };

export function EnquiryDetail({ enquiry, backTab }: { enquiry: Enquiry; backTab: InboxTab }) {
  const navigate = useNavigate();
  const outcome = useOutcome();
  const ui = useRowState();
  const data = useInboxData();
  const [busyKind, setBusyKind] = useState<EnquiryMove | null>(null);
  const [doneKind, setDoneKind] = useState<EnquiryMove | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const error = ui.errors[enquiry.id];
  const links = contactLinks({
    phone: enquiry.phone,
    email: enquiry.email,
    name: enquiry.name,
    subject: enquiry.subject?.trim() || null,
  });
  const phone = enquiry.phone?.trim() ?? "";
  const email = enquiry.email?.trim() ?? "";
  const actions = enquiryActions(enquiry.status);

  // Opening a new message marks it read: once per message, without a word.
  const { markRead } = data;
  const marked = useRef<string | null>(null);
  useEffect(() => {
    if (enquiry.status !== "new" || marked.current === enquiry.id) return;
    marked.current = enquiry.id;
    void markRead(enquiry);
  }, [enquiry, markRead]);

  /** Mark as done, or Move back to New; then back to the list it was in, and its card leaves. */
  async function moveIt(action: EnquiryMove) {
    setBusyKind(action);
    const ok = await data.move(enquiry, action);
    setBusyKind(null);
    if (!ok) return;
    setDoneKind(action);
    await wait(DONE_PAUSE_MS);
    await navigate({ to: "/admin/inbox", search: { tab: tabOfStatus(enquiry.status) } });
    outcome.show({
      text: enquiryOutcome(action, enquiry.name),
      undo: data.undoMove(enquiry.id, action),
    });
    await data.leaveList(enquiry.id, { status: enquiryMove(enquiry.status, action).to });
    void data.refreshEnquiry(enquiry.id);
  }

  async function deleteForGood() {
    if (!data.client) return;
    const result = await deleteEnquiry(data.client, enquiry.id);
    if (!result.ok) {
      if ("conflict" in result) {
        await data.refreshEnquiry(enquiry.id);
        throw MESSAGE_CONFLICT;
      }
      throw result.error;
    }
    data.countsChanged();
    const text = enquiryOutcome("delete", enquiry.name);
    // Close the dialog before the page changes under it.
    setDeleteOpen(false);
    await navigate({ to: "/admin/inbox", search: { tab: "done" } });
    outcome.show({ text });
    await data.leaveList(enquiry.id, null);
  }

  const busy = busyKind !== null;

  return (
    <article aria-labelledby="enquiry-detail-heading" className="space-y-6 lg:px-5 lg:pt-5">
      <h1 className="sr-only lg:hidden">Inbox</h1>
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/admin/inbox"
          search={{ tab: backTab }}
          className={adminButtonClass("quiet", "-ml-3 px-3 lg:hidden")}
        >
          <span aria-hidden>←</span> Inbox
        </Link>
        <Link
          to="/admin/inbox"
          search={{ tab: backTab }}
          className={adminButtonClass("quiet", "ml-auto hidden px-0 lg:inline-flex")}
        >
          <X aria-hidden className="h-5 w-5" strokeWidth={2} />
          <span className="sr-only">Close the message</span>
        </Link>
      </div>

      <header className="space-y-2">
        <h2
          id="enquiry-detail-heading"
          className="break-words font-display text-xl font-bold leading-snug text-[var(--color-deep-blue)]"
        >
          {enquiry.name}
        </h2>
        <p className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-ink-soft)]">
          <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-0.5 font-semibold text-[var(--color-deep-blue)]">
            {STATUS_PILL[enquiry.status]}
          </span>
          <span className="tabular-nums">Received {formatAdminDateTime(enquiry.created_at)}</span>
        </p>
        {error ? (
          <p
            role="alert"
            className="flex gap-1.5 rounded-[var(--radius-btn)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2 text-sm leading-snug text-[var(--color-danger)]"
          >
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            <span>{error}</span>
          </p>
        ) : null}
      </header>

      <section aria-labelledby="enquiry-message-heading" className="space-y-2">
        <h3
          id="enquiry-message-heading"
          className={
            enquiry.subject?.trim()
              ? "break-words text-base font-semibold leading-snug text-[var(--color-deep-blue)]"
              : "text-base italic leading-snug text-[var(--color-ink-soft)]"
          }
        >
          {enquiry.subject?.trim() || "No subject"}
        </h3>
        <p className="whitespace-pre-line break-words text-base leading-relaxed text-[var(--color-ink)]">
          {enquiry.message}
        </p>
      </section>

      <section aria-labelledby="enquiry-contact-heading">
        <h3
          id="enquiry-contact-heading"
          className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-deep-blue)]"
        >
          Contact
        </h3>
        <dl className="divide-y divide-[var(--color-hairline)] rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] text-sm">
          <ContactRow label="Phone">
            {phone ? (
              links.tel ? (
                <a
                  href={links.tel}
                  className="inline-flex min-h-11 items-center font-semibold text-[var(--color-deep-blue)] underline underline-offset-4"
                >
                  {phone}
                </a>
              ) : (
                <>
                  {phone}
                  <span className="block text-xs text-[var(--color-ink-soft)]">
                    This number could not be checked, so WhatsApp and Call are not offered.
                  </span>
                </>
              )
            ) : (
              <span className="text-[var(--color-ink-soft)]">Not given</span>
            )}
          </ContactRow>
          <ContactRow label="Email">
            {email && links.mailto ? (
              <a
                href={links.mailto}
                className="inline-flex min-h-11 items-center break-all font-semibold text-[var(--color-deep-blue)] underline underline-offset-4"
              >
                {email}
              </a>
            ) : (
              <span className="text-[var(--color-ink-soft)]">Not given</span>
            )}
          </ContactRow>
          <ContactRow label="School">{schoolLabel(enquiry.school_slug)}</ContactRow>
          <ContactRow label="Received">
            <span className="tabular-nums">{formatAdminDateTime(enquiry.created_at)}</span>
          </ContactRow>
        </dl>
      </section>

      <StickyBar>
        {links.whatsapp ? (
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noreferrer"
            className={adminButtonClass("primary", "flex-1 sm:flex-none")}
          >
            <MessageCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
            Reply on WhatsApp
          </a>
        ) : null}
        {links.tel ? (
          <a href={links.tel} className={adminButtonClass("secondary", "flex-1 sm:flex-none")}>
            <Phone aria-hidden className="h-4 w-4" strokeWidth={2} />
            Call
          </a>
        ) : null}
        {links.mailto ? (
          <a href={links.mailto} className={adminButtonClass("secondary", "flex-1 sm:flex-none")}>
            <Mail aria-hidden className="h-4 w-4" strokeWidth={2} />
            Email
          </a>
        ) : null}
        {actions.map((a) => {
          if (a === "delete") {
            return (
              <AdminButton
                key={a}
                variant="danger"
                icon={Trash2}
                disabled={busy}
                onClick={() => setDeleteOpen(true)}
                className="flex-1 sm:flex-none"
              >
                Delete permanently
              </AdminButton>
            );
          }
          const isDone = a === "done";
          const finished = doneKind === a;
          return (
            <AdminButton
              key={a}
              variant="secondary"
              icon={finished ? Check : isDone ? CheckCheck : Undo2}
              busy={busyKind === a}
              busyLabel={isDone ? "Marking as done…" : "Moving back…"}
              disabled={busy && busyKind !== a}
              onClick={() => void moveIt(a)}
              className="flex-1 sm:flex-none"
            >
              {finished
                ? isDone
                  ? "Done"
                  : "Moved back"
                : isDone
                  ? "Mark as done"
                  : "Move back to New"}
            </AdminButton>
          );
        })}
      </StickyBar>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${possessive(enquiry.name)} message?`}
        body="The message and their contact details are removed for good. This cannot be undone."
        confirmLabel="Delete permanently"
        busyLabel="Deleting…"
        danger
        onConfirm={deleteForGood}
      />
    </article>
  );
}

function ContactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-11 flex-col justify-center gap-0.5 px-4 py-2 sm:flex-row sm:items-center sm:gap-4">
      <dt className="shrink-0 font-semibold text-[var(--color-deep-blue)] sm:w-24">{label}</dt>
      <dd className="min-w-0 text-[var(--color-ink)]">{children}</dd>
    </div>
  );
}
