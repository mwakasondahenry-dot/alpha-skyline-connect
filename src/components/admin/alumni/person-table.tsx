/**
 * The alumni list from 768px: a table with a sticky header. It scrolls
 * sideways inside its own frame when the columns do not fit, never clipping a
 * column. The name opens the person; Phone and Email are one-tap links, the
 * same as the phone cards (owner request 2026-10-23).
 */
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { WholePhoto } from "@/components/testimonials/whole-photo";
import type { AlumniPerson } from "@/lib/admin/alumni-directory";
import {
  inviteLabel,
  personSchoolLabel,
  roleAtCompany,
  storyLabel,
  type AlumniSearch,
} from "@/lib/admin/alumni-view";
import { ContactLink } from "./person-card";

const COLUMNS = [
  "Name",
  "Class of",
  "School",
  "Phone",
  "Email",
  "Role and company",
  "City or country",
  "Story",
  "Invite",
];

export function PersonTable({ people, search }: { people: AlumniPerson[]; search: AlumniSearch }) {
  return (
    // The frame scrolls both ways so the header can stick to its top.
    <div
      tabIndex={0}
      role="region"
      aria-label="Former students, scrolls sideways"
      className="max-h-[calc(100dvh-14rem)] min-h-64 overflow-auto rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
    >
      <table className="w-full min-w-[68rem] border-separate border-spacing-0 text-left text-sm">
        <caption className="sr-only">Former students</caption>
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th
                key={c}
                scope="col"
                className="sticky top-0 z-[1] whitespace-nowrap border-b border-[var(--color-hairline)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-deep-blue)]"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.key} className="align-top">
              <Cell>
                <Link
                  to="/admin/alumni/$key"
                  params={{ key: p.key }}
                  search={search}
                  className="flex min-h-11 items-center gap-2.5 font-semibold text-[var(--color-deep-blue)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                >
                  <WholePhoto
                    key={p.photo_url ?? ""}
                    src={p.photo_url}
                    name={p.name}
                    className="h-10 w-8 rounded-[var(--radius-btn)]"
                    initialClassName="text-sm"
                  />
                  <span className="min-w-0 break-words">{p.name}</span>
                </Link>
              </Cell>
              <Cell className="tabular-nums">{p.grad_year ?? <Soft>Not recorded</Soft>}</Cell>
              <Cell>{personSchoolLabel(p.school_slug)}</Cell>
              <Cell className="whitespace-nowrap">
                <ContactLink kind="phone" person={p} />
              </Cell>
              <Cell className="max-w-[16rem]">
                <ContactLink kind="email" person={p} />
              </Cell>
              <Cell>{roleAtCompany(p) ?? <Soft>Not given</Soft>}</Cell>
              <Cell>{p.city ?? <Soft>Not given</Soft>}</Cell>
              <Cell className="whitespace-nowrap">{storyLabel(p.storyStatus)}</Cell>
              <Cell className="whitespace-nowrap">{inviteLabel(p.inviteStatus)}</Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <td
      className={`border-b border-[var(--color-hairline)] px-3 py-1 align-middle text-[var(--color-ink)] ${className}`}
    >
      {children}
    </td>
  );
}

function Soft({ children }: { children: ReactNode }) {
  return <span className="text-[var(--color-ink-soft)]">{children}</span>;
}
