/**
 * The lines under a person's name on a published story, shared by the public
 * /testimonials page and the admin's "How it will look" preview so the two
 * can never disagree.
 */
type MetaFields = {
  relationship: string | null;
  company: string | null;
  grad_year: number | null;
  school_slug: string | null;
};

const SCHOOL_LABELS: Record<string, string> = {
  "group-wide": "Alpha Schools",
  "nursery-primary": "Nursery & Primary",
  "alpha-high": "Alpha High",
  "alpha-girls": "Alpha Girls",
};

/** The school's name as the public site prints it; anything unknown is Alpha Schools. */
export function storySchoolLabel(slug: string | null | undefined): string {
  return SCHOOL_LABELS[slug ?? "group-wide"] ?? "Alpha Schools";
}

/** "Parent, Form 3", or "Parent, <school>" when no relationship was given. */
export function parentMeta(t: MetaFields): string[] {
  return [t.relationship ?? `Parent, ${storySchoolLabel(t.school_slug)}`];
}

/** "Alpha High, class of 2018" then "Pilot at Air Tanzania", from whichever parts exist. */
export function alumniMeta(t: MetaFields): string[] {
  const school = [storySchoolLabel(t.school_slug), t.grad_year ? `class of ${t.grad_year}` : null]
    .filter(Boolean)
    .join(", ");
  const now = [t.relationship, t.company].filter(Boolean).join(" at ");
  return [school, now].filter(Boolean);
}

/** A story with a class year is a former student's; without one, a parent's. */
export function storyMeta(t: MetaFields): string[] {
  return t.grad_year != null ? alumniMeta(t) : parentMeta(t);
}
