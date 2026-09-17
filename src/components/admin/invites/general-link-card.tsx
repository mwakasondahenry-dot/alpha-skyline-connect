/** The general story link: one address any alumnus can use. */
import { useState } from "react";
import { generalMessage, whatsappUrl } from "@/lib/invites/whatsapp";
import { A_BTN_SECONDARY, A_INPUT, Notice, copyText, type NoticeState } from "./ui";

export function GeneralLinkCard({ base }: { base: string | null }) {
  const [notice, setNotice] = useState<NoticeState>(null);
  const link = base ? `${base}/alumni/story` : "";

  async function copy() {
    const ok = await copyText(link);
    setNotice(
      ok
        ? { tone: "ok", text: "General link copied." }
        : { tone: "error", text: "Couldn't copy. Select the link and copy it by hand." },
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="general-story-link" className="block text-sm text-[var(--color-ink)]/70">
        <span className="font-semibold text-[var(--color-deep-blue)]">General link.</span> For
        anyone without a personal invite: WhatsApp groups, status, newsletters.
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="general-story-link"
          readOnly
          value={link || "Loading…"}
          onFocus={(e) => e.currentTarget.select()}
          className={`${A_INPUT} min-w-0 flex-1 basis-64`}
        />
        <button type="button" onClick={copy} disabled={!link} className={A_BTN_SECONDARY}>
          Copy
        </button>
        {link ? (
          <a
            href={whatsappUrl(null, generalMessage(link))}
            target="_blank"
            rel="noopener noreferrer"
            className={A_BTN_SECONDARY}
          >
            Share on WhatsApp
          </a>
        ) : null}
      </div>
      <Notice notice={notice} />
    </div>
  );
}
