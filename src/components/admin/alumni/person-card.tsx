/**
 * One former student in the phone list: the whole photo, name, class and
 * school, role at company, city, and small story and invite labels. The top
 * of the card opens the person; under it, the phone and email they gave are
 * their own 44px lines, one tap to call or email (owner request 2026-10-23).
 */
import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { ListCard } from "@/components/admin/kit";
import { WholePhoto } from "@/components/testimonials/whole-photo";
import type { AlumniPerson } from "@/lib/admin/alumni-directory";
import {
  classAndSchool,
  formatPhoneDisplay,
  inviteLabel,
  roleAtCompany,
  storyLabel,
  type AlumniSearch,
} from "@/lib/admin/alumni-view";
import { contactLinks } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export function PersonCard({
  person,
  search,
  selected = false,
}: {
  person: AlumniPerson;
  /** The list's filters, carried to the person and back. */
  search: AlumniSearch;
  selected?: boolean;
}) {
  const role = roleAtCompany(person);
  return (
    <ListCard selected={selected} className="overflow-hidden p-0">
      <Link
        to="/admin/alumni/$key"
        params={{ key: person.key }}
        search={search}
        aria-current={selected ? "page" : undefined}
        className="admin-hover flex min-h-11 gap-3 p-3 hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      >
        <WholePhoto
          key={person.photo_url ?? ""}
          src={person.photo_url}
          name={person.name}
          className="h-16 w-12 rounded-[var(--radius-btn)]"
          initialClassName="text-xl"
        />
        <span className="min-w-0 flex-1">
          <span className="block break-words font-semibold leading-snug text-[var(--color-deep-blue)]">
            {person.name}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-[var(--color-ink-soft)]">
            {classAndSchool(person)}
          </span>
          {role || person.city ? (
            <span className="mt-0.5 block break-words text-sm leading-snug text-[var(--color-ink)]">
              {[role, person.city].filter(Boolean).join(" · ")}
            </span>
          ) : null}
          <StatusLabels person={person} className="mt-1.5" />
        </span>
      </Link>
      <div className="divide-y divide-[var(--color-hairline)] border-t border-[var(--color-hairline)] px-3">
        <ContactLink kind="phone" person={person} />
        <ContactLink kind="email" person={person} />
      </div>
    </ListCard>
  );
}

export function StatusLabels({ person, className }: { person: AlumniPerson; className?: string }) {
  return (
    <span className={cn("flex flex-wrap gap-1.5 text-xs", className)}>
      <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2 py-0.5 font-semibold text-[var(--color-deep-blue)]">
        {storyLabel(person.storyStatus)}
      </span>
      <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2 py-0.5 font-semibold text-[var(--color-deep-blue)]">
        {inviteLabel(person.inviteStatus)}
      </span>
    </span>
  );
}

/**
 * The phone or email a person gave, as a 44px tappable line (tel: / mailto:),
 * or "Not given". A phone number that could not be checked is shown, but not
 * offered as a call.
 */
export function ContactLink({
  kind,
  person,
  className,
}: {
  kind: "phone" | "email";
  person: Pick<AlumniPerson, "name" | "phone" | "email">;
  className?: string;
}) {
  const links = contactLinks({ phone: person.phone, email: person.email, name: person.name });
  const value = kind === "phone" ? formatPhoneDisplay(person.phone) : person.email?.trim() || null;
  const href = kind === "phone" ? links.tel : links.mailto;
  const Icon = kind === "phone" ? Phone : Mail;
  const what = kind === "phone" ? "Phone" : "Email";
  const line = cn("flex min-h-11 items-center gap-2 text-sm", className);

  if (!value) {
    return (
      <span className={cn(line, "text-[var(--color-ink-soft)]")}>
        <Icon aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="sr-only">{what}: </span>
        Not given
      </span>
    );
  }
  if (!href) {
    return (
      <span className={cn(line, "break-all text-[var(--color-ink)]")}>
        <Icon
          aria-hidden
          className="h-4 w-4 shrink-0 text-[var(--color-ink-soft)]"
          strokeWidth={2}
        />
        <span className="sr-only">{what}: </span>
        {value}
      </span>
    );
  }
  return (
    <a
      href={href}
      className={cn(
        line,
        "min-w-0 font-semibold text-[var(--color-deep-blue)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]",
      )}
    >
      <Icon aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2} />
      <span className="sr-only">
        {kind === "phone" ? "Call" : "Email"} {person.name}:{" "}
      </span>
      <span className={kind === "email" ? "min-w-0 break-all" : "tabular-nums"}>{value}</span>
    </a>
  );
}
