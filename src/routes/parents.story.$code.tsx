/**
 * A personal parent story link. The code in the URL is the only credential.
 * An alumni code opened here is refused (the invite's audience must match).
 */
import { createFileRoute } from "@tanstack/react-router";
import { EMPTY_PARENT_DRAFT } from "@/lib/story/parent-fields";
import { InviteGate } from "@/components/alumni/story-wizard/invite-gate";
import { ParentStoryWizard } from "@/components/alumni/story-wizard/parent-story-wizard";

export const Route = createFileRoute("/parents/story/$code")({
  head: () => ({
    meta: [
      { title: "Share your experience · Alpha Schools" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: PersonalParentStoryPage,
});

function PersonalParentStoryPage() {
  const { code } = Route.useParams();
  return (
    <InviteGate
      code={code}
      audience="parent"
      heading={(name) =>
        name ? `${name}, share your experience of Alpha` : "Share your experience of Alpha"
      }
    >
      {(invite) => (
        <ParentStoryWizard
          code={code}
          initial={{
            ...EMPTY_PARENT_DRAFT,
            fullName: invite.fullName,
            schoolSlug: invite.schoolSlug ?? "",
          }}
        />
      )}
    </InviteGate>
  );
}
