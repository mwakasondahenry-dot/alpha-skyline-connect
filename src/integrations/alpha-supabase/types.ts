// Hand-written types matching alpha_schema.sql (Phase 1).
// Regenerate when the schema changes.

export type SchoolSlug =
  | "group-wide"
  | "nursery-primary"
  | "alpha-high"
  | "alpha-girls";

export interface SchoolRow {
  slug: SchoolSlug;
  name: string;
  campus: string | null;
  accent_hex: string | null;
  sort_order: number;
  created_at: string;
}

export interface NewsRow {
  id: string;
  school_slug: SchoolSlug;
  title: string;
  body: string | null;
  cover_url: string | null;
  published: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
}

export interface EventRow {
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

export interface GalleryRow {
  id: string;
  school_slug: SchoolSlug;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface StaffRow {
  id: string;
  school_slug: SchoolSlug;
  name: string;
  title: string | null;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      schools: { Row: SchoolRow; Insert: Partial<SchoolRow>; Update: Partial<SchoolRow> };
      news: { Row: NewsRow; Insert: Partial<NewsRow>; Update: Partial<NewsRow> };
      events: { Row: EventRow; Insert: Partial<EventRow>; Update: Partial<EventRow> };
      gallery: { Row: GalleryRow; Insert: Partial<GalleryRow>; Update: Partial<GalleryRow> };
      staff: { Row: StaffRow; Insert: Partial<StaffRow>; Update: Partial<StaffRow> };
    };
  };
}
