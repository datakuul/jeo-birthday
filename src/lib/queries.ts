import { prisma } from "@/lib/prisma";
import {
  honoree as honoreeContent,
  storyChapters as storyContent,
  event as eventContent,
  galleryAlbums as galleryContent,
  featuredTributes,
} from "@/content/honoree";

/**
 * Public data access. Reads from the database, but falls back to the static
 * content module if the DB is empty or unreachable — so the site is beautiful
 * even before `db:push` / `db:seed` have run. All public pages are static-first
 * (revalidated), never blocking on a slow DB at request time.
 */

export async function getHonoree() {
  try {
    const h = await prisma.honoreeProfile.findFirst();
    if (h) {
      return {
        fullName: h.fullName,
        honorific: h.honorific ?? "",
        shortName: h.shortName ?? honoreeContent.shortName,
        tagline: h.heroSubtitle ?? honoreeContent.tagline,
        heroTitle: h.heroTitle ?? "Celebrating 80 Years",
        intro: h.shortBio ?? honoreeContent.intro,
        epigraph: h.epigraph ?? honoreeContent.epigraph,
        birthPlace: h.birthPlace ?? honoreeContent.birthPlace,
        heroImage: h.heroImage ?? "/images/honoree-hero.jpg",
        portrait: h.portraitImageUrl ?? "/images/honoree-portrait.jpg",
      };
    }
  } catch {
    /* fall through to static content */
  }
  return {
    fullName: honoreeContent.fullName,
    honorific: honoreeContent.honorific,
    shortName: honoreeContent.shortName,
    tagline: honoreeContent.tagline,
    heroTitle: "Celebrating 80 Years",
    intro: honoreeContent.intro,
    epigraph: honoreeContent.epigraph,
    birthPlace: honoreeContent.birthPlace,
    heroImage: "/images/honoree-hero.jpg",
    portrait: "/images/honoree-portrait.jpg",
  };
}

export async function getStoryChapters() {
  try {
    const rows = await prisma.storyChapter.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length) {
      return rows.map((r) => ({
        slug: r.slug,
        title: r.title,
        years: r.years ?? "",
        body: r.body,
        quote: r.quote ?? "",
        image: r.image ?? "",
      }));
    }
  } catch {
    /* fall through */
  }
  return storyContent;
}

export async function getEvent() {
  try {
    const e = await prisma.event.findFirst();
    if (e) {
      return {
        title: e.title,
        venueName: e.venueName,
        addressLine: e.addressLine,
        city: e.city ?? "",
        startsAt: e.startsAt.toISOString(),
        dressCode: e.dressCode ?? "",
        parking: e.parking ?? "",
        accessibility: e.accessibility ?? "",
        giftNote: e.giftNote ?? "",
        mapQuery: e.mapQuery ?? "",
        venueWebsite: e.venueWebsite ?? "",
      };
    }
  } catch {
    /* fall through */
  }
  return eventContent;
}

export type GalleryAlbumView = {
  slug: string;
  title: string;
  description: string;
  images: {
    id: string;
    url: string | null;
    thumbUrl: string | null;
    blurData: string | null;
    width: number | null;
    height: number | null;
    alt: string;
    caption: string;
    year: number | null;
    isPlaceholder: boolean;
  }[];
};

export async function getGalleryAlbums(): Promise<GalleryAlbumView[]> {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    if (albums.length) {
      return albums.map((a) => ({
        slug: a.slug,
        title: a.title,
        description: a.description ?? "",
        images: a.images.map((i) => ({
          id: i.id,
          url: i.url,
          thumbUrl: i.thumbUrl,
          blurData: i.blurData,
          width: i.width,
          height: i.height,
          alt: i.alt,
          caption: i.caption ?? "",
          year: i.year,
          isPlaceholder: i.isPlaceholder,
        })),
      }));
    }
  } catch {
    /* fall through */
  }
  // static placeholders
  return galleryContent.map((a) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    images: a.images.map((i, idx) => ({
      id: `${a.slug}-${idx}`,
      url: null,
      thumbUrl: null,
      blurData: null,
      width: 800,
      height: 1000,
      alt: i.alt,
      caption: i.caption,
      year: i.year,
      isPlaceholder: true,
    })),
  }));
}

export async function getFeaturedGalleryImages(limit = 4) {
  try {
    const imgs = await prisma.galleryImage.findMany({
      where: { isFeatured: true, isPlaceholder: false },
      take: limit,
      orderBy: { sortOrder: "asc" },
    });
    if (imgs.length) return imgs;
  } catch {
    /* fall through */
  }
  return [];
}

export async function getApprovedTributes() {
  try {
    const rows = await prisma.tribute.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
    if (rows.length) {
      return rows.map((r) => ({
        id: r.id,
        author: r.author,
        relationship: r.relationship ?? "",
        message: r.message,
        isFeatured: r.isFeatured,
      }));
    }
  } catch {
    /* fall through */
  }
  return featuredTributes.map((t, i) => ({
    id: `seed-${i}`,
    author: t.author,
    relationship: t.relationship,
    message: t.message,
    isFeatured: i === 0,
  }));
}

export async function getRsvpStats() {
  const [attending, declined, pending, maybe, guestCount, households] =
    await Promise.all([
      prisma.guest.count({ where: { rsvpStatus: "ATTENDING" } }),
      prisma.guest.count({ where: { rsvpStatus: "DECLINED" } }),
      prisma.guest.count({ where: { rsvpStatus: "PENDING" } }),
      prisma.guest.count({ where: { rsvpStatus: "MAYBE" } }),
      prisma.guest.count(),
      prisma.household.count(),
    ]);
  const seated = await prisma.seatAssignment.count();
  return { attending, declined, pending, maybe, guestCount, households, seated };
}
