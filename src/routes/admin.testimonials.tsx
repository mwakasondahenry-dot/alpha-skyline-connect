import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";

export const Route = createFileRoute("/admin/testimonials")({
  head: () => ({ meta: [{ title: "Parent Testimonials · Alpha Admin" }] }),
  component: () => <AdminCrud config={CONFIG} />,
});

const CONFIG: CrudConfig = {
  table: "testimonials",
  title: "Parent Testimonials",
  description: "Quotes from parents, shown on the Parent Testimonials page.",
  orderBy: { column: "sort_order", ascending: true },
  listColumns: [
    { key: "photo_url", label: "Photo" },
    { key: "author_name", label: "Name" },
    { key: "relationship", label: "Relationship" },
    { key: "school_slug", label: "School" },
    { key: "published", label: "Published" },
  ],
  fields: [
    { name: "author_name", label: "Parent name", kind: "text", required: true },
    { name: "relationship", label: "Relationship", kind: "text", placeholder: "Parent, Form 3" },
    { name: "school_slug", label: "School", kind: "school", required: true, defaultValue: "group-wide" },
    { name: "quote", label: "Testimonial", kind: "textarea", required: true },
    { name: "photo_url", label: "Photo (optional)", kind: "image" },
    { name: "sort_order", label: "Order", kind: "number", defaultValue: 0 },
    { name: "published", label: "Published", kind: "boolean", defaultValue: true },
  ],
};
