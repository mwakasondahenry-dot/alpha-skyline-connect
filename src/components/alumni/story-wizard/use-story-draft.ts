/**
 * Form answers, kept in localStorage so a closed tab or a dropped
 * connection does not lose them. Consent is never restored: it is given
 * fresh each time. The photo is not stored at all.
 *
 * Loaded in an effect, not in useState's initialiser, because the general
 * routes are server-rendered and localStorage does not exist there.
 *
 * Only keys the current draft shape has are restored, so a draft saved by
 * the longer form this one replaced cannot smuggle old fields back in.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type DraftShape = { consent: boolean };

export function useStoryDraft<D extends DraftShape>(storageKey: string, initial: D) {
  const [draft, setDraft] = useState<D>(initial);
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, unknown>;
        /* An empty draft (every field blank) is not a restore: the person
           never typed anything, so no "choose your photo again" note. */
        const typed = Object.keys(initial).some(
          (key) => typeof saved[key] === "string" && (saved[key] as string).trim() !== "",
        );
        if (typed) {
          setDraft((d) => {
            const next: Record<string, unknown> = { ...d };
            for (const key of Object.keys(d)) {
              if (typeof saved[key] === "string") next[key] = saved[key];
            }
            next.consent = false;
            return next as D;
          });
          setRestored(true);
        }
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

  /* Spreading a generic loses its type in TypeScript; the cast restores it. */
  const update = useCallback((patch: Partial<D>) => {
    setDraft((d) => ({ ...d, ...patch }) as D);
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* Nothing to clear. */
    }
  }, [storageKey]);

  return { draft, update, clear, restored };
}
