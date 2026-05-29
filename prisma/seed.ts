import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  honoree,
  storyChapters,
  event,
  galleryAlbums,
  featuredTributes,
} from "../src/content/honoree";

const prisma = new PrismaClient();

// Deterministic codes for the sample households so the README can document them.
const SAMPLE_HOUSEHOLDS = [
  {
    name: "The Olaniru Family",
    invitationCode: "JNT-FAM1",
    primaryContactName: "Olaniru Family",
    primaryEmail: "family@janetolaniru.com",
    primaryPhone: "+234 800 000 0001",
    maxPartySize: 5,
    guests: [
      { firstName: "Samuel", lastName: "Olaniru", relationship: "Son", ageGroup: "ADULT" },
      { firstName: "Esther", lastName: "Olaniru", relationship: "Daughter", ageGroup: "ADULT" },
      { firstName: "Deborah", lastName: "Olaniru", relationship: "Daughter", ageGroup: "ADULT" },
      { firstName: "Joshua", lastName: "Olaniru", relationship: "Grandson", ageGroup: "CHILD" },
    ],
  },
  {
    name: "Pastor & Mrs. Adeyemi",
    invitationCode: "JNT-CH22",
    primaryContactName: "Pastor Adeyemi",
    primaryEmail: "adeyemi@janetolaniru.com",
    primaryPhone: "+234 800 000 0002",
    maxPartySize: 2,
    guests: [
      { firstName: "Emmanuel", lastName: "Adeyemi", relationship: "Pastor, 1st ECWA", ageGroup: "ADULT" },
      { firstName: "Grace", lastName: "Adeyemi", relationship: "Church family", ageGroup: "ADULT" },
    ],
  },
  {
    name: "Chief (Mrs.) Bello",
    invitationCode: "JNT-OK37",
    primaryContactName: "Mrs. Bello",
    primaryEmail: "bello@janetolaniru.com",
    primaryPhone: "+234 800 000 0003",
    maxPartySize: 2,
    guests: [
      { firstName: "Folake", lastName: "Bello", relationship: "Friend, Oke-Ere", ageGroup: "ADULT" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding Janet at 80 …");

  // ---- Admin users ----------------------------------------------------------
  const adminEmails = (process.env.ADMIN_EMAILS ?? "admin@janetolaniru.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  for (const email of adminEmails) {
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "ADMIN" },
      create: {
        email,
        name: email.split("@")[0],
        role: "ADMIN",
        passwordHash,
      },
    });
  }
  console.log(`  ✓ ${adminEmails.length} admin user(s)`);

  // ---- Honoree profile -------------------------------------------------------
  const existingHonoree = await prisma.honoreeProfile.findFirst();
  const honoreeData = {
    fullName: honoree.fullName,
    honorific: honoree.honorific,
    shortName: honoree.shortName,
    heroTitle: "Celebrating 80 Years",
    heroSubtitle: honoree.tagline,
    shortBio: honoree.intro,
    epigraph: honoree.epigraph,
    birthPlace: honoree.birthPlace,
    birthdayDate: new Date(honoree.bornOn),
    heroImage: "/images/honoree-hero.jpg",
    portraitImageUrl: "/images/honoree-portrait.jpg",
  };
  if (existingHonoree) {
    await prisma.honoreeProfile.update({ where: { id: existingHonoree.id }, data: honoreeData });
  } else {
    await prisma.honoreeProfile.create({ data: honoreeData });
  }
  console.log("  ✓ honoree profile");

  // ---- Event -----------------------------------------------------------------
  const existingEvent = await prisma.event.findFirst();
  const eventData = {
    title: event.title,
    venueName: event.venueName,
    addressLine: event.addressLine,
    city: event.city,
    startsAt: new Date(event.startsAt),
    dressCode: event.dressCode,
    parking: event.parking,
    accessibility: event.accessibility,
    giftNote: event.giftNote,
    mapQuery: event.mapQuery,
    venueWebsite: event.venueWebsite,
  };
  if (existingEvent) {
    await prisma.event.update({ where: { id: existingEvent.id }, data: eventData });
  } else {
    await prisma.event.create({ data: eventData });
  }
  console.log("  ✓ event details");

  // ---- Story chapters --------------------------------------------------------
  for (const [i, c] of storyChapters.entries()) {
    await prisma.storyChapter.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        years: c.years,
        body: c.body,
        quote: c.quote,
        image: c.image,
        sortOrder: i,
        published: true,
      },
      create: {
        slug: c.slug,
        title: c.title,
        years: c.years,
        body: c.body,
        quote: c.quote,
        image: c.image,
        sortOrder: i,
        published: true,
      },
    });
  }
  console.log(`  ✓ ${storyChapters.length} story chapters`);

  // ---- Gallery albums + placeholder images -----------------------------------
  for (const [ai, album] of galleryAlbums.entries()) {
    const created = await prisma.galleryAlbum.upsert({
      where: { slug: album.slug },
      update: { title: album.title, description: album.description, sortOrder: ai },
      create: { slug: album.slug, title: album.title, description: album.description, sortOrder: ai },
    });
    // Replace placeholder images for a clean re-seed.
    await prisma.galleryImage.deleteMany({
      where: { albumId: created.id, isPlaceholder: true },
    });
    await prisma.galleryImage.createMany({
      data: album.images.map((img, ii) => ({
        albumId: created.id,
        alt: img.alt,
        caption: img.caption,
        year: img.year,
        sortOrder: ii,
        isPlaceholder: true,
      })),
    });
  }
  console.log(`  ✓ ${galleryAlbums.length} gallery albums (placeholders)`);

  // ---- Tributes (approved + featured) ---------------------------------------
  const tributeCount = await prisma.tribute.count();
  if (tributeCount === 0) {
    await prisma.tribute.createMany({
      data: featuredTributes.map((t, i) => ({
        author: t.author,
        relationship: t.relationship,
        message: t.message,
        status: "APPROVED",
        isFeatured: i === 0,
      })),
    });
  }
  console.log(`  ✓ tributes`);

  // ---- Sample households, guests, seating ------------------------------------
  for (const h of SAMPLE_HOUSEHOLDS) {
    const household = await prisma.household.upsert({
      where: { invitationCode: h.invitationCode },
      update: {
        name: h.name,
        primaryContactName: h.primaryContactName,
        primaryEmail: h.primaryEmail,
        primaryPhone: h.primaryPhone,
        maxPartySize: h.maxPartySize,
      },
      create: {
        name: h.name,
        invitationCode: h.invitationCode,
        primaryContactName: h.primaryContactName,
        primaryEmail: h.primaryEmail,
        primaryPhone: h.primaryPhone,
        maxPartySize: h.maxPartySize,
      },
    });
    // Reset guests for idempotent re-seed.
    await prisma.guest.deleteMany({ where: { householdId: household.id } });
    for (const g of h.guests) {
      await prisma.guest.create({
        data: {
          householdId: household.id,
          firstName: g.firstName,
          lastName: g.lastName,
          relationship: g.relationship,
          ageGroup: g.ageGroup,
        },
      });
    }
  }
  console.log(`  ✓ ${SAMPLE_HOUSEHOLDS.length} sample households`);

  // ---- A couple of seating tables --------------------------------------------
  const tableCount = await prisma.table.count();
  if (tableCount === 0) {
    await prisma.table.createMany({
      data: [
        { name: "Table 1 — Family", capacity: 10, sortOrder: 0 },
        { name: "Table 2 — Church Family", capacity: 10, sortOrder: 1 },
        { name: "Table 3 — Friends", capacity: 10, sortOrder: 2 },
        { name: "High Table", capacity: 8, sortOrder: 3, notes: "Honoree & dignitaries" },
      ],
    });
  }
  console.log("  ✓ seating tables");

  console.log("✅ Seed complete.");
  console.log(
    `\n  Sample invitation codes: ${SAMPLE_HOUSEHOLDS.map((h) => h.invitationCode).join(", ")}`,
  );
  console.log(`  Admin login: ${adminEmails[0]} / ${adminPassword}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
