import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { captureError } from '@/lib/observability';
import {
  RANGES,
  type RangeKey,
  type SegmentKey,
  type SeriesPoint,
  type BarDatum,
  type GeoDatum,
  type WebAnalytics,
} from '@/lib/analytics/web';

export { RANGES, SEGMENTS } from '@/lib/analytics/web';
export type { RangeKey, SegmentKey, SeriesPoint, BarDatum, GeoDatum, WebAnalytics } from '@/lib/analytics/web';

type RawEvent = {
  name: string;
  occurred_at: string;
  anonymous_id: string | null;
  session_id: string | null;
  applicant_id: string | null;
  payload: Record<string, unknown> | null;
};

const COUNTRY_NAMES: Record<string, string> = {
  ZA: 'South Africa',
  NA: 'Namibia',
  BW: 'Botswana',
  ZW: 'Zimbabwe',
  GB: 'United Kingdom',
  US: 'United States',
  AU: 'Australia',
  DE: 'Germany',
  NG: 'Nigeria',
  KE: 'Kenya',
  IN: 'India',
  AE: 'UAE',
};

function flagFor(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function rangeConfig(range: RangeKey) {
  return RANGES.find((r) => r.key === range) ?? RANGES[1];
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

/** Aggregates a set of raw events into the dashboard totals + breakdowns. */
function aggregate(events: RawEvent[], range: RangeKey, buckets: number, startMs: number, spanMs: number) {
  const pageViews = events.filter((e) => e.name === 'page_view');
  const users = new Set<string>();
  const sessions = new Map<
    string,
    { first: number; last: number; pv: number; device: string; source: string; country: string | null }
  >();

  const series: SeriesPoint[] = Array.from({ length: buckets }, () => ({ label: '', pageViews: 0, visitors: 0 }));
  const seriesSessions: Set<string>[] = Array.from({ length: buckets }, () => new Set<string>());
  const bucketMs = spanMs / buckets;

  for (const e of events) {
    if (e.anonymous_id) users.add(e.anonymous_id);
    const t = Date.parse(e.occurred_at);
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor((t - startMs) / bucketMs)));

    if (e.name === 'page_view') series[idx].pageViews += 1;

    const sid = e.session_id;
    if (sid) {
      if (e.session_id) seriesSessions[idx].add(sid);
      const s = sessions.get(sid);
      const device = str(e.payload?.device) ?? 'desktop';
      const source = str(e.payload?.source) ?? 'Direct';
      const country = str(e.payload?.country);
      if (s) {
        s.first = Math.min(s.first, t);
        s.last = Math.max(s.last, t);
        if (e.name === 'page_view') s.pv += 1;
      } else {
        sessions.set(sid, { first: t, last: t, pv: e.name === 'page_view' ? 1 : 0, device, source, country });
      }
    }
  }

  for (let i = 0; i < buckets; i++) series[i].visitors = seriesSessions[i].size;

  // Device / source / geo — one vote per session
  const devices = new Map<string, number>();
  const sources = new Map<string, number>();
  const geo = new Map<string, number>();
  let bounced = 0;
  let pvSessions = 0;
  let durationSum = 0;
  for (const s of sessions.values()) {
    devices.set(s.device, (devices.get(s.device) ?? 0) + 1);
    sources.set(s.source, (sources.get(s.source) ?? 0) + 1);
    if (s.country) geo.set(s.country, (geo.get(s.country) ?? 0) + 1);
    durationSum += Math.max(0, s.last - s.first);
    if (s.pv >= 1) {
      pvSessions += 1;
      if (s.pv <= 1) bounced += 1;
    }
  }

  const topPagesMap = new Map<string, number>();
  for (const e of pageViews) {
    const path = str(e.payload?.path) ?? '/';
    topPagesMap.set(path, (topPagesMap.get(path) ?? 0) + 1);
  }

  const toBars = (m: Map<string, number>): BarDatum[] =>
    [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  return {
    totals: {
      visitors: sessions.size,
      uniqueUsers: users.size,
      pageViews: pageViews.length,
      bounceRate: pvSessions ? bounced / pvSessions : 0,
      avgSessionSec: sessions.size ? Math.round(durationSum / sessions.size / 1000) : 0,
    },
    series,
    sources: toBars(sources),
    devices: toBars(devices),
    geo: toBars(geo)
      .map((b) => ({ code: b.label, name: COUNTRY_NAMES[b.label] ?? b.label, flag: flagFor(b.label), value: b.value }))
      .slice(0, 8),
    topPages: toBars(topPagesMap).slice(0, 8),
  };
}

function labelBuckets(range: RangeKey, buckets: number, startMs: number, spanMs: number, series: SeriesPoint[]) {
  const bucketMs = spanMs / buckets;
  for (let i = 0; i < buckets; i++) {
    const d = new Date(startMs + i * bucketMs);
    series[i].label =
      range === '24h'
        ? `${String(d.getHours()).padStart(2, '0')}:00`
        : d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
  }
}

function pctDelta(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return Math.round(((curr - prev) / prev) * 100);
}

export async function getWebAnalytics(range: RangeKey, segment: SegmentKey): Promise<WebAnalytics> {
  const cfg = rangeConfig(range);
  const now = Date.now();
  const spanMs = cfg.days * 24 * 60 * 60 * 1000;
  const startMs = now - spanMs;
  const prevStartMs = startMs - spanMs;

  const sb = supabaseAdmin();
  if (!sb) return sampleAnalytics(range, segment);

  let query = sb
    .from('events')
    .select('name, occurred_at, anonymous_id, session_id, applicant_id, payload')
    .gte('occurred_at', new Date(prevStartMs).toISOString())
    .order('occurred_at', { ascending: false })
    .limit(50000);
  if (segment === 'identified') query = query.not('applicant_id', 'is', null);
  if (segment === 'anonymous') query = query.is('applicant_id', null);

  const { data, error } = await query;
  if (error) {
    await captureError('getWebAnalytics failed', error);
    return sampleAnalytics(range, segment);
  }

  const rows = (data ?? []) as RawEvent[];
  if (rows.length === 0) return sampleAnalytics(range, segment);

  const current = rows.filter((e) => Date.parse(e.occurred_at) >= startMs);
  const previous = rows.filter((e) => {
    const t = Date.parse(e.occurred_at);
    return t >= prevStartMs && t < startMs;
  });

  const agg = aggregate(current, range, cfg.buckets, startMs, spanMs);
  labelBuckets(range, cfg.buckets, startMs, spanMs, agg.series);
  const prevAgg = aggregate(previous, range, cfg.buckets, prevStartMs, spanMs);

  return {
    isSample: false,
    range,
    segment,
    generatedAt: new Date(now).toISOString(),
    ...agg,
    deltas: {
      visitors: pctDelta(agg.totals.visitors, prevAgg.totals.visitors),
      uniqueUsers: pctDelta(agg.totals.uniqueUsers, prevAgg.totals.uniqueUsers),
      pageViews: pctDelta(agg.totals.pageViews, prevAgg.totals.pageViews),
    },
  };
}

// ---------------------------------------------------------------------------
// Sample data — used when Supabase is unconfigured or no traffic exists yet,
// so the dashboard is demonstrable. Always flagged `isSample: true`.
// ---------------------------------------------------------------------------
function sampleAnalytics(range: RangeKey, segment: SegmentKey): WebAnalytics {
  const cfg = rangeConfig(range);
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const now = Date.now();
  const bucketMs = (cfg.days * 24 * 60 * 60 * 1000) / cfg.buckets;
  const startMs = now - cfg.days * 24 * 60 * 60 * 1000;

  const series: SeriesPoint[] = Array.from({ length: cfg.buckets }, (_, i) => {
    const d = new Date(startMs + i * bucketMs);
    const base = 120 + Math.sin(i * 0.5) * 40 + rand() * 60;
    const pv = Math.round(base);
    return {
      label:
        range === '24h'
          ? `${String(d.getHours()).padStart(2, '0')}:00`
          : d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' }),
      pageViews: pv,
      visitors: Math.round(pv * (0.55 + rand() * 0.15)),
    };
  });

  const pageViews = series.reduce((s, p) => s + p.pageViews, 0);
  const visitors = series.reduce((s, p) => s + p.visitors, 0);
  const mult = segment === 'identified' ? 0.18 : segment === 'anonymous' ? 0.82 : 1;
  const scale = (n: number) => Math.round(n * mult);

  return {
    isSample: true,
    range,
    segment,
    generatedAt: new Date(now).toISOString(),
    totals: {
      visitors: scale(visitors),
      uniqueUsers: scale(Math.round(visitors * 0.78)),
      pageViews: scale(pageViews),
      bounceRate: 0.42,
      avgSessionSec: 168,
    },
    deltas: { visitors: 12, uniqueUsers: 9, pageViews: 15 },
    series: series.map((p) => ({ ...p, pageViews: scale(p.pageViews), visitors: scale(p.visitors) })),
    sources: [
      { label: 'Organic search', value: scale(Math.round(visitors * 0.41)) },
      { label: 'Direct', value: scale(Math.round(visitors * 0.27)) },
      { label: 'Social', value: scale(Math.round(visitors * 0.19)) },
      { label: 'Referral', value: scale(Math.round(visitors * 0.13)) },
    ],
    devices: [
      { label: 'mobile', value: scale(Math.round(visitors * 0.64)) },
      { label: 'desktop', value: scale(Math.round(visitors * 0.29)) },
      { label: 'tablet', value: scale(Math.round(visitors * 0.07)) },
    ],
    geo: [
      { code: 'ZA', name: 'South Africa', flag: flagFor('ZA'), value: scale(Math.round(visitors * 0.83)) },
      { code: 'NA', name: 'Namibia', flag: flagFor('NA'), value: scale(Math.round(visitors * 0.05)) },
      { code: 'GB', name: 'United Kingdom', flag: flagFor('GB'), value: scale(Math.round(visitors * 0.04)) },
      { code: 'BW', name: 'Botswana', flag: flagFor('BW'), value: scale(Math.round(visitors * 0.03)) },
      { code: 'ZW', name: 'Zimbabwe', flag: flagFor('ZW'), value: scale(Math.round(visitors * 0.03)) },
    ],
    topPages: [
      { label: '/', value: scale(Math.round(pageViews * 0.22)) },
      { label: '/courses', value: scale(Math.round(pageViews * 0.18)) },
      { label: '/funding', value: scale(Math.round(pageViews * 0.15)) },
      { label: '/courses/mddop', value: scale(Math.round(pageViews * 0.12)) },
      { label: '/apply', value: scale(Math.round(pageViews * 0.1)) },
      { label: '/career', value: scale(Math.round(pageViews * 0.08)) },
    ],
  };
}
