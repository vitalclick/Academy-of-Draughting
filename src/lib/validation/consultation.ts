import { z } from 'zod';

export const ConsultationSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(6).max(20),
  campus: z.enum(['Johannesburg', 'Durban', 'Online']),
  preferredDate: z.string().trim().max(40).optional(),
  preferredTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
  interest: z.string().trim().max(40).optional(),
  message: z.string().trim().max(600).optional(),
  anonymousId: z.string().max(64).nullable().optional(),
  sessionId: z.string().max(64).nullable().optional(),
});

export type ConsultationInput = z.infer<typeof ConsultationSchema>;
