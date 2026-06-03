import { ImageResponse } from "next/og";

// Browser-tab / address-bar favicon — a gold "J" monogram on warm ink.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2b2521",
          color: "#c9a86a",
          fontSize: 46,
          fontWeight: 700,
          fontFamily: "Georgia, 'Times New Roman', serif",
          paddingBottom: 4,
        }}
      >
        J
      </div>
    ),
    { ...size },
  );
}
