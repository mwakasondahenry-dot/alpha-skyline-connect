/**
 * The old one-page alumni form. It was replaced by the story wizard at
 * /alumni/story; links already shared still land there.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/submit")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: () => {
    throw redirect({ to: "/alumni/story", replace: true });
  },
});
