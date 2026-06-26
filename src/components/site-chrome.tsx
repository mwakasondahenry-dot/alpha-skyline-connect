import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/schools/alpha-high" as const, label: "Schools" },
  { to: "/aviation" as const, label: "Aviation" },
  { to: "/coding" as const, label: "Coding" },
  { to: "/admission" as const, label: "Admission" },
  { to: "/about" as const, label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-deep-blue)] text-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[var(--color-deep-blue)] font-display font-bold text-lg">
            A
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold tracking-wider">
              ALPHA <span className="font-normal text-white/80">SCHOOLS</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-white/70">
              Dar es Salaam
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm text-white/90 transition-colors hover:text-white"
              activeProps={{ className: "text-white font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/admission"
          className="rounded-md bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-[#1a1a18] shadow-sm transition-transform hover:scale-[1.02]"
        >
          Apply Now
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
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--color-deep-blue)] font-display font-bold">
              A
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
          <span>3 schools · 2 campuses · ages 2–18</span>
        </div>
      </div>
    </footer>
  );
}
