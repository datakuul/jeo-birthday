/**
 * Generates the QR code that guests scan to open the programme.
 * Run with:  npm run qr:gen
 *
 * Outputs (committed to /public, served through next/image):
 *   - public/programme-qr.svg  — crisp vector for on-screen + print
 *   - public/programme-qr.png  — 1200px raster for WhatsApp / sharing / large prints
 *
 * The encoded URL follows NEXT_PUBLIC_SITE_URL so regenerating after a
 * domain change keeps the code pointing at the live programme page.
 */
import QRCode from "qrcode";
import { writeFileSync } from "node:fs";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://janetolaniru.com").replace(/\/$/, "");
const url = `${base}/programme`;

// Warm editorial palette: dark brown on white for high, reliable contrast.
const opts = {
  errorCorrectionLevel: "H", // survives smudged prints / off-angle scans
  margin: 2,
  color: { dark: "#2b2018", light: "#ffffff" },
};

const svg = await QRCode.toString(url, { type: "svg", ...opts });
writeFileSync("public/programme-qr.svg", svg);
await QRCode.toFile("public/programme-qr.png", url, { ...opts, width: 1200 });

console.log(`Programme QR generated → ${url}`);
