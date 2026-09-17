/**
 * The alumni story wizard, for the general link (code = null) and personal
 * links. Each step's check runs before Next; the server runs all of them
 * again. Nothing is uploaded until Send, to keep mobile data use down.
 */
import { submitStory } from "@/lib/alumni.functions";
import {
  STORY_PROMPTS,
  checkAbout,
  checkConsent,
  checkNow,
  checkPrompts,
  checkQuote,
  draftToForm,
  type StoryDraft,
} from "@/lib/story/fields";
import {
  AboutStep,
  NowStep,
  PhotoConsentStep,
  PromptsStep,
  QuoteStep,
  ReviewStep,
  usePhoto,
} from "./steps";
import { useStoryDraft } from "./use-story-draft";
import { StoryWizardFrame, type FrameStep } from "./wizard-frame";

const INTRO =
  "We would like to feature former students on our alumni page. It takes about five minutes, " +
  "you can change any answer before you send it, and a member of staff reads every story " +
  "before it is published.";

export function StoryWizard({ code, initial }: { code: string | null; initial: StoryDraft }) {
  const storageKey = `alpha-story-draft:${code ? code.slice(0, 12) : "general"}`;
  const { draft, update, setAnswer, clear, restored } = useStoryDraft(storageKey, initial);
  const { photo, photoError, onPickPhoto } = usePhoto();

  const steps: FrameStep[] = [
    { title: "About you", short: "You", check: () => checkAbout(draft) },
    { title: "Where you are now", short: "Now", check: () => checkNow(draft) },
    { title: "Your story", short: "Story", check: () => checkPrompts(draft) },
    { title: "Your quote", short: "Quote", check: () => checkQuote(draft) },
    { title: "Photo and consent", short: "Photo", check: () => checkConsent(draft) },
    { title: "Check and send", short: "Send" },
  ];

  return (
    <StoryWizardFrame
      intro={INTRO}
      steps={steps}
      submit={() => submitStory({ data: draftToForm(draft, code, photo) })}
      onSent={clear}
      renderStep={(step, goTo) => (
        <>
          {step === 0 && <AboutStep draft={draft} update={update} />}
          {step === 1 && <NowStep draft={draft} update={update} />}
          {step === 2 && (
            <PromptsStep prompts={STORY_PROMPTS} answers={draft.answers} onAnswer={setAnswer} />
          )}
          {step === 3 && (
            <QuoteStep
              lead="In a sentence or two, what did Alpha mean to you? This is the part we publish, next to your name."
              quote={draft.quote}
              onChange={(quote) => update({ quote })}
            />
          )}
          {step === 4 && (
            <PhotoConsentStep
              consent={draft.consent}
              onConsent={(consent) => update({ consent })}
              photo={photo}
              photoError={photoError}
              onPickPhoto={onPickPhoto}
            />
          )}
          {step === 5 && (
            <ReviewStep
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
