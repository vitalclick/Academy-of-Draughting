import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/supabase/server";

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

type AuditEvent = {
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Json;
};

// Fire-and-forget audit writer. Service-role inserts; never throws.
export async function logAudit(event: AuditEvent): Promise<void> {
  try {
    const session = await getUserWithRole();
    const h = headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    const supabase = getSupabaseAdmin();
    await supabase.from("audit_log").insert({
      actor_id: session?.user.id ?? null,
      actor_email: session?.user.email ?? null,
      actor_role: session?.role ?? null,
      action: event.action,
      entity_type: event.entityType ?? null,
      entity_id: event.entityId ?? null,
      details: (event.details as never) ?? null,
      ip,
    });
  } catch (err) {
    // Audit must never block the primary operation.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("audit log write failed:", err);
    }
  }
}
