/**
 * The clocks behind the admin kit, kept free of React so they can be tested
 * with fake timers. The components in this folder wrap them in hooks.
 */
import { friendlyError } from "@/lib/admin/errors";

/** A spinner appears only once work has run this long; the label changes at once. */
export const SPINNER_DELAY_MS = 300;
/** An outcome line clears itself after this long, unless it is hovered or focused. */
export const OUTCOME_CLEAR_MS = 8000;

/**
 * A boolean that turns on only after `delayMs` of being asked to, and turns
 * off at once. `set(true)` while already pending or on does not restart the
 * wait, so a re-render cannot hold a spinner back forever.
 */
export function createDelayedFlag(onChange: (on: boolean) => void, delayMs = SPINNER_DELAY_MS) {
  let on = false;
  let pending: ReturnType<typeof setTimeout> | null = null;

  function cancel() {
    if (pending !== null) clearTimeout(pending);
    pending = null;
  }

  return {
    set(want: boolean) {
      if (want) {
        if (on || pending !== null) return;
        pending = setTimeout(() => {
          pending = null;
          on = true;
          onChange(true);
        }, delayMs);
        return;
      }
      cancel();
      if (on) {
        on = false;
        onChange(false);
      }
    },
    dispose: cancel,
  };
}

export type OutcomeInput = {
  /** One plain sentence, e.g. "Published Keith's story." */
  text: string;
  /** Reverses the action. Runs at most once. A rejection is shown in plain language. */
  undo?: () => Promise<void>;
  /** A follow-up, e.g. { to: "/testimonials", label: "View on site" }. */
  link?: { to: string; label: string };
};

export type Outcome = OutcomeInput & {
  /** New for every `show()`, so the same text shown twice still re-announces and re-enters. */
  id: number;
  /** "error" stays until dismissed; "info" clears itself. */
  tone: "info" | "error";
  /** True while Undo is running. */
  undoing: boolean;
};

/**
 * One outcome at a time. A newer outcome replaces the older one. The store
 * outlives any one screen (it lives in the admin shell), so a screen can call
 * `show()` and then navigate away.
 */
export function createOutcomeStore({
  clearAfterMs = OUTCOME_CLEAR_MS,
  describeError = friendlyError,
}: { clearAfterMs?: number; describeError?: (err: unknown) => string } = {}) {
  let state: Outcome | null = null;
  let nextId = 1;
  let paused = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  function emit() {
    for (const l of listeners) l();
  }
  function stopClock() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }
  function startClock() {
    stopClock();
    if (!state || paused || state.undoing || state.tone === "error") return;
    timer = setTimeout(() => {
      timer = null;
      state = null;
      emit();
    }, clearAfterMs);
  }
  function set(next: Outcome | null) {
    state = next;
    startClock();
    emit();
  }

  return {
    get: (): Outcome | null => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    show(input: OutcomeInput) {
      // A new outcome mounts a new line, which the pointer or focus that
      // paused the old one is no longer on.
      paused = false;
      set({ ...input, id: nextId++, tone: "info", undoing: false });
    },
    clear() {
      paused = false;
      set(null);
    },
    /** Hold the outcome while the pointer or focus is on it. */
    pause() {
      paused = true;
      stopClock();
    },
    /** Let go: the outcome gets a fresh full interval, not the remainder. */
    resume() {
      paused = false;
      startClock();
    },
    async undo(): Promise<void> {
      const current = state;
      if (!current?.undo || current.undoing) return;
      const run = current.undo;
      const id = current.id;
      set({ ...current, undoing: true });
      try {
        await run();
        if (state?.id === id) set({ id, text: "Undone.", tone: "info", undoing: false });
      } catch (err) {
        if (state?.id === id) set({ id, text: describeError(err), tone: "error", undoing: false });
      }
    },
    dispose: stopClock,
  };
}

export type OutcomeStore = ReturnType<typeof createOutcomeStore>;
