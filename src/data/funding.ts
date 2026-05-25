import { COURSES, getCourseById } from './courses';

/**
 * Indicative fee structure, in South African Rand.
 *
 * These figures are configurable and should be confirmed against the current
 * admissions price list before launch — the value of this module is the
 * funding-route logic and the payment maths, not the specific numbers.
 *
 * `total`   — full programme fee
 * `deposit` — minimum amount that secures a seat (also the online deposit)
 * `maxMonths` — longest monthly plan offered for this programme
 */
export type FeeStructure = {
  total: number;
  deposit: number;
  maxMonths: number;
};

export const FEES: Record<string, FeeStructure> = {
  mddop: { total: 48000, deposit: 4500, maxMonths: 18 },
  bridging: { total: 12500, deposit: 2000, maxMonths: 6 },
  autocad: { total: 9800, deposit: 1500, maxMonths: 8 },
  revit: { total: 12900, deposit: 1500, maxMonths: 10 },
  inventor: { total: 12900, deposit: 1500, maxMonths: 10 },
  civil: { total: 15500, deposit: 2000, maxMonths: 12 },
};

/** Settlement discount for paying the full fee upfront. */
export const UPFRONT_DISCOUNT = 0.05;

export type FundingRouteId = 'upfront' | 'monthly' | 'employer' | 'nsfas' | 'seta';

export type FundingRoute = {
  id: FundingRouteId;
  label: string;
  blurb: string;
  /** Routes that the online deposit step applies to. */
  takesDeposit: boolean;
};

export const FUNDING_ROUTES: FundingRoute[] = [
  {
    id: 'upfront',
    label: 'Pay upfront',
    blurb: `Settle the full fee before your intake and save ${Math.round(
      UPFRONT_DISCOUNT * 100
    )}%.`,
    takesDeposit: true,
  },
  {
    id: 'monthly',
    label: 'Monthly payment plan',
    blurb: 'Secure your seat with a deposit, then spread the balance over the programme.',
    takesDeposit: true,
  },
  {
    id: 'employer',
    label: 'Employer / company-funded',
    blurb: 'Your employer is invoiced directly. We supply a pro-forma and tax invoice.',
    takesDeposit: false,
  },
  {
    id: 'nsfas',
    label: 'NSFAS / bursary',
    blurb: 'Check whether you qualify for funding before you commit a cent.',
    takesDeposit: false,
  },
  {
    id: 'seta',
    label: 'SETA / learnership',
    blurb: 'Discretionary-grant and learnership funding for qualifying employers and learners.',
    takesDeposit: false,
  },
];

/** Household-income threshold (annual, ZAR) commonly used for bursary screening. */
export const NSFAS_HOUSEHOLD_THRESHOLD = 350000;

export type Quote = {
  courseId: string;
  courseTitle: string;
  route: FundingRouteId;
  total: number;
  deposit: number;
  /** Net payable after any discount. */
  payable: number;
  discount: number;
  months: number | null;
  monthly: number | null;
};

const round = (n: number) => Math.round(n);

/**
 * Pure pricing function — given a course, a funding route and (for monthly
 * plans) a term, returns the full breakdown. Clamps the term to the
 * programme's allowed range.
 */
export function computeQuote(input: {
  courseId: string;
  route: FundingRouteId;
  months?: number;
}): Quote | null {
  const course = getCourseById(input.courseId);
  const fee = FEES[input.courseId];
  if (!course || !fee) return null;

  if (input.route === 'upfront') {
    const discount = round(fee.total * UPFRONT_DISCOUNT);
    return {
      courseId: course.id,
      courseTitle: course.title,
      route: 'upfront',
      total: fee.total,
      deposit: fee.deposit,
      payable: fee.total - discount,
      discount,
      months: null,
      monthly: null,
    };
  }

  if (input.route === 'monthly') {
    const months = Math.min(Math.max(input.months ?? fee.maxMonths, 1), fee.maxMonths);
    const balance = fee.total - fee.deposit;
    return {
      courseId: course.id,
      courseTitle: course.title,
      route: 'monthly',
      total: fee.total,
      deposit: fee.deposit,
      payable: fee.total,
      discount: 0,
      months,
      monthly: round(balance / months),
    };
  }

  // employer / nsfas / seta — informational, no online deposit
  return {
    courseId: course.id,
    courseTitle: course.title,
    route: input.route,
    total: fee.total,
    deposit: fee.deposit,
    payable: fee.total,
    discount: 0,
    months: null,
    monthly: null,
  };
}

export function formatRand(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Courses that have a fee entry and can be priced. */
export const FUNDABLE_COURSES = COURSES.filter((c) => FEES[c.id]);
