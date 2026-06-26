import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/schools/nursery-primary", label: "Nursery & Primary" },
  { to: "/schools/alpha-high", label: "Alpha High" },
  { to: "/schools/alpha-girls", label: "Alpha Girls" },
  { to: "/aviation", label: "Aviation" },
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-deep-blue)] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--color-deep-blue)] font-bold">
            A
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-wide">ALPHA SCHOOLS</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-white/70">
              Dar es Salaam
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-white/85 transition-colors hover:text-white"
              activeProps={{ className: "text-white font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/admission"
          className="hidden rounded-full bg-[var(--color-gold)] px-4 py-2 text-sm font-medium text-[#1a1a18] shadow-sm transition-transform hover:scale-[1.02] sm:inline-flex"
        >
          Apply Now
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[var(--color-deep-blue)] text-white/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--color-deep-blue)] font-bold">
              A
            </span>
            <span className="text-sm font-semibold tracking-wide">ALPHA SCHOOLS</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Three schools, two campuses in Dar es Salaam. The first school in Tanzania to teach
            aviation.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Schools</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              <Link to="/schools/nursery-primary" className="hover:text-white">
                Nursery &amp; Primary · Kunduchi
              </Link>
            </li>
            <li>
              <Link to="/schools/alpha-high" className="hover:text-white">
                Alpha High · Mikocheni
              </Link>
            </li>
            <li>
              <Link to="/schools/alpha-girls" className="hover:text-white">
                Alpha Girls · Kunduchi
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link to="/aviation" className="hover:text-white">Aviation programme</Link></li>
            <li><Link to="/coding" className="hover:text-white">Coding &amp; digital</Link></li>
            <li><Link to="/admission" className="hover:text-white">Admissions</Link></li>
            <li><Link to="/news" className="hover:text-white">News &amp; events</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>Kunduchi, Dar es Salaam</li>
            <li>
              <a href="tel:+255734036010" className="hover:text-white">
                0734 036 010
              </a>{" "}
              · admissions{" "}
              <a href="tel:+255756299302" className="hover:text-white">
                0756 299 302
              </a>
            </li>
            <li>
              <a href="mailto:alphaschoolsdsm@gmail.com" className="hover:text-white">
                alphaschoolsdsm@gmail.com
              </a>
            </li>
            <li>Instagram @alphaschoolstz</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Alpha Education Centre Limited.</span>
          <span>3 schools · 2 campuses · ages 2–18</span>
        </div>
      </div>
    </footer>
  );
}
