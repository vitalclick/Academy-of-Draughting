import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { env, features } from '@/lib/env';
import type { Database } from '@/types/database';

/**
 * Per-request Supabase client bound to the Next.js request cookies.
 * Used inside server components, server actions, and route handlers that
 * need to act AS the signed-in admin user.
 *
 * Returns null when Supabase isn't configured.
 */
export async function supabaseRouteHandler() {
  if (!features.supabase) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          for (const { name, value, options } of toSet) {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server components can't set cookies; middleware handles refresh.
            }
          }
        },
      },
    }
  );
}
