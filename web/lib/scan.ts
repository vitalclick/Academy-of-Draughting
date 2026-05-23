import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import type { ScanStatus } from "@/lib/database.types";

// Antivirus scan of an uploaded object. Pluggable provider:
//   - VirusTotal hash-lookup when VIRUSTOTAL_API_KEY is set.
//   - No key => "skipped".
//
// The hash-lookup approach is privacy-preserving (the file bytes never leave
// our infrastructure) and cheap, at the cost of only catching known-bad files.
// A file VirusTotal has never seen comes back "pending" — re-scan later or
// upload to VT in a background worker if you want full coverage.
export async function scanBytes(bytes: ArrayBuffer): Promise<ScanStatus> {
  const key = env().VIRUSTOTAL_API_KEY;
  if (!key) return "skipped";

  try {
    const hash = createHash("sha256").update(Buffer.from(bytes)).digest("hex");
    const res = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
      headers: { "x-apikey": key },
    });
    if (res.status === 404) {
      // VT has never seen this file. Treat as pending (not proven clean).
      return "pending";
    }
    if (!res.ok) return "error";
    const data = (await res.json()) as {
      data?: { attributes?: { last_analysis_stats?: { malicious?: number; suspicious?: number } } };
    };
    const stats = data.data?.attributes?.last_analysis_stats;
    const bad = (stats?.malicious ?? 0) + (stats?.suspicious ?? 0);
    return bad > 0 ? "infected" : "clean";
  } catch {
    return "error";
  }
}
