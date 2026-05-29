import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/image-uploader";
import { CreateAlbumForm, ImageCard } from "@/components/admin/gallery-admin";
import { deleteAlbum } from "./actions";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: { sortOrder: "asc" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  const blobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;

  return (
    <div>
      <PageHeader title="Gallery" subtitle="Create albums, upload photos, and curate captions." />

      {!blobConfigured && (
        <Card className="mb-6 border-gold/40 bg-gold-soft/30 p-4 text-sm text-foreground">
          Photo uploads require <code className="rounded bg-surface px-1">BLOB_READ_WRITE_TOKEN</code>. Until then,
          albums and placeholder images can still be managed. See the README to enable Vercel Blob.
        </Card>
      )}

      <div className="mb-6">
        <CreateAlbumForm />
      </div>

      <div className="space-y-8">
        {albums.map((album) => (
          <Card key={album.id} className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-foreground">{album.title}</h2>
                {album.description && <p className="text-sm text-muted-foreground">{album.description}</p>}
                <p className="mt-0.5 text-xs text-muted-foreground">{album.images.length} image(s)</p>
              </div>
              <form action={deleteAlbum.bind(null, album.id)}>
                <button type="submit" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" /> Delete album
                </button>
              </form>
            </div>

            {blobConfigured && (
              <div className="mb-4">
                <ImageUploader albumId={album.id} />
              </div>
            )}

            {album.images.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {album.images.map((img) => (
                  <ImageCard
                    key={img.id}
                    image={{
                      id: img.id,
                      url: img.url,
                      thumbUrl: img.thumbUrl,
                      alt: img.alt,
                      caption: img.caption ?? "",
                      year: img.year,
                      isFeatured: img.isFeatured,
                      isPlaceholder: img.isPlaceholder,
                      sortOrder: img.sortOrder,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No images in this album yet.</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
