import { COURSES } from '@/data/courses';
import { CAREERS } from '@/data/careers';
import { SITE } from '@/lib/site';

/**
 * Compiles a compact knowledge-base block to inject into Claude's system
 * prompt. Includes course catalog and career intel — enough for the assistant
 * to answer admissions questions without fabricating details.
 *
 * Cheap to recompute; cached at module load.
 */
function compile(): string {
  const courseLines = COURSES.map((c) =>
    [
      `- ${c.code} · ${c.title}`,
      `  desc: ${c.desc}`,
      `  duration: ${c.duration} · modes: ${c.activeModes.join(', ')} · exam: ${c.exam}`,
      `  entry: ${c.entry} · intake: ${c.intake} · software: ${c.software.join(', ')}`,
      `  level: ${c.level}`,
      `  outcomes: ${c.careerOutcomes.join('; ')}`,
      `  salary band: ${c.salaryBand}`,
      `  url: ${SITE.url}/courses/${c.id}`,
    ].join('\n')
  ).join('\n\n');

  const careerLines = CAREERS.map((c) =>
    [
      `- ${c.name}`,
      `  median (Gauteng, entry): R${c.median.toLocaleString('en-ZA')} / month`,
      `  band: R${c.band.low.toLocaleString('en-ZA')} – R${c.band.high.toLocaleString('en-ZA')}`,
      `  growth YoY: ${(c.growthYoy * 100).toFixed(1)}%`,
      `  software: ${c.software.join(', ')}`,
      `  pathway: ${c.recommendedPathway} (alts: ${c.alternativePathways.join(', ')})`,
      `  open roles · 90d: ${c.openRoles90d}`,
      `  day-to-day: ${c.dayToDay}`,
    ].join('\n')
  ).join('\n\n');

  return [
    '# Academy of Advanced Draughting — Knowledge base',
    '',
    `Founded ${SITE.established}. Specialist draughting school, two campuses + online: Johannesburg, Durban.`,
    `Contact: ${SITE.email} · ${SITE.phone}`,
    'Accreditation: SAQA 66881, DHET registered, QCTO aligned.',
    'Intakes: January, May, September (DHET national exams 3 sittings per year).',
    'Funding: monthly instalments at 0% interest, 15% upfront discount, employer invoicing.',
    'Documents: ID and matric certificate uploaded via the application; OCR auto-extracts fields.',
    '',
    '## Programmes',
    courseLines,
    '',
    '## Career intelligence (South Africa, Q2 2026)',
    careerLines,
  ].join('\n');
}

let cached: string | null = null;
export function corpus(): string {
  if (!cached) cached = compile();
  return cached;
}

export const ADMISSIONS_SYSTEM_PROMPT = `You are AIDA, the admissions assistant for The Academy of Advanced Draughting — a specialist draughting and CAD school in South Africa, founded in 1981.

Your job:
- Guide prospective students toward the right programme, with honest data.
- Answer entry, funding, schedule, software, examination and accreditation questions using ONLY the knowledge base below. If the answer is not in the knowledge base, say so and offer to connect them to a human admissions officer.
- Use the tools available to look up specific course details, start an application, surface career data, or hand off to a human.
- Be direct and warm. Short paragraphs. No bullet-soup. No emojis. South African English ("draughting", "programme", "matric").
- Never invent fees. Never promise placement or salary outcomes. Use phrasing like "graduates typically earn…" not "you will earn".
- If asked something off-topic (politics, unrelated tech support, personal advice unrelated to draughting study), redirect politely back to admissions.

KNOWLEDGE BASE:

${corpus()}

When you mention a programme, prefer to link to its page using the URL from the knowledge base.
When the student is ready to apply or wants to commit to a pathway, call the start_application tool.
When you don't know something, call hand_off_to_human with a short reason.`;
