import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/news")({
  head: () => ({
    ...seo({
      title: "News & Events — Alpha Schools, Dar es Salaam",
      description:
        "News and announcements from the three Alpha schools in Dar es Salaam. The full listing is still being prepared by the school and is not yet published.",
      path: "/news",
      noindex: true,
    }),
  }),
  component: makeStubRoute("News & events", "Full listing coming next."),
});
