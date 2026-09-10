/**
 * Every replaceable photo position on the three school pages.
 *
 * A position is a layout fact, so it lives here in code. The photograph in
 * it is a content fact and lives in `photo_slots` in Supabase. Adding a
 * position needs a deploy; changing a photograph does not.
 *
 * `fallback` is the picture the page shipped with. Thirteen slots
 * deliberately have none — the eight facility tiles whose stand-ins showed
 * the wrong building, and the five sport positions that never had a
 * photograph at all. Those render a labelled panel until staff upload
 * something real. A labelled blank is better than a confident lie.
 */
import type { SchoolSlug } from "@/integrations/alpha-supabase/types";

import clubAviation from "@/assets/club-aviation.webp";
import clubDrama from "@/assets/club-drama.webp";
import clubMusic from "@/assets/club-music-dance.webp";
import clubDebate from "@/assets/club-debate.webp";
import clubArt from "@/assets/club-art.webp";
import clubCookery from "@/assets/club-cookery.webp";
import clubScout from "@/assets/club-scout.webp";
import clubSpeaking from "@/assets/club-public-speaking.webp";
import clubUn from "@/assets/club-un.webp";
import clubEnvironment from "@/assets/club-environment.webp";
import campusGirls from "@/assets/campus-girls.webp";
import photoHippoRide from "@/assets/np-hippo-ride.webp";
import photoGirlPortrait from "@/assets/np-girl-portrait.webp";
import photoTeacher from "@/assets/np-teacher-pupils.webp";
import girlCutout from "@/assets/alpha-girl-uniform.webp";
import photoBallPit from "@/assets/np-ball-pit.webp";
import photoShapesClass from "@/assets/np-shapes-class.webp";
import photoToyCar from "@/assets/np-toy-car.webp";
import photoPlayground from "@/assets/np-playground.webp";
import photoSpeakersTeam from "@/assets/np-junior-speakers-team.webp";
import photoSpeakersGroup from "@/assets/np-junior-speakers-group.webp";
import photoTelescope from "@/assets/np-telescope.webp";
import photoTeam from "@/assets/np-team-thumbs.webp";
import photoMusicalChairs from "@/assets/np-musical-chairs.webp";
import photoDance from "@/assets/np-traditional-dance.webp";

export type SlotDef = {
  /** Stable identity, `<school>.<section>.<name>`. Never change a shipped key. */
  key: string;
  school: SchoolSlug;
  /** Grouping heading in the admin screen. */
  section: string;
  label: string;
  /** CSS aspect-ratio the position crops to, shown as upload guidance. */
  aspect: string;
  guidance?: string;
  fallback?: string;
};

export type SlotPhotoMap = Record<
  string,
  { image_url: string; alt_text: string; credit: string | null }
>;

const WIDE = "16 / 10";
const TILE = "4 / 5";
const CARD = "3 / 2";

export const PHOTO_SLOTS: readonly SlotDef[] = [
  // ---- Alpha High · Clubs (marquee ribbon) ----
  {
    key: "alpha-high.clubs.aviation",
    school: "alpha-high",
    section: "Clubs",
    label: "Aviation club",
    aspect: CARD,
    fallback: clubAviation,
  },
  {
    key: "alpha-high.clubs.drama",
    school: "alpha-high",
    section: "Clubs",
    label: "Drama club",
    aspect: CARD,
    fallback: clubDrama,
  },
  {
    key: "alpha-high.clubs.music",
    school: "alpha-high",
    section: "Clubs",
    label: "Music & Dance club",
    aspect: CARD,
    fallback: clubMusic,
  },
  {
    key: "alpha-high.clubs.debate",
    school: "alpha-high",
    section: "Clubs",
    label: "Debate club",
    aspect: CARD,
    fallback: clubDebate,
  },
  {
    key: "alpha-high.clubs.art",
    school: "alpha-high",
    section: "Clubs",
    label: "Art & Drawing club",
    aspect: CARD,
    fallback: clubArt,
  },
  {
    key: "alpha-high.clubs.cookery",
    school: "alpha-high",
    section: "Clubs",
    label: "Cookery club",
    aspect: CARD,
    fallback: clubCookery,
  },
  {
    key: "alpha-high.clubs.scout",
    school: "alpha-high",
    section: "Clubs",
    label: "Scout club",
    aspect: CARD,
    fallback: clubScout,
  },
  {
    key: "alpha-high.clubs.speaking",
    school: "alpha-high",
    section: "Clubs",
    label: "Public Speaking club",
    aspect: CARD,
    fallback: clubSpeaking,
  },
  {
    key: "alpha-high.clubs.model-un",
    school: "alpha-high",
    section: "Clubs",
    label: "Model UN club",
    aspect: CARD,
    fallback: clubUn,
  },
  {
    key: "alpha-high.clubs.environment",
    school: "alpha-high",
    section: "Clubs",
    label: "Environment club",
    aspect: CARD,
    fallback: clubEnvironment,
  },

  // ---- Alpha High · Sport (no photograph has ever existed for these) ----
  {
    key: "alpha-high.sport.football",
    school: "alpha-high",
    section: "Sport",
    label: "Football",
    aspect: TILE,
    guidance: "Players in action if possible, not an empty pitch.",
  },
  {
    key: "alpha-high.sport.basketball",
    school: "alpha-high",
    section: "Sport",
    label: "Basketball",
    aspect: TILE,
    guidance: "Players in action if possible, not an empty court.",
  },
  {
    key: "alpha-high.sport.volleyball",
    school: "alpha-high",
    section: "Sport",
    label: "Volleyball",
    aspect: TILE,
    guidance: "Players in action if possible, not an empty court.",
  },
  {
    key: "alpha-high.sport.netball",
    school: "alpha-high",
    section: "Sport",
    label: "Netball",
    aspect: TILE,
    guidance: "Players in action if possible, not an empty court.",
  },
  {
    key: "alpha-high.sport.athletics",
    school: "alpha-high",
    section: "Sport",
    label: "Athletics",
    aspect: TILE,
    guidance: "Runners or field events, not an empty track.",
  },

  // ---- Alpha High · Campus & facilities (stand-ins removed — see the spec) ----
  {
    key: "alpha-high.facilities.science-labs",
    school: "alpha-high",
    section: "Campus & facilities",
    label: "Science labs",
    aspect: TILE,
    guidance: "A Mikocheni lab. The tile is portrait — shoot or crop tall.",
  },
  {
    key: "alpha-high.facilities.library",
    school: "alpha-high",
    section: "Campus & facilities",
    label: "Library",
    aspect: TILE,
    guidance: "The Mikocheni library. Portrait crop.",
  },
  {
    key: "alpha-high.facilities.sports-field",
    school: "alpha-high",
    section: "Campus & facilities",
    label: "Sports field",
    aspect: TILE,
    guidance: "The Mikocheni field. Portrait crop.",
  },
  {
    key: "alpha-high.facilities.boarding",
    school: "alpha-high",
    section: "Campus & facilities",
    label: "Boarding",
    aspect: TILE,
    guidance: "Mikocheni boarding. Portrait crop.",
  },

  // ---- Alpha Girls · Campus & facilities ----
  {
    key: "alpha-girls.facilities.science-labs",
    school: "alpha-girls",
    section: "Campus & facilities",
    label: "Science labs",
    aspect: TILE,
    guidance: "A Kunduchi lab. Portrait crop.",
  },
  {
    key: "alpha-girls.facilities.library",
    school: "alpha-girls",
    section: "Campus & facilities",
    label: "Library",
    aspect: TILE,
    guidance: "The Kunduchi library. Portrait crop.",
  },
  {
    key: "alpha-girls.facilities.sports-field",
    school: "alpha-girls",
    section: "Campus & facilities",
    label: "Sports field",
    aspect: TILE,
    guidance: "The Kunduchi field. Portrait crop.",
  },
  {
    key: "alpha-girls.facilities.boarding",
    school: "alpha-girls",
    section: "Campus & facilities",
    label: "Boarding",
    aspect: TILE,
    guidance: "Kunduchi boarding. Portrait crop.",
  },

  // ---- Alpha Girls · Students ----
  {
    key: "alpha-girls.students.campus-plate",
    school: "alpha-girls",
    section: "Students",
    label: "Full-width campus plate",
    aspect: WIDE,
    guidance: "Wide and full-bleed; a caption sits over the bottom third, so keep faces out of it.",
    fallback: campusGirls,
  },

  // ---- Nursery & Primary · Our days (tilted card cluster) ----
  {
    key: "nursery-primary.days.hippo-ride",
    school: "nursery-primary",
    section: "Our days",
    label: "Courtyard play card",
    aspect: CARD,
    guidance: "Sits in a tilted lilac frame, top right of the cluster.",
    fallback: photoHippoRide,
  },
  {
    key: "nursery-primary.days.girl-portrait",
    school: "nursery-primary",
    section: "Our days",
    label: "Gold-frame portrait card",
    aspect: CARD,
    guidance: "The largest card, tilted left in a gold frame. A single pupil reads best.",
    fallback: photoGirlPortrait,
  },
  {
    key: "nursery-primary.days.teacher",
    school: "nursery-primary",
    section: "Our days",
    label: "Teaching card",
    aspect: CARD,
    guidance: "Tilted navy frame, bottom right. A teacher with pupils.",
    fallback: photoTeacher,
  },

  // ---- Nursery & Primary · Primary ----
  {
    key: "nursery-primary.primary.pupil-portrait",
    school: "nursery-primary",
    section: "Primary",
    label: "Circular pupil portrait",
    aspect: "1 / 1",
    guidance:
      "Masked to a circle and anchored to the top of the frame. Use a head-and-shoulders portrait with the face high and centred; anything else crops badly.",
    fallback: girlCutout,
  },

  // ---- Nursery & Primary · Gallery (captions stay in the page) ----
  {
    key: "nursery-primary.gallery.play-discovery",
    school: "nursery-primary",
    section: "Gallery",
    label: "Play & discovery",
    aspect: "3 / 4",
    guidance: "The tall tile — spans two rows. Use an upright photo.",
    fallback: photoBallPit,
  },
  {
    key: "nursery-primary.gallery.shapes",
    school: "nursery-primary",
    section: "Gallery",
    label: "Learning shapes",
    aspect: WIDE,
    fallback: photoShapesClass,
  },
  {
    key: "nursery-primary.gallery.toy-car",
    school: "nursery-primary",
    section: "Gallery",
    label: "Little drivers",
    aspect: WIDE,
    fallback: photoToyCar,
  },
  {
    key: "nursery-primary.gallery.playground",
    school: "nursery-primary",
    section: "Gallery",
    label: "Outdoor adventures",
    aspect: "2 / 1",
    guidance: "Spans two columns — use a wide photo.",
    fallback: photoPlayground,
  },
  {
    key: "nursery-primary.gallery.speakers-team",
    school: "nursery-primary",
    section: "Gallery",
    label: "Junior Speakers team",
    aspect: WIDE,
    fallback: photoSpeakersTeam,
  },
  {
    key: "nursery-primary.gallery.speakers-challenge",
    school: "nursery-primary",
    section: "Gallery",
    label: "Speakers Challenge 2025",
    aspect: WIDE,
    fallback: photoSpeakersGroup,
  },
  {
    key: "nursery-primary.gallery.one-to-one",
    school: "nursery-primary",
    section: "Gallery",
    label: "One-on-one learning",
    aspect: WIDE,
    fallback: photoTeacher,
  },
  {
    key: "nursery-primary.gallery.telescope",
    school: "nursery-primary",
    section: "Gallery",
    label: "Curious minds",
    aspect: WIDE,
    fallback: photoTelescope,
  },
  {
    key: "nursery-primary.gallery.sports-teamwork",
    school: "nursery-primary",
    section: "Gallery",
    label: "Sports & teamwork",
    aspect: "2 / 1",
    guidance: "Spans two columns — use a wide photo.",
    fallback: photoTeam,
  },
  {
    key: "nursery-primary.gallery.musical-chairs",
    school: "nursery-primary",
    section: "Gallery",
    label: "Active play",
    aspect: WIDE,
    fallback: photoMusicalChairs,
  },
  {
    key: "nursery-primary.gallery.dance",
    school: "nursery-primary",
    section: "Gallery",
    label: "Culture & dance",
    aspect: WIDE,
    fallback: photoDance,
  },
] as const;

const BY_KEY = new Map(PHOTO_SLOTS.map((s) => [s.key, s]));

export function slotDef(key: string): SlotDef | undefined {
  return BY_KEY.get(key);
}

/** Slots for one school, grouped under their section, both in registry order. */
export function slotsBySection(school: SchoolSlug): { section: string; slots: SlotDef[] }[] {
  const groups: { section: string; slots: SlotDef[] }[] = [];
  for (const slot of PHOTO_SLOTS) {
    if (slot.school !== school) continue;
    const existing = groups.find((g) => g.section === slot.section);
    if (existing) existing.slots.push(slot);
    else groups.push({ section: slot.section, slots: [slot] });
  }
  return groups;
}

/**
 * The photograph to render: the staff upload, else what the page shipped
 * with, else nothing. Returns null rather than throwing on an unknown key so
 * a stale key can never blank a page at runtime — photo-slots.test.ts is what
 * catches that, before it ships.
 */
export function slotPhoto(photos: SlotPhotoMap, key: string): { src: string; alt: string } | null {
  const uploaded = photos[key];
  if (uploaded) return { src: uploaded.image_url, alt: uploaded.alt_text };
  const def = BY_KEY.get(key);
  if (def?.fallback) return { src: def.fallback, alt: def.label };
  return null;
}
