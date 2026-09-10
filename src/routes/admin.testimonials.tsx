import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";
import { AlumniPendingQueue } from "@/components/admin/alumni-pending";

export const Route = createFileRoute("/admin/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials · Alpha Admin" }] }),
  component: TestimonialsAdmin,
});

/**
 * Testimonials, plus the alumni moderation queue.
 *
 * The queue sits above the table rather than on a screen of its own: both are
 * rows in public.testimonials, and splitting them would mean two places to
 * look for the same content. Approving a submission just flips published, so
 * it drops out of the queue and into the table below.
 *
 * The table lists every row, pending ones included, because it is the full
 * view of the table. The Published column tells them apart, and the queue is
 * where a submission is meant to be acted on.
 */
function TestimonialsAdmin() {
  /* Bumping this remounts AdminCrud so an approval shows up in the table
     immediately. AdminCrud owns its own fetch and exposes no refresh handle,
     and adding one for a single consumer is not worth widening its API. */
  const [version, setVersion] = useState(0);

  return (
    <div className="space-y-8">
      <AlumniPendingQueue onChanged={() => setVersion((v) => v + 1)} />
      <AdminCrud key={version} config={CONFIG} />
    </div>
  );
}

const CONFIG: CrudConfig = {
  table: "testimonials",
  title: "Testimonials",
  description:
    "Parent quotes and approved alumni stories. A row with a graduating year is an alumni entry.",
  orderBy: { column: "sort_order", ascending: true },
  listColumns: [
    { key: "photo_url", label: "Photo" },
    { key: "author_name", label: "Name" },
    { key: "relationship", label: "Relationship / role" },
    { key: "grad_year", label: "Class of" },
    { key: "school_slug", label: "School" },
    { key: "published", label: "Published" },
  ],
  fields: [
    { name: "author_name", label: "Name", kind: "text", required: true },
    {
      name: "relationship",
      label: "Relationship or role",
      kind: "text",
      placeholder: "Parent, Form 3 — or a job title for alumni",
    },
    {
      name: "grad_year",
      label: "Graduating year (alumni only)",
      kind: "number",
      helpText:
        "Leave empty for a parent quote. Setting this marks the entry as alumni and shows it on /alumni.",
    },
    { name: "company", label: "Company or organisation (alumni only)", kind: "text" },
    { name: "school_slug", label: "School", kind: "school", required: true, defaultValue: "group-wide" },
    { name: "quote", label: "Testimonial", kind: "textarea", required: true },
    { name: "photo_url", label: "Photo (optional)", kind: "image" },
    { name: "sort_order", label: "Order", kind: "number", defaultValue: 0 },
    { name: "published", label: "Published", kind: "boolean", defaultValue: true },
  ],
};
