/** The bodies of the six wizard steps. State lives in StoryWizard. */
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { T } from "@/components/type-roles";
import { ALUMNI_SCHOOLS } from "@/lib/invites/contacts";
import {
  CONSENT_TEXT,
  COMPANY_MAX,
  MESSAGE_MAX,
  NAME_MAX,
  PHOTO_ACCEPT,
  PLACE_MAX,
  PROMPT_MAX,
  ROLE_MAX,
  STORY_PROMPTS,
  type PromptKey,
  type StoryDraft,
} from "@/lib/story/fields";
import { BTN_SECONDARY, CountedTextArea, FieldLabel, TextField } from "./field-ui";

type DraftProps = {
  draft: StoryDraft;
  update: (patch: Partial<StoryDraft>) => void;
};

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--color-ink-soft)]" style={T.body}>
      {children}
    </p>
  );
}

/** A local preview of the chosen photo. Nothing is uploaded until Send. */
function usePreviewUrl(file: File | null): string | null {
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

export function AboutStep({ draft, update }: DraftProps) {
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
      <fieldset>
        <legend>
          <FieldLabel required>School you attended</FieldLabel>
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
                name="school"
                value={s.value}
                checked={draft.schoolSlug === s.value}
                onChange={() => update({ schoolSlug: s.value })}
                className="h-5 w-5 shrink-0 accent-[var(--color-bright-blue)]"
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
      <TextField
        label="Year you finished"
        required
        numeric
        placeholder="2018"
        value={draft.gradYear}
        onChange={(gradYear) => update({ gradYear })}
      />
    </div>
  );
}

export function NowStep({ draft, update }: DraftProps) {
  return (
    <div className="space-y-5">
      <TextField
        label="What you do now (job or studies)"
        required
        placeholder="Software engineer"
        value={draft.role}
        onChange={(role) => update({ role })}
        maxLength={ROLE_MAX}
      />
      <TextField
        label="Company, organisation or university"
        value={draft.company}
        onChange={(company) => update({ company })}
        maxLength={COMPANY_MAX}
      />
      <TextField
        label="City and country"
        placeholder="Dar es Salaam, Tanzania"
        value={draft.cityCountry}
        onChange={(cityCountry) => update({ cityCountry })}
        maxLength={PLACE_MAX}
      />
    </div>
  );
}

export function PromptsStep({
  draft,
  setAnswer,
}: {
  draft: StoryDraft;
  setAnswer: (key: PromptKey, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Body>
        Answer any you like, or none. These are for the school to read and are not published.
      </Body>
      {STORY_PROMPTS.map((p) => (
        <CountedTextArea
          key={p.key}
          id={`prompt-${p.key}`}
          label={p.label}
          value={draft.answers[p.key]}
          onChange={(value) => setAnswer(p.key, value)}
          max={PROMPT_MAX}
          rows={3}
        />
      ))}
    </div>
  );
}

export function QuoteStep({ draft, update }: DraftProps) {
  return (
    <div className="space-y-4">
      <Body>
        In a sentence or two, what did Alpha mean to you? This is the part we publish, next to
        your name.
      </Body>
      <CountedTextArea
        id="quote"
        label="Your quote"
        required
        value={draft.quote}
        onChange={(quote) => update({ quote })}
        max={MESSAGE_MAX}
        rows={5}
      />
    </div>
  );
}

export function PhotoConsentStep({
  draft,
  update,
  photo,
  photoError,
  onPickPhoto,
}: DraftProps & {
  photo: File | null;
  photoError: string | null;
  onPickPhoto: (file: File | null) => void;
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
          A clear photo of you. JPEG, PNG or WebP, up to 5 MB.
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
          checked={draft.consent}
          onChange={(e) => update({ consent: e.target.checked })}
          required
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-bright-blue)]"
        />
        <span className="text-[var(--color-ink)]" style={T.body}>
          {CONSENT_TEXT}
        </span>
      </label>
    </div>
  );
}

type ReviewItem = { label?: string; value: string };

export function ReviewStep({
  draft,
  photo,
  photoLostOnReload,
  onEdit,
}: {
  draft: StoryDraft;
  photo: File | null;
  photoLostOnReload: boolean;
  onEdit: (step: number) => void;
}) {
  const preview = usePreviewUrl(photo);
  const school = ALUMNI_SCHOOLS.find((s) => s.value === draft.schoolSlug)?.label ?? "";
  const answered = STORY_PROMPTS.filter((p) => draft.answers[p.key].trim());
  const now = [draft.role, draft.company, draft.cityCountry].map((s) => s.trim()).filter(Boolean);

  const sections: { step: number; title: string; items: ReviewItem[] }[] = [
    {
      step: 0,
      title: "About you",
      items: [{ value: `${draft.fullName.trim()}, ${school}, class of ${draft.gradYear}` }],
    },
    { step: 1, title: "Where you are now", items: [{ value: now.join(", ") }] },
    {
      step: 2,
      title: "Your story",
      items: answered.length
        ? answered.map((p) => ({ label: p.label, value: draft.answers[p.key].trim() }))
        : [{ value: "Not answered." }],
    },
    { step: 3, title: "Your quote", items: [{ value: draft.quote.trim() }] },
    {
      step: 4,
      title: "Photo",
      items: photo
        ? []
        : [
            {
              value: photoLostOnReload
                ? "No photo attached. If you chose one before the page reloaded, choose it again."
                : "No photo.",
            },
          ],
    },
  ];

  return (
    <dl className="divide-y divide-[var(--color-deep-blue)]/10 border-y border-[var(--color-deep-blue)]/10">
      {sections.map((s) => (
        <div key={s.title} className="py-4">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[var(--color-deep-blue)]" style={T.label}>
              {s.title}
            </dt>
            <button
              type="button"
              onClick={() => onEdit(s.step)}
              aria-label={`Change ${s.title.toLowerCase()}`}
              className="text-[var(--color-bright-blue)] underline underline-offset-2 hover:text-[var(--color-deep-blue)]"
              style={T.body}
            >
              Change
            </button>
          </div>
          {s.step === 4 && preview && (
            <dd className="mt-2">
              <img
                src={preview}
                alt="Your chosen photo"
                className="aspect-square w-20 rounded-lg object-cover ring-1 ring-[var(--color-deep-blue)]/10"
              />
            </dd>
          )}
          {s.items.map((item, i) => (
            <dd key={i} className={i === 0 ? "mt-1" : "mt-3"}>
              {item.label && (
                <span className="block text-[var(--color-ink-soft)]" style={T.body}>
                  {item.label}
                </span>
              )}
              <span
                className="block whitespace-pre-line break-words text-[var(--color-ink)]"
                style={T.body}
              >
                {item.value}
              </span>
            </dd>
          ))}
        </div>
      ))}
    </dl>
  );
}
