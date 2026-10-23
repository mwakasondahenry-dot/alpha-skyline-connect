import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The old Testimonials page. Its queue, table and invite panels became the
 * Stories screens; bookmarks and old links land there.
 */
export const Route = createFileRoute("/admin/testimonials")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/stories", replace: true });
  },
});
