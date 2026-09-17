/**
 * Wizard answers, kept in localStorage so a closed tab or a dropped
 * connection does not lose them. Consent is never restored: it is given
 * fresh each time. The photo is not stored at all.
 *
 * Loaded in an effect, not in useState's initialiser, because the general
 * route is server-rendered and localStorage does not exist there.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { PromptKey, StoryDraft } from "@/lib/story/fields";

export function useStoryDraft(storageKey: string, initial: StoryDraft) {
  const [draft, setDraft] = useState<StoryDraft>(initial);
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<StoryDraft>;
        setDraft((d) => ({
          ...d,
          ...saved,
          answers: { ...d.answers, ...(saved.answers ?? {}) },
          consent: false,
        }));
        setRestored(true);
      }
    } catch {
      /* Storage blocked or corrupt: start fresh. */
    }
    loaded.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      const { consent: _consent, ...rest } = draft;
      localStorage.setItem(storageKey, JSON.stringify(rest));
    } catch {
      /* Storage full or blocked: the draft just isn't kept. */
    }
  }, [draft, storageKey]);

  const update = useCallback((patch: Partial<StoryDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const setAnswer = useCallback((key: PromptKey, value: string) => {
    setDraft((d) => ({ ...d, answers: { ...d.answers, [key]: value } }));
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* Nothing to clear. */
    }
  }, [storageKey]);

  return { draft, update, setAnswer, clear, restored };
}
