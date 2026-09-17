/** Page chrome for the story routes: site header, heading, footer. */
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SHELL, T } from "@/components/type-roles";
import { CARD } from "./field-ui";

/** The heading names the person when the link is personal. */
export function StoryShell({ name, children }: { name?: string | null; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />
      <main className={`${SHELL} py-[var(--space-section-y)]`}>
        <div className="mx-auto max-w-2xl">
          <h1
            className="font-display tracking-tight text-balance text-[var(--color-deep-blue)]"
            style={T.section}
          >
            {name ? `${name}, share your Alpha story` : "Share your Alpha story"}
          </h1>
          <span
            aria-hidden
            className="mt-[var(--heading-rule-gap)] block"
            style={{
              width: "var(--heading-rule-w)",
              height: "var(--heading-rule-h)",
              background: "var(--heading-rule-color)",
              borderRadius: "var(--heading-rule-radius)",
            }}
          />
          <div className="mt-5">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function MessageCard({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={CARD} role="status">
      <h2 className="font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
        {title}
      </h2>
      {children}
    </div>
  );
}
