/**
 * The alumni directory's reads: personal invites for former students and the
 * stories that carry a class year, each with explicit columns. Read only; the
 * Alumni screens never write. Contact details here are staff only: never log
 * them.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mergeAlumni,
  type AlumniPerson,
  type AlumniStoryRow,
  type InviteRow,
} from "./alumni-directory";

export const ALUMNI_INVITE_COLUMNS = [
  "id",
  "full_name",
  "phone",
  "email",
  "school_slug",
  "grad_year",
  "status",
  "created_at",
  "submitted_at",
].join(",");

export const ALUMNI_STORY_COLUMNS = [
  "id",
  "author_name",
  "relationship",
  "company",
  "city_country",
  "school_slug",
  "grad_year",
  "status",
  "photo_url",
  "answers",
  "invite_id",
  "created_at",
].join(",");

export type AlumniDirectory = {
  people: AlumniPerson[];
  invites: InviteRow[];
  stories: AlumniStoryRow[];
};

export async function loadAlumni(sb: SupabaseClient): Promise<AlumniDirectory> {
  const [inv, st] = await Promise.all([
    sb
      .from("testimonial_invites")
      .select(ALUMNI_INVITE_COLUMNS)
      .eq("audience", "alumni")
      .order("created_at", { ascending: false }),
    sb
      .from("testimonials")
      .select(ALUMNI_STORY_COLUMNS)
      .not("grad_year", "is", null)
      .order("created_at", { ascending: false }),
  ]);
  if (inv.error) throw inv.error;
  if (st.error) throw st.error;
  const invites = (inv.data ?? []) as unknown as InviteRow[];
  const stories = (st.data ?? []) as unknown as AlumniStoryRow[];
  return { people: mergeAlumni(invites, stories), invites, stories };
}
