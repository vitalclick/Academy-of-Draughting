// Lightweight moderation + prompt-injection defence for AIDA inputs.
// Not a substitute for a proper safety layer — catches obvious cases so we
// don't waste tokens on traffic that's clearly trying to bypass the system
// prompt or fish for other students' data.

const SUSPICIOUS_PATTERNS: RegExp[] = [
  /ignore (?:all |previous |prior |above )?instructions?/i,
  /disregard (?:all |previous |prior )?(?:instructions?|system|prompt)/i,
  /you are now (?:a |an )?(?:dan|jailbroken|unrestricted)/i,
  /system\s*[:>]/i,
  /<\s*system\s*>/i,
  /show me (?:the )?(?:system )?prompt/i,
  /reveal (?:your |the )?(?:system )?(?:prompt|instructions)/i,
  /what (?:are|were) your instructions/i,
  /(?:other|another) students?'?s? (?:grades?|submissions?|feedback|scores?)/i,
];

const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 16000;

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: "too_long" | "suspicious" | "empty"; detail?: string };

export function moderateAidaMessages(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): ModerationResult {
  let total = 0;
  for (const m of messages) {
    if (!m.content.trim()) return { ok: false, reason: "empty" };
    if (m.content.length > MAX_MESSAGE_CHARS) return { ok: false, reason: "too_long" };
    total += m.content.length;
    if (m.role !== "user") continue;
    for (const re of SUSPICIOUS_PATTERNS) {
      if (re.test(m.content)) {
        return { ok: false, reason: "suspicious", detail: re.source };
      }
    }
  }
  if (total > MAX_TOTAL_CHARS) return { ok: false, reason: "too_long" };
  return { ok: true };
}
