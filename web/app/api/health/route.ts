import { NextResponse } from "next/server";
import { env, hasSupabaseAdmin, hasSupabasePublic } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public health endpoint for uptime monitors. Reports presence of optional
// integrations and a single round-trip to Postgres. Reveals no secrets.
export async function GET() {
  const e = env();

  const checks: Record<string, "ok" | "missing" | "fail"> = {
    anthropic: e.ANTHROPIC_API_KEY ? "ok" : "missing",
    supabase_public: hasSupabasePublic(e) ? "ok" : "missing",
    supabase_admin: hasSupabaseAdmin(e) ? "ok" : "missing",
    upstash: e.UPSTASH_REDIS_REST_URL && e.UPSTASH_REDIS_REST_TOKEN ? "ok" : "missing",
    resend: e.RESEND_API_KEY ? "ok" : "missing",
    mindee: e.MINDEE_API_KEY ? "ok" : "missing",
    db: "missing",
  };

  if (hasSupabaseAdmin(e)) {
    try {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("profiles").select("id", { head: true, count: "exact" });
      checks.db = error ? "fail" : "ok";
    } catch {
      checks.db = "fail";
    }
  }

  const critical = ["supabase_public", "supabase_admin", "db"] as const;
  const allCriticalOk = critical.every((k) => checks[k] === "ok");

  return NextResponse.json(
    { status: allCriticalOk ? "ok" : "degraded", checks },
    { status: allCriticalOk ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
