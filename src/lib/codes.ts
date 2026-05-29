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

/** Hash an IP address for light rate-limiting / abuse triage (not reversible). */
export function hashIp(ip: string | null | undefined): string {
  return createHash("sha256")
    .update(`${ip ?? "unknown"}:${process.env.AUTH_SECRET ?? "salt"}`)
    .digest("hex")
    .slice(0, 32);
}
