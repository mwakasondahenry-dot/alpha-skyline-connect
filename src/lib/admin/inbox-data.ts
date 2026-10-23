/**
 * The inbox data layer: every read and write the admin Inbox screens make on
 * contact_messages, the enquiries parents send from the website's contact form.
 *
 * Writes are guarded like the Stories ones (src/lib/admin/stories-data.ts):
 * `.eq("status", from)` plus the affected ids back, so no rows back means
 * someone else moved the message first, `{ ok: false, conflict: true }`.
 *
 * Only listEnquiries throws (it feeds a query); the rest return results so the
 * screen can show the error on the message that failed.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MoveResult } from "@/lib/admin/stories-data";
import { canMoveEnquiry } from "@/lib/admin/inbox-view";

export type { MoveResult };

export type EnquiryStatus = "new" | "read" | "archived";

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  school_slug: string | null;
  subject: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
};

const TABLE = "contact_messages";

export const ENQUIRY_COLUMNS = [
  "id",
  "name",
  "email",
  "phone",
  "school_slug",
  "subject",
  "message",
  "status",
  "created_at",
].join(",");

const OK: MoveResult = { ok: true };
const CONFLICT: MoveResult = { ok: false, conflict: true };
const fail = (error: unknown): MoveResult => ({ ok: false, error });

export async function listEnquiries(sb: SupabaseClient): Promise<Enquiry[]> {
  const { data, error } = await sb
    .from(TABLE)
    .select(ENQUIRY_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Enquiry[];
}

/** One message again, after a conflict. `row: null` means it has been deleted. */
export async function getEnquiry(
  sb: SupabaseClient,
  id: string,
): Promise<{ ok: true; row: Enquiry | null } | { ok: false; error: unknown }> {
  try {
    const { data, error } = await sb.from(TABLE).select(ENQUIRY_COLUMNS).eq("id", id).maybeSingle();
    if (error) return { ok: false, error };
    return { ok: true, row: (data ?? null) as unknown as Enquiry | null };
  } catch (err) {
    return { ok: false, error: err };
  }
}

/** Move a message from one state to another, guarded on `from`. */
export async function setEnquiryStatus(
  sb: SupabaseClient,
  id: string,
  from: EnquiryStatus,
  to: EnquiryStatus,
): Promise<MoveResult> {
  if (!canMoveEnquiry(from, to)) {
    return fail(new Error(`An enquiry cannot move from ${from} to ${to}.`));
  }
  try {
    const { data, error } = await sb
      .from(TABLE)
      .update({ status: to })
      .eq("id", id)
      .eq("status", from)
      .select("id");
    if (error) return fail(error);
    return Array.isArray(data) && data.length > 0 ? OK : CONFLICT;
  } catch (err) {
    return fail(err);
  }
}

/** Delete for good. Only a message under Done (status archived). */
export async function deleteEnquiry(sb: SupabaseClient, id: string): Promise<MoveResult> {
  try {
    const { data, error } = await sb
      .from(TABLE)
      .delete()
      .eq("id", id)
      .eq("status", "archived")
      .select("id");
    if (error) return fail(error);
    return Array.isArray(data) && data.length > 0 ? OK : CONFLICT;
  } catch (err) {
    return fail(err);
  }
}
