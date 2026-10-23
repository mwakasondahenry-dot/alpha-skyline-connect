/**
 * Per-row state shared by a list and its detail: which rows are busy, the
 * plain-language error on each, the gold flash after a change, and the card
 * elements (so a detail can make its card leave the list). The provider is in
 * ./row-state; it sits in a list-and-detail layout, above both.
 */
import { createContext, useContext } from "react";

export type RowState = {
  busy: ReadonlySet<string>;
  setBusy: (id: string, on: boolean) => void;
  errors: Readonly<Record<string, string>>;
  setError: (id: string, message: string | null) => void;
  /** A value per row that changes whenever the row should flash gold. */
  flash: Readonly<Record<string, number>>;
  flashRow: (id: string) => void;
  registerCard: (id: string, el: HTMLElement | null) => void;
  cardEl: (id: string) => HTMLElement | undefined;
};

export const RowStateContext = createContext<RowState | null>(null);

export function useRowState(): RowState {
  const ctx = useContext(RowStateContext);
  if (!ctx) throw new Error("useRowState must be used inside <RowStateProvider>");
  return ctx;
}
