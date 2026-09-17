/** Add one alumnus by hand. */
import { useState, type FormEvent } from "react";
import { createInvites } from "@/lib/invites.functions";
import { ALUMNI_SCHOOLS, validateContact } from "@/lib/invites/contacts";
import { A_BTN_PRIMARY, A_INPUT, Notice, errorText, useAccessToken, type NoticeState } from "./ui";

const EMPTY = { name: "", phone: "", email: "", school: "", year: "" };

export function AddInviteForm({ onCreated }: { onCreated: () => void }) {
  const accessToken = useAccessToken();
  const [fields, setFields] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const checked = validateContact(fields);
    if (!checked.ok) {
      setNotice({ tone: "error", text: checked.reason });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const res = await createInvites({ data: { accessToken, audience: "alumni", rows: [checked.draft] } });
      if (res.created === 0) {
        setNotice({ tone: "error", text: "This phone number already has an invite. It is in the list below." });
        return;
      }
      setNotice({
        tone: "ok",
        text: `${checked.draft.fullName} added. Send their link from the list below.`,
      });
      setFields(EMPTY);
      onCreated();
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err, "Could not create the invite.") });
    } finally {
      setBusy(false);
    }
  }

  const label = "block text-sm font-medium text-[var(--color-deep-blue)]";

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <h3 className="font-semibold text-[var(--color-deep-blue)]">Add one person</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>
          Name *
          <input value={fields.name} onChange={set("name")} className={`mt-1 ${A_INPUT}`} maxLength={120} />
        </label>
        <label className={label}>
          Phone *
          <input
            value={fields.phone}
            onChange={set("phone")}
            inputMode="tel"
            placeholder="0712 345 678"
            className={`mt-1 ${A_INPUT}`}
          />
        </label>
        <label className={label}>
          Email
          <input value={fields.email} onChange={set("email")} type="email" className={`mt-1 ${A_INPUT}`} />
        </label>
        <label className={label}>
          School
          <select value={fields.school} onChange={set("school")} className={`mt-1 ${A_INPUT}`}>
            <option value="">Not sure</option>
            {ALUMNI_SCHOOLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Class of
          <input
            value={fields.year}
            onChange={(e) => setFields((f) => ({ ...f, year: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
            inputMode="numeric"
            placeholder="2018"
            className={`mt-1 ${A_INPUT}`}
          />
        </label>
      </div>
      <button type="submit" disabled={busy} className={A_BTN_PRIMARY}>
        {busy ? "Adding…" : "Add invite"}
      </button>
      <Notice notice={notice} />
    </form>
  );
}
