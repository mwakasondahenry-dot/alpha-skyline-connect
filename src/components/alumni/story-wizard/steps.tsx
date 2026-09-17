/** The bodies of the seven wizard steps. State lives in StoryWizard. */
import { useRef } from "react";
import { Upload, X } from "lucide-react";
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

export function WelcomeStep({ greetingName }: { greetingName: string | null }) {
  return (
    <div className="space-y-3">
      <p className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
        Hi {greetingName ?? "there"} 👋
      </p>
      <Body>
        Alpha Schools would love to feature your story on our alumni page. It takes about 5
        minutes, and you can go back to change any answer before you send it.
      </Body>
      <Body>A member of staff reads every story before anything is published.</Body>
    </div>
  );
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
      <Body>All optional. Answer the ones you like. These help us know you; they are not published.</Body>
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
        Sum up what Alpha means to you in a sentence or two. <strong>This is the part we publish</strong>,
        with your name.
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

  function clearPhoto() {
    onPickPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Photo (optional)</FieldLabel>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className={`${BTN_SECONDARY} cursor-pointer`} style={T.body}>
            <Upload className="h-4 w-4" aria-hidden />
            {photo ? "Change photo" : "Choose a photo"}
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
            <span className="inline-flex min-w-0 items-center gap-2 text-[var(--color-ink-soft)]" style={T.body}>
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
  const school = ALUMNI_SCHOOLS.find((s) => s.value === draft.schoolSlug)?.label ?? "";
  const answered = STORY_PROMPTS.filter((p) => draft.answers[p.key].trim());

  const sections: { step: number; title: string; lines: string[] }[] = [
    {
      step: 1,
      title: "About you",
      lines: [draft.fullName.trim(), school, `Class of ${draft.gradYear}`],
    },
    {
      step: 2,
      title: "Where you are now",
      lines: [draft.role, draft.company, draft.cityCountry].map((s) => s.trim()).filter(Boolean),
    },
    {
      step: 3,
      title: "Your story",
      lines: answered.length
        ? answered.map((p) => `${p.label}: ${draft.answers[p.key].trim()}`)
        : ["No answers — that's fine."],
    },
    { step: 4, title: "Your quote", lines: [draft.quote.trim()] },
    {
      step: 5,
      title: "Photo",
      lines: [
        photo
          ? photo.name
          : photoLostOnReload
            ? "No photo attached. If you chose one before the page reloaded, please choose it again."
            : "No photo",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <Body>Check your answers, then send your story.</Body>
      <dl className="divide-y divide-[var(--color-deep-blue)]/10">
        {sections.map((s) => (
          <div key={s.title} className="py-3">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[var(--color-deep-blue)]" style={T.label}>
                {s.title}
              </dt>
              <button
                type="button"
                onClick={() => onEdit(s.step)}
                className="text-[var(--color-bright-blue)] underline underline-offset-2"
                style={T.label}
              >
                Edit
              </button>
            </div>
            {s.lines.map((line, i) => (
              <dd key={i} className="mt-1 whitespace-pre-line break-words text-[var(--color-ink)]" style={T.body}>
                {line}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </div>
  );
}
