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
