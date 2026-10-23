/**
 * The Inbox screens' shared state: the enquiries query and the moves every
 * screen makes. Per-message busy, error and flash state comes from the kit's
 * <RowStateProvider> in the /admin/inbox layout, above both the list and the
 * detail, so a card shows the error from an action taken in the detail.
 *
 * The same shape as the Stories hooks (src/components/admin/stories/use-stories.ts).
 */
import { useCallback } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { collapseAndRemove, useRowState } from "@/components/admin/kit";
import { useAdminAuth } from "@/lib/admin-auth";
import { ADMIN_COUNTS_KEY } from "@/lib/admin/counts";
import { friendlyError } from "@/lib/admin/errors";
import {
  getEnquiry,
  listEnquiries,
  setEnquiryStatus,
  type Enquiry,
  type MoveResult,
} from "@/lib/admin/inbox-data";
import { enquiryMove, enquiryUndo, type EnquiryMove } from "@/lib/admin/inbox-view";

export const INBOX_LIST_KEY = ["admin", "inbox", "list"] as const;

/** friendlyError() turns this into "This message was changed by someone else." */
export const MESSAGE_CONFLICT = { kind: "conflict", what: "message" } as const;

export function useEnquiriesQuery() {
  const { client, session } = useAdminAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: INBOX_LIST_KEY,
    enabled: !!client && !!userId,
    placeholderData: keepPreviousData,
    queryFn: () => listEnquiries(client!),
  });
}

/**
 * The data side of every inbox action. Each returns whether it worked; on
 * failure the plain-language error is already on the message's card (and the
 * detail), and on a conflict that message has been fetched again.
 */
export function useInboxData() {
  const { client } = useAdminAuth();
  const qc = useQueryClient();
  const ui = useRowState();

  /** Replace (or with null remove) one message in the cached list. */
  const patch = useCallback(
    (id: string, change: Partial<Enquiry> | null) => {
      qc.setQueryData<Enquiry[]>(INBOX_LIST_KEY, (old) => {
        if (!old) return old;
        if (change === null) return old.filter((e) => e.id !== id);
        return old.map((e) => (e.id === id ? { ...e, ...change } : e));
      });
    },
    [qc],
  );

  /** Fetch one message again and put it in the list (or take it out if it is gone). */
  const refreshEnquiry = useCallback(
    async (id: string): Promise<Enquiry | null> => {
      if (!client) return null;
      const result = await getEnquiry(client, id);
      if (!result.ok) {
        void qc.invalidateQueries({ queryKey: INBOX_LIST_KEY });
        return null;
      }
      const row = result.row;
      qc.setQueryData<Enquiry[]>(INBOX_LIST_KEY, (old) => {
        if (!old) return old;
        if (!row) return old.filter((e) => e.id !== id);
        return old.some((e) => e.id === id)
          ? old.map((e) => (e.id === id ? row : e))
          : [row, ...old];
      });
      return row;
    },
    [client, qc],
  );

  /** The shell's Inbox and Today badges count new messages: they follow every change. */
  const countsChanged = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ADMIN_COUNTS_KEY });
    void qc.invalidateQueries({ queryKey: ["admin", "today"] });
  }, [qc]);

  /** Run one guarded write for a message, with its busy state and error handling. */
  const run = useCallback(
    async (id: string, write: () => Promise<MoveResult>): Promise<boolean> => {
      ui.setError(id, null);
      ui.setBusy(id, true);
      try {
        const result = await write();
        if (result.ok) return true;
        if ("conflict" in result) {
          ui.setError(id, friendlyError(MESSAGE_CONFLICT));
          await refreshEnquiry(id);
        } else {
          ui.setError(id, friendlyError(result.error));
        }
        return false;
      } catch (err) {
        ui.setError(id, friendlyError(err));
        return false;
      } finally {
        ui.setBusy(id, false);
      }
    },
    [ui, refreshEnquiry],
  );

  /** Mark as done, or Move back to New. */
  const move = useCallback(
    async (e: Enquiry, action: EnquiryMove) => {
      if (!client) return false;
      const { from, to } = enquiryMove(e.status, action);
      const ok = await run(e.id, async () => {
        const first = await setEnquiryStatus(client, e.id, from, to);
        if (first.ok || !("conflict" in first) || from !== "new") return first;
        // Opening the message marks it read, and that may have landed first:
        // try once more from read. Anyone else's change still conflicts.
        return setEnquiryStatus(client, e.id, "read", to);
      });
      if (ok) countsChanged();
      return ok;
    },
    [client, run, countsChanged],
  );

  /** The Undo for a move: the reverse move, guarded on the state it left the message in. */
  const undoMove = useCallback(
    (id: string, action: EnquiryMove) => async () => {
      if (!client) throw new Error("Not signed in");
      const back = enquiryUndo(action);
      const result = await setEnquiryStatus(client, id, back.from, back.to);
      await refreshEnquiry(id);
      countsChanged();
      if (!result.ok) throw "conflict" in result ? MESSAGE_CONFLICT : result.error;
      ui.flashRow(id);
    },
    [client, refreshEnquiry, countsChanged, ui],
  );

  /**
   * Opening a new message marks it read, silently: no outcome line, and a
   * failure only leaves it bold (the next refresh shows the truth).
   */
  const markRead = useCallback(
    async (e: Enquiry) => {
      if (!client || e.status !== "new") return;
      const result = await setEnquiryStatus(client, e.id, "new", "read");
      if (result.ok) {
        patch(e.id, { status: "read" });
        countsChanged();
      } else if ("conflict" in result) {
        await refreshEnquiry(e.id);
      } else {
        console.warn("Could not mark the message as read", result.error);
      }
    },
    [client, patch, countsChanged, refreshEnquiry],
  );

  /**
   * The card leaves its list: fade, close the gap, then update the cache.
   * When the card is not on screen (the phone shows the detail as its own
   * page) the cache is simply updated.
   */
  const leaveList = useCallback(
    async (id: string, change: Partial<Enquiry> | null) => {
      const el = ui.cardEl(id);
      if (el && el.getClientRects().length > 0) await collapseAndRemove(el);
      patch(id, change);
    },
    [ui, patch],
  );

  return {
    client,
    patch,
    refreshEnquiry,
    countsChanged,
    run,
    move,
    undoMove,
    markRead,
    leaveList,
  };
}
