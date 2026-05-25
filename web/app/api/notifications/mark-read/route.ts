import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, getSupabaseServer } from "@/lib/supabase/server";
import { isAllowedOrigin } from "@/lib/origin";

export const runtime = "nodejs";

const BodySchema = z.object({
  id: z.string().uuid().optional(),
  all: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in." }, { status: 401 });

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json().catch(() => ({})));
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Self-updates go through the SSR client so RLS confirms ownership.
  const supabase = getSupabaseServer();
  const now = new Date().toISOString();
  let query = supabase
    .from("notifications")
    .update({ read_at: now } as never)
    .is("read_at", null);
  if (body.id) query = query.eq("id", body.id);
  else if (!body.all) {
    return NextResponse.json({ error: "Provide id or all=true." }, { status: 400 });
  }
  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
