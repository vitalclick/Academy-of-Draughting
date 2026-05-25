import { COURSES } from '@/data/courses';

export const PROGRAMME_OPTIONS = COURSES.map((c) => ({ value: c.id, label: c.title }));
export const PROGRAMME_IDS: string[] = COURSES.map((c) => c.id);

export const MODE_OPTIONS = ['Full-time', 'Part-time', 'Online'];
export const CAMPUS_OPTIONS = ['Johannesburg', 'Durban', 'Online'];

export const FUNDING_OPTIONS = [
  { value: 'upfront', label: 'Upfront' },
  { value: 'monthly', label: 'Monthly instalments' },
  { value: 'employer', label: 'Employer / sponsor' },
];
export const FUNDING_VALUES: string[] = FUNDING_OPTIONS.map((f) => f.value);

export const STATUS_OPTIONS = ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'];

export type CreateState = { error?: string };

export type ImportState = {
  ran: boolean;
  created: number;
  skipped: number;
  errors: { row: number; message: string }[];
};

export const EMPTY_IMPORT: ImportState = { ran: false, created: 0, skipped: 0, errors: [] };

export const CSV_COLUMNS = [
  'email',
  'first_name',
  'last_name',
  'phone',
  'city',
  'id_number',
  'matric_year',
  'programme',
  'mode',
  'campus',
  'funding_plan',
  'intake',
  'status',
];
