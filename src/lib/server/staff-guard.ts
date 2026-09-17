/**
 * Staff check for server functions that act on behalf of the admin portal.
 *
 * The browser sends its Supabase access token; the token is verified with
 * Supabase Auth and the user must have a profiles row. That is the same
 * definition of "staff" as public.is_staff() in the database.
 */
import { serviceClient } from "./supabase-service";

/** Its message is shown to the member of staff. */
export class StaffAuthError extends Error {}

export async function requireStaff(accessToken: string): Promise<{ userId: string }> {
  if (typeof accessToken !== "string" || !accessToken) {
    throw new StaffAuthError("Please sign in again.");
  }
  const sb = serviceClient();
  const { data, error } = await sb.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new StaffAuthError("Your session has expired. Please sign in again.");
  }
  const { data: profile, error: profileError } = await sb
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) throw new StaffAuthError("This account is not a staff account.");
  return { userId: data.user.id };
}
