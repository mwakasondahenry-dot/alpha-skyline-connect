/**
 * "How it will look": the story rendered by the public testimonials page's
 * own component and type, from the form as it stands, so every edit shows at
 * once. The lines under the name come from the same function the site uses.
 */
import { StoryFigure } from "@/components/testimonials/story-list";
import { formToEdit, type StoryFormValues } from "@/lib/admin/stories-view";
import { storyMeta } from "@/lib/story/story-meta";

export function StoryPreview({ values, photo }: { values: StoryFormValues; photo: string | null }) {
  const edit = formToEdit(values);
  const text = (v: string | null) => (v && v.trim() ? v.trim() : null);
  const item = {
    author_name: values.author_name.trim(),
    quote: values.quote.trim(),
    photo_url: photo,
    relationship: text(edit.relationship),
    company: text(edit.company),
    grad_year: edit.grad_year,
    school_slug: edit.school_slug,
  };
  const empty = !item.author_name && !item.quote;

  return (
    <section aria-labelledby="story-preview-heading" className="space-y-2">
      <h2
        id="story-preview-heading"
        className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-deep-blue)]"
      >
        How it will look
      </h2>
      <div className="rounded-[var(--radius-card)] border border-[var(--color-hairline)] bg-[var(--color-off-white)] p-4 sm:p-5">
        {empty ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            The story appears here as you type the name and their words.
          </p>
        ) : (
          <StoryFigure item={item} meta={storyMeta} />
        )}
      </div>
    </section>
  );
}
