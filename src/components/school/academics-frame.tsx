import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Info } from "lucide-react";
import { T, SHELL } from "@/components/type-roles";

/**
 * The framing around the academics section: the tinted opening band and the
 * guidance callout that closes it.
 *
 * Split out of subject-lists.tsx because that module is the LISTS — the
 * disclosure card and the three things rendered inside it. This is the section
 * chrome around them, it is used once per page rather than three times, and
 * keeping the two apart is what stops either file growing into the page.
 *
 * Like the lists, these carry no content. Every string is a prop and lives in
 * the page, so Alpha High and Alpha Girls can diverge without a refactor.
 */

/** Sets the accent for the band and callout, or nothing when none is given. */
const accentVar = (accent?: string): CSSProperties | undefined =>
  accent ? ({ "--ac-accent": accent } as CSSProperties) : undefined;

/**
 * The section's opening band.
 *
 * The comp opens on a tint rather than on white, with a faint mark in the
 * corner. It also sets a script tagline — "Explore. Combine. Excel." — which
 * is not built: that line appears in no school document and nowhere in this
 * codebase, and inventing brand copy is the thing design/README.md exists to
 * stop. The band takes the page's real eyebrow, heading and intro instead.
 */
export function CurriculumBand({
  eyebrow,
  title,
  intro,
  accent,
  image,
}: {
  /** Optional small label above the heading. The redesigned pages omit it. */
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  accent?: string;
  /** Decorative photograph faded in from the right. */
  image?: string;
}) {
  return (
    <div className={`ac-band${image ? " ac-band--photo" : ""}`} style={accentVar(accent)}>
      {image ? (
        <img width={1200} height={800} loading="lazy" src={image} alt="" aria-hidden className="ac-band__photo" decoding="async" />
      ) : (
        <GraduationCap aria-hidden className="ac-band__mark" strokeWidth={1} />
      )}
      <div className={`${SHELL} relative py-[var(--space-block-y)]`}>
        <div className={image ? "md:max-w-[50%]" : undefined}>
          {eyebrow && (
            <p className="mb-3 flex items-center gap-3" style={T.label}>
              <span
                aria-hidden
                className="inline-block"
                style={{
                  width: "var(--heading-rule-w)",
                  height: "var(--heading-rule-h)",
                  background: "var(--color-gold)",
                  borderRadius: "var(--heading-rule-radius)",
                }}
              />
              <span style={{ color: "var(--ac-accent, var(--color-brand-blue))" }}>{eyebrow}</span>
            </p>
          )}
          <h2
            className="max-w-3xl font-display tracking-tight text-balance text-[var(--color-ink)]"
            style={T.section}
          >
            {title}
          </h2>
          <span
            aria-hidden
            className="mt-[var(--heading-rule-gap)] block"
            style={{
              width: "var(--heading-rule-w)",
              height: "var(--heading-rule-h)",
              background: "var(--color-gold)",
              borderRadius: "var(--heading-rule-radius)",
            }}
          />
          {intro && (
            <p className="mt-4 max-w-2xl text-[var(--color-ink-soft)]" style={T.body}>
              {intro}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The closing callout. The comp's "Need Guidance? / Talk to Our Team" bar,
 * pointing at the contact route that already exists rather than a new one.
 */
export function GuidanceCallout({
  title,
  body,
  cta,
  to = "/contact",
  accent,
}: {
  title: string;
  body: string;
  cta: string;
  to?: string;
  accent?: string;
}) {
  return (
    <div className="ac-callout" style={accentVar(accent)}>
      <span aria-hidden className="ac-callout__icon">
        <Info className="h-5 w-5" />
      </span>
      <div className="ac-callout__body">
        <p className="font-display text-[var(--color-ink)]" style={T.cardTitle}>
          {title}
        </p>
        <p className="mt-1 text-[var(--color-ink-soft)]" style={T.body}>
          {body}
        </p>
      </div>
      <Link to={to} className="ac-callout__cta" style={T.body}>
        {cta}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </div>
  );
}
