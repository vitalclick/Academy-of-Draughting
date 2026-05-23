import Link from "next/link";
import { HeaderClient } from "@/components/HeaderClient";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/portal", label: "Student Portal" },
  { href: "/apply", label: "Apply" },
];

// Pure static shell. All session-dependent UI lives in <HeaderClient/> so this
// component (and therefore the root layout) never reads cookies server-side —
// keeping marketing pages statically generated.
export function SiteHeader() {
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

        <HeaderClient nav={NAV} />
      </div>
    </header>
  );
}
