/**
 * "Invite alumni" on the Testimonials admin page: the general link, adding
 * people, and the list of invites. Stories that come back land in the
 * moderation queue below it.
 */
import { useEffect, useState } from "react";
import { getLinkBase } from "@/lib/invites.functions";
import { AddInviteForm } from "./add-invite-form";
import { GeneralLinkCard } from "./general-link-card";
import { InviteList } from "./invite-list";
import { Notice } from "./ui";

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
          Each person gets their own link to a short step-by-step form. Send it from WhatsApp; their story
          appears under "Awaiting review" when they finish.
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

      <div className="grid gap-4 lg:grid-cols-2">
        <AddInviteForm onCreated={bump} />
      </div>

      <InviteList reloadKey={reloadKey} />
    </section>
  );
}
