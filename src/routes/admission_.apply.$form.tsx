/**
 * The online admission form for one school and kind. Unlisted in search:
 * reached from the Admission page. On a computer it is a four-step form that
 * ends in a filled PDF; on phones and tablets it offers the blank form.
 *
 * The trailing underscore on `admission_` keeps this page out of the
 * /admission page's layout (that page has no <Outlet />); the URL is still
 * /admission/apply/$form.
 */
import { useEffect } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { StoryShell } from "@/components/alumni/story-wizard/story-shell";
import { BTN_PRIMARY, BTN_PRIMARY_STYLE } from "@/components/alumni/story-wizard/field-ui";
import { ApplicationWizard } from "@/components/admission-forms/application-wizard";
import { sweepStaleDrafts } from "@/components/admission-forms/use-form-draft";
import { useIsDesktop } from "@/components/admission-forms/use-is-desktop";
import { T } from "@/components/type-roles";
import { getForm, type FormDef } from "@/lib/admission-forms/forms";

export const Route = createFileRoute("/admission_/apply/$form")({
  loader: ({ params }) => {
    const form = getForm(params.form);
    if (!form) throw notFound();
    return { formId: form.id };
  },
  head: ({ loaderData }) => {
    const form = loaderData ? getForm(loaderData.formId) : undefined;
    return {
      meta: [
        {
          title: form
            ? `${form.shortName} ${form.kind === "form-1" ? "Form I 2027" : "Transfer"} application · Alpha Schools`
            : "Application · Alpha Schools",
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: ApplyPage,
});

function headingFor(form: FormDef): string {
  const what =
    form.kind === "form-1" ? "Application for admission, Form I 2027" : "Transfer application";
  return `${form.shortName} — ${what}`;
}

function ApplyPage() {
  const { formId } = Route.useLoaderData();
  const form = getForm(formId) as FormDef;
  const desktop = useIsDesktop();

  /* Drafts expire after a week; clear any that have, on any device's visit. */
  useEffect(() => {
    sweepStaleDrafts();
  }, []);

  return (
    <StoryShell heading={headingFor(form)}>
      {desktop === null && (
        <noscript>
          <p className="max-w-[60ch] text-[var(--color-ink-soft)]" style={T.body}>
            The online form needs JavaScript. Download the blank form, print it and fill it in by
            hand.
          </p>
          <a
            href={form.blankPdfPath}
            download
            className={`mt-5 ${BTN_PRIMARY}`}
            style={BTN_PRIMARY_STYLE}
          >
            Download the blank form
          </a>
        </noscript>
      )}
      {desktop === true && <ApplicationWizard form={form} />}
      {desktop === false && (
        <>
          <p className="max-w-[60ch] text-[var(--color-ink-soft)]" style={T.body}>
            The online form works on a computer. On this device, download the blank form, print it
            and fill it in by hand.
          </p>
          <a
            href={form.blankPdfPath}
            download
            className={`mt-5 ${BTN_PRIMARY}`}
            style={BTN_PRIMARY_STYLE}
          >
            Download the blank form
          </a>
        </>
      )}
    </StoryShell>
  );
}
