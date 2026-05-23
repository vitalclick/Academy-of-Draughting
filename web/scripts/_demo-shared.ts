import { type SupabaseClient } from "@supabase/supabase-js";

export const DEMO_TAG = "@demo.aod.local";
export const DEMO_TAG_LIKE = `%${DEMO_TAG}`;
export const DEMO_PASSWORD = "DemoPassword!42";

export async function purgeDemo(client: SupabaseClient): Promise<number> {
  let page = 1;
  const userIds: string[] = [];
  for (;;) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) {
      if (u.email && u.email.endsWith(DEMO_TAG)) userIds.push(u.id);
    }
    if (data.users.length < 200) break;
    page += 1;
  }
  for (const id of userIds) {
    const { error } = await client.auth.admin.deleteUser(id);
    if (error) console.warn(`  ! deleteUser ${id}: ${error.message}`);
  }
  const { error: appErr } = await client
    .from("applications")
    .delete()
    .like("email", DEMO_TAG_LIKE);
  if (appErr) console.warn(`  ! applications wipe: ${appErr.message}`);
  return userIds.length;
}

export function clientFromEnv(): SupabaseClient {
  // Lazy import to keep this file dependency-light at typecheck time.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  const url = process.env.DEMO_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.DEMO_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Set DEMO_SUPABASE_URL + DEMO_SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_*) before running demo scripts."
    );
    process.exit(1);
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
