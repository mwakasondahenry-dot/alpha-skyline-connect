import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";

export const Route = createFileRoute("/admin/facility-photos")({
  head: () => ({ meta: [{ title: "Facilities Gallery · Alpha Admin" }] }),
  component: () => <AdminCrud config={CONFIG} />,
});

const CONFIG: CrudConfig = {
  table: "facility_photos",
  title: "Facilities Gallery",
  description:
    "Upload multiple up-to-date photos for each facility. Pick the school first, then choose the facility.",
  orderBy: { column: "sort_order", ascending: true },
  listColumns: [
    { key: "image_url", label: "Photo" },
    { key: "school_slug", label: "School" },
    { key: "facility_id", label: "Facility" },
    { key: "caption", label: "Caption" },
    { key: "sort_order", label: "Order" },
    { key: "published", label: "Published" },
  ],
  fields: [
    { name: "school_slug", label: "School", kind: "school", required: true, defaultValue: "nursery-primary" },
    {
      name: "facility_id",
      label: "Facility",
      kind: "dynamicSelect",
      required: true,
      dependsOn: ["school_slug"],
      helpText: "Pick a school first, then choose one of its facilities.",
      loadOptions: async (form, client) => {
        const slug = form.school_slug as string | undefined;
        if (!slug) return [];
        const { data, error } = await client
          .from("facilities")
          .select("id,name")
          .eq("school_slug", slug)
          .order("sort_order", { ascending: true });
        if (error) {
          console.error("[facility_photos.loadOptions]", error);
          return [];
        }
        return (data ?? []).map((r: { id: string; name: string }) => ({ value: r.id, label: r.name }));
      },
    },
    { name: "image_url", label: "Photo", kind: "image", required: true },
    { name: "caption", label: "Caption", kind: "text" },
    { name: "sort_order", label: "Sort order", kind: "number", defaultValue: 0 },
    { name: "published", label: "Published", kind: "boolean", defaultValue: true },
  ],
};
