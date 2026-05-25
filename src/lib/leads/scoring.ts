/**
 * Lead scoring — turns the raw event stream into a single intent score so
 * admissions can prioritise follow-up. Pure and dependency-free.
 *
 * Weights reflect commitment: paying a deposit is worth far more than
 * downloading a guide. A contact's score is the sum of their distinct
 * scored events (capped per event so repeated actions don't inflate it).
 */

export const EVENT_WEIGHTS: Record<string, number> = {
  deposit_paid: 100,
  application_submitted: 60,
  deposit_initiated: 40,
  funding_quote: 25,
  document_uploaded: 20,
  recommend_completed: 15,
  career_quiz_completed: 15,
  consultation_booked: 35,
  lead_captured: 10,
  apply_step_complete: 8,
};

export type LeadGrade = 'hot' | 'warm' | 'cool' | 'cold';

export function gradeFor(score: number): LeadGrade {
  if (score >= 100) return 'hot';
  if (score >= 45) return 'warm';
  if (score >= 15) return 'cool';
  return 'cold';
}

export function scoreEvent(name: string): number {
  return EVENT_WEIGHTS[name] ?? 0;
}

/**
 * Sums weights across a contact's events. Each event type counts at most
 * twice so a flurry of the same action can't dominate the score.
 */
export function computeLeadScore(eventNames: string[]): number {
  const counts = new Map<string, number>();
  let total = 0;
  for (const name of eventNames) {
    const weight = EVENT_WEIGHTS[name];
    if (!weight) continue;
    const seen = counts.get(name) ?? 0;
    if (seen >= 2) continue;
    counts.set(name, seen + 1);
    total += weight;
  }
  return total;
}
