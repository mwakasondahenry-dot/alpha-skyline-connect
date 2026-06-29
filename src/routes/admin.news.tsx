import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";

export const Route = createFileRoute("/admin/news")({
  head: () => ({ meta: [{ title: "News · Alpha Admin" }] }),
  component: () => <AdminCrud config={CONFIG} />,
});

const CONFIG: CrudConfig = {
  table: "news",
  title: "News",
  description: "Post updates that appear in the homepage slideshow and on school pages.",
  orderBy: { column: "published_at", ascending: false },
  listColumns: [
    { key: "cover_url", label: "Cover" },
    { key: "title", label: "Title" },
    { key: "school_slug", label: "School" },
    { key: "published", label: "Published" },
    { key: "published_at", label: "Date" },
  ],
  fields: [
    { name: "title", label: "Title", kind: "text", required: true },
    { name: "school_slug", label: "School", kind: "school", required: true, defaultValue: "group-wide" },
    { name: "body", label: "Body", kind: "textarea" },
    { name: "cover_url", label: "Cover image", kind: "image" },
    { name: "published", label: "Published", kind: "boolean", placeholder: "Show on the public site" },
    { name: "published_at", label: "Publish date", kind: "date", helpText: "Used to sort the homepage slideshow." },
  ],
};
