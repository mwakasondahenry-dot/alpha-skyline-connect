/**
 * What is waiting for a person: stories to read, enquiries to answer, photo
 * positions with nothing in them. Feeds the shell's badges and the Today
 * screen from one query, so they never disagree.
 *
 * Stories and enquiries are head-only counts (no rows come back). The photo
 * tally needs the uploaded keys, because "empty" means no upload AND no
 * picture the page shipped with: the same rule the School photos screen uses.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/lib/admin-auth";
import { PHOTO_SLOTS } from "@/lib/photo-slots";

export type AdminCounts = { storiesWaiting: number; inboxNew: number; photosEmpty: number };

export const ADMIN_COUNTS_KEY = ["admin", "counts"] as const;

/** Positions with no uploaded photo and no shipped fallback, across all three schools. */
export function countEmptyPhotoPositions(uploadedKeys: Iterable<string>): number {
  const uploaded = new Set(uploadedKeys);
  return PHOTO_SLOTS.filter((s) => !s.fallback && !uploaded.has(s.key)).length;
}

/** The Today badge: everything that is waiting, in one number. */
export function totalNeedingAttention(c: AdminCounts): number {
  return c.storiesWaiting + c.inboxNew + c.photosEmpty;
}

export function useAdminCounts(): AdminCounts & { loading: boolean; error: unknown } {
  const { client, session } = useAdminAuth();
  const userId = session?.user.id;

  const q = useQuery({
    queryKey: ADMIN_COUNTS_KEY,
    enabled: !!client && !!userId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    queryFn: async (): Promise<AdminCounts> => {
      const sb = client!;
      const [stories, inbox, photos] = await Promise.all([
        sb
          .from("testimonials")
          .select("id", { count: "exact", head: true })
          .eq("status", "waiting"),
        sb
          .from("contact_messages")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
        sb.from("photo_slots").select("slot_key"),
      ]);
      if (stories.error) throw stories.error;
      if (inbox.error) throw inbox.error;
      if (photos.error) throw photos.error;
      return {
        storiesWaiting: stories.count ?? 0,
        inboxNew: inbox.count ?? 0,
        photosEmpty: countEmptyPhotoPositions(
          (photos.data ?? []).map((r: { slot_key: string }) => r.slot_key),
        ),
      };
    },
  });

  return {
    storiesWaiting: q.data?.storiesWaiting ?? 0,
    inboxNew: q.data?.inboxNew ?? 0,
    photosEmpty: q.data?.photosEmpty ?? 0,
    loading: q.isPending,
    error: q.error,
  };
}
