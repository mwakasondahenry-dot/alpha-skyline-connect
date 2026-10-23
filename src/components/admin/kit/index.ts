/** The shared admin UI kit. Every admin screen builds from these. */
export { AdminButton, type AdminButtonProps } from "./button";
export { adminButtonClass, adminButtonBase, type AdminButtonVariant } from "./button-class";
export { OutcomeProvider } from "./outcome";
export { useOutcome, type OutcomeInput } from "./outcome-context";
export { ConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog";
export { AdminSheet, type AdminSheetProps } from "./admin-sheet";
export { CountBadge } from "./count-badge";
export { EmptyState } from "./empty-state";
export { ListCard, type ListCardProps } from "./list-card";
export {
  collapseAndRemove,
  restoreCollapsed,
  prefersReducedMotion,
  useDelayedFlag,
} from "./motion";
export { SPINNER_DELAY_MS, OUTCOME_CLEAR_MS } from "./timers";
