import { NextResponse } from 'next/server';
import { supabaseRouteHandler } from '@/lib/supabase/ssr';

/**
 * Magic-link landing route. Supabase appends `?code=…` which the SSR client
 * exchanges for a session cookie. We then send the user to /admin.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/admin';

  if (code) {
    const sb = await supabaseRouteHandler();
    if (sb) {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(
          new URL(`/admin/login?error=${encodeURIComponent(error.message)}`, req.url)
        );
      }
    }
  }
  return NextResponse.redirect(new URL(next, req.url));
}
