import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Keeps the Supabase Auth session fresh on /admin routes. The middleware is
 * a no-op when Supabase isn't configured; the admin UI just shows the sign-in
 * page since `currentAdmin()` returns null in that case.
 */
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const isAdminArea = url.startsWith('/admin') || url.startsWith('/api/admin');
  const isPortalArea = url.startsWith('/portal') && !url.startsWith('/portal/login');
  if (!isAdminArea && !isPortalArea) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return NextResponse.next();

  const res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        for (const { name, value, options } of toSet) {
          res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2]);
        }
      },
    },
  });

  // Touching getUser refreshes the access token if needed.
  await supabase.auth.getUser();
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/portal/:path*'],
};
