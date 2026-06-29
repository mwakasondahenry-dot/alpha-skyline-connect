import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
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
    blurb: "Form 1–6 · Mixed secondary, Mikocheni",
    photo: schoolHighPhoto.url,
  },
  {
    to: "/schools/alpha-girls" as const,
    label: "Alpha Girls",
    blurb: "Form 1–6 · Girls' secondary, Kunduchi",
    photo: schoolGirlsPhoto.url,
  },
];

const NAV = [
  { to: "/aviation" as const, label: "Aviation" },
  { to: "/admission" as const, label: "Admission" },
  { to: "/about" as const, label: "About" },
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
        className="group inline-flex items-center gap-1.5 text-sm text-white/90 transition-colors hover:text-[var(--color-gold)]"
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
          <div className="h-1 w-full bg-gradient-to-r from-[var(--color-deep-blue)] via-[var(--color-bright-blue)] to-[var(--color-deep-blue)]" />
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
                className="group/item flex items-start gap-3 rounded-lg px-3 py-3 transition-all duration-200 hover:bg-[var(--color-bright-blue)] hover:translate-x-1"
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
      `}</style>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-hairline)] bg-white/90 text-[var(--color-ink)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90">
          <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] ring-1 ring-[var(--color-hairline)]">
            <img src={alphaLogo.url} alt="Alpha Schools" className="h-10 w-10 object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold tracking-wider text-[var(--color-deep-blue)]">
              ALPHA <span className="font-normal text-[var(--color-ink-soft)]">SCHOOLS</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
              Dar es Salaam
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          <SchoolsDropdown />
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-deep-blue)]"
              activeProps={{ className: "text-[var(--color-deep-blue)] font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/admission"
          className="rounded-md bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-[#1a1a18] shadow-sm transition-transform hover:scale-[1.02]"
        >
          Enroll Now
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[var(--color-deep-blue)] text-white/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-white">
              <img src={alphaLogo.url} alt="Alpha Schools" className="h-9 w-9 object-contain" />
            </span>
            <span className="font-display text-sm font-bold tracking-wider">
              ALPHA <span className="font-normal text-white/80">SCHOOLS</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Alpha Education Centre Limited. Three schools, two campuses across Dar es Salaam, Tanzania.
          </p>
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">Schools</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link to="/schools/nursery-primary" className="hover:text-white">Nursery &amp; Primary</Link></li>
            <li><Link to="/schools/alpha-high" className="hover:text-white">Alpha High</Link></li>
            <li><Link to="/schools/alpha-girls" className="hover:text-white">Alpha Girls</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link to="/aviation" className="hover:text-white">Aviation</Link></li>
            <li><Link to="/coding" className="hover:text-white">Coding</Link></li>
            <li><Link to="/admission" className="hover:text-white">Admission</Link></li>
            <li><Link to="/scholarships" className="hover:text-white">Scholarships</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">Visit</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/facilities" className="hover:text-white">Facilities</Link></li>
            <li><Link to="/events" className="hover:text-white">Events</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span>© {new Date().getFullYear()} Alpha Education Centre Limited.</span>
          <span>{"\n"}</span>
        </div>
      </div>
    </footer>
  );
}
