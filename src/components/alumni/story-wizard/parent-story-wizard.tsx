/** The parent story wizard, for /parents/story and personal parent links. */
import { submitStory } from "@/lib/alumni.functions";
import { checkConsent, checkQuote } from "@/lib/story/fields";
import {
  PARENT_PROMPTS,
  checkParentAbout,
  checkParentPrompts,
  parentDraftToForm,
  type ParentDraft,
} from "@/lib/story/parent-fields";
import { ParentAboutStep, ParentReviewStep } from "./parent-steps";
import { PhotoConsentStep, PromptsStep, QuoteStep, usePhoto } from "./steps";
import { useStoryDraft } from "./use-story-draft";
import { StoryWizardFrame, type FrameStep } from "./wizard-frame";

const INTRO =
  "We would like to share parents' experiences of Alpha on our website. It takes about five " +
  "minutes, you can change any answer before you send it, and a member of staff reads every " +
  "story before it is published.";

export function ParentStoryWizard({ code, initial }: { code: string | null; initial: ParentDraft }) {
  const storageKey = `alpha-parent-draft:${code ? code.slice(0, 12) : "general"}`;
  const { draft, update, setAnswer, clear, restored } = useStoryDraft(storageKey, initial);
  const { photo, photoError, onPickPhoto } = usePhoto();

  const steps: FrameStep[] = [
    { title: "About you", short: "You", check: () => checkParentAbout(draft) },
    { title: "Your experience", short: "Experience", check: () => checkParentPrompts(draft) },
    { title: "Your quote", short: "Quote", check: () => checkQuote(draft) },
    { title: "Photo and consent", short: "Photo", check: () => checkConsent(draft) },
    { title: "Check and send", short: "Send" },
  ];

  return (
    <StoryWizardFrame
      intro={INTRO}
      steps={steps}
      submit={() => submitStory({ data: parentDraftToForm(draft, code, photo) })}
      onSent={clear}
      renderStep={(step, goTo) => (
        <>
          {step === 0 && <ParentAboutStep draft={draft} update={update} />}
          {step === 1 && (
            <PromptsStep prompts={PARENT_PROMPTS} answers={draft.answers} onAnswer={setAnswer} />
          )}
          {step === 2 && (
            <QuoteStep
              lead="In a sentence or two, what has Alpha meant for your family? This is the part we publish, next to your name."
              quote={draft.quote}
              onChange={(quote) => update({ quote })}
            />
          )}
          {step === 3 && (
            <PhotoConsentStep
              consent={draft.consent}
              onConsent={(consent) => update({ consent })}
              photo={photo}
              photoError={photoError}
              onPickPhoto={onPickPhoto}
            />
          )}
          {step === 4 && (
            <ParentReviewStep
              draft={draft}
              photo={photo}
              photoLostOnReload={restored && !photo}
              onEdit={goTo}
            />
          )}
        </>
      )}
    />
  );
}
