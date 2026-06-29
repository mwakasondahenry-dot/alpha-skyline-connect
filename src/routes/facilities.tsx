import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import {
  getAllFacilities,
  getFacilityPhotosBySchool,
  type PublicFacilityItem,
  type PublicFacilityPhoto,
} from "@/lib/alpha-content.functions";
import type { SchoolSlug } from "@/integrations/alpha-supabase/types";

type LoaderData = {
  facilities: PublicFacilityItem[];
  photos: Record<string, PublicFacilityPhoto[]>;
};

export const Route = createFileRoute("/facilities")({
  head: () => ({
    meta: [
      { title: "Facilities · Alpha Schools" },
      { name: "description", content: "Tour facilities across our three Dar es Salaam campuses." },
    ],
  }),
  loader: async (): Promise<LoaderData> => {
    const slugs: SchoolSlug[] = ["nursery-primary", "alpha-high", "alpha-girls"];
    const [facilities, ...photoLists] = await Promise.all([
      getAllFacilities(),
      ...slugs.map((slug) => getFacilityPhotosBySchool({ data: { slug } })),
    ]);
    const photos: Record<string, PublicFacilityPhoto[]> = {};
    slugs.forEach((slug, i) => { photos[slug] = photoLists[i] ?? []; });
    return { facilities, photos };
  },
  component: FacilitiesPage,
});

const SCHOOLS: { slug: SchoolSlug; label: string; href: "/schools/nursery-primary" | "/schools/alpha-high" | "/schools/alpha-girls" }[] = [
  { slug: "nursery-primary", label: "Nursery & Primary", href: "/schools/nursery-primary" },
  { slug: "alpha-high", label: "Alpha High", href: "/schools/alpha-high" },
  { slug: "alpha-girls", label: "Alpha Girls", href: "/schools/alpha-girls" },
];

function FacilitiesPage() {
  const { facilities: all, photos } = Route.useLoaderData() as LoaderData;


  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />

      <section className="bg-gradient-to-b from-[#0C447C] to-[#08305a] py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">Campus tour</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Facilities across Alpha Schools</h1>
          <p className="mt-4 max-w-2xl text-base text-white/80">
            Classrooms, labs, libraries, sports grounds and aviation facilities — all three schools, one tour.
          </p>
        </div>
      </section>

      {SCHOOLS.map((school) => {
        const items = all.filter((f) => f.school_slug === school.slug);
        if (items.length === 0) return null;
        return (
          <section key={school.slug} className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">
                  {school.label}
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-[var(--color-deep-blue)]">
                  {school.label} campus
                </h2>
              </div>
              <Link
                to={school.href}
                className="hidden text-sm font-bold text-[var(--color-deep-blue)] hover:underline sm:inline"
              >
                Visit page →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((f) => <FacilityCard key={f.id} item={f} />)}
            </div>
          </section>
        );
      })}

      {all.length === 0 && (
        <section className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
          <p className="rounded-2xl border border-dashed border-[var(--color-deep-blue)]/20 bg-white p-10 text-sm text-[var(--color-ink)]/70">
            Facility photos are being added — please check back soon, or{" "}
            <Link to="/contact" className="font-semibold text-[var(--color-deep-blue)] underline">book a visit</Link>{" "}
            to tour the campuses in person.
          </p>
        </section>
      )}

      <section className="bg-[var(--color-deep-blue)] py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-10">
          <p className="font-display text-2xl font-semibold">See it for yourself — book a visit.</p>
          <Link to="/contact" className="rounded-md bg-[var(--color-gold)] px-5 py-2.5 text-sm font-semibold text-[#1a1a18]">
            Book a Visit →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FacilityCard({ item }: { item: PublicFacilityItem }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg">
      {item.image_url ? (
        <div className="aspect-[4/3] overflow-hidden bg-black/5">
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-[var(--color-deep-blue)]/10 to-[var(--color-gold)]/10" />
      )}
      <div className="p-5">
        {item.category ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">{item.category}</p>
        ) : null}
        <h3 className="mt-1 font-display text-lg font-semibold text-[var(--color-deep-blue)]">{item.name}</h3>
        {item.description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink)]/75">{item.description}</p>
        ) : null}
      </div>
    </article>
  );
}
