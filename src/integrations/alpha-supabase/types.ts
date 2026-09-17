// Hand-written types matching alpha_schema.sql.
// Regenerate when the schema changes.

export type SchoolSlug =
  | "group-wide"
  | "nursery-primary"
  | "alpha-high"
  | "alpha-girls";

export type SchoolRow = {
  slug: SchoolSlug;
  name: string;
  campus: string | null;
  accent_hex: string | null;
  sort_order: number;
  created_at: string;
}

export type NewsRow = {
  id: string;
  school_slug: SchoolSlug;
  title: string;
  body: string | null;
  cover_url: string | null;
  published: boolean;
  urgent: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
}

export type EventRow = {
  id: string;
  school_slug: SchoolSlug;
  title: string;
  description: string | null;
  event_date: string; // YYYY-MM-DD
  location: string | null;
  cover_url: string | null;
  published: boolean;
  created_at: string;
}

export type GalleryRow = {
  id: string;
  school_slug: SchoolSlug;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export type StaffRow = {
  id: string;
  school_slug: SchoolSlug;
  name: string;
  title: string | null;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
}

export type FacilityRow = {
  id: string;
  school_slug: SchoolSlug;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export type FacilityPhotoRow = {
  id: string;
  school_slug: SchoolSlug;
  facility_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
}


export type PhotoSlotRow = {
  /** Stable `<school>.<section>.<name>` identity, declared in src/lib/photo-slots.ts. */
  slot_key: string;
  school_slug: SchoolSlug;
  image_url: string;
  /** Required. These photos are how a parent reads the school, screen reader or not. */
  alt_text: string;
  credit: string | null;
  updated_at: string;
}

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  school_slug: SchoolSlug | null;
  subject: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

export type HeroSlideRow = {
  id: string;
  page_key: string;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export type InviteStatus = "pending" | "opened" | "submitted";

export type InviteAudience = "alumni" | "parent";

/** See alpha_migration_testimonial_invites.sql. */
export type TestimonialInviteRow = {
  id: string;
  full_name: string;
  /** E.164, e.g. +255712345678. Unique. */
  phone: string;
  /** Who the invite is for. Phone numbers are unique per audience. */
  audience: InviteAudience;
  email: string | null;
  school_slug: SchoolSlug | null;
  grad_year: number | null;
  /** SHA-256 hex of the link code. */
  token_hash: string;
  /** base64(iv ‖ AES-GCM ciphertext) of the link code. Server key only. */
  token_cipher: string;
  status: InviteStatus;
  expires_at: string;
  opened_at: string | null;
  submitted_at: string | null;
  last_shared_at: string | null;
  created_by: string | null;
  created_at: string;
}

export type TestimonialRow = {
  id: string;
  school_slug: SchoolSlug | null;
  author_name: string;
  /** Free text. 'Parent, Form 3' for a parent quote; a job title for alumni. */
  relationship: string | null;
  quote: string;
  photo_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;

  /* Alumni submissions — see alpha_migration_alumni_submissions.sql.
     grad_year doubles as the alumni discriminator: it is required by the
     submission form and never set on a parent quote. */
  grad_year: number | null;
  company: string | null;
  consent_at: string | null;
  consent_text: string | null;
  /** Object path in the PRIVATE alumni-pending bucket, while awaiting review. */
  pending_photo_path: string | null;
  submitted_ip: string | null;

  /* Invites — see alpha_migration_testimonial_invites.sql. */
  /** Set when the story came through a personal link; null for the general link. */
  invite_id: string | null;
  /** Story prompt answers keyed by prompt (alumni or parent prompts). Staff only; never published. */
  answers: Record<string, string> | null;
  city_country: string | null;
}

export interface Database {
  public: {
    Tables: {
      schools: { Row: SchoolRow; Insert: Partial<SchoolRow>; Update: Partial<SchoolRow>; Relationships: [] };
      news: { Row: NewsRow; Insert: Partial<NewsRow>; Update: Partial<NewsRow>; Relationships: [] };
      events: { Row: EventRow; Insert: Partial<EventRow>; Update: Partial<EventRow>; Relationships: [] };
      gallery: { Row: GalleryRow; Insert: Partial<GalleryRow>; Update: Partial<GalleryRow>; Relationships: [] };
      staff: { Row: StaffRow; Insert: Partial<StaffRow>; Update: Partial<StaffRow>; Relationships: [] };
      facilities: { Row: FacilityRow; Insert: Partial<FacilityRow>; Update: Partial<FacilityRow>; Relationships: [] };
      facility_photos: { Row: FacilityPhotoRow; Insert: Partial<FacilityPhotoRow>; Update: Partial<FacilityPhotoRow>; Relationships: [] };
      photo_slots: { Row: PhotoSlotRow; Insert: Partial<PhotoSlotRow>; Update: Partial<PhotoSlotRow>; Relationships: [] };
      contact_messages: { Row: ContactMessageRow; Insert: Partial<ContactMessageRow>; Update: Partial<ContactMessageRow>; Relationships: [] };
      hero_slides: { Row: HeroSlideRow; Insert: Partial<HeroSlideRow>; Update: Partial<HeroSlideRow>; Relationships: [] };
      testimonials: { Row: TestimonialRow; Insert: Partial<TestimonialRow>; Update: Partial<TestimonialRow>; Relationships: [] };
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow>; Update: Partial<ProfileRow>; Relationships: [] };
      testimonial_invites: { Row: TestimonialInviteRow; Insert: Partial<TestimonialInviteRow>; Update: Partial<TestimonialInviteRow>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
