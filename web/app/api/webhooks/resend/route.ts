import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resend webhooks are signed using the Svix protocol:
//   svix-id, svix-timestamp, svix-signature: v1,<base64(hmac-sha256)>
// The HMAC body is `${id}.${timestamp}.${rawBody}` keyed by the
// base64-decoded secret (the part after "whsec_").
function verifySvix(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string
): boolean {
  if (!headers.id || !headers.timestamp || !headers.signature) return false;
  const ts = Number(headers.timestamp);
  if (!Number.isFinite(ts)) return false;
  // Reject very old events to thwart replay.
  if (Math.abs(Date.now() / 1000 - ts) > 60 * 5) return false;

  const stripped = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const keyBytes = Buffer.from(stripped, "base64");
  const expected = createHmac("sha256", keyBytes)
    .update(`${headers.id}.${headers.timestamp}.${rawBody}`)
    .digest("base64");

  for (const part of headers.signature.split(" ")) {
    const [v, sig] = part.split(",");
    if (v !== "v1" || !sig) continue;
    try {
      if (
        sig.length === expected.length &&
        timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
      ) {
        return true;
      }
    } catch {
      // length mismatch in timingSafeEqual
    }
  }
  return false;
}

export async function POST(req: Request) {
  const secret = env().RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await req.text();
  const ok = verifySvix(rawBody, {
    id: req.headers.get("svix-id"),
    timestamp: req.headers.get("svix-timestamp"),
    signature: req.headers.get("svix-signature"),
  }, secret);
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: { type?: string; data?: Record<string, unknown> };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const event = payload.type ?? "unknown";
  const data = payload.data ?? {};
  const resendId = typeof data["email_id"] === "string" ? (data["email_id"] as string) : null;
  const to = data["to"];
  const recipient = Array.isArray(to)
    ? (to[0] as string | undefined) ?? null
    : typeof to === "string"
      ? to
      : null;
  const subject = typeof data["subject"] === "string" ? (data["subject"] as string) : null;

  const supabase = getSupabaseAdmin();
  await supabase.from("email_deliveries").insert({
    resend_id: resendId,
    recipient,
    subject,
    event,
    payload: payload as never,
  });

  return NextResponse.json({ ok: true });
}
