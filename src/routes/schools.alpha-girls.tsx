import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle } from "@/lib/alpha-content.functions";
import { SCHOOL_CONFIGS } from "@/lib/schools";
import { SchoolPage } from "@/components/school/school-page";

const slug = "alpha-girls" as const;
const bundleQuery = queryOptions({
  queryKey: ["school-bundle", slug],
  queryFn: () => getSchoolBundle({ data: { slug } }),
});

export const Route = createFileRoute("/schools/alpha-girls")({
  head: () => ({ meta: [{ title: "Alpha Girls · Alpha Schools" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(bundleQuery),
  component: AlphaGirlsRoute,
});

function AlphaGirlsRoute() {
  const { data } = useSuspenseQuery(bundleQuery);
  return <SchoolPage config={SCHOOL_CONFIGS[slug]} bundle={data} />;
}
