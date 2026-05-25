// Email signature generator — brand constants, types and form schema.
// Templates consume SignatureInput + SignatureOptions to emit email-safe HTML.

import { z } from 'zod';

export const BRAND = {
  navy: '#050F25',
  deepNavy: '#071B3B',
  blue: '#2860EA',
  blueLight: '#5A8CFF',
  cyan: '#3DD9D6',
  paper: '#F4F6FA',
  ink: '#050F25',
  line: '#D4DCEA',
  muted: '#4A5876',
} as const;

export const OFFICE_LOCATIONS = [
  { value: 'johannesburg', label: 'Johannesburg campus (HQ)', line: 'Johannesburg · South Africa' },
  { value: 'durban',       label: 'Durban campus',            line: 'Durban · South Africa' },
  { value: 'online',       label: 'Online / Remote',          line: 'Online · South Africa' },
] as const;

export const ACCREDITATIONS = [
  'DHET', 'QCTO', 'SAQA', 'merSETA',
] as const;

export const signatureInputSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(160),
  role: z.string().min(1, 'Role is required').max(160),
  qualifications: z.string().max(160).optional().nullable(),
  email: z.string().email('Enter a valid email').max(200),
  mobile: z.string().max(40).optional().nullable(),
  office_phone: z.string().max(40).optional().nullable(),
  office_location: z.string().max(40).default('johannesburg'),
  linkedin: z.string().max(200).optional().nullable(),
  website: z.string().max(200).default('academydraughting.com'),
});

export type SignatureInput = z.infer<typeof signatureInputSchema>;

export const signatureOptionsSchema = z.object({
  template: z.string().min(1).default('classic-horizontal'),
  show_logo: z.coerce.boolean().default(true),
  show_tagline: z.coerce.boolean().default(true),
  show_accreditations: z.coerce.boolean().default(false),
});

export type SignatureOptions = z.infer<typeof signatureOptionsSchema>;
