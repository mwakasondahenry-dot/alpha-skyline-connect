import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { submitContactMessage } from "@/lib/alpha-content.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · Alpha Schools" },
      { name: "description", content: "Call, WhatsApp, email or visit Alpha Schools in Dar es Salaam." },
    ],
  }),
  component: ContactPage,
});

const SCHOOLS = [
  { slug: "", label: "Any / not sure" },
  { slug: "nursery-primary", label: "Nursery & Primary (Kunduchi)" },
  { slug: "alpha-high", label: "Alpha High (Mikocheni)" },
  { slug: "alpha-girls", label: "Alpha Girls (Kunduchi)" },
];

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", school_slug: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await submitContactMessage({ data: form });
      setDone(true);
      setForm({ name: "", email: "", phone: "", school_slug: "", subject: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      <section className="bg-gradient-to-b from-[#0C447C] to-[#08305a] py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">Get in touch</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">We'd love to hear from you</h1>
          <p className="mt-4 max-w-2xl text-base text-white/80">
            Call, WhatsApp, email or send a message below — and we'll be in touch within one working day.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.1fr_1fr] lg:px-10">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-deep-blue)]">Send us a message</h2>
          <p className="mt-1 text-sm text-[var(--color-ink)]/70">
            Tell us a little about your enquiry. We'll reply by email or phone.
          </p>

          {done ? (
            <div role="status" className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
              <p className="font-display text-lg font-semibold text-green-900">Thank you — your message is on its way.</p>
              <p className="mt-1 text-sm text-green-800">A member of staff will reply within one working day.</p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-4 text-sm font-semibold text-[var(--color-deep-blue)] underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" required>
                  <input required value={form.name} onChange={(e) => update("name", e.target.value)} className={INPUT} />
                </Field>
                <Field label="Email" required>
                  <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className={INPUT} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone (optional)">
                  <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={INPUT} />
                </Field>
                <Field label="Which school?">
                  <select value={form.school_slug} onChange={(e) => update("school_slug", e.target.value)} className={INPUT}>
                    {SCHOOLS.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Subject">
                <input value={form.subject} onChange={(e) => update("subject", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Message" required>
                <textarea required rows={6} value={form.message} onChange={(e) => update("message", e.target.value)} className={INPUT} />
              </Field>

              {error ? (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-[var(--color-gold)] px-5 py-3 text-sm font-semibold text-[#1a1a18] shadow transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {busy ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <InfoCard title="Call or WhatsApp">
            <p className="text-base font-semibold text-[var(--color-deep-blue)]">+255 (0)22 277 5046</p>
            <p className="text-sm text-[var(--color-ink)]/70">Mon – Fri · 7:30 – 16:30</p>
          </InfoCard>
          <InfoCard title="Email">
            <a href="mailto:info@alphaschools.ac.tz" className="text-base font-semibold text-[var(--color-deep-blue)] hover:underline">
              info@alphaschools.ac.tz
            </a>
          </InfoCard>
          <InfoCard title="Postal address">
            <p className="text-sm text-[var(--color-ink)]/80">ALFA EDUCATION CENTRE<br />P.O. Box 35136<br />Dar es Salaam, Tanzania</p>
          </InfoCard>
          <InfoCard title="Campuses">
            <ul className="space-y-1 text-sm text-[var(--color-ink)]/80">
              <li><span className="font-semibold">Mikocheni</span> — Alpha High</li>
              <li><span className="font-semibold">Kunduchi</span> — Alpha Girls · Nursery & Primary</li>
            </ul>
          </InfoCard>
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-[var(--color-deep-blue)]/15 bg-white px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-deep-blue)]/70">
        {label}{required ? <span className="text-red-600"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--color-deep-blue)]/10 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">{title}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
