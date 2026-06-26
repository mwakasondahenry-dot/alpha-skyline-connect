import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export function makeStubRoute(title: string, blurb: string) {
  return function Stub() {
    return (
      <div className="min-h-screen bg-[var(--color-off-white)]">
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">
            Coming next
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-[var(--color-deep-blue)] sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-[var(--color-ink)]/80">
            {blurb}
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center rounded-full bg-[var(--color-gold)] px-5 py-3 text-sm font-medium text-[#1a1a18]"
          >
            Back to home
          </Link>
        </section>
        <SiteFooter />
      </div>
    );
  };
}

// Re-export for tree-shake friendliness in route files.
export { createFileRoute };
