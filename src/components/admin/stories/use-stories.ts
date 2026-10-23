/**
 * The Stories screens' shared state: the stories query, the signed photo
 * links, per-row busy and error state, and the moves every screen makes.
 *
 * The row-state provider (kit) sits in the /admin/stories layout, above both
 * the list and the detail, so a card can show the error from an action taken
 * in the detail panel, and the detail can make a card leave the list.
 */
import { useCallback, useMemo } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/lib/admin-auth";
import { ADMIN_COUNTS_KEY } from "@/lib/admin/counts";
import { friendlyError } from "@/lib/admin/errors";
import {
  STORY_COLUMNS,
  guardedMove,
  listStories,
  publishStory,
  signPendingPhotos,
  type AdminStory,
  type MoveResult,
} from "@/lib/admin/stories-data";
import { UNDO, transition } from "@/lib/admin/story-status";
import { moveExtra, undoMoveExtra } from "@/lib/admin/stories-view";
import { collapseAndRemove, useRowState } from "@/components/admin/kit";

export const STORIES_LIST_KEY = ["admin", "stories", "list"] as const;

/** Signed links last an hour; renew them well before then. */
const SIGNED_REFRESH_MS = 50 * 60 * 1000;

/** Shown instead of the generic conflict when Show on site meets an unapproved photo. */
export const UNAPPROVED_PHOTO =
  "This story still has an unapproved photo, so it cannot go on the site. Remove the photo first, then try again.";

export function useStoriesQuery() {
  const { client, session } = useAdminAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: STORIES_LIST_KEY,
    enabled: !!client && !!userId,
    placeholderData: keepPreviousData,
    queryFn: () => listStories(client!),
  });
}

/** Path → signed URL for every private photo in the list, renewed every 50 minutes. */
export function useSignedPhotos(stories: AdminStory[] | undefined): Record<string, string> {
  const { client, session } = useAdminAuth();
  const userId = session?.user.id;
  const paths = useMemo(() => {
    const set = new Set<string>();
    for (const s of stories ?? []) if (s.pending_photo_path) set.add(s.pending_photo_path);
    return [...set].sort();
  }, [stories]);
  const q = useQuery({
    queryKey: ["admin", "stories", "signed", paths.join("|")],
    enabled: !!client && !!userId && paths.length > 0,
    placeholderData: keepPreviousData,
    staleTime: SIGNED_REFRESH_MS,
    refetchInterval: SIGNED_REFRESH_MS,
    queryFn: () => signPendingPhotos(client!, paths),
  });
  return q.data ?? {};
}

/**
 * Per-story busy, error and flash state, from the <RowStateProvider> in the
 * /admin/stories layout.
 */
export const useStoriesUi = useRowState;

/** A rejected undo or confirm carries this so friendlyError() says "changed by someone else". */
export const CONFLICT = { kind: "conflict" } as const;

export type StateMove = "publish" | "decline" | "restore" | "hide" | "show";

/**
 * The data side of every story action. Each returns whether it worked; on
 * failure the plain-language error is already on the story's card (and the
 * detail), and on a conflict that story has been fetched again.
 */
export function useStoryData() {
  const { client } = useAdminAuth();
  const qc = useQueryClient();
  const ui = useStoriesUi();

  /** Replace (or with null remove) one story in the cached list. */
  const patch = useCallback(
    (id: string, change: Partial<AdminStory> | null) => {
      qc.setQueryData<AdminStory[]>(STORIES_LIST_KEY, (old) => {
        if (!old) return old;
        if (change === null) return old.filter((s) => s.id !== id);
        return old.map((s) => (s.id === id ? { ...s, ...change } : s));
      });
    },
    [qc],
  );

  /** Fetch one story again and put it in the list (or take it out if it is gone). */
  const refreshStory = useCallback(
    async (id: string): Promise<AdminStory | null> => {
      if (!client) return null;
      const { data, error } = await client
        .from("testimonials")
        .select(STORY_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      if (error) {
        void qc.invalidateQueries({ queryKey: STORIES_LIST_KEY });
        return null;
      }
      const row = (data ?? null) as unknown as AdminStory | null;
      qc.setQueryData<AdminStory[]>(STORIES_LIST_KEY, (old) => {
        if (!old) return old;
        if (!row) return old.filter((s) => s.id !== id);
        return old.some((s) => s.id === id)
          ? old.map((s) => (s.id === id ? row : s))
          : [row, ...old];
      });
      return row;
    },
    [client, qc],
  );

  /** Badges on the shell and Today follow every story action. */
  const countsChanged = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ADMIN_COUNTS_KEY });
    void qc.invalidateQueries({ queryKey: ["admin", "today"] });
  }, [qc]);

  /**
   * Report a failed result on the story. Returns false so callers can
   * `return report(...)`.
   */
  const report = useCallback(
    async (id: string, result: Exclude<MoveResult, { ok: true }>) => {
      if ("conflict" in result) {
        ui.setError(id, friendlyError(CONFLICT));
        await refreshStory(id);
      } else {
        ui.setError(id, friendlyError(result.error));
      }
      return false;
    },
    [ui, refreshStory],
  );

  /** Run one guarded write for a story, with its busy state and error handling. */
  const run = useCallback(
    async (id: string, write: () => Promise<MoveResult>): Promise<boolean> => {
      ui.setError(id, null);
      ui.setBusy(id, true);
      try {
        const result = await write();
        if (!result.ok) return await report(id, result);
        return true;
      } catch (err) {
        ui.setError(id, friendlyError(err));
        return false;
      } finally {
        ui.setBusy(id, false);
      }
    },
    [ui, report],
  );

  /** A state move. Publish goes through publishStory, the only path that copies the photo. */
  const move = useCallback(
    async (story: AdminStory, action: StateMove, extra: Record<string, unknown> = {}) => {
      if (!client) return false;
      if (action === "show" && story.pending_photo_path) {
        ui.setError(story.id, UNAPPROVED_PHOTO);
        return false;
      }
      const ok = await run(story.id, () => {
        if (action === "publish") return publishStory(client, story);
        const { from, to } = transition(action);
        return guardedMove(client, story.id, from, to, { ...moveExtra(action), ...extra });
      });
      if (ok) countsChanged();
      return ok;
    },
    [client, run, countsChanged, ui],
  );

  /**
   * The Undo for a state move: the reverse move, guarded on the state it left
   * the story in. `before` is the story as it was, so Undo of Hide can put its
   * featured place back.
   */
  const undoMove = useCallback(
    (id: string, action: StateMove, before: Pick<AdminStory, "featured" | "featured_order">) =>
      async () => {
        if (!client) throw new Error("Not signed in");
        const back = UNDO[action];
        const result = await guardedMove(
          client,
          id,
          back.from,
          back.to,
          undoMoveExtra(action, before),
        );
        await refreshStory(id);
        countsChanged();
        if (!result.ok) throw "conflict" in result ? CONFLICT : result.error;
        ui.flashRow(id);
      },
    [client, refreshStory, countsChanged, ui],
  );

  /**
   * The card leaves its list: fade, close the gap, then drop it from the
   * cache. When the card is not on screen (the phone shows the detail as its
   * own page) it is simply dropped.
   */
  const leaveList = useCallback(
    async (id: string, change: Partial<AdminStory> | null) => {
      const el = ui.cardEl(id);
      if (el && el.getClientRects().length > 0) await collapseAndRemove(el);
      patch(id, change);
    },
    [ui, patch],
  );

  return { client, patch, refreshStory, countsChanged, run, move, undoMove, leaveList, report };
}
