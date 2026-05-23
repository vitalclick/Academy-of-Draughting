import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedOrigin } from "@/lib/origin";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const BodySchema = z.object({
  reason: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Sign in to request account deletion." }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json().catch(() => ({})));
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const s = getSupabaseAdmin();

  // Reject if a pending request already exists.
  const { data: existing } = await s
    .from("data_deletion_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "You already have a pending deletion request." },
      { status: 409 }
    );
  }

  const { data, error } = await s
    .from("data_deletion_requests")
    .insert({
      user_id: user.id,
      user_email: user.email,
      reason: body.reason?.trim() || null,
    })
    .select("id, requested_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the configured admissions inbox if Resend + ADMISSIONS_NOTIFY_EMAIL set.
  const e = env();
  if (e.ADMISSIONS_NOTIFY_EMAIL) {
    await sendEmail({
      to: e.ADMISSIONS_NOTIFY_EMAIL,
      subject: `Account deletion request — ${user.email}`,
      html: `<p>A data subject has filed a POPIA Section 24 deletion request.</p>
        <ul>
          <li><strong>User:</strong> ${user.email}</li>
          <li><strong>Request ID:</strong> ${data.id}</li>
          <li><strong>Filed at:</strong> ${data.requested_at}</li>
          ${body.reason ? `<li><strong>Reason:</strong> ${escape(body.reason)}</li>` : ""}
        </ul>
        <p>Process within 30 days. Mark the request as completed in <code>public.data_deletion_requests</code> once done.</p>`,
      text: `Account deletion request from ${user.email}. Request ID ${data.id}. Process within 30 days.`,
    });
  }

  return NextResponse.json({
    id: data.id,
    requested_at: data.requested_at,
    message:
      "We've recorded your request. Admissions will process it within 30 days; you'll receive a confirmation by email.",
  });
}

function escape(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] || c));
}
