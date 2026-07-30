import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, Instagram, Youtube, Facebook, Linkedin } from "lucide-react";
import alphaLogo from "@/assets/alpha-logo.png.asset.json";
import schoolNurseryPhoto from "@/assets/school-nursery-primary.jpg.asset.json";
import schoolHighPhoto from "@/assets/school-alpha-high.jpg.asset.json";
import schoolGirlsPhoto from "@/assets/school-alpha-girls.jpg.asset.json";

const SCHOOLS = [
  {
    to: "/schools/nursery-primary" as const,
    label: "Nursery & Primary",
    blurb: "Ages 2–12 · Foundations for life",
    photo: schoolNurseryPhoto.url,
  },
  {
    to: "/schools/alpha-high" as const,
    label: "Alpha High",
    blurb: "Form 1–6 · Co-education, Mikocheni",
    photo: schoolHighPhoto.url,
  },
  {
    to: "/schools/alpha-girls" as const,
    label: "Alpha Girls",
    blurb: "Form 1–6 · Girls' secondary, Kunduchi",
    photo: schoolGirlsPhoto.url,
  },
];

/** Nav items after the Schools dropdown, in the client-approved order. */
const NAV_BEFORE = [{ to: "/about" as const, label: "About Us" }];
const NAV_AFTER = [
  { to: "/admission" as const, label: "Admission" },
  { to: "/contact" as const, label: "Contacts" },
  { to: "/testimonials" as const, label: "Testimonials" },
  { to: "/aviation" as const, label: "Aviation" },
];

function SchoolsDropdown() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/85 transition-colors hover:text-[var(--color-gold)]"
      >
        Schools
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180 text-[var(--color-gold)]" : ""}`}
        />
      </button>

      <div
        role="menu"
        className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 transition-all duration-200 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div className="w-[22rem] overflow-hidden rounded-xl border border-black/10 bg-white text-[var(--color-ink)] shadow-2xl shadow-black/30 ring-1 ring-black/5">
          <div className="h-1 w-full bg-gradient-to-r from-[var(--color-deep-blue)] via-[var(--color-gold)] to-[var(--color-bright-blue)]" />
          <div className="p-2">
            {SCHOOLS.map((s, i) => (
              <Link
                key={s.to}
                to={s.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                style={{
                  animation: open
                    ? `schoolItemIn 320ms ${i * 60 + 60}ms cubic-bezier(.2,.8,.2,1) both`
                    : undefined,
                }}
                className="group/item flex items-start gap-3 rounded-lg px-3 py-3 transition-all duration-200 hover:bg-[var(--color-brand-blue)] hover:translate-x-1"
              >
                <span className="mt-0.5 h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 ring-black/10 transition-all duration-300 group-hover/item:ring-white group-hover/item:scale-105">
                  <img src={s.photo} alt={s.label} className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110" loading="lazy" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-bold text-[var(--color-deep-blue)] transition-colors group-hover/item:text-white">
                    {s.label}
                  </span>
                  <span className="block text-xs text-[var(--color-ink)]/70 transition-colors group-hover/item:text-white/85">{s.blurb}</span>
                </span>
                <span className="self-center text-white opacity-0 transition-opacity duration-200 group-hover/item:opacity-100">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes schoolItemIn {
          0% { opacity: 0; transform: translateY(-6px) scale(.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes schoolItemIn { 0%,100% { opacity: 1; transform: none; } }
        }
      `}</style>
    </div>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const [schoolsOpen, setSchoolsOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={`fixed inset-0 top-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        id="mobile-nav-panel"
        className={`fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-[var(--color-deep-blue)] text-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
          <span className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white">
              <img src={alphaLogo.url} alt="" className="h-8 w-8 object-contain" />
            </span>
            <span className="font-display text-sm font-bold tracking-wider">
              ALPHA <span className="font-normal text-white/70">SCHOOLS</span>
            </span>
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="grid h-9 w-9 place-items-center rounded-md border border-white/25 bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-1">
            {NAV_BEFORE.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={close}
                  className="block rounded-lg px-3 py-3 font-display text-lg font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-[var(--color-gold)]"
                  activeProps={{ className: "block rounded-lg px-3 py-3 font-display text-lg font-semibold bg-white/10 text-[var(--color-gold)]" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li>
              <button
                type="button"
                aria-expanded={schoolsOpen}
                onClick={() => setSchoolsOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 font-display text-lg font-semibold text-white/90 transition-colors hover:bg-white/10"
              >
                Schools
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${schoolsOpen ? "rotate-180 text-[var(--color-gold)]" : ""}`} />
              </button>
              <ul className={`overflow-hidden pl-3 transition-all duration-300 motion-reduce:transition-none ${schoolsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                {SCHOOLS.map((s) => (
                  <li key={s.to}>
                    <Link
                      to={s.to}
                      onClick={close}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-md ring-1 ring-white/25">
                        <img src={s.photo} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{s.label}</span>
                        <span className="block truncate text-[11px] text-white/60">{s.blurb}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {NAV_AFTER.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={close}
                  className="block rounded-lg px-3 py-3 font-display text-lg font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-[var(--color-gold)]"
                  activeProps={{ className: "block rounded-lg px-3 py-3 font-display text-lg font-semibold bg-white/10 text-[var(--color-gold)]" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/admission"
            onClick={close}
            className="mt-6 block rounded-lg bg-[var(--color-gold)] px-4 py-3.5 text-center text-sm font-bold text-[#1a1a18] shadow-lg"
          >
            Enroll Now
          </Link>

          <div className="mt-6 flex items-center gap-3 border-t border-white/15 pt-5">
            <SocialLinks compact />
          </div>
        </nav>
      </div>
    </div>
  );
}

function SocialLinks({ compact = false }: { compact?: boolean }) {
  const cls = compact
    ? "grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[var(--color-gold)] hover:text-[#1a1a18]"
    : "grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[var(--color-gold)] hover:text-[#1a1a18]";
  return (
    <>
      <a
        href="https://www.instagram.com/alphaschoolstz"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Alpha Schools on Instagram (@alphaschoolstz)"
        className={cls}
      >
        <Instagram className="h-4.5 w-4.5" />
      </a>
      <a
        href="https://www.youtube.com/@alphaschoolstz"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Alpha Schools on YouTube"
        className={cls}
      >
        <Youtube className="h-4.5 w-4.5" />
      </a>
      {/* Placeholder slots — swap the href in once the handles are confirmed. */}
      <span
        title="[Facebook link — to be provided]"
        aria-hidden
        className="grid h-9 w-9 cursor-not-allowed place-items-center rounded-full bg-white/5 text-white/30"
      >
        <Facebook className="h-4.5 w-4.5" />
      </span>
      <span
        title="[LinkedIn link — to be provided]"
        aria-hidden
        className="grid h-9 w-9 cursor-not-allowed place-items-center rounded-full bg-white/5 text-white/30"
      >
        <Linkedin className="h-4.5 w-4.5" />
      </span>
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--color-deep-blue)]/95 text-white backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:flex lg:justify-between lg:gap-4 lg:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-3 hover:opacity-90">
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-white/30">
            <img src={alphaLogo.url} alt="Alpha Schools" className="h-10 w-10 object-contain" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-sm font-bold tracking-wider text-white">
              ALPHA <span className="font-normal text-white/70">SCHOOLS</span>
            </span>
            <span className="block truncate text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Dar es Salaam
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_BEFORE.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-white/85 transition-colors hover:text-[var(--color-gold)]"
              activeProps={{ className: "text-sm font-semibold text-[var(--color-gold)]" }}
            >
              {item.label}
            </Link>
          ))}
          <SchoolsDropdown />
          {NAV_AFTER.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-white/85 transition-colors hover:text-[var(--color-gold)]"
              activeProps={{ className: "text-sm font-semibold text-[var(--color-gold)]" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/admission"
            className="hidden rounded-md bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-[#1a1a18] shadow-sm transition-transform hover:scale-[1.02] sm:inline-flex"
          >
            Enroll Now
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[var(--color-deep-blue)] text-white/80">
      <div aria-hidden className="h-1 w-full bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-bright-blue)] to-[var(--color-gold)]" />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-white">
              <img src={alphaLogo.url} alt="Alpha Schools" className="h-9 w-9 object-contain" />
            </span>
            <span className="font-display text-sm font-bold tracking-wider text-white">
              ALPHA <span className="font-normal text-white/70">SCHOOLS</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            ALFA EDUCATION CENTRE. Three schools, two campuses across Dar es Salaam, Tanzania.
          </p>
          <p className="mt-3 font-display text-sm font-semibold text-[var(--color-gold)]">
            Your Child's Education is Our Priority
          </p>
          <div className="mt-5 flex items-center gap-3">
            <SocialLinks />
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">Schools</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/schools/nursery-primary" className="hover:text-[var(--color-gold)]">Nursery &amp; Primary</Link></li>
            <li><Link to="/schools/alpha-high" className="hover:text-[var(--color-gold)]">Alpha High</Link></li>
            <li><Link to="/schools/alpha-girls" className="hover:text-[var(--color-gold)]">Alpha Girls</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/aviation" className="hover:text-[var(--color-gold)]">Aviation</Link></li>
            <li><Link to="/coding" className="hover:text-[var(--color-gold)]">Coding</Link></li>
            <li><Link to="/admission" className="hover:text-[var(--color-gold)]">Admission</Link></li>
            <li><Link to="/testimonials" className="hover:text-[var(--color-gold)]">Parent Testimonials</Link></li>
            <li><Link to="/scholarships" className="hover:text-[var(--color-gold)]">Scholarships</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">Visit</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-[var(--color-gold)]">About Us</Link></li>
            <li><Link to="/facilities" className="hover:text-[var(--color-gold)]">Facilities</Link></li>
            <li><Link to="/events" className="hover:text-[var(--color-gold)]">Events</Link></li>
            <li><Link to="/contact" className="hover:text-[var(--color-gold)]">Contacts</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span>© {new Date().getFullYear()} ALFA EDUCATION CENTRE.</span>
          <span>Instagram @alphaschoolstz</span>
        </div>
      </div>
    </footer>
  );
}
