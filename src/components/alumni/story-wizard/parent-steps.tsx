/** Step bodies specific to the parent story. */
import { ALUMNI_SCHOOLS } from "@/lib/invites/contacts";
import { NAME_MAX } from "@/lib/story/fields";
import { PARENT_PROMPTS, type ParentDraft } from "@/lib/story/parent-fields";
import { TextField } from "./field-ui";
import { ReviewList, SchoolChoice, answerItems, photoItems, type ReviewSection } from "./steps";

export function ParentAboutStep({
  draft,
  update,
}: {
  draft: ParentDraft;
  update: (patch: Partial<ParentDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <TextField
        label="Your full name"
        required
        value={draft.fullName}
        onChange={(fullName) => update({ fullName })}
        maxLength={NAME_MAX}
        autoComplete="name"
      />
      <SchoolChoice
        legend="Your child's school"
        name="parent-school"
        value={draft.schoolSlug}
        onChange={(schoolSlug) => update({ schoolSlug })}
      />
    </div>
  );
}

export function ParentReviewStep({
  draft,
  photo,
  photoLostOnReload,
  onEdit,
}: {
  draft: ParentDraft;
  photo: File | null;
  photoLostOnReload: boolean;
  onEdit: (step: number) => void;
}) {
  const school = ALUMNI_SCHOOLS.find((s) => s.value === draft.schoolSlug)?.label ?? "";
  const sections: ReviewSection[] = [
    { step: 0, title: "About you", items: [{ value: `${draft.fullName.trim()}, parent at ${school}` }] },
    { step: 1, title: "Your experience", items: answerItems(PARENT_PROMPTS, draft.answers) },
    { step: 2, title: "Your quote", items: [{ value: draft.quote.trim() }] },
    { step: 3, title: "Photo", items: photoItems(photo, photoLostOnReload) },
  ];
  return <ReviewList sections={sections} photo={photo} photoStep={3} onEdit={onEdit} />;
}
