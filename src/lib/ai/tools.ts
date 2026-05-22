import type Anthropic from '@anthropic-ai/sdk';
import { COURSES, getCourseById } from '@/data/courses';
import { CAREERS, getCareerById } from '@/data/careers';
import { SITE } from '@/lib/site';

export const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'lookup_course',
    description:
      'Look up full details for one of the Academy programmes — modules, duration, modes, software, salary band, FAQs. Use when the student asks for specifics about a programme.',
    input_schema: {
      type: 'object',
      properties: {
        course_id: {
          type: 'string',
          enum: COURSES.map((c) => c.id),
          description: 'The programme id (e.g. mddop, bridging, autocad, revit, inventor, civil)',
        },
      },
      required: ['course_id'],
    },
  },
  {
    name: 'list_courses',
    description:
      'List all available programmes with a one-line summary. Use when the student wants an overview before going deep.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_career_data',
    description:
      'Get South African market data for a draughting career — median salary, band, growth, demand, top employers. Use when the student asks about money, demand, or employability.',
    input_schema: {
      type: 'object',
      properties: {
        career_id: {
          type: 'string',
          enum: CAREERS.map((c) => c.id),
        },
      },
      required: ['career_id'],
    },
  },
  {
    name: 'recommend_pathway',
    description:
      'Given the student profile, return the top programme matches with a fit score and rationale. Use after you have enough context: their starting point (matric, working, career change), interest area, and study mode preference.',
    input_schema: {
      type: 'object',
      properties: {
        starting_point: {
          type: 'string',
          enum: ['matric', 'working', 'career_change', 'student'],
        },
        interest: {
          type: 'string',
          enum: ['mechanical', 'architectural', 'civil', 'bim', 'not_sure'],
        },
        mode: { type: 'string', enum: ['full_time', 'part_time', 'online', 'no_preference'] },
        has_cad_experience: { type: 'boolean' },
      },
      required: ['starting_point', 'interest', 'mode'],
    },
  },
  {
    name: 'start_application',
    description:
      'Open the application form with the suggested programme pre-selected. Use only after the student has expressed intent to apply.',
    input_schema: {
      type: 'object',
      properties: {
        course_id: { type: 'string', enum: COURSES.map((c) => c.id) },
        mode: { type: 'string', enum: ['Full-time', 'Part-time', 'Online'] },
      },
      required: ['course_id'],
    },
  },
  {
    name: 'hand_off_to_human',
    description:
      'Surface a "talk to a human admissions officer" CTA. Use when you are uncertain, when the student wants formal confirmation, or when the topic is sensitive (fees, special circumstances, accommodations).',
    input_schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'One-line description of why you are handing off.',
        },
      },
      required: ['reason'],
    },
  },
];

type ToolInput = {
  lookup_course: { course_id: string };
  list_courses: Record<string, never>;
  get_career_data: { career_id: string };
  recommend_pathway: {
    starting_point: 'matric' | 'working' | 'career_change' | 'student';
    interest: 'mechanical' | 'architectural' | 'civil' | 'bim' | 'not_sure';
    mode: 'full_time' | 'part_time' | 'online' | 'no_preference';
    has_cad_experience?: boolean;
  };
  start_application: { course_id: string; mode?: string };
  hand_off_to_human: { reason: string };
};

export type ToolEffect =
  | { kind: 'cta-apply'; courseId: string; mode?: string }
  | { kind: 'cta-handoff'; reason: string }
  | { kind: 'cta-link'; href: string; label: string };

export type ToolResult = { content: string; effect?: ToolEffect };

export function runTool(name: string, raw: unknown): ToolResult {
  switch (name as keyof ToolInput) {
    case 'lookup_course': {
      const { course_id } = raw as ToolInput['lookup_course'];
      const c = getCourseById(course_id);
      if (!c) return { content: JSON.stringify({ error: 'unknown course', course_id }) };
      return {
        content: JSON.stringify(
          {
            id: c.id,
            code: c.code,
            title: c.title,
            description: c.desc,
            duration: c.duration,
            modes: c.activeModes,
            exam: c.exam,
            entry: c.entry,
            intake: c.intake,
            software: c.software,
            modules: c.modules,
            outcomes: c.careerOutcomes,
            salary_band: c.salaryBand,
            url: `${SITE.url}/courses/${c.id}`,
          },
          null,
          2
        ),
        effect: { kind: 'cta-link', href: `/courses/${c.id}`, label: `Open ${c.title}` },
      };
    }

    case 'list_courses': {
      const list = COURSES.map((c) => ({
        id: c.id,
        title: c.title,
        duration: c.duration,
        modes: c.activeModes,
        level: c.level,
      }));
      return { content: JSON.stringify(list, null, 2) };
    }

    case 'get_career_data': {
      const { career_id } = raw as ToolInput['get_career_data'];
      const c = getCareerById(career_id);
      if (!c) return { content: JSON.stringify({ error: 'unknown career', career_id }) };
      return {
        content: JSON.stringify(
          {
            name: c.name,
            median_zar_per_month: c.median,
            band: c.band,
            growth_yoy: c.growthYoy,
            software: c.software,
            open_roles_90d: c.openRoles90d,
            recommended_pathway: c.recommendedPathway,
            day_to_day: c.dayToDay,
          },
          null,
          2
        ),
      };
    }

    case 'recommend_pathway': {
      const input = raw as ToolInput['recommend_pathway'];
      const scored = scoreRecommendations(input);
      return { content: JSON.stringify(scored.slice(0, 3), null, 2) };
    }

    case 'start_application': {
      const { course_id, mode } = raw as ToolInput['start_application'];
      return {
        content: JSON.stringify({ ok: true, opened: `/apply?course=${course_id}` }),
        effect: { kind: 'cta-apply', courseId: course_id, mode },
      };
    }

    case 'hand_off_to_human': {
      const { reason } = raw as ToolInput['hand_off_to_human'];
      return {
        content: JSON.stringify({ acknowledged: true, reason }),
        effect: { kind: 'cta-handoff', reason },
      };
    }
  }

  return { content: JSON.stringify({ error: 'unknown tool', name }) };
}

// ---- Recommendation scoring (shared with the /api/recommend endpoint) ----

export function scoreRecommendations(input: {
  starting_point: 'matric' | 'working' | 'career_change' | 'student';
  interest: 'mechanical' | 'architectural' | 'civil' | 'bim' | 'not_sure';
  mode: 'full_time' | 'part_time' | 'online' | 'no_preference';
  has_cad_experience?: boolean;
}) {
  return COURSES.map((c) => {
    let score = c.fit; // baseline
    // starting point
    if (input.starting_point === 'matric' && c.id === 'mddop') score += 8;
    if (input.starting_point === 'matric' && c.id === 'bridging') score += 4;
    if (input.starting_point === 'working' && c.level === 'Specialisation') score += 10;
    if (input.starting_point === 'career_change' && c.id === 'mddop') score += 6;
    if (input.starting_point === 'career_change' && c.id === 'bridging' && !input.has_cad_experience)
      score += 4;
    // interest
    if (input.interest !== 'not_sure' && c.discipline.includes(input.interest)) score += 12;
    // mode
    if (input.mode === 'full_time' && c.activeModes.includes('Full-time')) score += 2;
    if (input.mode === 'part_time' && c.activeModes.includes('Part-time')) score += 4;
    if (input.mode === 'online' && c.activeModes.includes('Online')) score += 4;
    // experience
    if (input.has_cad_experience === false && c.id === 'bridging') score += 6;
    if (input.has_cad_experience === true && c.level === 'Specialisation') score += 4;
    return {
      course_id: c.id,
      title: c.title,
      score: Math.min(100, Math.round(score)),
      duration: c.duration,
      modes: c.activeModes,
      software: c.software,
    };
  }).sort((a, b) => b.score - a.score);
}
