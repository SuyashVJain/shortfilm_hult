import { ImageResponse } from "next/og";

// Poster wording only. No prize amounts, no dates.
export const alt = "Short Film Competition · Real stories | Brighter tomorrows · Hult Prize @ SUAS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at 50% 60%, #2a1606 0%, #050505 70%)",
          color: "#F2E8D5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, textTransform: "uppercase", opacity: 0.8, display: "flex" }}>
          Real stories <span style={{ color: "#E11D2E", margin: "0 18px" }}>|</span> Brighter tomorrows
        </div>
        <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: -2, textTransform: "uppercase", marginTop: 24, lineHeight: 1 }}>
          Short Film
        </div>
        <div style={{ fontSize: 96, fontStyle: "italic", color: "#E11D2E", marginTop: -10, transform: "rotate(-6deg)" }}>
          Competition
        </div>
        <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", opacity: 0.65, marginTop: 40 }}>
          Hult Prize @ SUAS
        </div>
      </div>
    ),
    size,
  );
}
