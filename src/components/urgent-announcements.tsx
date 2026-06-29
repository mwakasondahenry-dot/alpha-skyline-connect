import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUrgentNews, type UrgentNewsItem } from "@/lib/alpha-content.functions";

const STORAGE_KEY = "alpha:dismissed-urgent-news";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function UrgentAnnouncements() {
  const { data } = useQuery({
    queryKey: ["urgent-news"],
    queryFn: () => getUrgentNews(),
    staleTime: 60_000,
  });

  const [dismissed, setDismissed] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(getDismissed());
  }, []);

  if (!mounted || !data || data.length === 0) return null;

  const visible: UrgentNewsItem[] = data.filter((n) => !dismissed.includes(n.id));
  if (visible.length === 0) return null;

  const current = visible[Math.min(index, visible.length - 1)];

  const dismiss = () => {
    const next = [...dismissed, current.id];
    setDismissed(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    setIndex(0);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="urgent-news-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 animate-scale-in">
        {/* Urgent ribbon */}
        <div className="flex items-center gap-2 bg-[var(--color-gold)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1a18]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
          </span>
          Urgent announcement
          {visible.length > 1 && (
            <span className="ml-auto text-[10px] font-semibold text-[#1a1a18]/70">
              {Math.min(index, visible.length - 1) + 1} of {visible.length}
            </span>
          )}
        </div>

        {current.cover_url && (
          <img
            src={current.cover_url}
            alt=""
            className="h-48 w-full object-cover sm:h-56"
            loading="eager"
          />
        )}

        <div className="px-6 py-5">
          <h2
            id="urgent-news-title"
            className="font-[Mulish] text-2xl font-extrabold leading-tight text-[var(--color-deep-blue)]"
          >
            {current.title}
          </h2>
          {current.published_at && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
              {new Date(current.published_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {current.body && (
            <p className="mt-3 max-h-48 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-neutral-700">
              {current.body}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 bg-neutral-50 px-6 py-3">
          {visible.length > 1 && index < visible.length - 1 ? (
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-neutral-600 hover:text-[var(--color-deep-blue)]"
            >
              Next →
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md bg-[var(--color-deep-blue)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[var(--color-deep-blue)]/90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
