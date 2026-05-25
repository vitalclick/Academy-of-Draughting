import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Academy of Advanced Draughting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0B1B2F 0%, #102842 60%, #0B1B2F 100%)",
          color: "white",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              background: "#5EE6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontWeight: 700,
              fontSize: 32,
              color: "#0B1B2F",
            }}
          >
            AD
          </div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 18, opacity: 0.7 }}>
            EST. 1981 · JOHANNESBURG
          </div>
        </div>
        <div>
          <div style={{ fontSize: 64, fontWeight: 500, lineHeight: 1.05, maxWidth: 1000 }}>
            The Academy of Advanced Draughting
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#9FB0C8", maxWidth: 1000 }}>
            AI-powered draughting & CAD education aligned to real engineering
            offices.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 18, color: "rgba(255,255,255,0.55)" }}>
          <span style={{ fontFamily: "ui-monospace, monospace" }}>MDDOP · BRIDGING · AUTOCAD · REVIT · INVENTOR</span>
          <span style={{ fontFamily: "ui-monospace, monospace" }}>aod.ac.za</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
