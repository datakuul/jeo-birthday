import Link from "next/link";
import { Users, MailCheck, Armchair, Utensils } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRsvpStats } from "@/lib/queries";
import { PageHeader, StatCard, StatusPill } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MEAL_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  HALAL: "Halal",
  CHILD: "Child",
};

export default async function AdminDashboard() {
  const stats = await getRsvpStats();

  const mealGroups = await prisma.guest.groupBy({
    by: ["mealChoice"],
    where: { rsvpStatus: "ATTENDING" },
    _count: true,
  });

  const recent = await prisma.rsvpSubmission.findMany({
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: { household: true },
  });

  const pendingTributes = await prisma.tribute.count({ where: { status: "PENDING" } });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="An overview of responses, meals and seating for the celebration."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attending" value={stats.attending} accent="success" hint={`of ${stats.guestCount} guests`} />
        <StatCard label="Declined" value={stats.declined} accent="destructive" />
        <StatCard label="Pending" value={stats.pending} accent="muted" />
        <StatCard label="Maybe" value={stats.maybe} accent="gold" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Households" value={stats.households} />
        <StatCard label="Total guests" value={stats.guestCount} />
        <StatCard label="Seated" value={`${stats.seated}/${stats.attending}`} hint="attending guests seated" />
        <StatCard label="Tributes to review" value={pendingTributes} accent={pendingTributes ? "gold" : "muted"} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Utensils className="size-4 text-gold-strong" />
            <h2 className="font-serif text-lg">Meal counts (attending)</h2>
          </div>
          {mealGroups.length ? (
            <ul className="space-y-2">
              {mealGroups.map((m) => (
                <li key={m.mealChoice ?? "none"} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {MEAL_LABELS[m.mealChoice ?? ""] ?? "Unspecified"}
                  </span>
                  <span className="font-medium">{m._count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No attending guests yet.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-serif text-lg">Recent RSVPs</h2>
          {recent.length ? (
            <ul className="divide-y divide-border/60">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{r.household.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.updatedAt)}</p>
                  </div>
                  <StatusPill status={r.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No responses yet.</p>
          )}
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <QuickLink href="/admin/guests" Icon={Users} label="Manage guests" />
        <QuickLink href="/admin/rsvps" Icon={MailCheck} label="Review RSVPs" />
        <QuickLink href="/admin/seating" Icon={Armchair} label="Plan seating" />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-gold"
    >
      <Icon className="size-4 text-gold-strong" />
      {label}
    </Link>
  );
}
