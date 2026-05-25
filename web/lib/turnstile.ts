import { env } from "@/lib/env";

// Verify a Cloudflare Turnstile token server-side. Returns { ok: true } when
// the gate is bypassed (no secret configured) so dev/staging still work.
export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = env().TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };
  if (!token) return { ok: false, reason: "missing_token" };

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (ip) form.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      return { ok: false, reason: data["error-codes"]?.join(",") ?? "verify_failed" };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "verify_error" };
  }
}
