// Admin auth context: tracks Supabase session in the browser.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/integrations/alpha-supabase/browser-client";

type AdminAuthState = {
  ready: boolean;
  session: Session | null;
  client: SupabaseClient | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    let sub: { unsubscribe: () => void } | null = null;

    getBrowserSupabase()
      .then(async (sb) => {
        if (cancelled) return;
        setClient(sb);
        const { data } = await sb.auth.getSession();
        if (cancelled) return;
        setSession(data.session);
        setReady(true);
        const { data: listener } = sb.auth.onAuthStateChange((_event, s) => {
          setSession(s);
        });
        sub = listener.subscription;
      })
      .catch((err) => {
        console.error("[admin-auth] failed to init Supabase", err);
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, []);

  const signIn = useCallback<AdminAuthState["signIn"]>(
    async (email, password) => {
      if (!client) return { error: "Sign-in is still loading. Please try again." };
      const { error } = await client.auth.signInWithPassword({ email, password });
      return { error: error ? error.message : null };
    },
    [client],
  );

  const signOut = useCallback(async () => {
    if (!client) return;
    await client.auth.signOut();
  }, [client]);

  const value = useMemo<AdminAuthState>(
    () => ({ ready, session, client, signIn, signOut }),
    [ready, session, client, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthState {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return ctx;
}
