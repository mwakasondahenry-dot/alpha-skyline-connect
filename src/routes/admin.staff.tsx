import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff · Alpha Admin" }] }),
  component: () => <AdminCrud config={CONFIG} />,
});

const CONFIG: CrudConfig = {
  table: "staff",
  title: "Staff",
  description: "Teachers and leadership shown on school pages.",
  orderBy: { column: "sort_order", ascending: true },
  listColumns: [
    { key: "photo_url", label: "Photo" },
    { key: "name", label: "Name" },
    { key: "title", label: "Title" },
    { key: "school_slug", label: "School" },
    { key: "sort_order", label: "Order" },
  ],
  fields: [
    { name: "school_slug", label: "School", kind: "school", required: true, defaultValue: "nursery-primary" },
    { name: "name", label: "Name", kind: "text", required: true },
    { name: "title", label: "Title / role", kind: "text" },
    { name: "photo_url", label: "Photo", kind: "image" },
    { name: "sort_order", label: "Sort order", kind: "number", defaultValue: 0 },
  ],
};
