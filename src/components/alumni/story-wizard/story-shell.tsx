/** Page chrome for the story routes: site header, heading, footer. */
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SHELL, T } from "@/components/type-roles";
import { CARD } from "./field-ui";

export function StoryShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-off-white)] text-[var(--color-ink)]">
      <SiteHeader />
      <main className={`${SHELL} py-[var(--space-section-y)]`}>
        <div className="mx-auto max-w-2xl">
          <p className="text-[var(--color-bright-blue)]" style={T.label}>
            Alpha Alumni
          </p>
          <h1 className="mt-2 font-display tracking-tight text-[var(--color-deep-blue)]" style={T.section}>
            Share your story
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
          <div className="mt-[var(--space-block-y)]">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function MessageCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={CARD} role="status">
      {icon}
      <h2 className="mt-3 font-display text-[var(--color-deep-blue)]" style={T.cardTitle}>
        {title}
      </h2>
      {children}
    </div>
  );
}
