/**
 * Set (or reset) the admin password — without re-seeding site content.
 *
 * Usage:
 *   1. Put the password in .env as ADMIN_PASSWORD (and your login email in ADMIN_EMAILS)
 *   2. npm run db:set-password
 *
 * It hashes the password with bcrypt and upserts the admin user(s) on the
 * database your .env points at (Neon, locally, etc.).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const password = process.env.ADMIN_PASSWORD;

  if (!emails.length) throw new Error("Set ADMIN_EMAILS in .env first.");
  if (!password) throw new Error("Set ADMIN_PASSWORD in .env first.");

  const passwordHash = await bcrypt.hash(password, 10);
  for (const email of emails) {
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "ADMIN" },
      create: { email, name: email.split("@")[0], role: "ADMIN", passwordHash },
    });
    console.log(`✓ password set for ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
