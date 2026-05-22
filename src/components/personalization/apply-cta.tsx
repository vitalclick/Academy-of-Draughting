'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePersonalization } from './provider';
import { track } from '@/lib/analytics/events';

const LABELS: Record<string, string> = {
  apply_now: 'Apply Now',
  start_application: 'Start application',
  check_eligibility: 'Check eligibility',
};

/**
 * Personalized Apply CTA — label varies by experiment assignment.
 * Drop-in for any place that linked to `/apply`.
 */
export function ApplyCta({
  size = 'sm',
  className = '',
  href = '/apply',
}: {
  size?: 'sm' | 'lg';
  className?: string;
  href?: string;
}) {
  const { ready, variantFor, segment, anonId } = usePersonalization();
  const variant = variantFor('apply_cta_label');
  const label = LABELS[variant] ?? LABELS.apply_now;
  const reportedRef = useRef(false);

  useEffect(() => {
    if (!ready || reportedRef.current) return;
    reportedRef.current = true;
    track('experiment_exposed', {
      experiment: 'apply_cta_label',
      variant,
      segment,
      anonId: anonId ?? undefined,
    });
  }, [ready, variant, segment, anonId]);

  return (
    <Link
      href={href}
      className={`btn ${size === 'lg' ? 'btn-lg' : 'btn-sm'} ${className}`}
      onClick={() =>
        track('apply_cta_clicked', { variant, segment, source: size === 'lg' ? 'hero' : 'chrome' })
      }
    >
      {label}{' '}
      <span className="arr" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
