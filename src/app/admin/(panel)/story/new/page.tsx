import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { StoryForm } from "@/components/admin/story-form";
import { createChapter } from "../actions";

export const dynamic = "force-dynamic";

export default function NewChapterPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/story" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to chapters
      </Link>
      <PageHeader title="New chapter" />
      <StoryForm action={createChapter} submitLabel="Create chapter" initial={{ published: true }} />
    </div>
  );
}
