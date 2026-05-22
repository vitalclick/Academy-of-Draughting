import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { env, features } from '@/lib/env';

let cached: Anthropic | null = null;

export function anthropic(): Anthropic | null {
  if (!features.ai) return null;
  if (cached) return cached;
  cached = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY! });
  return cached;
}

export const MODELS = {
  chat: () => env.ANTHROPIC_MODEL,
  ocr: () => env.ANTHROPIC_OCR_MODEL,
};
