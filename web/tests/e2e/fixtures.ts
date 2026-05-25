import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Tests use the service-role key directly to create + tear down users,
// applications, enrollments, submissions. NEVER set these to production values.

const SUPABASE_URL = process.env.E2E_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_KEY =
  process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export const requiredEnv = {
  SUPABASE_URL,
  SERVICE_KEY,
};

let cached: SupabaseClient | null = null;
export function admin(): SupabaseClient {
  if (cached) return cached;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "E2E_SUPABASE_URL + E2E_SUPABASE_SERVICE_ROLE_KEY (or the SUPABASE_* fallbacks) are required."
    );
  }
  cached = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const TAG = "e2e-aod";
export const PASSWORD = "Playwright!Test123";

export function tagEmail(name: string): string {
  return `${TAG}-${Date.now()}-${name}@example.com`;
}

export async function ensureUser(opts: {
  email: string;
  password: string;
  fullName: string;
  role?: "student" | "admin" | "faculty";
}): Promise<string> {
  const s = admin();
  const { data, error } = await s.auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: true,
    user_metadata: { full_name: opts.fullName },
  });
  if (error || !data.user) throw new Error(`createUser: ${error?.message}`);

  // The on_auth_user_created trigger inserts the profile; bump the role if needed.
  if (opts.role && opts.role !== "student") {
    const { error: upErr } = await s
      .from("profiles")
      .update({ role: opts.role })
      .eq("id", data.user.id);
    if (upErr) throw new Error(`profile role: ${upErr.message}`);
  }
  return data.user.id;
}

export async function deleteUserByEmail(email: string): Promise<void> {
  const s = admin();
  // listUsers is paginated; iterate. For e2e cleanup we expect very few matches.
  let page = 1;
  for (;;) {
    const { data, error } = await s.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const match = data.users.find((u) => u.email === email);
    if (match) {
      await s.auth.admin.deleteUser(match.id);
      return;
    }
    if (data.users.length < 200) return; // last page
    page += 1;
  }
}

// Clean up everything created by this test run: identified by emails starting
// with the TAG prefix.
export async function purgeTagged(): Promise<void> {
  const s = admin();
  let page = 1;
  const toDelete: string[] = [];
  for (;;) {
    const { data, error } = await s.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) {
      if (u.email?.startsWith(TAG)) toDelete.push(u.id);
    }
    if (data.users.length < 200) break;
    page += 1;
  }
  for (const id of toDelete) {
    await s.auth.admin.deleteUser(id).catch(() => {});
  }
  // Defensive: drop any applications without a user_id matching our pattern.
  await s.from("applications").delete().like("email", `${TAG}-%`);
}
