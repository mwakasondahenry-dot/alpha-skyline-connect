// Server functions that read PUBLISHED public content from Alpha's Supabase.
// Uses ALPHA_SUPABASE_URL_SERVER + ALPHA_SUPABASE_ANON_KEY_SERVER (anon key,
// RLS-protected — public site only sees published rows).

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database, NewsRow, EventRow, GalleryRow, SchoolRow, SchoolSlug } from "@/integrations/alpha-supabase/types";


function serverClient() {
  const rawUrl = process.env.ALPHA_SUPABASE_URL_SERVER;
  const key = process.env.ALPHA_SUPABASE_ANON_KEY_SERVER;
  if (!rawUrl || !key) {
    throw new Error("ALPHA_SUPABASE_URL_SERVER / ALPHA_SUPABASE_ANON_KEY_SERVER not configured");
  }
  // Defensive: secret may have been stored with a trailing /rest/v1/ — supabase-js
  // appends that itself, so strip it to avoid a double path (PGRST125).
  const url = rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}


export type HomeNewsItem = Pick<NewsRow, "id" | "title" | "body" | "cover_url" | "published_at" | "school_slug">;
export type HomeEventItem = Pick<EventRow, "id" | "title" | "description" | "event_date" | "location" | "school_slug">;

export type HomeWhatsNew = {
  news: HomeNewsItem[];
  events: HomeEventItem[];
};

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

      return {
        news: newsRes.data ?? [],
        events: eventsRes.data ?? [],
      };
    } catch (err) {
      console.error("[getHomeWhatsNew]", err);
      return { news: [], events: [] };
    }
  },
);

export type SchoolNewsItem = Pick<NewsRow, "id" | "title" | "body" | "cover_url" | "published_at" | "school_slug">;
export type SchoolEventItem = Pick<EventRow, "id" | "title" | "description" | "event_date" | "location" | "school_slug">;
export type SchoolGalleryItem = Pick<GalleryRow, "id" | "image_url" | "caption">;

export type SchoolBundle = {
  school: SchoolRow | null;
  news: SchoolNewsItem[];
  events: SchoolEventItem[];
  gallery: SchoolGalleryItem[];
};

export const getSchoolBundle = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: SchoolSlug }) => data)
  .handler(async ({ data }): Promise<SchoolBundle> => {
    const empty: SchoolBundle = { school: null, news: [], events: [], gallery: [] };
    try {
      const sb = serverClient();
      const slugFilter = [data.slug, "group-wide"];

      const [schoolRes, newsRes, eventsRes, galleryRes] = await Promise.all([
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
      ]);

      return {
        school: schoolRes.data ?? null,
        news: newsRes.data ?? [],
        events: eventsRes.data ?? [],
        gallery: galleryRes.data ?? [],
      };
    } catch (err) {
      console.error("[getSchoolBundle]", err);
      return empty;
    }
  });

