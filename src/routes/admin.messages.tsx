import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/lib/admin-crud";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({ meta: [{ title: "Messages · Alpha Admin" }] }),
  component: () => <AdminCrud config={CONFIG} />,
});

const CONFIG: CrudConfig = {
  table: "contact_messages",
  title: "Contact messages",
  description: "Enquiries submitted via the public /contact form.",
  orderBy: { column: "created_at", ascending: false },
  readOnlyCreate: true,
  listColumns: [
    { key: "created_at", label: "Received", render: (v) => v ? new Date(v as string).toLocaleString() : "—" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "school_slug", label: "School" },
    { key: "subject", label: "Subject" },
    { key: "status", label: "Status" },
  ],
  fields: [], // unused — readOnlyCreate hides the form
};
