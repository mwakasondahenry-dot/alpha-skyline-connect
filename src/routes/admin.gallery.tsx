import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({ meta: [{ title: "Activities Gallery · Alpha Admin" }] }),
  component: () => <AdminCrud config={CONFIG} />,
});

const CONFIG: CrudConfig = {
  table: "gallery",
  title: "Activities Gallery",
  description: "Photos of school life, activities and events. For facility photos, use the Facilities Gallery.",
  orderBy: { column: "sort_order", ascending: true },
  listColumns: [
    { key: "image_url", label: "Photo" },
    { key: "school_slug", label: "School" },
    { key: "caption", label: "Caption" },
    { key: "sort_order", label: "Order" },
  ],
  fields: [
    { name: "school_slug", label: "School", kind: "school", required: true, defaultValue: "nursery-primary" },
    { name: "image_url", label: "Image", kind: "image", required: true },
    { name: "caption", label: "Caption", kind: "text" },
    { name: "sort_order", label: "Sort order", kind: "number", defaultValue: 0 },
  ],
};
