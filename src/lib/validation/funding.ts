import { z } from 'zod';

const courseId = z.string().min(1).max(40);
const route = z.enum(['upfront', 'monthly', 'employer', 'nsfas', 'seta']);

/** Request to email/save a fee quote — a qualified lead. */
export const QuoteRequestSchema = z.object({
  courseId,
  route,
  months: z.coerce.number().int().min(1).max(36).optional(),
  email: z.string().trim().toLowerCase().email(),
  firstName: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  /** Annual household income band, captured for bursary screening (optional). */
  householdIncome: z.coerce.number().int().min(0).max(100_000_000).optional(),
  anonymousId: z.string().max(64).nullable().optional(),
  sessionId: z.string().max(64).nullable().optional(),
});

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

/** Request to initiate an online deposit checkout. */
export const DepositInitSchema = z.object({
  courseId,
  route: z.enum(['upfront', 'monthly']),
  months: z.coerce.number().int().min(1).max(36).optional(),
  email: z.string().trim().toLowerCase().email(),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
});

export type DepositInit = z.infer<typeof DepositInitSchema>;
