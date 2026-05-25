"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { href: string; label: string };

export function HeaderMobile({
  nav,
  isAdmin,
  isFaculty,
  signedIn,
  email,
}: {
  nav: Item[];
  isAdmin: boolean;
  isFaculty?: boolean;
  signedIn: boolean;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="md:hidden grid h-9 w-9 place-items-center rounded-sm border border-paper-3"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="block h-px w-5 bg-ink before:block before:h-px before:w-5 before:-translate-y-1.5 before:bg-ink after:block after:h-px after:w-5 after:translate-y-1 after:bg-ink" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-t border-paper-2 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-sm px-2 py-2 text-sm text-ink-2 hover:bg-paper">
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="rounded-sm px-2 py-2 text-sm font-medium text-electric-700 hover:bg-paper">
                Admin
              </Link>
            )}
            {isFaculty && (
              <Link href="/admin/curriculum" className="rounded-sm px-2 py-2 text-sm font-medium text-electric-700 hover:bg-paper">
                Curriculum
              </Link>
            )}
            {signedIn ? (
              <form action="/auth/signout" method="post" className="px-2 pt-2">
                <div className="mb-2 text-[12px] text-ink-3">{email}</div>
                <button type="submit" className="btn-ghost w-full justify-center">Sign out</button>
              </form>
            ) : (
              <div className="flex flex-col gap-2 px-2 pt-2">
                <Link href="/login" className="btn-ghost w-full justify-center">Sign in</Link>
                <Link href="/apply" className="btn-primary w-full justify-center">Apply now</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
