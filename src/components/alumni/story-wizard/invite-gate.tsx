/**
 * Loads a personal invite in the browser and shows the matching state.
 * Runs after load rather than in a route loader, so WhatsApp's link preview
 * (which runs no JavaScript) does not mark the invite as opened.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { T } from "@/components/type-roles";
import { openInvite, type OpenInviteResult } from "@/lib/invites.functions";
import type { Audience } from "@/lib/invites/audience";
import { firstName } from "@/lib/invites/whatsapp";
import { BTN_PRIMARY, BTN_PRIMARY_STYLE } from "./field-ui";
import { MessageCard, StoryShell } from "./story-shell";
import { AlreadyReceivedCard, InvalidLinkCard } from "./wizard-frame";

type Ok = Extract<OpenInviteResult, { state: "ok" }>;
type LoadState = { kind: "loading" } | { kind: "error" } | { kind: "loaded"; invite: OpenInviteResult };

export function InviteGate({
  code,
  audience,
  heading,
  children,
}: {
  code: string;
  audience: Audience;
  /** The page heading, given the invitee's first name once known. */
  heading: (name: string | null) => string;
  children: (invite: Ok) => ReactNode;
}) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(() => {
    setState({ kind: "loading" });
    openInvite({ data: { code, audience } }).then(
      (invite) => setState({ kind: "loaded", invite }),
      () => setState({ kind: "error" }),
    );
  }, [code, audience]);

  useEffect(() => {
    load();
  }, [load]);

  const ok = state.kind === "loaded" && state.invite.state === "ok" ? state.invite : null;

  return (
    <StoryShell heading={heading(ok ? firstName(ok.fullName) : null)}>
      {state.kind === "loading" && <MessageCard title="Loading your invitation…" />}
      {state.kind === "error" && (
        <MessageCard title="We couldn't load your invitation">
          <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
            Please check your connection and try again.
          </p>
          <button type="button" onClick={load} className={`mt-5 ${BTN_PRIMARY}`} style={BTN_PRIMARY_STYLE}>
            Try again
          </button>
        </MessageCard>
      )}
      {state.kind === "loaded" && state.invite.state === "invalid" && <InvalidLinkCard />}
      {state.kind === "loaded" && state.invite.state === "submitted" && <AlreadyReceivedCard />}
      {ok && children(ok)}
    </StoryShell>
  );
}
