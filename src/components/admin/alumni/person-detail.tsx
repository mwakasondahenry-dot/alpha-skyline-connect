/**
 * One former student: the whole photo, who they are, how to reach them (one
 * tap: WhatsApp, Call, Email), their story with its status and a link to it
 * in Stories, their invite with its status and a link to the Invite page, and
 * when they were first invited and first sent something.
 *
 * Read only. Their details are edited through their story or their invite.
 */
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone, X } from "lucide-react";
import { StickyBar, adminButtonClass } from "@/components/admin/kit";
import { WholePhoto } from "@/components/testimonials/whole-photo";
import type { AlumniPerson, AlumniStoryRow, InviteRow } from "@/lib/admin/alumni-directory";
import {
  inviteLabel,
  personSchoolLabel,
  storyLabel,
  type AlumniSearch,
} from "@/lib/admin/alumni-view";
import { contactLinks, formatAdminDateTime } from "@/lib/admin/format";
import { ContactLink } from "./person-card";

function earliest(...isos: Array<string | null | undefined>): string | null {
  const times = isos
    .filter((s): s is string => !!s && !Number.isNaN(Date.parse(s)))
    .sort((a, b) => Date.parse(a) - Date.parse(b));
  return times[0] ?? null;
}

export function PersonDetail({
  person,
  invite,
  story,
  search,
}: {
  person: AlumniPerson;
  invite: InviteRow | null;
  story: AlumniStoryRow | null;
  search: AlumniSearch;
}) {
  const links = contactLinks({ phone: person.phone, email: person.email, name: person.name });
  const firstInvited = invite?.created_at ?? null;
  const firstSubmitted = earliest(invite?.submitted_at, story?.created_at);
  const anyContact = links.whatsapp || links.tel || links.mailto;

  return (
    <article aria-labelledby="person-detail-heading" className="space-y-6 lg:px-5 lg:pt-5">
      <h1 className="sr-only lg:hidden">Alumni</h1>
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/admin/alumni"
          search={search}
          className={adminButtonClass("quiet", "-ml-3 px-3 lg:hidden")}
        >
          <span aria-hidden>←</span> Alumni
        </Link>
        <Link
          to="/admin/alumni"
          search={search}
          className={adminButtonClass("quiet", "ml-auto hidden px-0 lg:inline-flex")}
        >
          <X aria-hidden className="h-5 w-5" strokeWidth={2} />
          <span className="sr-only">Close</span>
        </Link>
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <WholePhoto
          key={person.photo_url ?? ""}
          src={person.photo_url}
          name={person.name}
          original
          className="h-60 w-48 rounded-[var(--radius-card)]"
          initialClassName="text-6xl"
        />
        <div className="min-w-0 space-y-1">
          <h2
            id="person-detail-heading"
            className="break-words font-display text-xl font-bold leading-snug text-[var(--color-deep-blue)]"
          >
            {person.name}
          </h2>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {person.grad_year === null ? "Class not recorded" : `Class of ${person.grad_year}`} ·{" "}
            {personSchoolLabel(person.school_slug)}
          </p>
        </div>
      </header>

      <Section title="About">
        <Row label="School">{personSchoolLabel(person.school_slug)}</Row>
        <Row label="Class of">
          {person.grad_year === null ? <Soft>Not recorded</Soft> : person.grad_year}
        </Row>
        <Row label="Role">{person.role ?? <Soft>Not given</Soft>}</Row>
        <Row label="Company">{person.company ?? <Soft>Not given</Soft>}</Row>
        <Row label="City or country">{person.city ?? <Soft>Not given</Soft>}</Row>
      </Section>

      <Section title="Contact">
        <Row label="Phone">
          <ContactLink kind="phone" person={person} />
          {person.phone && !links.tel ? (
            <span className="block text-xs text-[var(--color-ink-soft)]">
              This number could not be checked, so WhatsApp and Call are not offered.
            </span>
          ) : null}
        </Row>
        <Row label="Email">
          <ContactLink kind="email" person={person} />
        </Row>
      </Section>

      <Section title="Story">
        <Row label="Status">{storyLabel(person.storyStatus)}</Row>
        {person.storyId && person.storyStatus ? (
          <Row label="Open">
            <Link
              to="/admin/stories/$id"
              params={{ id: person.storyId }}
              search={{ tab: person.storyStatus }}
              className="inline-flex min-h-11 items-center font-semibold text-[var(--color-deep-blue)] underline underline-offset-4"
            >
              Their story in Stories
            </Link>
          </Row>
        ) : null}
        <Row label="First submitted">
          {firstSubmitted ? (
            <span className="tabular-nums">{formatAdminDateTime(firstSubmitted)}</span>
          ) : (
            <Soft>Not yet</Soft>
          )}
        </Row>
      </Section>

      <Section title="Invite">
        <Row label="Status">{inviteLabel(person.inviteStatus)}</Row>
        <Row label="First invited">
          {firstInvited ? (
            <span className="tabular-nums">{formatAdminDateTime(firstInvited)}</span>
          ) : (
            <Soft>Not invited</Soft>
          )}
        </Row>
        <Row label="Open">
          <Link
            to="/admin/stories/invite"
            search={{ audience: "alumni" }}
            className="inline-flex min-h-11 items-center font-semibold text-[var(--color-deep-blue)] underline underline-offset-4"
          >
            {person.inviteId ? "Invite page" : "Invite them from the Invite page"}
          </Link>
        </Row>
      </Section>

      {anyContact ? (
        <StickyBar>
          {links.whatsapp ? (
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noreferrer"
              className={adminButtonClass("primary", "flex-1 sm:flex-none")}
            >
              <MessageCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
              WhatsApp
            </a>
          ) : null}
          {links.tel ? (
            <a href={links.tel} className={adminButtonClass("secondary", "flex-1 sm:flex-none")}>
              <Phone aria-hidden className="h-4 w-4" strokeWidth={2} />
              Call
            </a>
          ) : null}
          {links.mailto ? (
            <a href={links.mailto} className={adminButtonClass("secondary", "flex-1 sm:flex-none")}>
              <Mail aria-hidden className="h-4 w-4" strokeWidth={2} />
              Email
            </a>
          ) : null}
        </StickyBar>
      ) : (
        <p className="text-sm text-[var(--color-ink-soft)]">
          There is no phone number or email to reach them on yet.
        </p>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-deep-blue)]">
        {title}
      </h3>
      <dl className="divide-y divide-[var(--color-hairline)] rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] text-sm">
        {children}
      </dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-11 flex-col justify-center gap-0.5 px-4 py-2 sm:flex-row sm:items-center sm:gap-4">
      <dt className="shrink-0 font-semibold text-[var(--color-deep-blue)] sm:w-32">{label}</dt>
      <dd className="min-w-0 break-words text-[var(--color-ink)]">{children}</dd>
    </div>
  );
}

function Soft({ children }: { children: ReactNode }) {
  return <span className="text-[var(--color-ink-soft)]">{children}</span>;
}
