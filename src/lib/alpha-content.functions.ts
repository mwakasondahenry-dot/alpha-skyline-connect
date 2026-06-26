// Server functions that read PUBLISHED public content from Alpha's Supabase.
// Uses ALPHA_SUPABASE_URL_SERVER + ALPHA_SUPABASE_ANON_KEY_SERVER (anon key,
// RLS-protected — public site only sees published rows).

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database, NewsRow, EventRow } from "@/integrations/alpha-supabase/types";

function serverClient() {
  const url = process.env.ALPHA_SUPABASE_URL_SERVER;
  const key = process.env.ALPHA_SUPABASE_ANON_KEY_SERVER;
  if (!url || !key) {
    throw new Error("ALPHA_SUPABASE_URL_SERVER / ALPHA_SUPABASE_ANON_KEY_SERVER not configured");
  }
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
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await sb
        .from("events")
        .select("id,title,description,event_date,location,school_slug")
        .eq("published", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(6);
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
      const today = new Date().toISOString().slice(0, 10);

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
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(6),
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
