/** The general story link: one address any alumnus can use. */
import { useState } from "react";
import { Copy, MessageCircle } from "lucide-react";
import { generalMessage, whatsappUrl } from "@/lib/invites/whatsapp";
import { A_BTN_SECONDARY, A_CARD, A_INPUT, Notice, copyText, type NoticeState } from "./ui";

export function GeneralLinkCard({ base }: { base: string | null }) {
  const [notice, setNotice] = useState<NoticeState>(null);
  const link = base ? `${base}/alumni/story` : "";

  async function copy() {
    const ok = await copyText(link);
    setNotice(
      ok
        ? { tone: "ok", text: "General link copied." }
        : { tone: "error", text: "Couldn't copy. Select the link above and copy it by hand." },
    );
  }

  return (
    <div className={`${A_CARD} space-y-3`}>
      <div>
        <h3 className="font-semibold text-[var(--color-deep-blue)]">General link</h3>
        <p className="text-sm text-[var(--color-ink)]/70">
          For any alumnus, without a personal invite. Share it in groups or on your status.
        </p>
      </div>
      <input
        readOnly
        value={link || "Loading…"}
        onFocus={(e) => e.currentTarget.select()}
        aria-label="General story link"
        className={A_INPUT}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} disabled={!link} className={A_BTN_SECONDARY}>
          <Copy className="h-4 w-4" aria-hidden />
          Copy link
        </button>
        <a
          href={link ? whatsappUrl(null, generalMessage(link)) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!link}
          className={A_BTN_SECONDARY}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Share on WhatsApp
        </a>
      </div>
      <Notice notice={notice} />
    </div>
  );
}
