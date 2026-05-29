"use server";

import { prisma } from "@/lib/prisma";
import { tributeSchema, fieldErrors } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { sendTributeNotice } from "@/lib/email";

export type TributeResult =
  | { ok: false; errors?: Record<string, string>; error?: string }
  | { ok: true };

export async function submitTribute(
  _prev: TributeResult | null,
  formData: FormData,
): Promise<TributeResult> {
  const parsed = tributeSchema.safeParse({
    author: formData.get("author") ?? "",
    relationship: formData.get("relationship") ?? "",
    email: formData.get("email") ?? "",
    message: formData.get("message") ?? "",
    website: formData.get("website") ?? "", // honeypot
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  // Honeypot triggered — silently accept without storing (don't tip off bots).
  if (parsed.data.website) {
    return { ok: true };
  }

  const { author, relationship, email, message } = parsed.data;

  const tribute = await prisma.tribute.create({
    data: {
      author,
      relationship: relationship ?? null,
      email: email && email !== "" ? email : null,
      // Stored as plain text; rendered as text (never dangerouslySetInnerHTML).
      message,
      status: "PENDING",
    },
  });

  await audit({
    action: "CREATE",
    entityType: "Tribute",
    entityId: tribute.id,
    metadata: { author },
  });

  await sendTributeNotice({ author, relationship, message });

  return { ok: true };
}
