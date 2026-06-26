import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSchoolBundle } from "@/lib/alpha-content.functions";
import { SCHOOL_CONFIGS } from "@/lib/schools";
import { SchoolPage } from "@/components/school/school-page";

const slug = "alpha-high" as const;
const bundleQuery = queryOptions({
  queryKey: ["school-bundle", slug],
  queryFn: () => getSchoolBundle({ data: { slug } }),
});

export const Route = createFileRoute("/schools/alpha-high")({
  head: () => ({ meta: [{ title: "Alpha High · Alpha Schools" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(bundleQuery),
  component: AlphaHighRoute,
});

function AlphaHighRoute() {
  const { data } = useSuspenseQuery(bundleQuery);
  return <SchoolPage config={SCHOOL_CONFIGS[slug]} bundle={data} />;
}
