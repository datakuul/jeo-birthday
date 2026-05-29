import { Download, Trash2, X, AlertTriangle, Armchair } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableForm } from "@/components/admin/table-form";
import { SeatAssign } from "@/components/admin/seat-assign";
import { deleteTable, unassignGuest } from "./actions";

export const dynamic = "force-dynamic";

export default async function SeatingPage() {
  const [tables, attendingGuests] = await Promise.all([
    prisma.table.findMany({
      orderBy: { sortOrder: "asc" },
      include: { seats: { include: { guest: true } } },
    }),
    prisma.guest.findMany({
      where: { rsvpStatus: "ATTENDING" },
      include: { household: true, seat: true },
      orderBy: [{ household: { name: "asc" } }],
    }),
  ]);

  const tableOptions = tables.map((t) => ({ id: t.id, name: t.name }));
  const unseated = attendingGuests.filter((g) => !g.seat);
  const totalCapacity = tables.reduce((n, t) => n + t.capacity, 0);
  const seatedCount = attendingGuests.length - unseated.length;

  return (
    <div>
      <PageHeader
        title="Seating"
        subtitle="Create tables and assign attending guests. Each guest can sit at one table."
        action={
          <Button asChild variant="outline" size="sm">
            <a href="/admin/export/seating" download><Download className="size-4" /> Export chart</a>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Tables" value={tables.length} hint={`${totalCapacity} seats total`} />
        <StatCard label="Seated" value={`${seatedCount}/${attendingGuests.length}`} accent="success" />
        <StatCard label="Unseated" value={unseated.length} accent={unseated.length ? "gold" : "muted"} />
      </div>

      <Card className="mb-6 p-5">
        <TableForm />
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Unseated guests */}
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-3 font-serif text-lg">Unseated ({unseated.length})</h2>
          {unseated.length ? (
            <ul className="space-y-2">
              {unseated.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-muted/50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{g.firstName} {g.lastName}</p>
                    <p className="truncate text-xs text-muted-foreground">{g.household.name}</p>
                  </div>
                  <SeatAssign guestId={g.id} tables={tableOptions} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {attendingGuests.length ? "Everyone attending has a seat. 🎉" : "No attending guests yet."}
            </p>
          )}
        </Card>

        {/* Tables */}
        <div className="space-y-4 lg:col-span-2">
          {tables.length === 0 && (
            <Card className="p-10 text-center text-muted-foreground">
              <Armchair className="mx-auto mb-2 size-6" />
              Create your first table above.
            </Card>
          )}
          {tables.map((t) => {
            const over = t.seats.length > t.capacity;
            return (
              <Card key={t.id} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg text-foreground">{t.name}</h3>
                    <span className={"text-sm " + (over ? "text-destructive" : "text-muted-foreground")}>
                      {t.seats.length}/{t.capacity}
                    </span>
                    {over && (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="size-3.5" /> Over capacity
                      </span>
                    )}
                  </div>
                  <form action={deleteTable.bind(null, t.id)}>
                    <button type="submit" className="text-muted-foreground hover:text-destructive" aria-label="Delete table">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
                {t.seats.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {t.seats.map((s) => (
                      <li key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm">
                        {s.guest.firstName} {s.guest.lastName}
                        <form action={unassignGuest.bind(null, s.guestId)} className="inline">
                          <button type="submit" className="text-muted-foreground hover:text-destructive" aria-label="Unseat">
                            <X className="size-3.5" />
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No guests seated yet.</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
