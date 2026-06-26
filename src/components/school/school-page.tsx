import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Reveal } from "@/components/reveal";
import type { SchoolConfig } from "@/lib/schools";
import type { SchoolBundle } from "@/lib/alpha-content.functions";

function relativeDate(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const dayOf = (iso: string) => new Date(iso).getDate().toString().padStart(2, "0");
const monthOf = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short" }).toUpperCase();

export function SchoolPage({ config, bundle }: { config: SchoolConfig; bundle: SchoolBundle }) {
  const { name, campus, tagline, intro, narrative, facts, programs, facilities, accent, accentSoft, heroImage, heroAlt, admissionCta } = config;

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      {/* Sub-site header band */}
      <div className="border-b border-black/5" style={{ background: accentSoft }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
              <Link to="/" className="opacity-70 hover:opacity-100">Alpha Schools</Link>
              <span className="px-2 opacity-50">/</span>
              <span>{name}</span>
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-[var(--color-deep-blue)] sm:text-3xl">
              {name} <span className="text-[var(--color-ink)]/50">·</span>{" "}
              <span className="text-[var(--color-ink)]/70 text-base font-normal">{campus}</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admission"
              className="inline-flex items-center rounded-md bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-[#1a1a18] shadow-sm transition-transform hover:scale-[1.02]"
            >
              Enroll Now
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-[var(--color-deep-blue)]/20 bg-white px-4 py-2 text-sm font-semibold text-[var(--color-deep-blue)] hover:bg-[var(--color-deep-blue)]/5"
            >
              Book a visit
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img src={heroImage} alt={heroAlt} className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/15 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-10 lg:py-32">
          <Reveal direction="up" className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-gold)" }} />
              {tagline}
            </span>
            <h2 className="mt-5 font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {name}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90">{intro}</p>
          </Reveal>
        </div>
      </section>

      {/* About + Key facts */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 py-20 lg:grid-cols-[1.4fr_1fr] lg:px-10">
          <Reveal direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>About this school</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-4xl">
              What makes {name} feel like {name}.
            </h2>
            {narrative.map((p, i) => (
              <p key={i} className="mt-5 text-base leading-relaxed text-[var(--color-ink)]/80">{p}</p>
            ))}
          </Reveal>
          <Reveal direction="right" className="rounded-2xl bg-[var(--color-off-white)] p-8 ring-1 ring-[var(--color-deep-blue)]/10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>Key facts</p>
            <dl className="mt-4 divide-y divide-[var(--color-deep-blue)]/10">
              {facts.map((f) => (
                <div key={f.label} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <dt className="text-[var(--color-ink)]/60">{f.label}</dt>
                  <dd className="text-right font-semibold text-[var(--color-deep-blue)]">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Programs */}
      <section className="bg-[var(--color-off-white)]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <Reveal direction="up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>Programs & curriculum</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-4xl">
              How learning is structured.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((p, i) => (
              <Reveal key={p.title} direction="up" delay={i * 90}>
                <article className="group h-full rounded-2xl bg-white p-6 ring-1 ring-[var(--color-deep-blue)]/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:ring-[var(--color-gold)]/40">
                  <div className="h-1 w-10 rounded-full" style={{ background: accent }} />
                  <h3 className="mt-4 font-display text-lg font-semibold text-[var(--color-deep-blue)]">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/75">{p.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10">
          <Reveal direction="left" className="relative overflow-hidden rounded-2xl">
            <img src={heroImage} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
          </Reveal>
          <Reveal direction="right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>Daily life & facilities</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-4xl">
              Built around how children actually learn.
            </h2>
            <ul className="mt-6 space-y-3">
              {facilities.map((f) => (
                <li key={f} className="flex gap-3 text-base text-[var(--color-ink)]/85">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Latest from this school */}
      <section className="bg-[var(--color-off-white)]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <Reveal direction="up" className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>Latest from {name}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-4xl">
                Recent updates.
              </h2>
            </div>
            <Link to="/news" className="hidden text-sm font-semibold hover:underline sm:inline" style={{ color: accent }}>
              All news →
            </Link>
          </Reveal>
          {bundle.news.length === 0 ? (
            <EmptyCard icon="📰" title="No updates yet" body={`Posts published for ${name} will appear here.`} />
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {bundle.news.map((n, i) => (
                <Reveal key={n.id} direction="up" delay={i * 90}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[var(--color-deep-blue)]/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {n.cover_url ? (
                        <img src={n.cover_url} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}, var(--color-gold))` }} />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      {n.published_at && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink)]/55">
                          {relativeDate(n.published_at)}
                        </span>
                      )}
                      <h3 className="font-display text-xl font-semibold leading-snug text-[var(--color-deep-blue)]">{n.title}</h3>
                      {n.body && <p className="line-clamp-3 text-sm text-[var(--color-ink)]/75">{n.body}</p>}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="relative overflow-hidden bg-[var(--color-deep-blue)] text-white">
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <Reveal direction="up" className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">Upcoming at {name}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">What's next.</h2>
            </div>
            <Link to="/events" className="hidden text-sm font-semibold text-[var(--color-gold)] hover:underline sm:inline">
              Full calendar →
            </Link>
          </Reveal>
          {bundle.events.length === 0 ? (
            <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-white/20 bg-white/[0.05] px-6 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-gold)]/20 text-2xl">📅</div>
              <h3 className="mt-4 font-display text-xl font-semibold text-white">Nothing scheduled right now</h3>
              <p className="mt-2 max-w-md text-sm text-white/65">
                The next event at {name} will appear here once it's announced.
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {bundle.events.map((e, i) => (
                <Reveal key={e.id} direction="up" delay={i * 80}>
                  <li className="group flex items-start gap-5 rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/15 backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:ring-[var(--color-gold)]/40">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[#d68f1c] text-[#1a1a18] shadow-lg ring-1 ring-white/30">
                      <span className="font-display text-3xl font-black leading-none">{dayOf(e.event_date)}</span>
                      <span className="absolute mt-12 text-[9px] font-bold tracking-[0.18em]">{monthOf(e.event_date)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-semibold leading-snug text-white">{e.title}</h3>
                      {e.location && <p className="mt-1 text-xs text-white/70">📍 {e.location}</p>}
                      {e.description && <p className="mt-2 line-clamp-2 text-sm text-white/80">{e.description}</p>}
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-white/55">
                        {new Date(e.event_date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Gallery */}
      <GallerySection items={bundle.gallery} accent={accent} schoolName={name} />

      {/* Admission CTA */}
      <section style={{ background: accent }}>
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-6 py-12 sm:flex-row sm:items-center lg:px-10">
          <Reveal direction="left">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Ready to join {name}?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/85">{admissionCta}</p>
          </Reveal>
          <Reveal direction="right" className="flex flex-wrap gap-3">
            <Link to="/admission" className="inline-flex items-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-[var(--color-deep-blue)] shadow-sm transition-transform hover:scale-[1.02]">
              Start an application →
            </Link>
            <Link to="/contact" className="inline-flex items-center rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
              Book a visit
            </Link>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function EmptyCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-[var(--color-deep-blue)]/15 bg-white px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-brand-blue)]/10 text-2xl">{icon}</div>
      <h3 className="mt-4 font-display text-xl font-semibold text-[var(--color-deep-blue)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[var(--color-ink)]/65">{body}</p>
    </div>
  );
}

function GallerySection({ items, accent, schoolName }: { items: { id: string; image_url: string; caption: string | null }[]; accent: string; schoolName: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <Reveal direction="up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>Gallery</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--color-deep-blue)] sm:text-4xl">
            A look around.
          </h2>
        </Reveal>
        {items.length === 0 ? (
          <EmptyCard icon="📷" title="Gallery coming soon" body={`Photos from ${schoolName} will be added here as they're uploaded.`} />
        ) : (
          <div className="mt-8 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
            {items.map((g) => (
              <button
                key={g.id}
                onClick={() => setActive(g.image_url)}
                className="group relative h-56 w-72 shrink-0 overflow-hidden rounded-2xl ring-1 ring-[var(--color-deep-blue)]/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                <img src={g.image_url} alt={g.caption ?? ""} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {g.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left text-xs text-white">
                    {g.caption}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-6 backdrop-blur-sm"
        >
          <img src={active} alt="" className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl" />
          <button
            aria-label="Close"
            onClick={() => setActive(null)}
            className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[var(--color-deep-blue)] shadow-lg"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
