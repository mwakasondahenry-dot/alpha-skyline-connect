/** Who an invite or a story is for. */
import type { InviteAudience } from "@/integrations/alpha-supabase/types";

export type Audience = InviteAudience;

export const AUDIENCES: readonly Audience[] = ["alumni", "parent"];

export function isAudience(v: unknown): v is Audience {
  return v === "alumni" || v === "parent";
}

/** The form's audience. Missing or unknown means alumni, so older forms keep working. */
export function formAudience(form: FormData): Audience {
  return form.get("audience") === "parent" ? "parent" : "alumni";
}
