import { getSupabaseAdmin } from "@/lib/supabase/admin";

type NotifyArgs = {
  userId: string;
  kind: string;
  title: string;
  body?: string | null;
  link?: string | null;
};

// Fire-and-forget in-app notification writer. Never throws.
export async function notifyUser(args: NotifyArgs): Promise<void> {
  try {
    await getSupabaseAdmin()
      .from("notifications")
      .insert({
        user_id: args.userId,
        kind: args.kind,
        title: args.title,
        body: args.body ?? null,
        link: args.link ?? null,
      });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("notify write failed:", err);
    }
  }
}
