import { createFileRoute } from "@tanstack/react-router";
import { makeStubRoute } from "@/components/stub-route";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact · Alpha Schools" }] }),
  component: makeStubRoute("Contact us", "Phone, WhatsApp, map and enquiry form — coming next."),
});
