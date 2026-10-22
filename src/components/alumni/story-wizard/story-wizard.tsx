/**
 * The alumni story form, for the general link (code = null) and personal
 * links. One screen: the checks run before Send, and the server runs all of
 * them again. Nothing is uploaded until Send, to keep mobile data use down.
 */
import { submitStory } from "@/lib/alumni.functions";
import { checkStory, draftToForm, type StoryDraft } from "@/lib/story/fields";
import { AlumniFields, PhotoConsentStep, usePhoto } from "./steps";
import { useStoryDraft } from "./use-story-draft";
import { StoryWizardFrame } from "./wizard-frame";

const INTRO =
  "Former students: one question, a minute of your time. Your answer goes on our alumni page " +
  "beside your name, once a member of staff has read it.";

export function StoryWizard({ code, initial }: { code: string | null; initial: StoryDraft }) {
  const storageKey = `alpha-story-draft:${code ? code.slice(0, 12) : "general"}`;
  const { draft, update, clear, restored } = useStoryDraft(storageKey, initial);
  const { photo, photoError, onPickPhoto } = usePhoto();

  return (
    <StoryWizardFrame
      intro={INTRO}
      steps={[{ title: "Your story", short: "Story", check: () => checkStory(draft) }]}
      submit={() => submitStory({ data: draftToForm(draft, code, photo) })}
      onSent={clear}
      renderStep={() => (
        <div className="space-y-8">
          <AlumniFields draft={draft} update={update} />
          <PhotoConsentStep
            consent={draft.consent}
            onConsent={(consent) => update({ consent })}
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
