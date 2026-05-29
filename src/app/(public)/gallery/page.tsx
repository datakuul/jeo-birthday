import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { GalleryGrid } from "@/components/gallery-grid";
import { getGalleryAlbums } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Gallery",
  description: "A gallery of cherished photographs across the years.",
};

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();

  return (
    <div className="section">
      <div className="container-prose">
        <header className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow">Through the Years</p>
            <h1 className="display mt-4 text-4xl text-foreground sm:text-5xl">
              The Gallery
            </h1>
            <div className="rule-gold mx-auto mt-6" />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              A collection of moments from a life beautifully lived. Tap any
              photograph to view it. New images are added by the family with
              care — placeholders mark memories still to come.
            </p>
          </Reveal>
        </header>

        <div className="mt-14 space-y-20">
          {albums.map((album) => (
            <section key={album.slug}>
              <Reveal className="mb-7 text-center">
                <h2 className="font-serif text-2xl text-foreground">
                  {album.title}
                </h2>
                {album.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {album.description}
                  </p>
                )}
              </Reveal>
              <GalleryGrid images={album.images} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
