'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  resolveSegment,
  SEGMENT_LABEL,
  type Segment,
  type SegmentSignals,
} from '@/lib/personalization/segment';
import {
  allAssignments,
  pickVariant,
  type ExperimentKey,
  type VariantOf,
} from '@/lib/personalization/experiments';
import { track } from '@/lib/analytics/events';

const ANON_KEY = 'aoad_anon_id_v1';

type Personalization = {
  ready: boolean;
  segment: Segment;
  signals: SegmentSignals | null;
  anonId: string | null;
  variantFor: <K extends ExperimentKey>(key: K) => VariantOf<K>;
};

const Context = createContext<Personalization | null>(null);

function readAnonId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ANON_KEY);
  } catch {
    return null;
  }
}

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [segment, setSegment] = useState<Segment>('unknown');
  const [signals, setSignals] = useState<SegmentSignals | null>(null);
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    const { segment: s, signals: sig } = resolveSegment();
    setSegment(s);
    setSignals(sig);
    setAnonId(readAnonId());
    setReady(true);
    track('segment_resolved', { segment: s, device: sig.device });
  }, []);

  const value = useMemo<Personalization>(
    () => ({
      ready,
      segment,
      signals,
      anonId,
      variantFor: <K extends ExperimentKey>(k: K) => pickVariant(k, anonId),
    }),
    [ready, segment, signals, anonId]
  );

  return (
    <Context.Provider value={value}>
      {children}
      <DebugOverlay segment={segment} signals={signals} anonId={anonId} />
    </Context.Provider>
  );
}

export function usePersonalization() {
  const ctx = useContext(Context);
  if (!ctx) {
    return {
      ready: false,
      segment: 'unknown' as Segment,
      signals: null,
      anonId: null,
      variantFor: <K extends ExperimentKey>(k: K) => pickVariant(k, null),
    };
  }
  return ctx;
}

/** Visible only when `?debug=personalization` is in the URL. */
function DebugOverlay({
  segment,
  signals,
  anonId,
}: {
  segment: Segment;
  signals: SegmentSignals | null;
  anonId: string | null;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setVisible(params.get('debug') === 'personalization');
  }, []);

  if (!visible) return null;
  const assignments = allAssignments(anonId);

  return (
    <div className="pers-debug" role="region" aria-label="Personalization debug">
      <div className="pers-debug-head">
        <span className="t-mono-xs">DEBUG · PERSONALIZATION</span>
        <button type="button" onClick={() => setVisible(false)} aria-label="Hide">
          ×
        </button>
      </div>
      <dl>
        <dt>SEGMENT</dt>
        <dd>
          <strong>{segment}</strong> · {SEGMENT_LABEL[segment]}
        </dd>
        {signals && (
          <>
            <dt>DEVICE</dt>
            <dd>{signals.device}</dd>
            <dt>PAGES</dt>
            <dd>{signals.pagesViewed}</dd>
            {signals.utmSource && (
              <>
                <dt>UTM</dt>
                <dd>
                  {signals.utmSource} / {signals.utmCampaign}
                </dd>
              </>
            )}
            {signals.referrer && (
              <>
                <dt>REFERRER</dt>
                <dd style={{ wordBreak: 'break-all' }}>{signals.referrer}</dd>
              </>
            )}
          </>
        )}
        <dt>ANON ID</dt>
        <dd style={{ wordBreak: 'break-all' }}>{anonId ?? '—'}</dd>
        <dt>EXPERIMENTS</dt>
        <dd>
          {Object.entries(assignments).map(([k, v]) => (
            <div key={k}>
              <code>{k}</code> → <strong>{v}</strong>
            </div>
          ))}
        </dd>
      </dl>
    </div>
  );
}
