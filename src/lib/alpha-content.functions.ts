// Server functions that read PUBLISHED public content from Alpha's Supabase.
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
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

function serverClient() {
  const rawUrl = process.env.ALPHA_SUPABASE_URL_SERVER;
  const key = process.env.ALPHA_SUPABASE_ANON_KEY_SERVER;
  if (!rawUrl || !key) {
    throw new Error("ALPHA_SUPABASE_URL_SERVER / ALPHA_SUPABASE_ANON_KEY_SERVER not configured");
  }
  const url = rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export type HomeNewsItem = Pick<NewsRow, "id" | "title" | "body" | "cover_url" | "published_at" | "school_slug">;
export type HomeEventItem = Pick<EventRow, "id" | "title" | "description" | "event_date" | "location" | "school_slug">;

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
        sb.from("news").select("id,title,body,cover_url,published_at,school_slug")
          .eq("published", true).order("published_at", { ascending: false, nullsFirst: false }).limit(8),
        sb.from("events").select("id,title,description,event_date,location,school_slug")
          .eq("published", true).order("event_date", { ascending: false }).limit(5),
      ]);
      return { news: newsRes.data ?? [], events: eventsRes.data ?? [] };
    } catch (err) {
      console.error("[getHomeWhatsNew]", err);
      return { news: [], events: [] };
    }
  },
);

export type UrgentNewsItem = Pick<NewsRow, "id" | "title" | "body" | "cover_url" | "published_at" | "school_slug">;

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
export type PublicEventItem = Pick<EventRow,
  "id" | "title" | "description" | "event_date" | "location" | "cover_url" | "school_slug">;

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
export type PublicFacilityItem = Pick<FacilityRow,
  "id" | "name" | "description" | "image_url" | "category" | "school_slug">;

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
export type PublicFacilityPhoto = Pick<FacilityPhotoRow,
  "id" | "facility_id" | "school_slug" | "image_url" | "caption" | "sort_order">;

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
  .inputValidator((data: {
    name: string; email: string; phone?: string;
    school_slug?: string; subject?: string; message: string;
  }) => {
    if (!data?.name?.trim() || !data?.email?.trim() || !data?.message?.trim()) {
      throw new Error("Name, email and message are required.");
    }
    if (!/.+@.+\..+/.test(data.email)) throw new Error("Please enter a valid email.");
    if (data.message.length > 4000) throw new Error("Message too long.");
    return data;
  })
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
    const { error } = await (sb.from("contact_messages") as unknown as {
      insert: (v: typeof payload) => Promise<{ error: { message: string } | null }>;
    }).insert(payload);
    if (error) {
      console.error("[submitContactMessage]", error);
      throw new Error("Could not send your message. Please try again or call us.");
    }
    return { ok: true };
  });

// ---- School bundle (used by individual school pages) ---------------------
export type SchoolNewsItem = Pick<NewsRow, "id" | "title" | "body" | "cover_url" | "published_at" | "school_slug">;
export type SchoolEventItem = Pick<EventRow, "id" | "title" | "description" | "event_date" | "location" | "school_slug">;
export type SchoolGalleryItem = Pick<GalleryRow, "id" | "image_url" | "caption">;
export type SchoolStaffItem = Pick<StaffRow, "id" | "name" | "title" | "photo_url">;
export type SchoolFacilityItem = PublicFacilityItem;

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
    const empty: SchoolBundle = { school: null, news: [], events: [], gallery: [], staff: [], facilities: [] };
    try {
      const sb = serverClient();
      const slugFilter = [data.slug, "group-wide"];
      const [schoolRes, newsRes, eventsRes, galleryRes, staffRes, facilitiesRes] = await Promise.all([
        sb.from("schools").select("*").eq("slug", data.slug).maybeSingle(),
        sb.from("news").select("id,title,body,cover_url,published_at,school_slug")
          .in("school_slug", slugFilter).eq("published", true)
          .order("published_at", { ascending: false, nullsFirst: false }).limit(3),
        sb.from("events").select("id,title,description,event_date,location,school_slug")
          .in("school_slug", slugFilter).eq("published", true)
          .order("event_date", { ascending: true }).limit(4),
        sb.from("gallery").select("id,image_url,caption")
          .eq("school_slug", data.slug).order("sort_order", { ascending: true }).limit(8),
        sb.from("staff").select("id,name,title,photo_url")
          .eq("school_slug", data.slug).order("sort_order", { ascending: true }).limit(12),
        sb.from("facilities").select("id,name,description,image_url,category,school_slug,sort_order")
          .eq("school_slug", data.slug).eq("published", true)
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

// ---- Hero slides ---------------------------------------------------------
export type HeroSlideItem = Pick<HeroSlideRow, "id" | "image_url" | "alt_text" | "caption" | "sort_order">;

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
export type TestimonialItem = Pick<TestimonialRow,
  "id" | "author_name" | "relationship" | "quote" | "photo_url" | "school_slug">;

export const getTestimonials = createServerFn({ method: "GET" }).handler(
  async (): Promise<TestimonialItem[]> => {
    try {
      const sb = serverClient();
      const { data, error } = await sb
        .from("testimonials")
        .select("id,author_name,relationship,quote,photo_url,school_slug")
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
