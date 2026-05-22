/**
 * Visitor segmentation — pure, deterministic, client-only.
 *
 * Segments are coarse buckets used to swap copy, CTAs, testimonials, and
 * recommended courses. We never store anything sensitive — just the inferred
 * bucket and the signals that led to it, with a TTL.
 */

export type Segment =
  | 'matric'           // Prospective matric / Grade 11–12 student
  | 'career_changer'   // Working but pivoting industries
  | 'working_pro'      // Working in adjacent field, upskilling
  | 'parent'           // Parent / guardian researching for someone else
  | 'returning'        // Has visited before
  | 'unknown';

export type SegmentSignals = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  device: 'mobile' | 'tablet' | 'desktop';
  isReturning: boolean;
  pagesViewed: number;
};

const STORAGE_KEY = 'aoad_segment_v1';
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type StoredSegment = {
  segment: Segment;
  signals: SegmentSignals;
  at: number;
};

function readStored(): StoredSegment | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSegment;
    if (Date.now() - parsed.at > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(value: StoredSegment) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function detectDevice(): SegmentSignals['device'] {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

/** Computes a segment from the current URL + referrer + history. */
export function inferSegment(signals: SegmentSignals): Segment {
  const utm = (signals.utmCampaign ?? '').toLowerCase();
  const source = (signals.utmSource ?? '').toLowerCase();
  const ref = (signals.referrer ?? '').toLowerCase();

  // Explicit campaign signals win
  if (utm.includes('matric') || utm.includes('school')) return 'matric';
  if (utm.includes('career') || utm.includes('change')) return 'career_changer';
  if (utm.includes('upskill') || utm.includes('cad')) return 'working_pro';
  if (utm.includes('parent') || utm.includes('guardian')) return 'parent';

  // Source heuristics
  if (source === 'tiktok' || source === 'instagram') return 'matric';
  if (source === 'linkedin') return 'career_changer';
  if (ref.includes('linkedin.com')) return 'career_changer';
  if (ref.includes('indeed.com') || ref.includes('careerjet')) return 'career_changer';
  if (ref.includes('autodesk.com') || ref.includes('cadblog')) return 'working_pro';

  if (signals.isReturning && signals.pagesViewed > 5) return 'returning';

  return 'unknown';
}

/**
 * Reads stored segment if fresh, otherwise infers from the current page
 * context. Idempotent — first invocation per session persists.
 */
export function resolveSegment(): { segment: Segment; signals: SegmentSignals } {
  if (typeof window === 'undefined') {
    return {
      segment: 'unknown',
      signals: { device: 'desktop', isReturning: false, pagesViewed: 0 },
    };
  }

  const stored = readStored();
  const params = new URLSearchParams(window.location.search);
  const pagesViewed = (() => {
    try {
      const n = Number(sessionStorage.getItem('aoad_pv') ?? '0') + 1;
      sessionStorage.setItem('aoad_pv', String(n));
      return n;
    } catch {
      return 1;
    }
  })();

  const signals: SegmentSignals = {
    utmSource: params.get('utm_source') ?? stored?.signals.utmSource,
    utmMedium: params.get('utm_medium') ?? stored?.signals.utmMedium,
    utmCampaign: params.get('utm_campaign') ?? stored?.signals.utmCampaign,
    referrer: document.referrer || stored?.signals.referrer,
    device: detectDevice(),
    isReturning: Boolean(stored),
    pagesViewed,
  };

  // If the URL brought new UTM data, recompute; otherwise stick with stored.
  const hasNewSignals = params.has('utm_source') || params.has('utm_campaign');
  const segment = stored && !hasNewSignals ? stored.segment : inferSegment(signals);

  writeStored({ segment, signals, at: Date.now() });
  return { segment, signals };
}

export const SEGMENT_LABEL: Record<Segment, string> = {
  matric: 'Matric / school leaver',
  career_changer: 'Career changer',
  working_pro: 'Working professional',
  parent: 'Parent / guardian',
  returning: 'Returning visitor',
  unknown: 'Visitor',
};
