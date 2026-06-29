import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getAllEvents, type PublicEventItem } from "@/lib/alpha-content.functions";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events · Alpha Schools" },
      { name: "description", content: "Upcoming events, open days, and milestones across Alpha Schools." },
    ],
  }),
  loader: () => getAllEvents(),
  component: EventsPage,
});

const SCHOOL_LABEL: Record<string, string> = {
  "group-wide": "Alpha Schools",
  "nursery-primary": "Nursery & Primary",
  "alpha-high": "Alpha High",
  "alpha-girls": "Alpha Girls",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function EventsPage() {
  const events = Route.useLoaderData() as PublicEventItem[];
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.event_date).getTime() >= now - 86400000);
  const past = events.filter((e) => new Date(e.event_date).getTime() < now - 86400000).reverse();

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      <section className="bg-gradient-to-b from-[#0C447C] to-[#08305a] py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">Calendar</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Events at Alpha Schools</h1>
          <p className="mt-4 max-w-2xl text-base text-white/80">
            Open days, parents' meetings, sports days, prize-givings and more. RSVP via{" "}
            <Link to="/contact" className="underline underline-offset-2 hover:text-[var(--color-gold)]">the office</Link>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <h2 className="font-display text-2xl font-semibold text-[var(--color-deep-blue)]">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-[var(--color-deep-blue)]/20 bg-white p-6 text-sm text-[var(--color-ink)]/70">
            No events scheduled yet — check back soon, or follow our news.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => <EventCard key={e.id} item={e} />)}
          </ul>
        )}

        {past.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-deep-blue)]">Past events</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {past.slice(0, 9).map((e) => <EventCard key={e.id} item={e} dim />)}
            </ul>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function EventCard({ item, dim = false }: { item: PublicEventItem; dim?: boolean }) {
  const d = new Date(item.event_date);
  return (
    <li className={`group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg ${dim ? "opacity-80" : ""}`}>
      <div className="flex">
        <div className="flex w-20 flex-shrink-0 flex-col items-center justify-center bg-[var(--color-deep-blue)] py-4 text-white">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            {d.toLocaleString(undefined, { month: "short" })}
          </span>
          <span className="font-display text-3xl font-bold leading-none">{d.getDate()}</span>
          <span className="mt-1 text-[10px] text-white/70">{d.getFullYear()}</span>
        </div>
        <div className="flex-1 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            {SCHOOL_LABEL[item.school_slug] ?? item.school_slug}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-[var(--color-deep-blue)]">{item.title}</h3>
          {item.location ? (
            <p className="mt-1 text-xs text-[var(--color-ink)]/60">📍 {item.location}</p>
          ) : null}
          {item.description ? (
            <p className="mt-2 line-clamp-3 text-sm text-[var(--color-ink)]/75">{item.description}</p>
          ) : null}
          <p className="mt-3 text-[11px] text-[var(--color-ink)]/50">{formatDate(item.event_date)}</p>
        </div>
      </div>
    </li>
  );
}
