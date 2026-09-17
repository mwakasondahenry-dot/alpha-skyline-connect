/**
 * The alumni story wizard, for the general link (code = null) and personal
 * links. Each step's check runs before Next; the server runs all of them
 * again. Nothing is uploaded until Submit, to keep mobile data use down.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
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
  WelcomeStep,
} from "./steps";
import { useStoryDraft } from "./use-story-draft";

type Check = (d: StoryDraft) => string | null;

const STEPS: { title: string; check?: Check }[] = [
  { title: "Welcome" },
  { title: "About you", check: (d) => checkAbout(d) },
  { title: "Where you are now", check: checkNow },
  { title: "Your story", check: checkPrompts },
  { title: "Your quote", check: checkQuote },
  { title: "Photo & consent", check: checkConsent },
  { title: "Review" },
];

const BodyText = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
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
    <MessageCard title="This link isn't valid any more">
      <BodyText>
        It may have expired or been replaced. Please contact the school and we will send you a
        new one.
      </BodyText>
      <Link to="/contact" className={`mt-5 ${BTN_PRIMARY}`} style={BTN_PRIMARY_STYLE}>
        Contact the school
      </Link>
    </MessageCard>
  );
}

export function AlreadyReceivedCard() {
  return (
    <MessageCard
      title="Thank you — we've already received your story."
      icon={<CheckCircle2 className="h-8 w-8 text-[var(--color-bright-blue)]" aria-hidden />}
    >
      <BodyText>If you need to change or withdraw it, contact the school and we will help.</BodyText>
      <HomeLink />
    </MessageCard>
  );
}

function DoneCard() {
  return (
    <MessageCard
      title="Thank you — we have your story."
      icon={<CheckCircle2 className="h-8 w-8 text-[var(--color-bright-blue)]" aria-hidden />}
    >
      <BodyText>
        Someone at the school reads every submission before anything is published, so it will not
        appear on the site straight away. If you need to change or withdraw it, contact the school
        and we will take it down.
      </BodyText>
      <HomeLink />
    </MessageCard>
  );
}

export function StoryWizard({
  code,
  greetingName,
  initial,
}: {
  code: string | null;
  greetingName: string | null;
  initial: StoryDraft;
}) {
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
          : "Could not send your story. Please check your connection and try again.",
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
    <div className={CARD}>
      <p className="text-[var(--color-ink-soft)]" style={T.label}>
        Step {step + 1} of {STEPS.length}
      </p>
      <div
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step + 1}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
      >
        <div
          className="h-full rounded-full bg-[var(--color-bright-blue)] transition-[width] duration-200 motion-reduce:transition-none"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 font-display text-[var(--color-deep-blue)] focus:outline-none"
        style={T.cardTitle}
      >
        {STEPS[step].title}
      </h2>

      <div className="mt-4">
        {step === 0 && <WelcomeStep greetingName={greetingName} />}
        {step === 1 && <AboutStep draft={draft} update={update} />}
        {step === 2 && <NowStep draft={draft} update={update} />}
        {step === 3 && <PromptsStep draft={draft} setAnswer={setAnswer} />}
        {step === 4 && <QuoteStep draft={draft} update={update} />}
        {step === 5 && (
          <PhotoConsentStep
            draft={draft}
            update={update}
            photo={photo}
            photoError={photoError}
            onPickPhoto={onPickPhoto}
          />
        )}
        {step === 6 && (
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
          <button type="button" onClick={() => goTo(step - 1)} className={BTN_SECONDARY} style={T.body}>
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
            className={`${BTN_PRIMARY} w-full sm:w-auto`}
            style={BTN_PRIMARY_STYLE}
          >
            {busy ? "Sending…" : "Send my story"}
          </button>
        ) : (
          <button type="button" onClick={onNext} className={BTN_PRIMARY} style={BTN_PRIMARY_STYLE}>
            {step === 0 ? "Start" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
