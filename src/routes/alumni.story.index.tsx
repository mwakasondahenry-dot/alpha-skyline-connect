/**
 * The general alumni story link. Unlisted: shared by staff, kept out of
 * search. Anyone can use it; stories go to the moderation queue tagged
 * "General link". Personal links live at /alumni/story/$code.
 */
import { createFileRoute } from "@tanstack/react-router";
import { EMPTY_DRAFT } from "@/lib/story/fields";
import { StoryShell } from "@/components/alumni/story-wizard/story-shell";
import { StoryWizard } from "@/components/alumni/story-wizard/story-wizard";

export const Route = createFileRoute("/alumni/story/")({
  head: () => ({
    meta: [
      { title: "Share your story · Alpha Schools" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "For Alpha alumni: send us your story for the alumni page." },
    ],
  }),
  component: GeneralStoryPage,
});

function GeneralStoryPage() {
  return (
    <StoryShell>
      <StoryWizard code={null} initial={EMPTY_DRAFT} />
    </StoryShell>
  );
}
