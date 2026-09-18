// Server functions that read PUBLISHED public content from Alpha's Supabase.
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { supabaseBaseUrl } from "@/lib/server/supabase-url";
import type {
  Database,
  NewsRow,
  EventRow,
  GalleryRow,
  SchoolRow,
  SchoolSlug,
  StaffRow,
  FacilityRow,
  FacilityPhotoRow,
  HeroSlideRow,
  TestimonialRow,
} from "@/integrations/alpha-supabase/types";

/* The _SERVER variants are an override, not a requirement: a deployment that
   sets only ALPHA_SUPABASE_URL and ALPHA_SUPABASE_ANON_KEY reads the same
   project. Without this fallback every content query threw, and because each
   one is caught and logged the pages simply rendered empty. */
function serverClient() {
  const url = supabaseBaseUrl(
    process.env.ALPHA_SUPABASE_URL_SERVER ?? process.env.ALPHA_SUPABASE_URL,
  );
  const key = process.env.ALPHA_SUPABASE_ANON_KEY_SERVER ?? process.env.ALPHA_SUPABASE_ANON_KEY;
  if (!url) {
    throw new Error("ALPHA_SUPABASE_URL_SERVER / ALPHA_SUPABASE_URL is missing or not a URL");
  }
  if (!key) throw new Error("ALPHA_SUPABASE_ANON_KEY_SERVER / ALPHA_SUPABASE_ANON_KEY not set");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export type HomeNewsItem = Pick<
  NewsRow,
  "id" | "title" | "body" | "cover_url" | "published_at" | "school_slug"
>;
export type HomeEventItem = Pick<
  EventRow,
  "id" | "title" | "description" | "event_date" | "location" | "school_slug"
>;

export type HomeWhatsNew = { news: HomeNewsItem[]; events: HomeEventItem[] };

export const getHomeUpcomingEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeEventItem[]> => {
    try {
      const sb = serverClient();
      const { data, error } = await sb
        .from("events")
        .select("id,title,description,event_date,location,school_slug")
        .eq("published", true)
        .order("event_date", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error("[getHomeUpcomingEvents]", err);
      return [];
    }
  },
);

export const getHomeWhatsNew = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeWhatsNew> => {
    try {
      const sb = serverClient();
      const [newsRes, eventsRes] = await Promise.all([
        sb
          .from("news")
          .select("id,title,body,cover_url,published_at,school_slug")
          .eq("published", true)
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(8),
        sb
          .from("events")
          .select("id,title,description,event_date,location,school_slug")
          .eq("published", true)
          .order("event_date", { ascending: false })
          .limit(5),
      ]);
      return { news: newsRes.data ?? [], events: eventsRes.data ?? [] };
    } catch (err) {
      console.error("[getHomeWhatsNew]", err);
      return { news: [], events: [] };
    }
  },
);

export type UrgentNewsItem = Pick<
  NewsRow,
  "id" | "title" | "body" | "cover_url" | "published_at" | "school_slug"
>;

export const getUrgentNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<UrgentNewsItem[]> => {
    try {
      const sb = serverClient();
      const { data, error } = await sb
        .from("news")
        .select("id,title,body,cover_url,published_at,school_slug")
        .eq("published", true)
        .eq("urgent", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error("[getUrgentNews]", err);
      return [];
    }
  },
);

// ---- Events page ---------------------------------------------------------
export type PublicEventItem = Pick<
  EventRow,
  "id" | "title" | "description" | "event_date" | "location" | "cover_url" | "school_slug"
>;

export const getAllEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicEventItem[]> => {
    try {
      const sb = serverClient();
      const { data, error } = await sb
        .from("events")
        .select("id,title,description,event_date,location,cover_url,school_slug")
        .eq("published", true)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error("[getAllEvents]", err);
      return [];
    }
  },
);

// ---- Facilities ----------------------------------------------------------
export type PublicFacilityItem = Pick<
  FacilityRow,
  "id" | "name" | "description" | "image_url" | "category" | "school_slug"
>;

export const getAllFacilities = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicFacilityItem[]> => {
    try {
      const sb = serverClient();
      const { data, error } = await sb
        .from("facilities")
        .select("id,name,description,image_url,category,school_slug,sort_order")
        .eq("published", true)
        .order("school_slug", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error("[getAllFacilities]", err);
      return [];
    }
  },
);

export const getFacilitiesBySchool = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: SchoolSlug }) => data)
  .handler(async ({ data }): Promise<PublicFacilityItem[]> => {
    try {
      const sb = serverClient();
      const { data: rows, error } = await sb
        .from("facilities")
        .select("id,name,description,image_url,category,school_slug,sort_order")
        .eq("published", true)
        .eq("school_slug", data.slug)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return rows ?? [];
    } catch (err) {
      console.error("[getFacilitiesBySchool]", err);
      return [];
    }
  });

// ---- Facility photos (multiple per facility) -----------------------------
export type PublicFacilityPhoto = Pick<
  FacilityPhotoRow,
  "id" | "facility_id" | "school_slug" | "image_url" | "caption" | "sort_order"
>;

export const getFacilityPhotosByFacility = createServerFn({ method: "GET" })
  .inputValidator((data: { facilityId: string }) => data)
  .handler(async ({ data }): Promise<PublicFacilityPhoto[]> => {
    try {
      const sb = serverClient();
      const { data: rows, error } = await sb
        .from("facility_photos")
        .select("id,facility_id,school_slug,image_url,caption,sort_order")
        .eq("published", true)
        .eq("facility_id", data.facilityId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return rows ?? [];
    } catch (err) {
      console.error("[getFacilityPhotosByFacility]", err);
      return [];
    }
  });

export const getFacilityPhotosBySchool = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: SchoolSlug }) => data)
  .handler(async ({ data }): Promise<PublicFacilityPhoto[]> => {
    try {
      const sb = serverClient();
      const { data: rows, error } = await sb
        .from("facility_photos")
        .select("id,facility_id,school_slug,image_url,caption,sort_order")
        .eq("published", true)
        .eq("school_slug", data.slug)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return rows ?? [];
    } catch (err) {
      console.error("[getFacilityPhotosBySchool]", err);
      return [];
    }
  });

// ---- Contact form --------------------------------------------------------
export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      name: string;
      email: string;
      phone?: string;
      school_slug?: string;
      subject?: string;
      message: string;
    }) => {
      if (!data?.name?.trim() || !data?.email?.trim() || !data?.message?.trim()) {
        throw new Error("Name, email and message are required.");
      }
      if (!/.+@.+\..+/.test(data.email)) throw new Error("Please enter a valid email.");
      if (data.message.length > 4000) throw new Error("Message too long.");
      return data;
    },
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sb = serverClient();
    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || null,
      school_slug: (data.school_slug as SchoolSlug) || null,
      subject: data.subject?.trim() || null,
      message: data.message.trim(),
    };
    const { error } = await sb.from("contact_messages").insert(payload);
    if (error) {
      console.error("[submitContactMessage]", error);
      throw new Error("Could not send your message. Please try again or call us.");
    }
    return { ok: true };
  });

// ---- School bundle (used by individual school pages) ---------------------
export type SchoolNewsItem = Pick<
  NewsRow,
  "id" | "title" | "body" | "cover_url" | "published_at" | "school_slug"
>;
export type SchoolEventItem = Pick<
  EventRow,
  "id" | "title" | "description" | "event_date" | "location" | "school_slug"
>;
export type SchoolGalleryItem = Pick<GalleryRow, "id" | "image_url" | "caption">;
export type SchoolStaffItem = Pick<StaffRow, "id" | "name" | "title" | "photo_url">;
export type SchoolFacilityItem = PublicFacilityItem;

/**
 * Staff-uploaded photographs for this school, keyed by photo_slots.slot_key.
 * The positions themselves are declared in src/lib/photo-slots.ts; a key
 * missing here means the page renders what it shipped with.
 */
export type SchoolPhotoMap = Record<
  string,
  { image_url: string; alt_text: string; credit: string | null }
>;

export type SchoolBundle = {
  school: SchoolRow | null;
  news: SchoolNewsItem[];
  events: SchoolEventItem[];
  gallery: SchoolGalleryItem[];
  staff: SchoolStaffItem[];
  facilities: SchoolFacilityItem[];
};

export const getSchoolBundle = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: SchoolSlug }) => data)
  .handler(async ({ data }): Promise<SchoolBundle> => {
    const empty: SchoolBundle = {
      school: null,
      news: [],
      events: [],
      gallery: [],
      staff: [],
      facilities: [],
    };
    try {
      const sb = serverClient();
      const slugFilter: SchoolSlug[] = [data.slug, "group-wide"];
      const [schoolRes, newsRes, eventsRes, galleryRes, staffRes, facilitiesRes] =
        await Promise.all([
          sb.from("schools").select("*").eq("slug", data.slug).maybeSingle(),
          sb
            .from("news")
            .select("id,title,body,cover_url,published_at,school_slug")
            .in("school_slug", slugFilter)
            .eq("published", true)
            .order("published_at", { ascending: false, nullsFirst: false })
            .limit(3),
          sb
            .from("events")
            .select("id,title,description,event_date,location,school_slug")
            .in("school_slug", slugFilter)
            .eq("published", true)
            .order("event_date", { ascending: true })
            .limit(4),
          sb
            .from("gallery")
            .select("id,image_url,caption")
            .eq("school_slug", data.slug)
            .order("sort_order", { ascending: true })
            .limit(8),
          sb
            .from("staff")
            .select("id,name,title,photo_url")
            .eq("school_slug", data.slug)
            .order("sort_order", { ascending: true })
            .limit(12),
          sb
            .from("facilities")
            .select("id,name,description,image_url,category,school_slug,sort_order")
            .eq("school_slug", data.slug)
            .eq("published", true)
            .order("sort_order", { ascending: true }),
        ]);
      return {
        school: schoolRes.data ?? null,
        news: newsRes.data ?? [],
        events: eventsRes.data ?? [],
        gallery: galleryRes.data ?? [],
        staff: staffRes.data ?? [],
        facilities: facilitiesRes.data ?? [],
      };
    } catch (err) {
      console.error("[getSchoolBundle]", err);
      return empty;
    }
  });

// ---- School photos (named page positions) --------------------------------
/**
 * The staff-uploaded photographs for one school, keyed by slot.
 *
 * Its own function rather than a field on the bundle: Nursery & Primary
 * never loads the bundle, and the pages that do would otherwise fetch this
 * twice. Pages put it in their route loader so it is server-rendered and the
 * built-in photo never flashes before the uploaded one arrives.
 */
export const getSchoolPhotos = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: SchoolSlug }) => data)
  .handler(async ({ data }): Promise<SchoolPhotoMap> => {
    try {
      const sb = serverClient();
      const { data: rows, error } = await sb
        .from("photo_slots")
        .select("slot_key,image_url,alt_text,credit")
        .eq("school_slug", data.slug);
      if (error) throw error;
      const photos: SchoolPhotoMap = {};
      for (const row of rows ?? []) {
        photos[row.slot_key] = {
          image_url: row.image_url,
          alt_text: row.alt_text,
          credit: row.credit,
        };
      }
      return photos;
    } catch (err) {
      // An empty map is the fallback path: every page renders the
      // photographs it shipped with.
      console.error("[getSchoolPhotos]", err);
      return {};
    }
  });

// ---- Hero slides ---------------------------------------------------------
export type HeroSlideItem = Pick<
  HeroSlideRow,
  "id" | "image_url" | "alt_text" | "caption" | "sort_order"
>;

export const getHeroSlides = createServerFn({ method: "GET" })
  .inputValidator((data: { page: string }) => data)
  .handler(async ({ data }): Promise<HeroSlideItem[]> => {
    try {
      const sb = serverClient();
      const { data: rows, error } = await sb
        .from("hero_slides")
        .select("id,image_url,alt_text,caption,sort_order")
        .eq("published", true)
        .eq("page_key", data.page)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return rows ?? [];
    } catch (err) {
      console.error("[getHeroSlides]", err);
      return [];
    }
  });

// ---- Testimonials --------------------------------------------------------
/**
 * grad_year is carried so consumers can tell a parent quote from an alumni
 * story. It is required by the alumni submission form and never set on a
 * parent quote — see alpha_migration_alumni_submissions.sql.
 */
export type TestimonialItem = Pick<
  TestimonialRow,
  | "id"
  | "author_name"
  | "relationship"
  | "quote"
  | "photo_url"
  | "school_slug"
  | "grad_year"
  | "company"
  | "created_at"
>;

/**
 * Parent quotes for one school (or every school when slug is omitted),
 * newest first, so stories parents send in lead and older staff-entered
 * quotes follow. School-wide quotes count for every school.
 */
export function parentQuotes(items: TestimonialItem[], slug?: SchoolSlug): TestimonialItem[] {
  return items
    .filter((t) => !isAlumniStory(t))
    .filter(
      (t) => !slug || t.school_slug === slug || t.school_slug === null || t.school_slug === "group-wide",
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** True for an approved alumni story, false for a parent quote. */
export function isAlumniStory(t: Pick<TestimonialItem, "grad_year">) {
  return t.grad_year != null;
}

export const getTestimonials = createServerFn({ method: "GET" }).handler(
  async (): Promise<TestimonialItem[]> => {
    try {
      const sb = serverClient();
      const { data, error } = await sb
        .from("testimonials")
        .select("id,author_name,relationship,quote,photo_url,school_slug,grad_year,company,created_at")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error("[getTestimonials]", err);
      return [];
    }
  },
);

/**
 * Approved alumni stories for the public /alumni page.
 *
 * published = true is the approval gate, exactly as for parent quotes. A
 * pending submission is invisible here because it is invisible to the anon
 * key this reads through — the RLS policy restricts anon SELECT to published
 * rows, so this is not the only thing standing between an unmoderated
 * submission and the public site.
 */
export const getAlumniStories = createServerFn({ method: "GET" }).handler(
  async (): Promise<TestimonialItem[]> => {
    try {
      const sb = serverClient();
      const { data, error } = await sb
        .from("testimonials")
        .select("id,author_name,relationship,quote,photo_url,school_slug,grad_year,company,created_at")
        .eq("published", true)
        .not("grad_year", "is", null)
        .order("grad_year", { ascending: false })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error("[getAlumniStories]", err);
      return [];
    }
  },
);
