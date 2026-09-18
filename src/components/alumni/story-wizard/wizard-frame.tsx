/**
 * The frame both story wizards share: named steps, Back/Next, the error
 * line, submit, and the result cards. Each wizard supplies its steps, their
 * checks, the step bodies and the submit call.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { T } from "@/components/type-roles";
import type { StorySubmissionResult } from "@/lib/alumni.functions";
import { BTN_PRIMARY, BTN_PRIMARY_STYLE, BTN_SECONDARY, CARD } from "./field-ui";
import { MessageCard } from "./story-shell";

export type FrameStep = {
  title: string;
  short: string;
  /** Returns the first problem with this step, or null. */
  check?: () => string | null;
};

const BodyText = ({ children }: { children: ReactNode }) => (
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
        It may have expired, or the school may have sent you a newer one. Contact the school and we
        will send you a fresh link.
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

export function DoneCard() {
  return (
    <MessageCard title="Thank you. Your story is with us.">
      <HomeLink />
    </MessageCard>
  );
}

/**
 * Where the reader is. Named steps on wider screens, where they fit and
 * show what is still to come; a single line on phones.
 */
function StepIndicator({ steps, step }: { steps: FrameStep[]; step: number }) {
  return (
    <>
      <p className="text-[var(--color-ink-soft)] sm:hidden" style={T.body}>
        Step {step + 1} of {steps.length}
      </p>
      <ol
        className="hidden gap-1 sm:grid"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        aria-label="Steps"
      >
        {steps.map((s, i) => (
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

export function StoryWizardFrame({
  intro,
  steps,
  renderStep,
  submit,
  onSent,
}: {
  intro: string;
  steps: FrameStep[];
  renderStep: (index: number, goTo: (index: number) => void) => ReactNode;
  submit: () => Promise<StorySubmissionResult>;
  /** Called once the story is stored, or found to be stored already. */
  onSent: () => void;
}) {
  const [step, setStep] = useState(0);
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
    const problem = steps[step].check?.() ?? null;
    if (problem) {
      setError(problem);
      return;
    }
    goTo(step + 1);
  }

  async function onSubmit() {
    /* Re-check everything; jump to the first step with a problem. */
    for (let i = 0; i < steps.length; i++) {
      const problem = steps[i].check?.() ?? null;
      if (problem) {
        goTo(i);
        setError(problem);
        return;
      }
    }

    setBusy(true);
    setError(null);
    try {
      const res = await submit();
      if (res.ok) {
        onSent();
        setResult("done");
      } else {
        if (res.state === "submitted") onSent();
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

  const last = step === steps.length - 1;

  return (
    <>
      <p className="max-w-[60ch] text-[var(--color-ink-soft)]" style={T.body}>
        {intro}
      </p>

      <div className={`${CARD} mt-[var(--space-block-y)]`}>
        <StepIndicator steps={steps} step={step} />

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 font-display text-[var(--color-deep-blue)] focus:outline-none"
          style={T.cardTitle}
        >
          {steps[step].title}
        </h2>

        <div className="mt-4">{renderStep(step, goTo)}</div>

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
            <button
              type="button"
              onClick={onNext}
              className={BTN_PRIMARY}
              style={BTN_PRIMARY_STYLE}
            >
              Next: {steps[step + 1].title.toLowerCase()}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
