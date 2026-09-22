import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/scholarships")({
  head: () => ({
    ...seo({
      title: "Scholarships — Alpha Schools, Dar es Salaam",
      description:
        "Bursary and scholarship information for Alpha Schools in Dar es Salaam. The details are still to be supplied by the school and are not yet published.",
      path: "/scholarships",
      noindex: true,
    }),
  }),
  component: makeStubRoute("Scholarships", "Bursary and scholarship details — coming next."),
});
