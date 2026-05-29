import { Download, Mail, Save, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusPill } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { setSubmissionStatus, resendConfirmation } from "./actions";

export const dynamic = "force-dynamic";

const STATUS = ["PENDING", "ATTENDING", "PARTIAL", "MAYBE", "DECLINED"];
const MEAL_LABELS: Record<string, string> = {
  STANDARD: "Standard", VEGETARIAN: "Vegetarian", VEGAN: "Vegan", HALAL: "Halal", CHILD: "Child",
};

export default async function RsvpsPage() {
  const submissions = await prisma.rsvpSubmission.findMany({
    orderBy: { updatedAt: "desc" },
    include: { household: { include: { guests: { orderBy: { createdAt: "asc" } } } } },
  });

  return (
    <div>
      <PageHeader
        title="RSVPs"
        subtitle={`${submissions.length} household${submissions.length === 1 ? "" : "s"} responded.`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/admin/export/rsvps" download><Download className="size-4" /> RSVP CSV</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/admin/export/meals" download><Download className="size-4" /> Meals CSV</a>
            </Button>
          </div>
        }
      />

      {submissions.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">No responses yet.</Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const needs = s.household.guests.filter((g) => g.allergies || g.accessibility);
            return (
              <Card key={s.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg text-foreground">{s.household.name}</h3>
                      <StatusPill status={s.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {s.submittedByName ? `By ${s.submittedByName}` : "—"}
                      {s.submittedByEmail ? ` · ${s.submittedByEmail}` : ""}
                      {s.submittedByPhone ? ` · ${s.submittedByPhone}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">Updated {formatDate(s.updatedAt)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={setSubmissionStatus.bind(null, s.id)} className="flex items-center gap-2">
                      <Select name="status" defaultValue={s.status} className="h-9 w-36 text-sm">
                        {STATUS.map((st) => <option key={st} value={st}>{st}</option>)}
                      </Select>
                      <Button type="submit" size="sm" variant="outline"><Save className="size-4" /></Button>
                    </form>
                    {s.submittedByEmail && (
                      <form action={resendConfirmation.bind(null, s.householdId)}>
                        <Button type="submit" size="sm" variant="ghost" title="Resend confirmation email">
                          <Mail className="size-4" />
                        </Button>
                      </form>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
                  {s.household.guests.map((g) => (
                    <div key={g.id} className="flex items-center justify-between rounded-lg bg-surface-muted/50 px-3 py-2 text-sm">
                      <span className="text-foreground">{g.firstName} {g.lastName}</span>
                      <span className="flex items-center gap-2">
                        {g.rsvpStatus === "ATTENDING" && g.mealChoice && (
                          <span className="text-xs text-muted-foreground">{MEAL_LABELS[g.mealChoice] ?? g.mealChoice}</span>
                        )}
                        <StatusPill status={g.rsvpStatus} />
                      </span>
                    </div>
                  ))}
                </div>

                {needs.length > 0 && (
                  <div className="mt-3 rounded-lg border border-gold/40 bg-gold-soft/30 p-3 text-sm">
                    <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                      <AlertCircle className="size-4 text-gold-strong" /> Dietary & accessibility
                    </p>
                    <ul className="space-y-0.5 text-muted-foreground">
                      {needs.map((g) => (
                        <li key={g.id}>
                          <strong className="text-foreground">{g.firstName}:</strong>{" "}
                          {[g.allergies, g.accessibility].filter(Boolean).join(" · ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.message && (
                  <p className="mt-3 border-l-2 border-gold pl-3 text-sm italic text-muted-foreground">
                    “{s.message}”
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
