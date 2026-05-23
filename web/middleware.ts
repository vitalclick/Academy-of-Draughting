import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/portal", "/admin"];
const ADMIN_PREFIXES = ["/admin"];
// Paths under /admin that faculty may also access.
const FACULTY_ALLOWED_PREFIXES = ["/admin/curriculum", "/admin/grading"];

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
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
