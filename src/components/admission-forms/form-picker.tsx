/**
 * "Choose your form" section of the Admission page. Computers get the online
 * form plus the blank PDF; phones and tablets get the blank PDF only.
 * Plain data and links only: pdf-lib is never loaded here.
 */
import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { T, SHELL } from "@/components/type-roles";
import {
  BTN_PRIMARY,
  BTN_PRIMARY_STYLE,
  BTN_SECONDARY,
} from "@/components/alumni/story-wizard/field-ui";
import { FORMS, type FormDef } from "@/lib/admission-forms/forms";
import { useIsDesktop } from "./use-is-desktop";

const GROUPS = [
  { school: "alpha-high", name: "Alpha High", accent: "var(--color-deep-blue)" },
  { school: "alpha-girls", name: "Alpha Girls", accent: "var(--color-girls-teal)" },
] as const;

const ROW_LABEL: Record<FormDef["kind"], string> = {
  "form-1": "Form I 2027",
  transfer: "Transfer",
};

function FormRow({ form, desktop }: { form: FormDef; desktop: boolean }) {
  return (
    <li className="flex flex-col gap-3 border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
      <span className="font-semibold text-[var(--color-deep-blue)]" style={T.body}>
        {ROW_LABEL[form.kind]}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {desktop && (
          <Link
            to="/admission/apply/$form"
            params={{ form: form.id }}
            className={BTN_PRIMARY}
            style={BTN_PRIMARY_STYLE}
          >
            Fill in online
          </Link>
        )}
        <a
          href={form.blankPdfPath}
          download
          className={desktop ? BTN_SECONDARY : `${BTN_PRIMARY} gap-2`}
          style={desktop ? T.body : BTN_PRIMARY_STYLE}
        >
          <Download className="h-4 w-4" aria-hidden />
          Download blank form
        </a>
      </div>
    </li>
  );
}

export function FormPicker() {
  const desktop = useIsDesktop() === true;

  return (
    <section id="forms" className={`${SHELL} scroll-mt-24 py-[var(--space-section-y)]`}>
      <Reveal>
        <h2 className="font-display text-[var(--color-deep-blue)]" style={T.section}>
          Choose your form
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {GROUPS.map((g, i) => (
          <Reveal key={g.school} delay={i * 100}>
            <article
              className="h-full overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
              style={{ borderTopColor: g.accent, borderTopWidth: 4 }}
            >
              <h3 className="font-display" style={{ ...T.cardTitle, color: g.accent }}>
                {g.name}
              </h3>
              <ul className="mt-5 space-y-4">
                {FORMS.filter((f) => f.school === g.school).map((f) => (
                  <FormRow key={f.id} form={f} desktop={desktop} />
                ))}
              </ul>
              {!desktop && (
                <p className="mt-5 text-[var(--color-ink)]/70" style={T.body}>
                  You can also fill these forms in online from a computer.
                </p>
              )}
            </article>
          </Reveal>
        ))}

        <Reveal delay={200}>
          <article
            className="h-full overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
            style={{ borderTopColor: "var(--color-bright-blue)", borderTopWidth: 4 }}
          >
            <h3 className="font-display text-[var(--color-bright-blue)]" style={T.cardTitle}>
              Alpha Nursery & Primary
            </h3>
            <p className="mt-5 italic text-[var(--color-ink)]/70" style={T.body}>
              [Nursery & Primary application form — to be provided]
            </p>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
