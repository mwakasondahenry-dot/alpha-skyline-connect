import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { safeRedirect } from "@/lib/admin/drafts";
import { AdminButton } from "@/components/admin/kit";
import logo from "@/assets/alpha-logo.webp";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Sign in · Alpha Schools Admin" }] }),
  // Where to go after signing in: the page the session expired on. Checked
  // again by safeRedirect() before it is used.
  validateSearch: (s: Record<string, unknown>): { redirect?: string } =>
    typeof s.redirect === "string" ? { redirect: s.redirect } : {},
  component: LoginPage,
});

const INPUT =
  "min-h-11 w-full rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-2.5 text-base text-[var(--color-ink)] outline-none transition-colors duration-150 focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30";

function LoginPage() {
  const { signIn, ready } = useAdminAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter both your email and password.");
      return;
    }
    setBusy(true);
    const { error: err } = await signIn(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(signInError(err));
      return;
    }
    navigate({ href: safeRedirect(redirect), replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-deep-blue)] to-[var(--color-deep-blue-dark)] px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-banner)] sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src={logo}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-full ring-2 ring-[var(--color-gold)]"
          />
          <h1 className="mt-4 font-display text-xl font-bold text-[var(--color-deep-blue)]">
            Alpha Schools Admin
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Sign in to manage stories, enquiries, news and photos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-semibold text-[var(--color-deep-blue)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              aria-required="true"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
              placeholder="you@alphaschools.co.tz"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-semibold text-[var(--color-deep-blue)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              aria-required="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT}
              placeholder="Your password"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-[var(--radius-btn)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2 text-sm text-[var(--color-danger)]"
            >
              {error}
            </p>
          ) : null}

          <AdminButton
            type="submit"
            variant="primary"
            disabled={!ready}
            busy={busy}
            busyLabel="Signing in…"
            className="w-full"
          >
            {ready ? "Sign in" : "Loading…"}
          </AdminButton>

          <p className="pt-2 text-center text-xs leading-relaxed text-[var(--color-ink-soft)]">
            Staff accounts are created by the school administrator.
            <br />
            Trouble signing in? Contact the office.
          </p>
        </form>
      </div>
    </main>
  );
}

/** Supabase's sign-in messages, in plain words. */
function signInError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid_credentials")) {
    return "That email and password don't match. Please try again.";
  }
  if (m.includes("email not confirmed")) {
    return "Your email is not yet confirmed. Please contact the administrator.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Couldn't reach the server. Check your internet and try again.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many tries. Wait a minute, then try again.";
  }
  if (m.includes("still loading")) return msg;
  return "Sign-in did not work. Try again, or contact the office.";
}
