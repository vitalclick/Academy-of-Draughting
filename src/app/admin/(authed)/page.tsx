import Link from 'next/link';
import { getOverviewCounts, listApplications } from '@/lib/db/admin';
import { getWebAnalytics, RANGES, SEGMENTS, type RangeKey, type SegmentKey } from '@/lib/db/analytics';
import { Kpi } from './_components/viz';
import { AnalyticsFilters } from './_components/analytics-filters';
import {
  MetricCard,
  TrafficChart,
  BarList,
  GeoList,
  DeviceDonut,
  fmtNum,
  fmtDuration,
  fmtPct,
} from './_components/analytics';

export const dynamic = 'force-dynamic';

function parseRange(v: string | undefined): RangeKey {
  return (RANGES.find((r) => r.key === v)?.key ?? '7d') as RangeKey;
}
function parseSegment(v: string | undefined): SegmentKey {
  return (SEGMENTS.find((s) => s.key === v)?.key ?? 'all') as SegmentKey;
}

function nameOf(a: { applicant?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null }) {
  const ap = a.applicant;
  if (!ap) return '—';
  return `${ap.first_name ?? ''} ${ap.last_name ?? ''}`.trim() || ap.email || '—';
}

function initialsOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0 || name === '—') return '··';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; segment?: string }>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const segment = parseSegment(sp.segment);

  const [counts, recentApps, analytics] = await Promise.all([
    getOverviewCounts(),
    listApplications({ limit: 8 }),
    getWebAnalytics(range, segment),
  ]);

  const t = analytics.totals;
  const rangeLabel = RANGES.find((r) => r.key === range)?.label ?? '';
  const segmentLabel = SEGMENTS.find((s) => s.key === segment)?.label ?? '';
  const visitorSpark = analytics.series.map((p) => p.visitors);
  const pvSpark = analytics.series.map((p) => p.pageViews);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            OPERATIONS<span className="sep">/</span>OVERVIEW
          </div>
          <h1>Operations</h1>
          <p>
            <strong style={{ color: 'var(--blue-700)' }}>
              {counts.applications_submitted} application{counts.applications_submitted === 1 ? '' : 's'}
            </strong>{' '}
            awaiting review · {counts.applications_under_review} under review · {counts.leads_total} leads
            captured.
          </p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/applications" className="btn btn-sm btn-solid-dark">
            Review applications
          </Link>
        </div>
      </div>

      <section className="an-section">
        <div className="an-head">
          <div>
            <h2 className="adm-card-title" style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              Website analytics
              {analytics.isSample && <span className="an-sample">SAMPLE DATA</span>}
            </h2>
            <div className="adm-card-sub">
              {rangeLabel} · {segmentLabel} · first-party
            </div>
          </div>
          <AnalyticsFilters range={range} segment={segment} generatedAt={analytics.generatedAt} />
        </div>

        <div className="an-kpi-row">
          <MetricCard label="Total visitors" value={fmtNum(t.visitors)} delta={analytics.deltas.visitors} spark={visitorSpark} />
          <MetricCard label="Unique users" value={fmtNum(t.uniqueUsers)} delta={analytics.deltas.uniqueUsers} spark={visitorSpark} />
          <MetricCard label="Page views" value={fmtNum(t.pageViews)} delta={analytics.deltas.pageViews} spark={pvSpark} />
          <MetricCard label="Bounce rate" value={fmtPct(t.bounceRate)} meta="single-page sessions" />
          <MetricCard label="Avg. session" value={fmtDuration(t.avgSessionSec)} meta="time on site" />
        </div>

        <div className="an-grid-main" style={{ marginBottom: 16 }}>
          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <h3 className="adm-card-title">Traffic over time</h3>
                <div className="adm-card-sub">Page views &amp; visitors · {rangeLabel.toLowerCase()}</div>
              </div>
            </div>
            <div className="adm-card-body">
              <TrafficChart series={analytics.series} />
            </div>
          </div>
          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <h3 className="adm-card-title">Devices</h3>
                <div className="adm-card-sub">Share of visitors</div>
              </div>
            </div>
            <div className="adm-card-body">
              <DeviceDonut items={analytics.devices} />
            </div>
          </div>
        </div>

        <div className="an-grid-3">
          <div className="adm-card">
            <div className="adm-card-head">
              <h3 className="adm-card-title">Traffic sources</h3>
            </div>
            <div className="adm-card-body">
              <BarList items={analytics.sources} />
            </div>
          </div>
          <div className="adm-card">
            <div className="adm-card-head">
              <h3 className="adm-card-title">Top pages</h3>
            </div>
            <div className="adm-card-body">
              <BarList items={analytics.topPages} />
            </div>
          </div>
          <div className="adm-card">
            <div className="adm-card-head">
              <h3 className="adm-card-title">Geographic distribution</h3>
            </div>
            <div className="adm-card-body">
              <GeoList items={analytics.geo} />
            </div>
          </div>
        </div>
      </section>

      <div className="adm-kpi-row">
        <Kpi label="Applications · total" value={counts.applications_total} delta="all-time" direction="up" sparkSeed={1} />
        <Kpi label="Submitted · pending" value={counts.applications_submitted} delta="awaiting review" direction="up" sparkSeed={2} />
        <Kpi label="Under review" value={counts.applications_under_review} delta="in progress" direction="up" sparkSeed={3} />
        <Kpi label="Accepted · all-time" value={counts.applications_accepted} delta="offers issued" direction="up" sparkSeed={4} />
      </div>

      <div className="adm-card">
        <div className="adm-card-head">
          <div>
            <h3 className="adm-card-title">Recent applications</h3>
            <div className="adm-card-sub">Latest submissions</div>
          </div>
          <Link href="/admin/applications" className="btn btn-sm btn-ghost-light">
            Open inbox →
          </Link>
        </div>
        <div className="adm-card-body flush">
          {recentApps.length === 0 ? (
            <p style={{ padding: '24px', color: 'var(--ink-4)', fontSize: 14 }}>No applications yet.</p>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Programme</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((a) => {
                  const name = nameOf(a);
                  return (
                    <tr key={a.id} className="is-link">
                      <td>
                        <div className="cell-name">
                          <span className="av">{initialsOf(name)}</span>
                          <div>
                            <div className="n">
                              <Link href={`/admin/applications/${a.id}`}>{name}</Link>
                            </div>
                            <div className="e">{a.applicant?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{a.programme}</td>
                      <td>
                        <span className={`status-pill status-${a.status}`}>{a.status}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                          {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-ZA') : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
