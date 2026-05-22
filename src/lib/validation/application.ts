import { z } from 'zod';

/** SA mobile, accepts `+27 …`, `0…`, with or without spaces */
const phoneRe = /^(\+27|0)\s?\d(\s?\d){8}$/;

/** SA ID: 13 digits with a valid Luhn checksum */
function isValidSaId(id: string) {
  const digits = id.replace(/\s+/g, '');
  if (!/^\d{13}$/.test(digits)) return false;
  // Modified Luhn check used by SA Home Affairs
  const odd = digits
    .slice(0, 12)
    .split('')
    .filter((_, i) => i % 2 === 0)
    .reduce((s, d) => s + Number(d), 0);
  const evenConcat = digits
    .slice(0, 12)
    .split('')
    .filter((_, i) => i % 2 === 1)
    .join('');
  const evenDoubled = String(Number(evenConcat) * 2);
  const evenSum = evenDoubled.split('').reduce((s, d) => s + Number(d), 0);
  const total = odd + evenSum;
  const check = (10 - (total % 10)) % 10;
  return check === Number(digits[12]);
}

export const StepAboutSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is required'),
  lastName: z.string().trim().min(2, 'Last name is required'),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  phone: z
    .string()
    .trim()
    .refine((v) => phoneRe.test(v), 'Use a SA mobile (+27 or 0…) format'),
  idNumber: z
    .string()
    .trim()
    .refine((v) => isValidSaId(v), 'That ID number is not valid'),
  city: z.string().trim().min(2, 'City is required'),
});

export const StepPathwaySchema = z.object({
  programme: z.enum(['mddop', 'bridging', 'short']),
  mode: z.enum(['Full-time', 'Part-time', 'Online']),
  campus: z.enum(['Johannesburg', 'Durban', 'Online']),
  fundingPlan: z.enum(['upfront', 'monthly', 'employer']),
  intake: z.string().optional(),
});

export const ApplicationDraftSchema = StepAboutSchema.merge(StepPathwaySchema).extend({
  matricYear: z.string().regex(/^(19|20)\d{2}$/, 'Use a 4-digit year').optional(),
});

export type ApplicationDraft = z.infer<typeof ApplicationDraftSchema>;
export type StepAbout = z.infer<typeof StepAboutSchema>;
export type StepPathway = z.infer<typeof StepPathwaySchema>;

/** Schemas in step order, used to validate one step at a time. */
export const STEP_SCHEMAS = [StepAboutSchema, StepPathwaySchema] as const;
