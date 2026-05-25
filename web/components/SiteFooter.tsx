export function SiteFooter() {
  return (
    <footer className="section-dark mt-24 border-t border-white/10">
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-sm bg-white/10 text-[11px] font-mono">AD</span>
            <span className="text-sm font-medium">Academy of Advanced Draughting</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            South Africa's specialist draughting institution. Modern CAD, real
            engineering vocabulary, career-aligned outcomes.
          </p>
        </div>
        <FooterCol title="Courses" links={[
          ["MDDOP N4/N5", "/courses#mddop-n4-n5"],
          ["Bridging Course", "/courses#bridging"],
          ["AutoCAD", "/courses#autocad"],
          ["Revit & BIM", "/courses#revit"],
          ["Inventor", "/courses#inventor"],
        ]} />
        <FooterCol title="Institution" links={[
          ["About", "/about"],
          ["Student Portal", "/portal"],
          ["Apply", "/apply"],
          ["Career Intel", "/#career-intel"],
        ]} />
        <FooterCol title="Visit" links={[
          ["Johannesburg Campus", "#"],
          ["+27 11 023 7990", "tel:+27110237990"],
          ["WhatsApp Admissions", "https://wa.me/27825550143"],
          ["info@aod.ac.za", "mailto:info@aod.ac.za"],
        ]} />
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-[12px] text-white/40 sm:flex-row sm:justify-between">
          <span className="mono">© {new Date().getFullYear()} ACADEMY OF ADVANCED DRAUGHTING · EST. 1981</span>
          <span className="mono flex gap-3">
            <a href="/privacy" className="hover:text-white">PRIVACY</a>
            <span>·</span>
            <a href="/terms" className="hover:text-white">TERMS</a>
            <span>·</span>
            <a href="/api/health" className="hover:text-white">STATUS</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <h4 className="mono text-white/50">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="hover:text-white">{label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
