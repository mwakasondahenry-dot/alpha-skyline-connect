/** The fields of the story forms, and the pieces both audiences share. */
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { T } from "@/components/type-roles";
import { ALUMNI_SCHOOLS } from "@/lib/invites/contacts";
import {
  ALUMNI_QUESTION,
  CONSENT_TEXT,
  EMAIL_MAX,
  MESSAGE_MAX,
  NAME_MAX,
  PHONE_MAX,
  PHOTO_ACCEPT,
  PHOTO_MAX_BYTES,
  ROLE_MAX,
  type StoryDraft,
} from "@/lib/story/fields";
import { BTN_SECONDARY, CountedTextArea, FieldLabel, TextField } from "./field-ui";

/** A local preview of the chosen photo. Nothing is uploaded until Send. */
export function usePreviewUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

/** The chosen photo, with the client-side size check. */
export function usePhoto() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const onPickPhoto = useCallback((file: File | null) => {
    setPhotoError(null);
    if (file && file.size > PHOTO_MAX_BYTES) {
      setPhoto(null);
      setPhotoError("That photo is larger than 5 MB. Please choose a smaller one.");
      return;
    }
    setPhoto(file);
  }, []);
  return { photo, photoError, onPickPhoto };
}

export function SchoolChoice({
  legend,
  name,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <fieldset>
      <legend>
        <FieldLabel required>{legend}</FieldLabel>
      </legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {ALUMNI_SCHOOLS.map((s) => (
          <label
            key={s.value}
            className="flex min-h-[var(--btn-primary-min-h)] cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-deep-blue)]/15 bg-[var(--color-off-white)] px-4 has-[:checked]:border-[var(--color-bright-blue)] has-[:checked]:bg-[var(--color-surface-muted)]"
            style={T.body}
          >
            <input
              type="radio"
              name={name}
              value={s.value}
              checked={value === s.value}
              onChange={() => onChange(s.value)}
              className="h-5 w-5 shrink-0 accent-[var(--color-bright-blue)]"
            />
            {s.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * The one question, with the answer box. The question is the label, so the
 * person sees exactly what they are answering, and the hint says where the
 * answer goes.
 */
export function QuestionField({
  question,
  hint,
  value,
  onChange,
}: {
  question: string;
  hint: string;
  value: string;
  onChange: (quote: string) => void;
}) {
  return (
    <div>
      <CountedTextArea
        id="quote"
        label={question}
        required
        value={value}
        onChange={onChange}
        max={MESSAGE_MAX}
        rows={4}
      />
      <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
        {hint}
      </p>
    </div>
  );
}

/** The alumni form: four short facts and the question. */
export function AlumniFields({
  draft,
  update,
}: {
  draft: StoryDraft;
  update: (patch: Partial<StoryDraft>) => void;
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
        legend="School you attended"
        name="school"
        value={draft.schoolSlug}
        onChange={(schoolSlug) => update({ schoolSlug })}
      />
      <TextField
        label="Year you finished"
        required
        numeric
        placeholder="2018"
        value={draft.gradYear}
        onChange={(gradYear) => update({ gradYear })}
      />
      <TextField
        label="What you do now"
        required
        placeholder="Pilot, Precision Air"
        value={draft.role}
        onChange={(role) => update({ role })}
        maxLength={ROLE_MAX}
      />
      {/* For the alumni network, not for the website. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Email"
          required
          type="email"
          value={draft.email}
          onChange={(email) => update({ email })}
          maxLength={EMAIL_MAX}
          autoComplete="email"
        />
        <TextField
          label="Phone / WhatsApp"
          required
          type="tel"
          placeholder="+255 7xx xxx xxx"
          value={draft.phone}
          onChange={(phone) => update({ phone })}
          maxLength={PHONE_MAX}
          autoComplete="tel"
        />
      </div>
      <p className="-mt-2 text-[var(--color-ink-soft)]" style={T.body}>
        Your email and phone are for the alumni network only. They are never published.
      </p>
      <QuestionField
        question={ALUMNI_QUESTION}
        hint="One or two sentences. This is published next to your name, school and year."
        value={draft.quote}
        onChange={(quote) => update({ quote })}
      />
    </div>
  );
}

export function PhotoConsentStep({
  consent,
  onConsent,
  consentText = CONSENT_TEXT,
  photo,
  photoError,
  onPickPhoto,
  lostOnReload = false,
}: {
  consent: boolean;
  onConsent: (consent: boolean) => void;
  /** The exact wording agreed to. Stored with the submission. */
  consentText?: string;
  photo: File | null;
  photoError: string | null;
  onPickPhoto: (file: File | null) => void;
  /** The draft came back from storage, so any photo chosen before is gone. */
  lostOnReload?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const preview = usePreviewUrl(photo);

  function clearPhoto() {
    onPickPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Photo (optional)</FieldLabel>
        {preview && (
          <img
            width={128}
            height={128}
            loading="lazy"
            src={preview}
            alt="Your chosen photo"
            className="mt-2 aspect-square w-32 rounded-xl object-cover ring-1 ring-[var(--color-deep-blue)]/10"
          />
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label
            className={`${BTN_SECONDARY} cursor-pointer focus-within:ring-2 focus-within:ring-[var(--color-bright-blue)]`}
            style={T.body}
          >
            <Upload className="h-4 w-4" aria-hidden />
            {photo ? "Choose a different photo" : "Choose a photo"}
            <input
              ref={fileRef}
              type="file"
              accept={PHOTO_ACCEPT}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onPickPhoto(file);
                if (!file && fileRef.current) fileRef.current.value = "";
              }}
            />
          </label>
          {photo && (
            <button
              type="button"
              onClick={clearPhoto}
              className="text-[var(--color-deep-blue)] underline underline-offset-2 hover:text-[var(--color-bright-blue)]"
              style={T.body}
            >
              Remove photo
            </button>
          )}
        </div>
        <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
          {lostOnReload && !photo
            ? "If you chose a photo before the page reloaded, choose it again. JPEG, PNG or WebP, up to 5 MB."
            : "A clear photo of you. JPEG, PNG or WebP, up to 5 MB."}
        </p>
        {photoError && (
          <p className="mt-2 text-[var(--color-danger)]" style={T.body} role="alert">
            {photoError}
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-[var(--radius-btn)] bg-[var(--color-surface-muted)] p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => onConsent(e.target.checked)}
          required
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-bright-blue)]"
        />
        <span className="text-[var(--color-ink)]" style={T.body}>
          {consentText}
        </span>
      </label>
    </div>
  );
}
