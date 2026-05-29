import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "gold" | "success" | "destructive" | "muted";
}) {
  const accents: Record<string, string> = {
    gold: "text-gold-strong",
    success: "text-[oklch(0.5_0.12_150)]",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  };
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-serif text-3xl", accent && accents[accent])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    ATTENDING: "bg-[oklch(0.93_0.05_150)] text-[oklch(0.4_0.1_150)]",
    APPROVED: "bg-[oklch(0.93_0.05_150)] text-[oklch(0.4_0.1_150)]",
    DECLINED: "bg-[oklch(0.94_0.04_25)] text-destructive",
    REJECTED: "bg-[oklch(0.94_0.04_25)] text-destructive",
    MAYBE: "bg-[oklch(0.95_0.04_85)] text-[oklch(0.5_0.1_75)]",
    PARTIAL: "bg-[oklch(0.95_0.04_85)] text-[oklch(0.5_0.1_75)]",
    PENDING: "bg-surface-muted text-muted-foreground",
  };
  const label: Record<string, string> = {
    ATTENDING: "Attending",
    DECLINED: "Declined",
    MAYBE: "Maybe",
    PENDING: "Pending",
    PARTIAL: "Partial",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[status] ?? "bg-surface-muted text-muted-foreground",
      )}
    >
      {label[status] ?? status}
    </span>
  );
}
