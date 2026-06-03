import { randomInt, createHash } from "crypto";

// Unambiguous alphabet (no 0/O, 1/I/L) for easy reading over the phone.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Generate a non-sequential invitation code, e.g. "JNT-7KQ4". */
export function generateInvitationCode(prefix = "JNT"): string {
  let body = "";
  for (let i = 0; i < 4; i++) {
    body += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${body}`;
}

/** Normalise a code for lookup (uppercase, trim, strip spaces). */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Canonicalise a phone number so the same person can't create duplicate RSVPs
 * by formatting their number differently. Tuned for Nigeria (+234) but safe for
 * international numbers (kept as-is with separators removed).
 */
export function normalizePhone(raw: string): string {
  let p = (raw ?? "").replace(/[^\d+]/g, ""); // keep digits and a leading +
  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (p.startsWith("0") && p.length === 11)
    p = "+234" + p.slice(1); // 0803… -> +234803…
  else if (p.startsWith("234")) p = "+" + p;
  return p;
}

/** Hash an IP address for light rate-limiting / abuse triage (not reversible). */
export function hashIp(ip: string | null | undefined): string {
  return createHash("sha256")
    .update(`${ip ?? "unknown"}:${process.env.AUTH_SECRET ?? "salt"}`)
    .digest("hex")
    .slice(0, 32);
}
