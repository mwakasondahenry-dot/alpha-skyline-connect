/**
 * The general parent story link. Unlisted: shared by staff, kept out of
 * search. Personal parent links live at /parents/story/$code.
 */
import { createFileRoute } from "@tanstack/react-router";
import { EMPTY_PARENT_DRAFT } from "@/lib/story/parent-fields";
import { ParentStoryWizard } from "@/components/alumni/story-wizard/parent-story-wizard";
import { StoryShell } from "@/components/alumni/story-wizard/story-shell";

export const Route = createFileRoute("/parents/story/")({
  head: () => ({
    meta: [
      { title: "Share your experience · Alpha Schools" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "For Alpha parents: tell us about your family's experience of the school.",
      },
    ],
  }),
  component: GeneralParentStoryPage,
});

function GeneralParentStoryPage() {
  return (
    <StoryShell heading="Share your experience of Alpha">
      <ParentStoryWizard code={null} initial={EMPTY_PARENT_DRAFT} />
    </StoryShell>
  );
}
