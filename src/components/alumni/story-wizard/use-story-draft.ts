/**
 * Wizard answers, kept in localStorage so a closed tab or a dropped
 * connection does not lose them. Consent is never restored: it is given
 * fresh each time. The photo is not stored at all.
 *
 * Loaded in an effect, not in useState's initialiser, because the general
 * routes are server-rendered and localStorage does not exist there.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type DraftShape = { consent: boolean; answers: Record<string, string> };

export function useStoryDraft<D extends DraftShape>(storageKey: string, initial: D) {
  const [draft, setDraft] = useState<D>(initial);
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<D>;
        setDraft(
          (d) =>
            ({
              ...d,
              ...saved,
              answers: { ...d.answers, ...(saved.answers ?? {}) },
              consent: false,
            }) as D,
        );
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

  /* Spreading a generic loses its type in TypeScript; the casts restore it. */
  const update = useCallback((patch: Partial<D>) => {
    setDraft((d) => ({ ...d, ...patch }) as D);
  }, []);

  const setAnswer = useCallback((key: string, value: string) => {
    setDraft((d) => ({ ...d, answers: { ...d.answers, [key]: value } }) as D);
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
