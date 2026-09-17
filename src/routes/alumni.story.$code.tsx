/**
 * A personal alumni story link. The code in the URL is the only credential.
 *
 * The invite is looked up from the browser after load rather than in a
 * loader, so WhatsApp's link preview (which runs no JavaScript) does not mark
 * the invite as opened. The referrer policy keeps the code out of any request
 * to another site.
 */
import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { T } from "@/components/type-roles";
import { openInvite, type OpenInviteResult } from "@/lib/invites.functions";
import { firstName } from "@/lib/invites/whatsapp";
import { EMPTY_DRAFT } from "@/lib/story/fields";
import { BTN_PRIMARY, BTN_PRIMARY_STYLE } from "@/components/alumni/story-wizard/field-ui";
import { MessageCard, StoryShell } from "@/components/alumni/story-wizard/story-shell";
import {
  AlreadyReceivedCard,
  InvalidLinkCard,
  StoryWizard,
} from "@/components/alumni/story-wizard/story-wizard";

export const Route = createFileRoute("/alumni/story/$code")({
  head: () => ({
    meta: [
      { title: "Share your story · Alpha Schools" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: PersonalStoryPage,
});

type LoadState = { kind: "loading" } | { kind: "error" } | { kind: "loaded"; invite: OpenInviteResult };

function PersonalStoryPage() {
  const { code } = Route.useParams();
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(() => {
    setState({ kind: "loading" });
    openInvite({ data: { code } }).then(
      (invite) => setState({ kind: "loaded", invite }),
      () => setState({ kind: "error" }),
    );
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <StoryShell>
      <PersonalStoryBody state={state} code={code} onRetry={load} />
    </StoryShell>
  );
}

function PersonalStoryBody({
  state,
  code,
  onRetry,
}: {
  state: LoadState;
  code: string;
  onRetry: () => void;
}) {
  if (state.kind === "loading") return <MessageCard title="Loading your invitation…" />;

  if (state.kind === "error") {
    return (
      <MessageCard title="We couldn't load your invitation">
        <p className="mt-2 text-[var(--color-ink-soft)]" style={T.body}>
          Please check your connection and try again.
        </p>
        <button type="button" onClick={onRetry} className={`mt-5 ${BTN_PRIMARY}`} style={BTN_PRIMARY_STYLE}>
          Try again
        </button>
      </MessageCard>
    );
  }

  const { invite } = state;
  if (invite.state === "invalid") return <InvalidLinkCard />;
  if (invite.state === "submitted") return <AlreadyReceivedCard />;

  return (
    <StoryWizard
      code={code}
      greetingName={firstName(invite.fullName)}
      initial={{
        ...EMPTY_DRAFT,
        fullName: invite.fullName,
        schoolSlug: invite.schoolSlug ?? "",
        gradYear: invite.gradYear ? String(invite.gradYear) : "",
      }}
    />
  );
}
