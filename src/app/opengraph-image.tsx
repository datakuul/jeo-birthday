import { ImageResponse } from "next/og";
import { honoree, event } from "@/content/honoree";
import { formatDate } from "@/lib/utils";

export const runtime = "edge";
export const alt = `${honoree.fullName} — Celebrating 80 Years`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Og() {
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
          background: "linear-gradient(135deg, #2b2521 0%, #3a322a 100%)",
          color: "#f6efe2",
          fontFamily: "serif",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 8, color: "#c9a86a" }}>
          CELEBRATING 80 YEARS
        </div>
        <div style={{ display: "flex", fontSize: 76, marginTop: 24, lineHeight: 1.05 }}>
          {honoree.fullName}
        </div>
        <div style={{ display: "flex", marginTop: 28, width: 120, height: 2, background: "#c9a86a" }} />
        <div style={{ display: "flex", fontSize: 30, marginTop: 28, color: "#d8cfbf" }}>
          {formatDate(event.startsAt)} · {event.city}
        </div>
      </div>
    ),
    size,
  );
}
