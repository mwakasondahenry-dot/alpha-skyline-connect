/**
 * A personal alumni story link. The code in the URL is the only credential.
 * The referrer policy keeps the code out of any request to another site.
 */
import { createFileRoute } from "@tanstack/react-router";
import { EMPTY_DRAFT } from "@/lib/story/fields";
import { InviteGate } from "@/components/alumni/story-wizard/invite-gate";
import { StoryWizard } from "@/components/alumni/story-wizard/story-wizard";

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

function PersonalStoryPage() {
  const { code } = Route.useParams();
  return (
    <InviteGate
      code={code}
      audience="alumni"
      heading={(name) => (name ? `${name}, share your Alpha story` : "Share your Alpha story")}
    >
      {(invite) => (
        <StoryWizard
          code={code}
          initial={{
            ...EMPTY_DRAFT,
            fullName: invite.fullName,
            schoolSlug: invite.schoolSlug ?? "",
            gradYear: invite.gradYear ? String(invite.gradYear) : "",
          }}
        />
      )}
    </InviteGate>
  );
}
