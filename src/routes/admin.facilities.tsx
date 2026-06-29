import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";

export const Route = createFileRoute("/admin/facilities")({
  head: () => ({ meta: [{ title: "Facilities · Alpha Admin" }] }),
  component: () => <AdminCrud config={CONFIG} />,
});

const CONFIG: CrudConfig = {
  table: "facilities",
  title: "Facilities",
  description: "Classrooms, labs, sports grounds — shown on each school page and the global /facilities tour.",
  orderBy: { column: "sort_order", ascending: true },
  listColumns: [
    { key: "image_url", label: "Photo" },
    { key: "name", label: "Name" },
    { key: "school_slug", label: "School" },
    { key: "category", label: "Category" },
    { key: "published", label: "Published" },
    { key: "sort_order", label: "Order" },
  ],
  fields: [
    { name: "school_slug", label: "School", kind: "school", required: true, defaultValue: "nursery-primary" },
    { name: "name", label: "Name", kind: "text", required: true },
    { name: "category", label: "Category", kind: "select", options: [
      { value: "academic", label: "Academic" },
      { value: "sports", label: "Sports" },
      { value: "boarding", label: "Boarding" },
      { value: "arts", label: "Arts" },
      { value: "aviation", label: "Aviation" },
      { value: "general", label: "General" },
    ], defaultValue: "general" },
    { name: "description", label: "Description", kind: "textarea" },
    { name: "image_url", label: "Photo", kind: "image" },
    { name: "sort_order", label: "Sort order", kind: "number", defaultValue: 0 },
    { name: "published", label: "Published", kind: "boolean", defaultValue: true },
  ],
};
