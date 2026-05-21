"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/portal", label: "Student Portal" },
  { href: "/apply", label: "Apply" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
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
          <Link href="/apply" className="btn-primary">Apply now</Link>
        </nav>

        <button
          type="button"
          className="md:hidden grid h-9 w-9 place-items-center rounded-sm border border-paper-3"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-px w-5 bg-ink before:block before:h-px before:w-5 before:-translate-y-1.5 before:bg-ink after:block after:h-px after:w-5 after:translate-y-1 after:bg-ink" />
        </button>
      </div>
      {open && (
        <div className="border-t border-paper-2 md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-sm px-2 py-2 text-sm text-ink-2 hover:bg-paper">
                {n.label}
              </Link>
            ))}
            <Link href="/apply" className="btn-primary mt-2">Apply now</Link>
          </div>
        </div>
      )}
    </header>
  );
}
