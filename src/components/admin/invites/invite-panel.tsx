/**
 * "Invite alumni" or "Invite parents" on the Testimonials admin page: the
 * general link, adding people, and the list of invites for that audience.
 * Stories that come back land in the moderation queue below it.
 */
import { useEffect, useState } from "react";
import { getLinkBase } from "@/lib/invites.functions";
import type { Audience } from "@/lib/invites/audience";
import { AddInviteForm } from "./add-invite-form";
import { BulkImport } from "./bulk-import";
import { GeneralLinkCard } from "./general-link-card";
import { InviteList } from "./invite-list";
import { A_CARD, Notice } from "./ui";

const COPY: Record<Audience, { id: string; heading: string; description: string }> = {
  alumni: {
    id: "invite-alumni",
    heading: "Invite alumni",
    description:
      'Each former student gets their own link to a short form. When they send it, their story waits under "Awaiting review" below.',
  },
  parent: {
    id: "invite-parents",
    heading: "Invite parents",
    description:
      'Each parent gets their own link to a short form. Their quote is published as "Parent, <school>". When they send it, it waits under "Awaiting review" below.',
  },
};

export function InvitePanel({ audience }: { audience: Audience }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [base, setBase] = useState<{ base: string; isLocal: boolean } | null>(null);
  const bump = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    getLinkBase().then(setBase, (err) => console.error("[InvitePanel] link base", err));
  }, []);

  const copy = COPY[audience];

  return (
    <section aria-labelledby={copy.id} className="space-y-4">
      <header>
        <h2 id={copy.id} className="text-lg font-bold text-[var(--color-deep-blue)]">
          {copy.heading}
        </h2>
        <p className="text-sm text-[var(--color-ink)]/70">{copy.description}</p>
      </header>

      {base?.isLocal && (
        <Notice
          notice={{
            tone: "error",
            text: `Links currently point to ${base.base}, which only works on this computer. Set PUBLIC_SITE_URL to the live site address before sending invites.`,
          }}
        />
      )}

      <GeneralLinkCard base={base?.base ?? null} audience={audience} />

      <div
        className={`${A_CARD} grid gap-6 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-[var(--color-deep-blue)]/10 lg:[&>*]:px-6 lg:[&>*:first-child]:pl-0 lg:[&>*:last-child]:pr-0`}
      >
        <AddInviteForm audience={audience} onCreated={bump} />
        <BulkImport audience={audience} onImported={bump} />
      </div>

      <InviteList audience={audience} reloadKey={reloadKey} />
    </section>
  );
}
