import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";

export const Route = createFileRoute("/admin/hero-slides")({
  head: () => ({ meta: [{ title: "Hero slides · Alpha Admin" }] }),
  component: () => <AdminCrud config={CONFIG} />,
});

const PAGE_OPTIONS = [
  { value: "home", label: "Homepage" },
  { value: "nursery-primary", label: "Nursery & Primary" },
  { value: "alpha-high", label: "Alpha High" },
  { value: "alpha-girls", label: "Alpha Girls" },
  { value: "aviation", label: "Aviation" },
  { value: "about", label: "About Us" },
  { value: "admission", label: "Admission" },
  { value: "testimonials", label: "Testimonials" },
];

const CONFIG: CrudConfig = {
  table: "hero_slides",
  title: "Hero slides",
  description: "Photos that rotate in the big hero banner at the top of each page.",
  orderBy: { column: "sort_order", ascending: true },
  listColumns: [
    { key: "image_url", label: "Photo" },
    { key: "page_key", label: "Page" },
    { key: "alt_text", label: "Alt text" },
    { key: "sort_order", label: "Order" },
    { key: "published", label: "Published" },
  ],
  fields: [
    { name: "page_key", label: "Page", kind: "select", required: true, options: PAGE_OPTIONS, defaultValue: "home" },
    { name: "image_url", label: "Photo", kind: "image", required: true, helpText: "Wide landscape photos work best (at least 1600px across)." },
    { name: "alt_text", label: "Alt text", kind: "text", helpText: "Short description of the photo, for screen readers." },
    { name: "caption", label: "Caption (optional)", kind: "text" },
    { name: "sort_order", label: "Order", kind: "number", defaultValue: 0 },
    { name: "published", label: "Published", kind: "boolean", defaultValue: true },
  ],
};
