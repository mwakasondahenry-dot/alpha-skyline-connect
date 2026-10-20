/**
 * Admission form answers, kept in this browser's localStorage only, so a
 * closed tab does not lose them. Nothing is sent anywhere. Drafts expire
 * after a week (see readDraft).
 *
 * Loaded in an effect, not in useState's initialiser, because the route is
 * server-rendered and localStorage does not exist there. Every storage call
 * is wrapped: storage can be blocked, full or missing.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { FORMS, type FormDef } from "@/lib/admission-forms/forms";
import {
  draftKey,
  isStaleDraft,
  readDraft,
  type Answers,
  type Draft,
} from "@/lib/admission-forms/answers";

/** Removes every expired or corrupt saved draft, for all four forms. Safe to call anywhere on the client. */
export function sweepStaleDrafts(): void {
  const now = Date.now();
  for (const f of FORMS) {
    try {
      const key = draftKey(f.id);
      if (isStaleDraft(localStorage.getItem(key), f.id, now)) localStorage.removeItem(key);
    } catch {
      /* Storage blocked: nothing to sweep. */
    }
  }
}

export function useFormDraft(form: FormDef): {
  answers: Answers;
  setAnswer(key: string, v: string): void;
  clear(): void;
  restored: boolean;
} {
  const [answers, setAnswers] = useState<Answers>({});
  const [restored, setRestored] = useState(false);
  /* Only a change the parent made is saved; loading or clearing is not. */
  const dirty = useRef(false);
  const key = draftKey(form.id);

  useEffect(() => {
    dirty.current = false;
    let saved: Answers = {};
    try {
      const raw = localStorage.getItem(key);
      const now = Date.now();
      saved = readDraft(raw, form.id, now);
      if (isStaleDraft(raw, form.id, now)) localStorage.removeItem(key);
    } catch {
      /* Storage blocked: start fresh. */
    }
    setAnswers(saved);
    setRestored(Object.values(saved).some((v) => v.trim() !== ""));
  }, [key, form.id]);

  useEffect(() => {
    if (!dirty.current) return;
    const draft: Draft = { formId: form.id, savedAt: Date.now(), answers };
    try {
      localStorage.setItem(key, JSON.stringify(draft));
    } catch {
      /* Storage full or blocked: the draft just isn't kept. */
    }
  }, [answers, key, form.id]);

  const setAnswer = useCallback((field: string, v: string) => {
    dirty.current = true;
    setAnswers((a) => ({ ...a, [field]: v }));
  }, []);

  const clear = useCallback(() => {
    dirty.current = false;
    try {
      localStorage.removeItem(key);
    } catch {
      /* Nothing to remove. */
    }
    setAnswers({});
    setRestored(false);
  }, [key]);

  return { answers, setAnswer, clear, restored };
}
