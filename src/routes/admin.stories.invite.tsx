/**
 * Invite people: the general link and the personal invites, one audience at a
 * time (Former students or Parents), chosen with a two-option switch and kept
 * in the address (?audience=) so Back and a shared link land on the same one.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { adminButtonClass } from "@/components/admin/kit";
import { InvitePanel } from "@/components/admin/invites/invite-panel";
import { isAudience, type Audience } from "@/lib/invites/audience";

type InviteSearch = { audience?: Audience };

export const Route = createFileRoute("/admin/stories/invite")({
  head: () => ({ meta: [{ title: "Invite people · Alpha Schools Admin" }] }),
  validateSearch: (search: Record<string, unknown>): InviteSearch =>
    isAudience(search.audience) ? { audience: search.audience } : {},
  component: InvitePage,
});

const OPTIONS: { value: Audience; label: string }[] = [
  { value: "alumni", label: "Former students" },
  { value: "parent", label: "Parents" },
];

function InvitePage() {
  const { audience = "alumni" } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Link to="/admin/stories" className={adminButtonClass("quiet", "-ml-3 px-3")}>
        <span aria-hidden>←</span> Stories
      </Link>
      <header>
        <h1 className="font-display text-2xl font-bold text-[var(--color-deep-blue)]">
          Invite people
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Send a link to a short form. What they send waits under Stories, Waiting, until you
          publish it.
        </p>
      </header>

      <div
        role="group"
        aria-label="Who are you inviting?"
        className="inline-flex rounded-[var(--radius-btn)] border border-[var(--color-hairline)] bg-[var(--color-surface)] p-1"
      >
        {OPTIONS.map((o) => {
          const on = audience === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() =>
                void navigate({
                  to: "/admin/stories/invite",
                  search: { audience: o.value },
                  replace: true,
                })
              }
              className={cn(
                "admin-press inline-flex min-h-11 min-w-11 items-center justify-center rounded-[calc(var(--radius-btn)-2px)] px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]",
                on
                  ? "bg-[var(--color-deep-blue)] text-[var(--color-surface)]"
                  : "text-[var(--color-deep-blue)] hover:bg-[var(--color-surface-muted)]",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <InvitePanel key={audience} audience={audience} />
    </div>
  );
}
