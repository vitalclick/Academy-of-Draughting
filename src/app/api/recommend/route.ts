import { z } from 'zod';
import { anthropic, MODELS } from '@/lib/ai/anthropic';
import { clientKey, rateLimit } from '@/lib/ai/rate-limit';
import { scoreRecommendations } from '@/lib/ai/tools';
import { getCourseById } from '@/data/courses';
import { logEvent } from '@/lib/db/applications';

export const runtime = 'nodejs';

const RequestSchema = z.object({
  starting_point: z.enum(['matric', 'working', 'career_change', 'student']),
  interest: z.enum(['mechanical', 'architectural', 'civil', 'bim', 'not_sure']),
  mode: z.enum(['full_time', 'part_time', 'online', 'no_preference']),
  has_cad_experience: z.boolean().optional(),
});

const QUIZ_SYSTEM = `You write one short paragraph (max 60 words) explaining why a specific Academy of Advanced Draughting programme is the best fit for a prospective student.

Tone: direct, warm, South African English. No bullet lists. No emojis. Reference the student's situation in concrete terms.`;

export async function POST(req: Request) {
  const key = clientKey(req.headers);
  const limit = rateLimit(`reco:${key}`, 10, 10);
  if (!limit.ok) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const ranked = scoreRecommendations(parsed.data).slice(0, 3);
  const top = ranked[0];
  const course = getCourseById(top.course_id);

  let rationale = course
    ? `${course.title} is the closest fit based on your answers — covering ${course.software.join(
        ', '
      )} across ${course.duration}. Most students at your starting point begin here.`
    : 'This pathway is the closest fit based on your answers.';

  // If Claude is configured, replace the boilerplate rationale with a tailored one.
  const client = anthropic();
  if (client && course) {
    try {
      const profile = `Starting point: ${parsed.data.starting_point}. Interest: ${parsed.data.interest}. Preferred mode: ${parsed.data.mode}. CAD experience: ${parsed.data.has_cad_experience ?? 'unknown'}.`;
      const courseSummary = `Programme: ${course.title}. Duration: ${course.duration}. Modes: ${course.activeModes.join(
        ', '
      )}. Entry: ${course.entry}. Software: ${course.software.join(', ')}. Outcomes: ${course.careerOutcomes.join(
        '; '
      )}.`;
      const msg = await client.messages.create({
        model: MODELS.chat(),
        max_tokens: 220,
        system: QUIZ_SYSTEM,
        messages: [
          {
            role: 'user',
            content: `Student profile:\n${profile}\n\nRecommended programme:\n${courseSummary}\n\nWrite the one-paragraph rationale.`,
          },
        ],
      });
      const text = msg.content
        .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      if (text) rationale = text;
    } catch (err) {
      console.warn('[reco] LLM rationale failed', err);
    }
  }

  logEvent({
    name: 'recommender_completed',
    applicant_id: null,
    application_id: null,
    anonymous_id: null,
    session_id: null,
    payload: { ...parsed.data, top_course: top.course_id, top_score: top.score },
  }).catch(() => {});

  return Response.json({ ranked, top: top.course_id, rationale });
}
