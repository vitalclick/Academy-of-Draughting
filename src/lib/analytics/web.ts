// Client-safe analytics types and constants (no server-only imports), so both
// the server aggregation layer and client filter components can share them.

export type RangeKey = '24h' | '7d' | '30d' | '90d';
export type SegmentKey = 'all' | 'identified' | 'anonymous';

export const RANGES: { key: RangeKey; label: string; days: number; buckets: number }[] = [
  { key: '24h', label: 'Last 24 hours', days: 1, buckets: 24 },
  { key: '7d', label: 'Last 7 days', days: 7, buckets: 7 },
  { key: '30d', label: 'Last 30 days', days: 30, buckets: 30 },
  { key: '90d', label: 'Last 90 days', days: 90, buckets: 90 },
];

export const SEGMENTS: { key: SegmentKey; label: string }[] = [
  { key: 'all', label: 'All traffic' },
  { key: 'identified', label: 'Known contacts' },
  { key: 'anonymous', label: 'Anonymous' },
];

export type SeriesPoint = { label: string; pageViews: number; visitors: number };
export type BarDatum = { label: string; value: number };
export type GeoDatum = { code: string; name: string; flag: string; value: number };

export type WebAnalytics = {
  isSample: boolean;
  range: RangeKey;
  segment: SegmentKey;
  generatedAt: string;
  totals: {
    visitors: number;
    uniqueUsers: number;
    pageViews: number;
    bounceRate: number;
    avgSessionSec: number;
  };
  deltas: { visitors: number; uniqueUsers: number; pageViews: number };
  series: SeriesPoint[];
  sources: BarDatum[];
  devices: BarDatum[];
  geo: GeoDatum[];
  topPages: BarDatum[];
};
