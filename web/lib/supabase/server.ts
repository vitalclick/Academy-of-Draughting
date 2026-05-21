import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, hasSupabasePublic } from "@/lib/env";

export function getSupabaseServer() {
  const e = env();
  if (!hasSupabasePublic(e)) {
    throw new Error(
      "Supabase public env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  const cookieStore = cookies();
  return createServerClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component — cookies are read-only there.
          // Session refresh is handled in middleware.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // see above
        }
      },
    },
  });
}

export async function getSessionUser() {
  if (!hasSupabasePublic()) return null;
  const supabase = getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export type UserRole = "student" | "admin" | "faculty";

export async function getUserWithRole(): Promise<
  { user: { id: string; email: string | null }; role: UserRole } | null
> {
  if (!hasSupabasePublic()) return null;
  const supabase = getSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();
  return {
    user: { id: userData.user.id, email: userData.user.email ?? null },
    role: (profile?.role as UserRole) ?? "student",
  };
}
