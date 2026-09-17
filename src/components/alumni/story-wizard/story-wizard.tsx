/**
 * The alumni story wizard, for the general link (code = null) and personal
 * links. Each step's check runs before Next; the server runs all of them
 * again. Nothing is uploaded until Send, to keep mobile data use down.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { T } from "@/components/type-roles";
import { submitStory } from "@/lib/alumni.functions";
import {
  PHOTO_MAX_BYTES,
  checkAbout,
  checkConsent,
  checkNow,
  checkPrompts,
  checkQuote,
  draftToForm,
  type StoryDraft,
} from "@/lib/story/fields";
import { BTN_PRIMARY, BTN_PRIMARY_STYLE, BTN_SECONDARY, CARD } from "./field-ui";
import { MessageCard } from "./story-shell";
import {
  AboutStep,
  NowStep,
  PhotoConsentStep,
  PromptsStep,
  QuoteStep,
  ReviewStep,
} from "./steps";
import { useStoryDraft } from "./use-story-draft";

type Check = (d: StoryDraft) => string | null;

const STEPS: { title: string; short: string; check?: Check }[] = [
  { title: "About you", short: "You", check: (d) => checkAbout(d) },
  { title: "Where you are now", short: "Now", check: checkNow },
  { title: "Your story", short: "Story", check: checkPrompts },
  { title: "Your quote", short: "Quote", check: checkQuote },
  { title: "Photo and consent", short: "Photo", check: checkConsent },
  { title: "Check and send", short: "Send" },
];

const BodyText = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-2 max-w-[60ch] text-[var(--color-ink-soft)]" style={T.body}>
    {children}
  </p>
);

const HomeLink = () => (
  <Link to="/" className={`mt-5 ${BTN_PRIMARY}`} style={BTN_PRIMARY_STYLE}>
    Back to Alpha Schools
  </Link>
);

export function InvalidLinkCard() {
  return (
    <MessageCard title="This link no longer works">
      <BodyText>
        It may have expired, or the school may have sent you a newer one. Contact the school and
        we will send you a fresh link.
      </BodyText>
      <Link to="/contact" className={`mt-5 ${BTN_PRIMARY}`} style={BTN_PRIMARY_STYLE}>
        Contact the school
      </Link>
    </MessageCard>
  );
}

export function AlreadyReceivedCard() {
  return (
    <MessageCard title="We already have your story">
      <BodyText>Thank you. To change or withdraw it, contact the school and we will help.</BodyText>
      <HomeLink />
    </MessageCard>
  );
}

function DoneCard() {
  return (
    <MessageCard title="Thank you. Your story is with us.">
      <BodyText>
        A member of staff will read it before anything is published, so it will not appear on the
        site straight away. To change or withdraw it later, contact the school.
      </BodyText>
      <HomeLink />
    </MessageCard>
  );
}

/**
 * Where the reader is. Named steps on wider screens, where they fit and
 * show what is still to come; a single line on phones.
 */
function StepIndicator({ step }: { step: number }) {
  return (
    <>
      <p className="text-[var(--color-ink-soft)] sm:hidden" style={T.body}>
        Step {step + 1} of {STEPS.length}
      </p>
      <ol className="hidden gap-1 sm:grid sm:grid-cols-6" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            aria-current={i === step ? "step" : undefined}
            className={`border-t-2 pt-2 text-sm ${
              i === step
                ? "border-[var(--color-gold)] font-semibold text-[var(--color-deep-blue)]"
                : i < step
                  ? "border-[var(--color-deep-blue)] text-[var(--color-deep-blue)]"
                  : "border-[var(--color-deep-blue)]/15 text-[var(--color-ink-soft)]"
            }`}
          >
            {s.short}
          </li>
        ))}
      </ol>
    </>
  );
}

export function StoryWizard({ code, initial }: { code: string | null; initial: StoryDraft }) {
  const storageKey = `alpha-story-draft:${code ? code.slice(0, 12) : "general"}`;
  const { draft, update, setAnswer, clear, restored } = useStoryDraft(storageKey, initial);

  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"done" | "invalid" | "submitted" | null>(null);

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const moved = useRef(false);

  /* Move focus to the new step's heading, but not on first render. */
  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "nearest" });
  }, [step]);

  function goTo(next: number) {
    moved.current = true;
    setError(null);
    setStep(next);
  }

  function onNext() {
    const problem = STEPS[step].check?.(draft) ?? null;
    if (problem) {
      setError(problem);
      return;
    }
    goTo(step + 1);
  }

  function onPickPhoto(file: File | null) {
    setPhotoError(null);
    if (file && file.size > PHOTO_MAX_BYTES) {
      setPhoto(null);
      setPhotoError("That photo is larger than 5 MB. Please choose a smaller one.");
      return;
    }
    setPhoto(file);
  }

  async function onSubmit() {
    /* Re-check everything; jump to the first step with a problem. */
    for (let i = 0; i < STEPS.length; i++) {
      const problem = STEPS[i].check?.(draft) ?? null;
      if (problem) {
        goTo(i);
        setError(problem);
        return;
      }
    }

    setBusy(true);
    setError(null);
    try {
      const res = await submitStory({ data: draftToForm(draft, code, photo) });
      if (res.ok) {
        clear();
        setResult("done");
      } else {
        if (res.state === "submitted") clear();
        setResult(res.state);
      }
    } catch (err) {
      /* The draft stays in storage, so a retry loses nothing. */
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not send your story. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (result === "done") return <DoneCard />;
  if (result === "submitted") return <AlreadyReceivedCard />;
  if (result === "invalid") return <InvalidLinkCard />;

  const last = step === STEPS.length - 1;

  return (
    <>
      <p className="max-w-[60ch] text-[var(--color-ink-soft)]" style={T.body}>
        We would like to feature former students on our alumni page. It takes about five minutes,
        you can change any answer before you send it, and a member of staff reads every story
        before it is published.
      </p>

      <div className={`${CARD} mt-[var(--space-block-y)]`}>
        <StepIndicator step={step} />

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 font-display text-[var(--color-deep-blue)] focus:outline-none"
          style={T.cardTitle}
        >
          {STEPS[step].title}
        </h2>

        <div className="mt-4">
          {step === 0 && <AboutStep draft={draft} update={update} />}
          {step === 1 && <NowStep draft={draft} update={update} />}
          {step === 2 && <PromptsStep draft={draft} setAnswer={setAnswer} />}
          {step === 3 && <QuoteStep draft={draft} update={update} />}
          {step === 4 && (
            <PhotoConsentStep
              draft={draft}
              update={update}
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
        </div>

        {error && (
          <p
            className="mt-5 rounded-[var(--radius-btn)] bg-[var(--color-danger)]/10 p-3 text-[var(--color-danger)]"
            style={T.body}
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap-reverse items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className={BTN_SECONDARY}
              style={T.body}
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {last ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={busy}
              aria-busy={busy}
              className={`${BTN_PRIMARY} w-full sm:w-auto`}
              style={BTN_PRIMARY_STYLE}
            >
              {busy ? "Sending…" : "Send my story"}
            </button>
          ) : (
            <button type="button" onClick={onNext} className={BTN_PRIMARY} style={BTN_PRIMARY_STYLE}>
              Next: {STEPS[step + 1].title.toLowerCase()}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
