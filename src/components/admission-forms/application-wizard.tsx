/**
 * The online admission form: four steps in the testimonial wizard's style,
 * ending in a filled PDF the parent prints, signs and brings to the school.
 * Everything stays in this browser. pdf-lib is loaded only when the parent
 * presses Download, so it never reaches phones or the Admission page.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { T } from "@/components/type-roles";
import {
  BTN_PRIMARY,
  BTN_PRIMARY_STYLE,
  BTN_SECONDARY,
  CARD,
} from "@/components/alumni/story-wizard/field-ui";
import { MessageCard } from "@/components/alumni/story-wizard/story-shell";
import { StepIndicator } from "@/components/alumni/story-wizard/wizard-frame";
import type { FormDef } from "@/lib/admission-forms/forms";
import { downloadProblem, pdfFileName, type Answers } from "@/lib/admission-forms/answers";
import { WIZARD_STEPS } from "./steps";
import { useFormDraft } from "./use-form-draft";
import { CheckStep, FieldsStep } from "./wizard-fields";

const BODY = "max-w-[60ch] text-[var(--color-ink-soft)]";

async function saveFilledPdf(form: FormDef, answers: Answers): Promise<void> {
  const [{ renderFormPdf }, crest] = await Promise.all([
    import("@/lib/admission-forms/pdf"),
    fetch(`/forms/crests/${form.crest}`),
  ]);
  if (!crest.ok) throw new Error(`Crest ${crest.status}`);
  const bytes = new Uint8Array(await crest.arrayBuffer());
  const pdf = await renderFormPdf(form, answers, {
    bytes,
    type: form.crest.endsWith(".png") ? "png" : "jpg",
  });

  const url = URL.createObjectURL(new Blob([pdf as BlobPart], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = pdfFileName(form, answers);
  document.body.appendChild(a);
  a.click();
  a.remove();
  /* Give the browser time to start the download before letting go. */
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function ApplicationWizard({ form }: { form: FormDef }) {
  const { answers, setAnswer, clear, restored } = useFormDraft(form);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"downloaded" | "removed" | null>(null);

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
    setDone(null);
    setStep(next);
  }

  function startAgain() {
    clear();
    goTo(0);
  }

  async function onDownload() {
    const problem = downloadProblem(answers);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveFilledPdf(form, answers);
      setDone("downloaded");
    } catch {
      setError(
        "Could not make the PDF. Check your connection and try again, or use the blank form below.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (done === "removed") {
    return (
      <MessageCard title="Your answers are removed from this computer.">
        <Link to="/admission" className={`mt-5 ${BTN_PRIMARY}`} style={BTN_PRIMARY_STYLE}>
          Back to Admissions
        </Link>
      </MessageCard>
    );
  }

  const hasAnswers = Object.values(answers).some((v) => v.trim() !== "");
  const current = WIZARD_STEPS[step];
  const last = step === WIZARD_STEPS.length - 1;

  return (
    <>
      {(restored || hasAnswers) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {restored ? (
            <p className={BODY} style={T.body} role="status">
              We kept your answers from last time on this computer.
            </p>
          ) : (
            <span />
          )}
          <button type="button" onClick={startAgain} className={BTN_SECONDARY} style={T.body}>
            Start again
          </button>
        </div>
      )}

      <div className={`${CARD} ${restored || hasAnswers ? "mt-5" : ""}`}>
        <StepIndicator steps={WIZARD_STEPS} step={step} />

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 font-display text-[var(--color-deep-blue)] focus:outline-none"
          style={T.cardTitle}
        >
          {current.title}
        </h2>

        <div className="mt-4">
          {current.step === "download" ? (
            <CheckStep form={form} answers={answers} goTo={goTo} />
          ) : (
            <FieldsStep
              key={current.step}
              form={form}
              step={current.step}
              answers={answers}
              setAnswer={setAnswer}
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

        {last && done === "downloaded" && (
          <div
            className="mt-5 rounded-[var(--radius-btn)] bg-[var(--color-surface-muted)] p-4"
            role="status"
          >
            <p className="text-[var(--color-ink)]" style={T.body}>
              Your form is downloaded. Print it, sign Part D, attach a passport photo and bring it
              to the school with the application fee.
            </p>
            <button
              type="button"
              onClick={() => {
                clear();
                setDone("removed");
              }}
              className={`mt-4 ${BTN_SECONDARY}`}
              style={T.body}
            >
              Remove my answers from this computer
            </button>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              Do this if you are on a shared or office computer.
            </p>
          </div>
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
              onClick={onDownload}
              disabled={busy}
              aria-busy={busy}
              className={BTN_PRIMARY}
              style={BTN_PRIMARY_STYLE}
            >
              {busy ? "Making your PDF…" : "Download PDF"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo(step + 1)}
              className={BTN_PRIMARY}
              style={BTN_PRIMARY_STYLE}
            >
              Next: {WIZARD_STEPS[step + 1].title.toLowerCase()}
            </button>
          )}
        </div>
      </div>

      <p className={`mt-5 ${BODY}`} style={T.body}>
        Prefer paper?{" "}
        <a
          href={form.blankPdfPath}
          download
          className="text-[var(--color-bright-blue)] underline underline-offset-2 hover:text-[var(--color-deep-blue)]"
        >
          Download the blank form
        </a>{" "}
        and fill it in by hand.
      </p>
    </>
  );
}
