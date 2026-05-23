"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const StatusSchema = z.enum(["received", "reviewing", "accepted", "rejected", "withdrawn"]);

export async function setApplicationStatus(id: string, status: string) {
  const session = await getUserWithRole();
  if (!session || session.role !== "admin") {
    throw new Error("Not authorized");
  }
  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) throw new Error("Invalid status");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("applications")
    .update({ status: parsed.data })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/applications/${id}`);
  revalidatePath("/admin");
}
