/** The outcome store's context and hook; the provider is in ./outcome. */
import { createContext, useContext, useMemo } from "react";
import type { OutcomeInput, OutcomeStore } from "./timers";

export type { OutcomeInput } from "./timers";

export const OutcomeContext = createContext<OutcomeStore | null>(null);

/**
 * `show()` replaces whatever outcome is on screen. Call it after the action
 * has succeeded; failures belong on the card that failed, not here.
 */
export function useOutcome(): { show: (o: OutcomeInput) => void; clear: () => void } {
  const store = useContext(OutcomeContext);
  if (!store) throw new Error("useOutcome must be used inside <OutcomeProvider>");
  return useMemo(() => ({ show: store.show, clear: store.clear }), [store]);
}
