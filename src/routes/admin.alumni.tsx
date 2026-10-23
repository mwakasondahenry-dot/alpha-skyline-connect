/**
 * Alumni: every former student the school knows of, merged from personal
 * invites and stories, searchable and filterable (owner request 2026-10-23).
 * Every row shows the phone and email they gave, one tap to call or email.
 *
 * The list loads once and filters on the device. Search and filters live in
 * the address, so a filtered list can be bookmarked and survives a refresh.
 * Phone: cards; from 768px: a table. A person opens beside the list from
 * 1024px, or as their own page below that.
 *
 * Read only: nothing here writes to the database. "Download list" builds the
 * CSV in the browser; nothing is generated or stored on a server.
 */
import { useMemo, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Download } from "lucide-react";
import {
  AdminButton,
  ConfirmDialog,
  EmptyState,
  adminButtonClass,
  adminDetailPanelClass,
  adminListDetailGridClass,
} from "@/components/admin/kit";
import { FilterBar } from "@/components/admin/alumni/filter-bar";
import { PersonCard } from "@/components/admin/alumni/person-card";
import { PersonTable } from "@/components/admin/alumni/person-table";
import { useAlumniQuery } from "@/components/admin/alumni/use-alumni";
import {
  EMPTY_FILTERS,
  alumniCsv,
  facetCounts,
  filterAlumni,
  filtersFromParams,
  type AlumniFilters,
  type AlumniPerson,
} from "@/lib/admin/alumni-directory";
import {
  activeFilterCount,
  alumniCsvFilename,
  alumniSearch,
  hasCounts,
  resultLine,
  type AlumniSearch,
} from "@/lib/admin/alumni-view";
import { friendlyError } from "@/lib/admin/errors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/alumni")({
  head: () => ({ meta: [{ title: "Alumni · Alpha Schools Admin" }] }),
  validateSearch: (search: Record<string, unknown>): AlumniSearch =>
    alumniSearch(filtersFromParams(search)),
  component: AlumniLayout,
});

function trimSlash(p: string) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

function AlumniLayout() {
  const pathname = useRouterState({ select: (s) => trimSlash(s.location.pathname) });
  const detailKey = pathname.startsWith("/admin/alumni/")
    ? decodeURIComponent(pathname.slice("/admin/alumni/".length))
    : null;
  return <AlumniScreen detailKey={detailKey} />;
}

/** The file opens in Excel with its accents intact only with a byte-order mark. */
function downloadCsv(people: AlumniPerson[]) {
  const blob = new Blob(["﻿",alumniCsv(people)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = alumniCsvFilename();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function AlumniScreen({ detailKey }: { detailKey: string | null }) {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const query = useAlumniQuery();
  const people = query.data?.people;
  const filters = useMemo(() => filtersFromParams(search), [search]);
  const shown = useMemo(() => (people ? filterAlumni(people, filters) : []), [people, filters]);
  const counts = useMemo(() => (people ? facetCounts(people, filters) : null), [people, filters]);
  const has = useMemo(
    () => (people ? hasCounts(people, filters) : { photo: 0, email: 0, phone: 0 }),
    [people, filters],
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const nFilters = activeFilterCount(filters);

  function setFilters(next: AlumniFilters) {
    const s = alumniSearch(next);
    void navigate(
      detailKey
        ? { to: "/admin/alumni/$key", params: { key: detailKey }, search: s, replace: true }
        : { to: "/admin/alumni", search: s, replace: true },
    );
  }

  // On a phone an open person is their own page: the list waits underneath.
  const listOnly = detailKey ? "hidden lg:block" : undefined;

  return (
    <div className="space-y-5">
      <header className={listOnly}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-[var(--color-deep-blue)]">
              Alumni
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              Every former student the school knows of, from personal invites and the stories they
              send. Their phone numbers and emails are for the school&apos;s own use.
            </p>
          </div>
          {people && people.length > 0 ? (
            <AdminButton
              variant="secondary"
              icon={Download}
              disabled={shown.length === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Download list
            </AdminButton>
          ) : null}
        </div>
      </header>

      {query.isPending ? (
        <p className={cn("text-sm text-[var(--color-ink-soft)]", listOnly)}>
          Loading former students…
        </p>
      ) : query.error && !people ? (
        <p role="alert" className={cn("text-sm text-[var(--color-danger)]", listOnly)}>
          {friendlyError(query.error)}
        </p>
      ) : people && people.length === 0 ? (
        <EmptyState
          className={listOnly}
          title="No former students here yet."
          body="People appear here when they are sent a personal invite, or send a story with their class year."
          action={
            <Link
              to="/admin/stories/invite"
              search={{ audience: "alumni" }}
              className={adminButtonClass("secondary")}
            >
              Invite people
            </Link>
          }
        />
      ) : people && counts ? (
        <div className={listOnly}>
          <FilterBar
            filters={filters}
            counts={counts}
            hasCounts={has}
            resultCount={shown.length}
            onChange={setFilters}
          />
          <p
            className="mt-4 text-sm font-semibold tabular-nums text-[var(--color-deep-blue)]"
            aria-live="polite"
          >
            {resultLine(shown.length, nFilters)}
          </p>
        </div>
      ) : null}

      <div
        className={detailKey && people && people.length > 0 ? adminListDetailGridClass : undefined}
      >
        {people && people.length > 0 ? (
          <div className={listOnly}>
            {shown.length === 0 ? (
              <EmptyState
                title="No former students match."
                action={
                  <AdminButton
                    variant="secondary"
                    onClick={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })}
                  >
                    Clear filters
                  </AdminButton>
                }
              />
            ) : (
              <>
                <ul className={detailKey ? "space-y-2" : "space-y-2 md:hidden"}>
                  {shown.map((p) => (
                    <li key={p.key}>
                      <PersonCard person={p} search={search} selected={p.key === detailKey} />
                    </li>
                  ))}
                </ul>
                {detailKey ? null : (
                  <div className="hidden md:block">
                    <PersonTable people={shown} search={search} />
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}

        {detailKey ? (
          <div className={adminDetailPanelClass}>
            <Outlet />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Download ${resultLine(shown.length, 0)}?`}
        body="This file contains phone numbers and emails. Keep it inside the school."
        confirmLabel="Download list"
        onConfirm={() => downloadCsv(shown)}
      />
    </div>
  );
}
