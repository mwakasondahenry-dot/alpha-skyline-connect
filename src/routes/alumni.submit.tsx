/**
 * Unlisted alumni submission form.
 *
 * Not in the navigation and marked noindex — it is shared by link. That is
 * also why it is rate limited server-side: a link-only form is public the
 * moment anyone forwards it.
 *
 * One page, not a wizard. Six fields on a phone is faster in one pass, and
 * the audience is on mid-range Android over mobile data.
 *
 * Nothing here is a security control. The size cap, the image check and the
 * character limit are repeated on the client so a mistake is caught before a
 * 5 MB upload runs over mobile data; src/lib/alumni.functions.ts is what
 * actually enforces them.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Upload, X } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { T, SHELL } from "@/components/type-roles";
import {
  submitAlumniStory,
  CONSENT_TEXT,
  MESSAGE_MAX,
  PHOTO_MAX_BYTES,
} from "@/lib/alumni.functions";

export const Route = createFileRoute("/alumni/submit")({
  head: () => ({
    meta: [
      { title: "Share your story · Alpha Schools" },
      /* Unlisted: shared by link, kept out of search results. */
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "For Alpha alumni: send us your story for the alumni page.",
      },
    ],
  }),
  component: AlumniSubmitPage,
});

const ACCEPT = "image/jpeg,image/png,image/webp";

const INPUT =
  "mt-2 w-full rounded-xl border border-[var(--color-deep-blue)]/15 " +
  "bg-[var(--color-off-white)] px-4 py-3 text-[var(--color-ink)] " +
  "focus:border-[var(--color-bright-blue)] focus:outline-none";

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <span className="text-[var(--color-deep-blue)]" style={T.label}>
      {children}
      {required && (
        <span aria-hidden className="text-[var(--color-danger)]"> *</span>
      )}
    </span>
  );
}

function AlumniSubmitPage() {
  const [fullName, setFullName] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const remaining = MESSAGE_MAX - message.length;
  const over = remaining < 0;

  function onPickPhoto(file: File | null) {
    setPhotoError(null);
    if (!file) {
      setPhoto(null);
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setPhoto(null);
      if (fileRef.current) fileRef.current.value = "";
      setPhotoError("That photo is larger than 5 MB. Please choose a smaller one.");
      return;
    }
    setPhoto(file);
  }

  function clearPhoto() {
    setPhoto(null);
    setPhotoError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (over) return;
    setError(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.set("full_name", fullName);
      form.set("grad_year", gradYear);
      form.set("role", role);
      form.set("company", company);
      form.set("message", message);
      form.set("consent", consent ? "yes" : "no");
      if (photo) form.set("photo", photo);

      await submitAlumniStory({ data: form });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send your story. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      <main className={`${SHELL} py-[var(--space-section-y)]`}>
        <div className="mx-auto max-w-2xl">
          <p className="text-[var(--color-bright-blue)]" style={T.label}>
            Alpha Alumni
          </p>
          <h1
            className="mt-2 font-display tracking-tight text-[var(--color-deep-blue)]"
            style={T.section}
          >
            Share your story
          </h1>
          <span
            aria-hidden
            className="mt-[var(--heading-rule-gap)] block"
            style={{
              width: "var(--heading-rule-w)",
              height: "var(--heading-rule-h)",
              background: "var(--heading-rule-color)",
              borderRadius: "var(--heading-rule-radius)",
            }}
          />

          {done ? (
            <div
              className="mt-[var(--space-block-y)] rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]"
              role="status"
            >
              <CheckCircle2
                className="h-8 w-8 text-[var(--color-bright-blue)]"
                aria-hidden
              />
              <h2
                className="mt-3 font-display text-[var(--color-deep-blue)]"
                style={T.cardTitle}
              >
                Thank you — we have your story.
              </h2>
              <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
                Someone at the school reads every submission before anything is
                published, so it will not appear on the site straight away. If
                you need to change or withdraw it, contact the school and we
                will take it down.
              </p>
              <Link
                to="/"
                className="mt-5 inline-flex min-h-[var(--btn-primary-min-h)] items-center rounded-[var(--radius-btn)] bg-[var(--color-gold)] px-[var(--btn-primary-pad-x)] font-display text-[var(--color-accent-foreground)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] motion-reduce:transition-none"
                style={{ ...T.body, fontWeight: "var(--btn-primary-weight)" }}
              >
                Back to Alpha Schools
              </Link>
            </div>
          ) : (
            <>
              <p
                className="mt-4 text-[var(--color-ink-soft)]"
                style={T.body}
              >
                If you studied at Alpha, we would like to hear where you have
                got to. A member of staff reads every submission before it is
                published.
              </p>

              <form
                onSubmit={onSubmit}
                className="mt-[var(--space-block-y)] rounded-[var(--radius-card)] bg-[var(--card-bg)] p-[var(--space-card-pad)] shadow-[var(--card-shadow)]"
                noValidate
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <FieldLabel required>Full name</FieldLabel>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      maxLength={120}
                      required
                      className={INPUT}
                      style={T.body}
                    />
                  </label>

                  <label className="block">
                    <FieldLabel required>Year you finished</FieldLabel>
                    <input
                      /* Not type="number": on Android that shows a spinner
                         keyboard and lets the value scroll. inputMode gives
                         the numeric pad without the rest. */
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={gradYear}
                      onChange={(e) =>
                        setGradYear(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder="2018"
                      required
                      className={INPUT}
                      style={T.body}
                    />
                  </label>

                  <label className="block">
                    <FieldLabel>What you do now</FieldLabel>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Software engineer"
                      maxLength={120}
                      className={INPUT}
                      style={T.body}
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <FieldLabel>Company or organisation</FieldLabel>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      maxLength={120}
                      className={INPUT}
                      style={T.body}
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <FieldLabel required>Your message</FieldLabel>
                      <span
                        aria-hidden
                        style={T.label}
                        className={
                          over
                            ? "text-[var(--color-danger)]"
                            : "text-[var(--color-ink-soft)]"
                        }
                      >
                        {remaining}
                      </span>
                    </span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      required
                      aria-describedby="message-count"
                      className={`${INPUT} resize-y`}
                      style={T.body}
                    />
                    {/* The number above is decorative; this is what a screen
                        reader announces, and only as it gets close. */}
                    <span id="message-count" className="sr-only" aria-live="polite">
                      {remaining <= 40
                        ? `${remaining} characters remaining`
                        : ""}
                    </span>
                  </label>
                </div>

                {/* Photo */}
                <div className="mt-5">
                  <FieldLabel>Photo (optional)</FieldLabel>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <label
                      className="inline-flex min-h-[var(--btn-primary-min-h)] cursor-pointer items-center gap-2 rounded-[var(--radius-btn)] border border-[var(--color-deep-blue)]/15 bg-[var(--color-off-white)] px-4 text-[var(--color-deep-blue)] transition-colors duration-150 hover:bg-[var(--color-surface-muted)] motion-reduce:transition-none"
                      style={T.body}
                    >
                      <Upload className="h-4 w-4" aria-hidden />
                      {photo ? "Change photo" : "Choose a photo"}
                      <input
                        ref={fileRef}
                        type="file"
                        accept={ACCEPT}
                        className="sr-only"
                        onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
                      />
                    </label>

                    {photo && (
                      <span
                        className="inline-flex min-w-0 items-center gap-2 text-[var(--color-ink-soft)]"
                        style={T.body}
                      >
                        <span className="truncate">{photo.name}</span>
                        <button
                          type="button"
                          onClick={clearPhoto}
                          aria-label="Remove photo"
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--color-deep-blue)]/15 text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)]"
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[var(--color-ink-soft)]" style={T.label}>
                    JPEG, PNG or WebP · up to 5 MB
                  </p>
                  {photoError && (
                    <p
                      className="mt-2 text-[var(--color-danger)]"
                      style={T.body}
                      role="alert"
                    >
                      {photoError}
                    </p>
                  )}
                </div>

                {/* Consent */}
                <label className="mt-6 flex items-start gap-3 rounded-[var(--radius-btn)] bg-[var(--color-surface-muted)] p-4">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-bright-blue)]"
                  />
                  {/* No asterisk here. The consent wording fills the line at
                      375px, so a trailing marker wrapped onto a line of its
                      own and read as a defect. The input is `required` for
                      assistive tech, and the submit button stays disabled
                      until this is ticked. */}
                  <span className="text-[var(--color-ink)]" style={T.body}>
                    {CONSENT_TEXT}
                  </span>
                </label>

                {error && (
                  <p
                    className="mt-5 rounded-[var(--radius-btn)] bg-[var(--color-danger)]/10 p-3 text-[var(--color-danger)]"
                    style={T.body}
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy || over || !consent}
                  className="mt-6 inline-flex min-h-[var(--btn-primary-min-h)] w-full items-center justify-center rounded-[var(--radius-btn)] bg-[var(--color-gold)] px-[var(--btn-primary-pad-x)] font-display text-[var(--color-accent-foreground)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 motion-reduce:transition-none sm:w-auto"
                  style={{ ...T.body, fontWeight: "var(--btn-primary-weight)" }}
                >
                  {busy ? "Sending…" : "Send my story"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
