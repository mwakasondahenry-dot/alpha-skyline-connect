import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events · Alpha Admin" }] }),
  component: () => <AdminCrud config={CONFIG} />,
});

const CONFIG: CrudConfig = {
  table: "events",
  title: "Events",
  description: "Open days, parents' meetings, sports days. Shown on the homepage rail and /events.",
  orderBy: { column: "event_date", ascending: false },
  listColumns: [
    { key: "cover_url", label: "Cover" },
    { key: "title", label: "Title" },
    { key: "school_slug", label: "School" },
    { key: "event_date", label: "Date" },
    { key: "location", label: "Location" },
    { key: "published", label: "Published" },
  ],
  fields: [
    { name: "title", label: "Title", kind: "text", required: true },
    { name: "school_slug", label: "School", kind: "school", required: true, defaultValue: "group-wide" },
    { name: "event_date", label: "Event date", kind: "date", required: true },
    { name: "location", label: "Location", kind: "text" },
    { name: "description", label: "Description", kind: "textarea" },
    { name: "cover_url", label: "Poster image (optional)", kind: "image", helpText: "Shown above the event card on the homepage rail and /events." },
    { name: "published", label: "Published", kind: "boolean" },
  ],
};
