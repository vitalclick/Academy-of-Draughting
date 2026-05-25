import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/portal", "/admin"];
const ADMIN_PREFIXES = ["/admin"];
// Paths under /admin that faculty may also access.
const FACULTY_ALLOWED_PREFIXES = ["/admin/curriculum", "/admin/grading"];
// Dynamic, auth-bearing routes get a strict nonce CSP. Everything else
// (marketing pages, API) gets a static CSP so statically-generated HTML —
// whose inline framework scripts carry no nonce — isn't broken.
const NONCE_CSP_PREFIXES = ["/portal", "/admin", "/login", "/auth"];

function makeNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function connectSrc(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let supabaseHost = "*.supabase.co";
  try {
    if (supabaseUrl) supabaseHost = new URL(supabaseUrl).host;
  } catch {
    /* keep wildcard */
  }
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
  let sentryOrigin = "";
  try {
    if (sentryDsn) sentryOrigin = new URL(sentryDsn).origin;
  } catch {
    /* none */
  }
  return [
    "'self'",
    `https://${supabaseHost}`,
    `wss://${supabaseHost}`,
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://challenges.cloudflare.com",
    "https://plausible.io",
    sentryOrigin,
  ]
    .filter(Boolean)
    .join(" ");
}

function commonDirectives(): string[] {
  return [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc()}`,
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];
}

function nonceCsp(nonce: string): string {
  // 'strict-dynamic' trusts scripts loaded by nonce'd scripts (Next chunks,
  // Turnstile, Plausible). 'unsafe-inline' is an ignored fallback for old
  // browsers that don't understand nonces.
  return [
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:`,
    ...commonDirectives(),
  ].join("; ");
}

function staticCsp(): string {
  // Statically-generated pages can't carry a per-request nonce, so inline
  // framework scripts need 'unsafe-inline'. These are public marketing pages
  // with no user data, so the weaker script policy is an acceptable trade-off.
  return [
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://plausible.io",
    ...commonDirectives(),
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const useNonce = NONCE_CSP_PREFIXES.some((p) => pathname.startsWith(p));

  let requestHeaders: Headers | undefined;
  let csp: string;
  if (useNonce) {
    const nonce = makeNonce();
    csp = nonceCsp(nonce);
    // Next reads the *request* CSP header to nonce its framework scripts.
    requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
  } else {
    csp = staticCsp();
  }

  const { response, user, supabase } = await updateSession(request, requestHeaders);
  response.headers.set("Content-Security-Policy", csp);

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return response;

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const needsAdminScope = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsAdminScope && supabase) {
    const facultyAllowed = FACULTY_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: string }>();
    const role = profile?.role;
    const ok = role === "admin" || (facultyAllowed && role === "faculty");
    if (!ok) {
      const home = request.nextUrl.clone();
      home.pathname = "/";
      home.searchParams.set("denied", "1");
      return NextResponse.redirect(home);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
