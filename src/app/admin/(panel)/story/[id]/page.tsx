import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { StoryForm } from "@/components/admin/story-form";
import { updateChapter } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapter = await prisma.storyChapter.findUnique({ where: { id } });
  if (!chapter) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/story" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to chapters
      </Link>
      <PageHeader title={`Edit: ${chapter.title}`} />
      <StoryForm
        action={updateChapter.bind(null, id)}
        submitLabel="Save changes"
        initial={{
          title: chapter.title,
          slug: chapter.slug,
          years: chapter.years ?? undefined,
          quote: chapter.quote ?? undefined,
          body: chapter.body,
          image: chapter.image ?? undefined,
          published: chapter.published,
        }}
      />
    </div>
  );
}
