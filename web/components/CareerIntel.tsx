"use client";

import { useMemo, useState } from "react";
import { careerPaths, intelUpdatedAt } from "@/data/career-intel";

export function CareerIntel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = careerPaths[activeIdx];

  return (
    <section id="career-intel" className="section-dark border-t border-white/10 bg-navy-1000">
      <div className="container-page py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <span className="mono text-electric-300">SECTION 04 / INDUSTRY OUTLOOK</span>
            <h2 className="mt-5 text-3xl font-medium leading-tight sm:text-4xl">
              A view of the engineering economy. <span className="italic font-normal text-cyan-400">So you decide with data.</span>
            </h2>
          </div>
          <p className="text-white/65">
            We don't quote you yesterday's salaries. Our Industry Outlook tracks
            median pay, regional demand and software requirements across South
            African engineering and design offices — updated quarterly.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
            <div className="flex gap-1">
              <Tab active>Career paths</Tab>
              <Tab>Software demand</Tab>
              <Tab>Regional hiring</Tab>
              <Tab>Industry sectors</Tab>
            </div>
            <span className="mono text-white/40">UPDATED {intelUpdatedAt}</span>
          </div>
          <div className="grid gap-0 md:grid-cols-[280px_1fr]">
            <div className="border-r border-white/10 p-4">
              <h4 className="mono px-2 pb-2 text-white/50">MATCH STRENGTH · TOP 6</h4>
              <div className="space-y-1">
                {careerPaths.map((p, i) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`flex w-full flex-col gap-2 rounded-md px-3 py-2 text-left transition ${
                      i === activeIdx ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-sm text-white">{p.name}</div>
                        <div className="text-[11px] text-white/50">{p.software}</div>
                      </div>
                      <span className="mono text-cyan-400">{p.matchScore}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full" style={{ width: `${p.matchScore}%`, background: i === activeIdx ? "#6FE6E2" : "#5A8CFF" }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Kpi label="Median Salary · GP" value={`R${active.medianSalary.toLocaleString()}`} delta="↑ 4.2% QoQ" />
                <Kpi label="Open roles · 90d" value={active.openRoles.toLocaleString()} delta="↑ 11.0% QoQ" />
                <Kpi label="Time-to-Hire" value={`${active.timeToHireDays}d`} delta="↑ 3 days" negative />
              </div>
              <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="mono text-white/60">{active.name.toUpperCase()} · 24 MO TREND</span>
                  <div className="flex gap-4 text-[11px] text-white/60">
                    <Legend dot="#6FE6E2" label="SALARY" />
                    <Legend dot="#5A8CFF" label="OPEN ROLES" />
                  </div>
                </div>
                <DashChart seed={activeIdx} />
              </div>
              <div className="mt-6 flex gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-400 text-[12px] font-medium text-navy-900">i</span>
                <p className="text-sm text-white/70">
                  <span className="mono text-cyan-400">FACULTY NOTE · </span>
                  {active.facultyNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tab({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`rounded-md px-3 py-1.5 text-[12px] font-medium ${
        active ? "bg-white/10 text-white" : "text-white/55 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Kpi({ label, value, delta, negative }: { label: string; value: string; delta: string; negative?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="mono text-white/50">{label}</div>
      <div className="mt-2 text-2xl font-medium">{value}</div>
      <div className={`mt-1 text-[12px] ${negative ? "text-amber-300" : "text-cyan-400"}`}>{delta}</div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <i className="block h-1.5 w-3 rounded-full" style={{ background: dot }} />
      {label}
    </span>
  );
}

function DashChart({ seed }: { seed: number }) {
  const w = 720;
  const h = 180;
  const { salary, demand } = useMemo(() => {
    const s: number[] = [];
    const d: number[] = [];
    let v = 38 + seed * 5;
    for (let i = 0; i < 24; i++) {
      v += Math.sin((i + seed) * 0.7) * 4 + (((i + seed) % 3) - 1) * 1.5;
      v = Math.max(20, Math.min(58, v));
      s.push(v);
      d.push(Math.max(8, v - 18 + Math.cos(i + seed) * 6));
    }
    return { salary: s, demand: d };
  }, [seed]);

  const toPath = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = (i / (arr.length - 1)) * (w - 24) + 12;
        const y = h - v * 2.4;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const area = `${toPath(salary)} L ${w - 12} ${h} L 12 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden className="mt-4 block">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="12" x2={w - 12} y1={(h * i) / 4} y2={(h * i) / 4} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      ))}
      <path d={area} fill="rgba(111,230,226,0.1)" />
      <path d={toPath(salary)} fill="none" stroke="#6FE6E2" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={toPath(demand)} fill="none" stroke="#5A8CFF" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}
