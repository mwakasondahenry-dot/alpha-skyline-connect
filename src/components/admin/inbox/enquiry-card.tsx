/**
 * One message in an Inbox list: name, subject, the first line of the
 * message, school and when it arrived. A message nobody has opened carries a
 * dot and a bold name. The whole card opens the message. A failed action on
 * this message shows its error here, in words.
 */
import { useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { ListCard, useRowState } from "@/components/admin/kit";
import type { Enquiry } from "@/lib/admin/inbox-data";
import { enquiryCard, isUnread } from "@/lib/admin/inbox-view";
import { cn } from "@/lib/utils";

export function EnquiryCard({
  enquiry,
  selected,
  onOpen,
}: {
  enquiry: Enquiry;
  selected: boolean;
  onOpen: () => void;
}) {
  const ui = useRowState();
  const { subject, preview, school, received } = enquiryCard(enquiry);
  const unread = isUnread(enquiry);
  const error = ui.errors[enquiry.id];
  const busy = ui.busy.has(enquiry.id);
  const register = ui.registerCard;
  const id = enquiry.id;
  const ref = useCallback((el: HTMLElement | null) => register(id, el), [register, id]);

  return (
    <ListCard
      ref={ref}
      onClick={onOpen}
      selected={selected}
      highlight={ui.flash[enquiry.id] ?? null}
      aria-busy={busy || undefined}
      className="p-3 sm:p-4"
    >
      <span className="flex items-start gap-2.5">
        <span aria-hidden className="mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
          {unread ? (
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-deep-blue)]" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span
              className={cn(
                "min-w-0 flex-1 break-words leading-snug text-[var(--color-deep-blue)]",
                unread ? "font-bold" : "font-normal",
              )}
            >
              {unread ? <span className="sr-only">New: </span> : null}
              {enquiry.name}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-[var(--color-ink-soft)]">
              {received}
            </span>
          </span>
          <span
            className={cn(
              "mt-0.5 block break-words text-sm leading-snug",
              "text-[var(--color-ink)]",
              unread && "font-semibold",
              !enquiry.subject?.trim() && "italic text-[var(--color-ink-soft)]",
            )}
          >
            {subject}
          </span>
          {preview ? (
            <span className="mt-0.5 line-clamp-1 block break-words text-sm leading-snug text-[var(--color-ink-soft)]">
              {preview}
            </span>
          ) : null}
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-ink-soft)]">
            <span>{school}</span>
            {busy ? <span>Working…</span> : null}
          </span>
          {error ? (
            <span className="mt-2 flex gap-1.5 text-sm leading-snug text-[var(--color-danger)]">
              <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </span>
          ) : null}
        </span>
      </span>
    </ListCard>
  );
}
