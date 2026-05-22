/**
 * Lightweight A/B harness.
 *
 * Assignment is deterministic: hash(anonId + experimentKey) % variants.length.
 * That means a visitor's bucket is stable across reloads without needing a
 * server round-trip, and we can change variant order without re-bucketing.
 *
 * Active experiments are registered here. When you're done analysing one,
 * either remove it or pin a `force` variant.
 */

export type Experiment<V extends string = string> = {
  key: string;
  description: string;
  variants: readonly V[];
  /** Optional fixed assignment (e.g. for a launch ramp). */
  force?: V;
};

export const EXPERIMENTS = {
  home_hero_headline: {
    key: 'home_hero_headline',
    description: 'Home hero H1 copy test',
    variants: ['careers_start', 'specialist_since_1981', 'drawing_office_ready'] as const,
  },
  apply_cta_label: {
    key: 'apply_cta_label',
    description: 'Primary CTA label across the chrome',
    variants: ['apply_now', 'start_application', 'check_eligibility'] as const,
  },
} satisfies Record<string, Experiment>;

export type ExperimentKey = keyof typeof EXPERIMENTS;
export type VariantOf<K extends ExperimentKey> = (typeof EXPERIMENTS)[K]['variants'][number];

/** FNV-1a 32-bit; small, deterministic, no deps. */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function pickVariant<K extends ExperimentKey>(
  key: K,
  anonId: string | null | undefined
): VariantOf<K> {
  const exp = EXPERIMENTS[key] as Experiment<VariantOf<K>>;
  if (exp.force) return exp.force;
  const id = anonId ?? 'anon';
  const i = fnv1a(`${id}::${exp.key}`) % exp.variants.length;
  return exp.variants[i] as VariantOf<K>;
}

/** Returns assignment for every active experiment — handy for the debug overlay. */
export function allAssignments(anonId: string | null | undefined) {
  const out: Record<string, string> = {};
  for (const key of Object.keys(EXPERIMENTS) as ExperimentKey[]) {
    out[key] = pickVariant(key, anonId);
  }
  return out;
}
