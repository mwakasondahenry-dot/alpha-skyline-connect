import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import logo from "@/assets/alpha-logo.png.asset.json";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Sign in · Alpha Schools Admin" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, ready } = useAdminAuth();
  const navigate = useNavigate();
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
      setError(friendlyError(err));
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-deep-blue)] via-[var(--color-deep-blue)] to-[#08305a] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo.url} alt="Alpha Schools" className="h-14 w-14 rounded-full ring-2 ring-[var(--color-gold)]" />
          <h1 className="mt-4 text-xl font-bold text-[var(--color-deep-blue)]">Alpha Schools Admin</h1>
          <p className="mt-1 text-sm text-[var(--color-ink)]/70">
            Sign in to manage news, events, gallery and staff.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--color-deep-blue)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-deep-blue)]/20 bg-white px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30"
              placeholder="you@alphaschools.ac.tz"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--color-deep-blue)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-deep-blue)]/20 bg-white px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/30"
              placeholder="Your password"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy || !ready}
            className="w-full rounded-lg bg-[var(--color-gold)] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[var(--color-gold-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Signing in…" : ready ? "Sign in" : "Loading…"}
          </button>

          <p className="pt-2 text-center text-xs text-[var(--color-ink)]/60">
            Staff accounts are created by the school administrator.
            <br />
            Trouble signing in? Contact the office.
          </p>
        </form>
      </div>
    </div>
  );
}

function friendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid_credentials")) {
    return "That email and password don't match. Please try again.";
  }
  if (m.includes("email not confirmed")) {
    return "Your email is not yet confirmed. Please contact the administrator.";
  }
  if (m.includes("network")) {
    return "Couldn't reach the server. Check your internet and try again.";
  }
  return msg;
}
