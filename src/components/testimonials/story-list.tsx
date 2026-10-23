/**
 * The testimonials page: every story at once, in two columns on a wide
 * screen and one on a phone.
 *
 * No cards. Each story is a small whole photo beside the words, and the
 * stories are separated by space alone. Columns rather than grid rows, so a
 * one-line story and a five-sentence one sit together without holes.
 *
 * Each story carries an id (`story-<id>`) so the home page's "Read in full"
 * can land on it.
 */
import { T } from "@/components/type-roles";
import { WholePhoto } from "@/components/testimonials/whole-photo";
import type { TestimonialItem } from "@/lib/alpha-content.functions";

export function StoryList({
  items,
  label,
  meta,
}: {
  items: TestimonialItem[];
  /** Names the list for screen readers, e.g. "Parent testimonials". */
  label: string;
  /** The lines under the name: school, class, where they are now. */
  meta: (item: TestimonialItem) => string[];
}) {
  return (
    <ul aria-label={label} className="gap-x-16 lg:columns-2">
      {items.map((item) => (
        <li
          key={item.id}
          id={`story-${item.id}`}
          className="story mb-12 break-inside-avoid scroll-mt-28 last:mb-0 sm:mb-14"
        >
          <figure className="flex gap-5 sm:gap-6">
            <WholePhoto
              src={item.photo_url}
              name={item.author_name}
              className="h-[6.25rem] w-20 rounded-xl sm:h-[7.5rem] sm:w-24"
              initialClassName="text-3xl"
            />
            <div className="min-w-0 flex-1">
              <blockquote
                className="whitespace-pre-line break-words text-[var(--color-ink)]"
                style={{ ...T.body, fontSize: "1.0625rem" }}
              >
                {item.quote}
              </blockquote>
              <figcaption className="mt-4">
                <span
                  className="block font-display text-[var(--color-deep-blue)]"
                  style={{ ...T.body, fontWeight: 800 }}
                >
                  {item.author_name}
                </span>
                {meta(item).map((line) => (
                  <span
                    key={line}
                    className="block text-[var(--color-ink-soft)]"
                    style={{ ...T.body, fontSize: "0.875rem", lineHeight: 1.45 }}
                  >
                    {line}
                  </span>
                ))}
              </figcaption>
            </div>
          </figure>
        </li>
      ))}
    </ul>
  );
}
