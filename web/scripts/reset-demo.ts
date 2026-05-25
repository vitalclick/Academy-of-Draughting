/* eslint-disable no-console */
/**
 * Remove every record tagged with @demo.aod.local from the configured
 * Supabase project. Safe to re-run.
 */

import { clientFromEnv, purgeDemo } from "./_demo-shared";

async function main() {
  const client = clientFromEnv();
  console.log("→ Purging demo data…");
  const removed = await purgeDemo(client);
  console.log(`✓ Removed ${removed} demo user(s) and any orphan applications.\n`);
}

main().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
