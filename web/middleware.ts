import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/portal", "/admin"];
const ADMIN_PREFIXES = ["/admin"];
// Paths under /admin that faculty may also access.
const FACULTY_ALLOWED_PREFIXES = ["/admin/curriculum", "/admin/grading"];

function makeNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function buildCsp(nonce: string): string {
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

  const connectSrc = [
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

  // 'strict-dynamic' lets nonce'd scripts load further scripts (Next chunks,
  // Turnstile, Plausible). 'unsafe-inline' is kept only as a fallback for
  // browsers that don't support nonces — they're ignored when a nonce is present.
  const scriptSrc = `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:`;

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const nonce = makeNonce();
  const csp = buildCsp(nonce);

  // Next.js extracts the nonce from the *request* CSP header and applies it to
  // its framework <script> tags. We forward both x-nonce (for our own Script
  // tags via headers()) and the CSP on the request, then echo the CSP on the
  // response so the browser enforces it.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const { response, user, supabase } = await updateSession(request, requestHeaders);
  response.headers.set("Content-Security-Policy", csp);

  const { pathname } = request.nextUrl;

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
