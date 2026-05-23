import { env } from "@/lib/env";

export type OcrResult =
  | { ok: true; provider: "mindee"; raw: unknown }
  | { ok: false; error: string };

export async function runOcrOnPdf(args: { fileUrl: string }): Promise<OcrResult> {
  const e = env();
  if (!e.MINDEE_API_KEY) {
    return { ok: false, error: "MINDEE_API_KEY not configured" };
  }

  try {
    const form = new FormData();
    form.append("document", args.fileUrl);

    const res = await fetch(
      "https://api.mindee.net/v1/products/mindee/invoices/v4/predict",
      {
        method: "POST",
        headers: { Authorization: `Token ${e.MINDEE_API_KEY}` },
        body: form,
      }
    );
    if (!res.ok) {
      return { ok: false, error: `Mindee returned ${res.status}` };
    }
    const json = await res.json();
    return { ok: true, provider: "mindee", raw: json };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "OCR call failed" };
  }
}
