import Link from "next/link";
import { getUserWithRole } from "@/lib/supabase/server";
import { hasSupabasePublic, env } from "@/lib/env";
import { HeaderMobile } from "@/components/HeaderMobile";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/portal", label: "Student Portal" },
  { href: "/apply", label: "Apply" },
];

export async function SiteHeader() {
  const user = hasSupabasePublic(env()) ? await safeGetUser() : null;
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-paper-3 bg-white/85 backdrop-blur">
      <div className="border-b border-paper-2 bg-paper">
        <div className="container-page flex h-7 items-center justify-between text-[11px] text-ink-3">
          <span className="mono">EST. 1981 · JOHANNESBURG</span>
          <span className="mono hidden sm:block">CALL +27 11 023 7990 · WHATSAPP +27 82 555 0143</span>
        </div>
      </div>
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-sm bg-navy-900 text-[11px] font-mono text-white">AD</span>
          <span className="text-[15px] font-medium leading-tight">
            Academy of <br className="hidden sm:block" />
            <span className="text-ink-3">Advanced Draughting</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm text-ink-2 hover:text-ink">
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-electric-700 hover:text-electric-600">
              Admin
            </Link>
          )}
          {user ? (
            <form action="/auth/signout" method="post" className="contents">
              <span className="text-[12px] text-ink-3">{user.user.email}</span>
              <button type="submit" className="btn-ghost">Sign out</button>
            </form>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink-2 hover:text-ink">Sign in</Link>
              <Link href="/apply" className="btn-primary">Apply now</Link>
            </>
          )}
        </nav>

        <HeaderMobile
          nav={NAV}
          isAdmin={isAdmin}
          signedIn={Boolean(user)}
          email={user?.user.email ?? null}
        />
      </div>
    </header>
  );
}

async function safeGetUser() {
  try {
    return await getUserWithRole();
  } catch {
    return null;
  }
}
