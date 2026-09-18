import type { InviteStatus } from "@/integrations/alpha-supabase/types";

/** "Expired" is derived from expires_at, never stored. A submitted invite stays submitted. */
export type DisplayStatus = InviteStatus | "expired";

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  pending: "Pending",
  opened: "Opened",
  submitted: "Submitted",
  expired: "Expired",
};

export function displayStatus(
  row: { status: InviteStatus; expires_at: string },
  now: Date = new Date(),
): DisplayStatus {
  if (row.status === "submitted") return "submitted";
  if (new Date(row.expires_at).getTime() < now.getTime()) return "expired";
  return row.status;
}
