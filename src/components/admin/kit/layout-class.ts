/**
 * Classes for the list-beside-detail screens (Stories, Inbox): the tab strip,
 * the two-column grid from 1024px, and the detail panel beside the list.
 */
export const adminTabListClass =
  "-mx-4 flex overflow-x-auto border-b border-[var(--color-hairline)] px-4 sm:mx-0 sm:px-0";

export const adminTabTriggerClass =
  "-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-deep-blue)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-gold)] data-[state=active]:border-[var(--color-deep-blue)] data-[state=active]:text-[var(--color-deep-blue)] sm:px-4";

export const adminListDetailGridClass =
  "mt-5 lg:grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-6";

export const adminDetailPanelClass =
  "lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:rounded-[var(--radius-card)] lg:border lg:border-[var(--color-hairline)] lg:bg-[var(--color-surface)] lg:shadow-[var(--shadow-card)]";
