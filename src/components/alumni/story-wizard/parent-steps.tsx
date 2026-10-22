/** The parent form's fields: two facts and the question. */
import { NAME_MAX } from "@/lib/story/fields";
import { PARENT_QUESTION, type ParentDraft } from "@/lib/story/parent-fields";
import { TextField } from "./field-ui";
import { QuestionField, SchoolChoice } from "./steps";

export function ParentFields({
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
      <QuestionField
        question={PARENT_QUESTION}
        hint="One or two sentences. This is published next to your name as a parent at the school."
        value={draft.quote}
        onChange={(quote) => update({ quote })}
      />
    </div>
  );
}
