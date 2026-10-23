/**
 * The outcome line: one sentence saying what just happened, with Undo and a
 * follow-up link when there is one ("Published Keith's story. View on site ·
 * Undo").
 *
 * <OutcomeProvider> lives in the admin shell, above the routes, so a screen
 * can call `show()` and then navigate away and the line survives. A
 * visually hidden role="status" node is always mounted and carries only the
 * sentence, so screen readers announce every outcome; the visible line and
 * its controls sit outside it. Under reduced motion nothing moves but the
 * words still arrive.
 *
 * Placement: fixed near the bottom on a phone (above the shell's tab bar, set
 * `--admin-outcome-bottom` on an ancestor to move it), top-right from 768px.
 */
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { AdminButton } from "./button";
import { OutcomeContext } from "./outcome-context";
import { createOutcomeStore, type Outcome, type OutcomeStore } from "./timers";

/** Exit fade length; matches `.admin-fade-out` in styles.css. */
const EXIT_MS = 150;

export function OutcomeProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createOutcomeStore());
  useEffect(() => () => store.dispose(), [store]);
  return (
    <OutcomeContext.Provider value={store}>
      {children}
      <OutcomeLine store={store} />
    </OutcomeContext.Provider>
  );
}

function OutcomeLine({ store }: { store: OutcomeStore }) {
  const current = useSyncExternalStore(store.subscribe, store.get, () => null);

  // Keep the last outcome on screen for the 150ms exit after the store clears.
  const [leaving, setLeaving] = useState<Outcome | null>(null);
  const [prev, setPrev] = useState<Outcome | null>(current);
  if (prev !== current) {
    if (prev && !current) setLeaving(prev);
    else if (current) setLeaving(null);
    setPrev(current);
  }
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setLeaving(null), EXIT_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  const shown = current ?? leaving;

  // Focus: remember where it was when an outcome arrived, and if focus is in
  // the line when the line (or its Undo button) goes away, put it back there,
  // or on <main>, rather than letting it fall to <body>.
  const box = useRef<HTMLDivElement>(null);
  const focusInside = useRef(false);
  const returnTo = useRef<HTMLElement | null>(null);
  const currentId = current?.id;

  useLayoutEffect(() => {
    if (currentId === undefined || focusInside.current) return;
    const active = document.activeElement;
    returnTo.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, [currentId]);

  useLayoutEffect(() => {
    if (!focusInside.current) return;
    const stillInside = box.current?.contains(document.activeElement) ?? false;
    if (current && stillInside) return;
    focusInside.current = false;
    store.resume("focus");
    restoreFocus(returnTo.current);
  });

  return (
    <>
      {/* The announcement: always mounted, text only. A new node per outcome
          so the same sentence twice is announced twice. */}
      <div role="status" aria-live="polite" className="sr-only">
        {current ? <span key={`${current.id}:${current.text}`}>{current.text}</span> : null}
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--admin-outcome-bottom,1rem)_+_env(safe-area-inset-bottom,0px))] z-40 flex justify-center px-4 md:inset-x-auto md:bottom-auto md:right-6 md:top-6 md:justify-end md:px-0">
        <div
          ref={box}
          className="w-full max-w-md"
          onFocus={() => {
            focusInside.current = true;
            store.pause("focus");
          }}
          onBlur={(e) => {
            // A blur from a node being removed is handled by the effect above.
            if (!e.target.isConnected) return;
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
            focusInside.current = false;
            store.resume("focus");
          }}
        >
          {shown ? (
            <OutcomeCard
              // A new id re-runs the rise; a text change within one outcome
              // (Undo → "Undone.") only swaps the words.
              key={shown.id}
              outcome={shown}
              leaving={!current}
              store={store}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

function restoreFocus(preferred: HTMLElement | null) {
  if (preferred?.isConnected) {
    preferred.focus({ preventScroll: true });
    if (document.activeElement === preferred) return;
  }
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return;
  if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
  main.focus({ preventScroll: true });
}

function OutcomeCard({
  outcome,
  leaving,
  store,
}: {
  outcome: Outcome;
  leaving: boolean;
  store: OutcomeStore;
}) {
  const router = useRouter();
  const error = outcome.tone === "error";
  const Icon = error ? AlertCircle : CheckCircle2;

  function follow(e: MouseEvent<HTMLAnchorElement>, to: string) {
    // In-app paths go through the router so the shell (and this line) stay
    // mounted; modified clicks and other origins behave as plain links.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    if (!to.startsWith("/") || to.startsWith("//")) return;
    e.preventDefault();
    // The router takes a fragment ("/testimonials#story-1") as its own option;
    // left in `to` it would become part of the path.
    const [path, hash] = to.split("#", 2);
    void router.navigate({ to: path, hash: hash || undefined });
  }

  return (
    <div
      // A leaving line is on its way out: not focusable, not clickable.
      inert={leaving}
      className={
        "pointer-events-auto flex items-center gap-3 rounded-[var(--radius-card)] border bg-[var(--color-surface)] py-1.5 pl-4 pr-1.5 shadow-[var(--shadow-banner)] " +
        (error ? "border-[var(--color-danger)]/40 " : "border-[var(--color-hairline)] ") +
        (leaving ? "admin-fade-out" : "admin-rise")
      }
      onPointerEnter={() => store.pause("pointer")}
      onPointerLeave={() => store.resume("pointer")}
    >
      <Icon
        aria-hidden
        className={
          "h-5 w-5 shrink-0 " +
          (error ? "text-[var(--color-danger)]" : "text-[var(--color-deep-blue)]")
        }
        strokeWidth={2}
      />
      <p
        className={
          "min-w-0 flex-1 py-2 text-sm leading-snug " +
          (error ? "text-[var(--color-danger)]" : "text-[var(--color-ink)]")
        }
      >
        {outcome.text}
      </p>
      {outcome.link ? (
        <a
          href={outcome.link.to}
          onClick={(e) => follow(e, outcome.link!.to)}
          className="admin-press inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-btn)] px-3 text-sm font-semibold text-[var(--color-deep-blue)] underline underline-offset-4 hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        >
          {outcome.link.label}
        </a>
      ) : null}
      {outcome.undo ? (
        <AdminButton
          variant="quiet"
          busy={outcome.undoing}
          busyLabel="Undoing…"
          onClick={() => void store.undo()}
          className="shrink-0 px-3 text-[var(--color-deep-blue)]"
        >
          Undo
        </AdminButton>
      ) : null}
      <button
        type="button"
        onClick={store.clear}
        className="admin-press inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[var(--radius-btn)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      >
        <X aria-hidden className="h-4 w-4" strokeWidth={2} />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  );
}
