/**
 * "Invite alumni" on the Testimonials admin page: the general link, adding
 * people, and the list of invites. Stories that come back land in the
 * moderation queue below it.
 */
import { useEffect, useState } from "react";
import { getLinkBase } from "@/lib/invites.functions";
import { AddInviteForm } from "./add-invite-form";
import { BulkImport } from "./bulk-import";
import { GeneralLinkCard } from "./general-link-card";
import { InviteList } from "./invite-list";
import { A_CARD, Notice } from "./ui";

export function InvitePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [base, setBase] = useState<{ base: string; isLocal: boolean } | null>(null);
  const bump = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    getLinkBase().then(setBase, (err) => console.error("[InvitePanel] link base", err));
  }, []);

  return (
    <section aria-labelledby="invite-alumni" className="space-y-4">
      <header>
        <h2 id="invite-alumni" className="text-lg font-bold text-[var(--color-deep-blue)]">
          Invite alumni
        </h2>
        <p className="text-sm text-[var(--color-ink)]/70">
          Each person gets their own link to a short form. When they send it, their story waits
          under "Awaiting review" below.
        </p>
      </header>

      {base?.isLocal && (
        <Notice
          notice={{
            tone: "error",
            text: `Links currently point to ${base.base}, which only works on this computer. Set PUBLIC_SITE_URL to the live site address before sending invites.`,
          }}
        />
      )}

      <GeneralLinkCard base={base?.base ?? null} />

      <div
        className={`${A_CARD} grid gap-6 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-[var(--color-deep-blue)]/10 lg:[&>*]:px-6 lg:[&>*:first-child]:pl-0 lg:[&>*:last-child]:pr-0`}
      >
        <AddInviteForm onCreated={bump} />
        <BulkImport onImported={bump} />
      </div>

      <InviteList reloadKey={reloadKey} />
    </section>
  );
}
