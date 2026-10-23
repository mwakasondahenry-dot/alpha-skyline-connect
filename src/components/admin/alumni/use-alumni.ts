/**
 * The alumni directory, loaded once and filtered on the device (it is
 * expected to stay in the low thousands). Previous data is kept while it
 * refreshes, so the list never blanks.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/lib/admin-auth";
import { loadAlumni } from "@/lib/admin/alumni-data";

export const ALUMNI_KEY = ["admin", "alumni", "directory"] as const;

export function useAlumniQuery() {
  const { client, session } = useAdminAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ALUMNI_KEY,
    enabled: !!client && !!userId,
    placeholderData: keepPreviousData,
    queryFn: () => loadAlumni(client!),
  });
}
