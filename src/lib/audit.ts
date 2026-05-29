import { prisma } from "@/lib/prisma";

export async function audit(opts: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: opts.actorUserId ?? null,
        action: opts.action,
        entityType: opts.entityType,
        entityId: opts.entityId ?? null,
        metadata:
          opts.metadata === undefined
            ? null
            : typeof opts.metadata === "string"
              ? opts.metadata
              : JSON.stringify(opts.metadata),
      },
    });
  } catch (e) {
    // Never let audit logging break the primary action.
    console.error("audit log failed", e);
  }
}
