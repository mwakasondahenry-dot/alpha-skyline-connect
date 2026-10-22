/** The parent story form, for /parents/story and personal parent links. One screen. */
import { submitStory } from "@/lib/alumni.functions";
import {
  PARENT_CONSENT_TEXT,
  checkParentStory,
  parentDraftToForm,
  type ParentDraft,
} from "@/lib/story/parent-fields";
import { ParentFields } from "./parent-steps";
import { PhotoConsentStep, usePhoto } from "./steps";
import { useStoryDraft } from "./use-story-draft";
import { StoryWizardFrame } from "./wizard-frame";

const INTRO =
  "Parents: one question, a minute of your time. Your answer goes on our website beside your " +
  "name, once a member of staff has read it.";

export function ParentStoryWizard({
  code,
  initial,
}: {
  code: string | null;
  initial: ParentDraft;
}) {
  const storageKey = `alpha-parent-draft:${code ? code.slice(0, 12) : "general"}`;
  const { draft, update, clear, restored } = useStoryDraft(storageKey, initial);
  const { photo, photoError, onPickPhoto } = usePhoto();

  return (
    <StoryWizardFrame
      intro={INTRO}
      steps={[{ title: "Your experience", short: "Experience", check: () => checkParentStory(draft) }]}
      submit={() => submitStory({ data: parentDraftToForm(draft, code, photo) })}
      onSent={clear}
      renderStep={() => (
        <div className="space-y-8">
          <ParentFields draft={draft} update={update} />
          <PhotoConsentStep
            consent={draft.consent}
            onConsent={(consent) => update({ consent })}
            consentText={PARENT_CONSENT_TEXT}
            photo={photo}
            photoError={photoError}
            onPickPhoto={onPickPhoto}
            lostOnReload={restored}
          />
        </div>
      )}
    />
  );
}
