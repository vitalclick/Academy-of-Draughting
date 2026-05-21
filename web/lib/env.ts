import { z } from "zod";

const schema = z.object({
  // Required for any AIDA call
  ANTHROPIC_API_KEY: z.string().optional(),

  // Supabase — server-only service role
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Supabase — public, used by browser + SSR auth
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // App
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  // Pass B — optional integrations (no-op if unset)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default("admissions@aod.local"),
  ADMISSIONS_NOTIFY_EMAIL: z.string().email().optional(),
  MINDEE_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function hasSupabasePublic(e = env()): e is Env & {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
} {
  return Boolean(e.NEXT_PUBLIC_SUPABASE_URL && e.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasSupabaseAdmin(e = env()): e is Env & {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
} {
  return Boolean(e.SUPABASE_URL && e.SUPABASE_SERVICE_ROLE_KEY);
}
