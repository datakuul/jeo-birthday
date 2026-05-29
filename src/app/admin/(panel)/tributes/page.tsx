import { Check, X, Star, Trash2, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusPill } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { setTributeStatus, toggleFeatured, deleteTribute } from "./actions";

export const dynamic = "force-dynamic";

export default async function TributesAdminPage() {
  const tributes = await prisma.tribute.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  const pending = tributes.filter((t) => t.status === "PENDING");
  const others = tributes.filter((t) => t.status !== "PENDING");

  return (
    <div>
      <PageHeader
        title="Tributes"
        subtitle="Approve, reject and feature tributes. Only approved tributes appear publicly."
      />

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg">
            <Clock className="size-4 text-gold-strong" /> Awaiting review ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((t) => (
              <TributeRow key={t.id} t={t} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-serif text-lg">All tributes</h2>
        <div className="space-y-3">
          {others.length ? others.map((t) => <TributeRow key={t.id} t={t} />) : (
            <Card className="p-8 text-center text-muted-foreground">No moderated tributes yet.</Card>
          )}
        </div>
      </section>
    </div>
  );
}

function TributeRow({
  t,
}: {
  t: {
    id: string;
    author: string;
    relationship: string | null;
    message: string;
    status: string;
    isFeatured: boolean;
    createdAt: Date;
  };
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-serif text-base text-foreground">{t.author}</p>
            {t.relationship && <span className="text-xs text-muted-foreground">· {t.relationship}</span>}
            <StatusPill status={t.status} />
            {t.isFeatured && <Star className="size-3.5 text-gold-strong" />}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{t.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {t.status !== "APPROVED" && (
            <form action={setTributeStatus.bind(null, t.id, "APPROVED")}>
              <button type="submit" className="rounded-lg p-2 text-muted-foreground hover:bg-surface-muted hover:text-[oklch(0.5_0.12_150)]" title="Approve">
                <Check className="size-4" />
              </button>
            </form>
          )}
          {t.status !== "REJECTED" && (
            <form action={setTributeStatus.bind(null, t.id, "REJECTED")}>
              <button type="submit" className="rounded-lg p-2 text-muted-foreground hover:bg-surface-muted hover:text-destructive" title="Reject">
                <X className="size-4" />
              </button>
            </form>
          )}
          <form action={toggleFeatured.bind(null, t.id, !t.isFeatured)}>
            <button type="submit" className={"rounded-lg p-2 hover:bg-surface-muted " + (t.isFeatured ? "text-gold-strong" : "text-muted-foreground hover:text-gold-strong")} title="Feature">
              <Star className="size-4" />
            </button>
          </form>
          <form action={deleteTribute.bind(null, t.id)}>
            <button type="submit" className="rounded-lg p-2 text-muted-foreground hover:bg-surface-muted hover:text-destructive" title="Delete">
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </Card>
  );
}
