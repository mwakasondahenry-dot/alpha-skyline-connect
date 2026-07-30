// Static, non-CMS content per school. Fill copy as the user supplies it.
// Marked TODO copy: are clearly-placeholder strings to be replaced.

import type { SchoolSlug } from "@/integrations/alpha-supabase/types";
import campusNurseryImage from "@/assets/campus-nursery.jpg.asset.json";
import campusHighImage from "@/assets/campus-high.jpg.asset.json";
import campusGirlsImage from "@/assets/campus-girls.jpg.asset.json";

export type SchoolFact = { label: string; value: string };
export type SchoolProgram = { title: string; description: string };

export type SchoolConfig = {
  slug: SchoolSlug;
  name: string;
  campus: string;
  accent: string; // CSS var name e.g. "var(--color-bright-blue)"
  accentSoft: string; // light tint for header band
  heroImage: string;
  heroAlt: string;
  tagline: string;
  intro: string;
  narrative: string[]; // paragraphs
  facts: SchoolFact[];
  programs: SchoolProgram[];
  facilities: string[];
  admissionCta: string;
};

export const SCHOOL_CONFIGS: Record<Exclude<SchoolSlug, "group-wide">, SchoolConfig> = {
  "nursery-primary": {
    slug: "nursery-primary",
    name: "Nursery & Primary",
    campus: "Combined campus · Ages 2–12",
    accent: "var(--color-bright-blue)",
    accentSoft: "rgba(34, 142, 215, 0.08)",
    heroImage: campusNurseryImage.url,
    heroAlt: "Alpha Nursery & Primary pupils in green sports kit",
    tagline: "TODO copy: one-line tagline for Nursery & Primary.",
    intro:
      "TODO copy: 2–4 sentence intro paragraph that sits over the hero image. Set the tone for the youngest learners at Alpha.",
    narrative: [
      "TODO copy: opening paragraph about the school's philosophy, daily life and what makes early years at Alpha distinct.",
      "TODO copy: a second paragraph about the transition from nursery into primary and the foundation built for secondary.",
    ],
    facts: [
      { label: "Ages", value: "2–12" },
      { label: "Campus", value: "TODO" },
      { label: "Curriculum", value: "TODO" },
      { label: "Language of instruction", value: "English" },
      { label: "Boarding", value: "Day school" },
    ],
    programs: [
      { title: "Early Years (2–5)", description: "TODO copy: one-sentence description." },
      { title: "Lower Primary (6–9)", description: "TODO copy: one-sentence description." },
      { title: "Upper Primary (10–12)", description: "TODO copy: one-sentence description." },
    ],
    facilities: [
      "TODO: facility bullet",
      "TODO: facility bullet",
      "TODO: facility bullet",
      "TODO: facility bullet",
    ],
    admissionCta: "TODO copy: short admission line for Nursery & Primary.",
  },
  "alpha-high": {
    slug: "alpha-high",
    name: "Alpha High",
    campus: "Co-education · Mikocheni · Form 1–6",
    accent: "var(--color-deep-blue)",
    accentSoft: "rgba(15, 35, 88, 0.08)",
    heroImage: campusHighImage.url,
    heroAlt: "Alpha High aviation students in safety vests at JNIA",
    tagline: "TODO copy: one-line tagline for Alpha High.",
    intro:
      "TODO copy: 2–4 sentence intro paragraph for the flagship secondary — aviation, coding, NECTA pathways.",
    narrative: [
      "TODO copy: opening paragraph about secondary life, academic rigour, and the Alpha High character.",
      "TODO copy: a second paragraph about pathways into university, aviation careers and tech.",
    ],
    facts: [
      { label: "Levels", value: "Form 1–6 (O-Level + A-Level)" },
      { label: "Campus", value: "Mikocheni" },
      { label: "Curriculum", value: "NECTA + Aviation + Coding" },
      { label: "Language of instruction", value: "English" },
      { label: "Boarding", value: "TODO" },
    ],
    programs: [
      { title: "O-Level (Form 1–4)", description: "TODO copy: one-sentence description." },
      { title: "A-Level (Form 5–6)", description: "TODO copy: one-sentence description." },
      { title: "Aviation Programme", description: "TODO copy: one-sentence description." },
      { title: "Coding & Digital Skills", description: "TODO copy: one-sentence description." },
    ],
    facilities: [
      "TODO: facility bullet",
      "TODO: facility bullet",
      "TODO: facility bullet",
      "TODO: facility bullet",
    ],
    admissionCta: "TODO copy: short admission line for Alpha High.",
  },
  "alpha-girls": {
    slug: "alpha-girls",
    name: "Alpha Girls",
    campus: "Girls' secondary · Kunduchi · Form 1–6",
    accent: "var(--color-blue-violet)",
    accentSoft: "rgba(101, 73, 200, 0.08)",
    heroImage: campusGirlsImage.url,
    heroAlt: "Alpha Girls students celebrating with medals",
    tagline: "TODO copy: one-line tagline for Alpha Girls.",
    intro:
      "TODO copy: 2–4 sentence intro paragraph — a secondary built for girls to lead, same rigour, room to thrive.",
    narrative: [
      "TODO copy: opening paragraph about girls-only environment, leadership, and academic outcomes.",
      "TODO copy: a second paragraph about aviation, coding and university destinations.",
    ],
    facts: [
      { label: "Levels", value: "Form 1–6 (O-Level + A-Level)" },
      { label: "Campus", value: "Kunduchi" },
      { label: "Curriculum", value: "NECTA + Aviation + Coding" },
      { label: "Language of instruction", value: "English" },
      { label: "Boarding", value: "TODO" },
    ],
    programs: [
      { title: "O-Level (Form 1–4)", description: "TODO copy: one-sentence description." },
      { title: "A-Level (Form 5–6)", description: "TODO copy: one-sentence description." },
      { title: "Aviation Programme", description: "TODO copy: one-sentence description." },
      { title: "Coding & Digital Skills", description: "TODO copy: one-sentence description." },
    ],
    facilities: [
      "TODO: facility bullet",
      "TODO: facility bullet",
      "TODO: facility bullet",
      "TODO: facility bullet",
    ],
    admissionCta: "TODO copy: short admission line for Alpha Girls.",
  },
};
