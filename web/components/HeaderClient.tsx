"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { HeaderMobile } from "@/components/HeaderMobile";
import { NotificationsBell } from "@/components/NotificationsBell";

type Item = { href: string; label: string };
type Session = { email: string | null; role: string | null } | null;

// Client island for the session-dependent header controls. Keeping this out of
// the server-rendered shell lets marketing pages stay statically generated.
export function HeaderClient({ nav }: { nav: Item[] }) {
  const [session, setSession] = useState<Session>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let active = true;

    async function load() {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) {
          if (active) {
            setSession(null);
            setLoaded(true);
          }
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle<{ role: string }>();
        if (active) {
          setSession({ email: user.email ?? null, role: profile?.role ?? "student" });
          setLoaded(true);
        }
      } catch {
        if (active) {
          setSession(null);
          setLoaded(true);
        }
      }
    }
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => void load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = session?.role === "admin";
  const isFaculty = session?.role === "faculty";
  const signedIn = Boolean(session);

  return (
    <>
      <nav className="hidden items-center gap-7 md:flex">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="text-sm text-ink-2 hover:text-ink">
            {n.label}
          </Link>
        ))}
        {isAdmin && (
          <Link href="/admin" className="text-sm font-medium text-electric-700 hover:text-electric-600">
            Admin
          </Link>
        )}
        {isFaculty && (
          <Link href="/admin/curriculum" className="text-sm font-medium text-electric-700 hover:text-electric-600">
            Curriculum
          </Link>
        )}
        {/* Until the session resolves, render the neutral signed-out controls. */}
        {loaded && signedIn ? (
          <>
            <NotificationsBell />
            <form action="/auth/signout" method="post" className="contents">
              <span className="text-[12px] text-ink-3">{session?.email}</span>
              <button type="submit" className="btn-ghost">Sign out</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-ink-2 hover:text-ink">Sign in</Link>
            <Link href="/apply" className="btn-primary">Apply now</Link>
          </>
        )}
      </nav>

      <HeaderMobile
        nav={nav}
        isAdmin={isAdmin}
        isFaculty={isFaculty}
        signedIn={loaded && signedIn}
        email={session?.email ?? null}
      />
    </>
  );
}
