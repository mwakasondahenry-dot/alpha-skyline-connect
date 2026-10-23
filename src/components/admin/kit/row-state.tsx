/** The provider for per-row list state; the type and hook are in ./row-state-context. */
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { RowStateContext } from "./row-state-context";

export function RowStateProvider({ children }: { children: ReactNode }) {
  const [busy, setBusySet] = useState<ReadonlySet<string>>(() => new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<Record<string, number>>({});
  const cards = useRef(new Map<string, HTMLElement>());

  const setBusy = useCallback((id: string, on: boolean) => {
    setBusySet((prev) => {
      if (prev.has(id) === on) return prev;
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const setError = useCallback((id: string, message: string | null) => {
    setErrors((prev) => {
      if ((prev[id] ?? null) === message) return prev;
      const next = { ...prev };
      if (message) next[id] = message;
      else delete next[id];
      return next;
    });
  }, []);
  const flashRow = useCallback((id: string) => {
    setFlash((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);
  const registerCard = useCallback((id: string, el: HTMLElement | null) => {
    if (el) cards.current.set(id, el);
    else cards.current.delete(id);
  }, []);
  const cardEl = useCallback((id: string) => cards.current.get(id), []);

  const value = useMemo(
    () => ({ busy, setBusy, errors, setError, flash, flashRow, registerCard, cardEl }),
    [busy, setBusy, errors, setError, flash, flashRow, registerCard, cardEl],
  );
  return <RowStateContext.Provider value={value}>{children}</RowStateContext.Provider>;
}
