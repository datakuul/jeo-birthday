import Link from "next/link";
import { ChevronUp, ChevronDown, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { togglePublish, moveChapter, deleteChapter } from "./actions";

export const dynamic = "force-dynamic";

export default async function StoryAdminPage() {
  const chapters = await prisma.storyChapter.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <PageHeader
        title="Story chapters"
        subtitle="Edit the life-story timeline. Reorder, publish or hide chapters."
        action={
          <Link href="/admin/story/new" className="inline-flex items-center gap-1.5 rounded-full bg-gold-strong px-4 py-2 text-sm font-medium text-white">
            New chapter
          </Link>
        }
      />

      <div className="space-y-3">
        {chapters.map((c, i) => (
          <Card key={c.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <form action={moveChapter.bind(null, c.id, "up")}>
                  <button type="submit" disabled={i === 0} className="text-muted-foreground disabled:opacity-30 hover:text-foreground" aria-label="Move up">
                    <ChevronUp className="size-4" />
                  </button>
                </form>
                <form action={moveChapter.bind(null, c.id, "down")}>
                  <button type="submit" disabled={i === chapters.length - 1} className="text-muted-foreground disabled:opacity-30 hover:text-foreground" aria-label="Move down">
                    <ChevronDown className="size-4" />
                  </button>
                </form>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-serif text-base text-foreground">{c.title}</p>
                  {c.published ? <Badge variant="success">Published</Badge> : <Badge variant="muted">Hidden</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{c.years}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <form action={togglePublish.bind(null, c.id, !c.published)}>
                <button type="submit" className="rounded-lg p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground" title={c.published ? "Hide" : "Publish"}>
                  {c.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </form>
              <Link href={`/admin/story/${c.id}`} className="rounded-lg p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground" title="Edit">
                <Pencil className="size-4" />
              </Link>
              <form action={deleteChapter.bind(null, c.id)}>
                <button type="submit" className="rounded-lg p-2 text-muted-foreground hover:bg-surface-muted hover:text-destructive" title="Delete">
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </Card>
        ))}
        {chapters.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">No chapters yet.</Card>
        )}
      </div>
    </div>
  );
}
