# Janet at 80 🤍

An elegant, fast, mobile-first website celebrating the **80th birthday of Mrs. Janet E. Olaniru, JP** — Saturday, 25 July 2026, at Pavilion Hall, Crystal Events Centre, Ibadan, Nigeria.

It is part luxury biography, part family archive, and part celebration invitation — with a complete RSVP, seating, gallery, story and tribute system, plus a private admin area for the family.

---

## ✨ Features

**Public site**
- **Home** — hero portrait, elegant countdown, RSVP call-to-action, featured story moments and gallery strip, event preview.
- **Her Story** — long-form biography as a timeline of life chapters (title, years, body, quote, image).
- **Gallery** — albums (_Early Years, Family, Career, Faith & Community, Travels, Milestones_) with batched “Load more”, on-demand lightbox, captions and alt text. Tasteful placeholders until the family adds photos.
- **Tributes** — approved public messages plus a moderated submission form (honeypot-protected).
- **The Celebration** — date, venue, dress code, parking, accessibility, gift note, and a maps **link** (no heavy embed).
- **RSVP** — invitation-code / surname / email / phone lookup → per-guest responses, meal preferences, allergies, accessibility needs → confirmation email.
- **Privacy notice** — plain-language explanation of what is collected and why.
- **Lite Mode** — one tap reduces images and animations for slow/metered connections (auto-detected on 2G / Save-Data).

**Admin (private, password-protected)**
- Dashboard with RSVP stats, meal counts, seating progress.
- Guests & households CRUD, **CSV import & export**, search/sort/paginate.
- RSVP management — edit status, view dietary/accessibility needs, resend confirmation.
- Seating — create tables, assign guests (one table each), capacity warnings, export chart.
- Gallery — create albums, upload photos (optimised & EXIF-stripped in the browser), edit captions/alt/order, feature images.
- Story — create/edit/reorder/publish chapters.
- Tributes — approve, reject, feature, delete.
- Audit log of admin changes.

**Built for Nigeria-first performance** — static-first public pages, `next/image` everywhere (AVIF/WebP), blur placeholders, lazy loading, lightweight JS, long-cache image headers, `next/font` self-hosted fonts, and `prefers-reduced-motion` respected throughout.

---

## 🧱 Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn-style UI · Prisma ORM · SQLite (dev) / PostgreSQL (prod) · Auth.js v5 · Resend · Vercel Blob · TanStack Table · Zod · React Hook Form · Vercel Analytics & Speed Insights.

---

## 🚀 Getting started (local)

> Requires Node 20+.

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
#   The defaults already work for local SQLite development.
#   (Optionally edit ADMIN_EMAILS / ADMIN_PASSWORD.)

# 3. Create the database and seed sample content
npm run db:push      # create SQLite tables from the schema
npm run db:seed      # honoree, event, story, gallery, sample guests, tributes

# 4. Run it
npm run dev          # http://localhost:3000
```

**Sample data created by the seed**
- Admin login: `admin@janetolaniru.com` / `changeme123` (from `ADMIN_EMAILS` / `ADMIN_PASSWORD`)
- Sample invitation codes for testing RSVP: **`JNT-FAM1`**, **`JNT-CH22`**, **`JNT-OK37`**

### Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | Seed sample content |
| `npm run db:reset` | Wipe & re-seed (destructive) |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run lint` | Lint |

---

## 🔐 Environment variables

See [`.env.example`](./.env.example) for the full annotated list.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | SQLite file locally; Postgres URL in production |
| `AUTH_SECRET` | ✅ | `npx auth secret` |
| `AUTH_TRUST_HOST` | ✅ | `true` |
| `ADMIN_EMAILS` | ✅ | Comma-separated emails allowed into `/admin` |
| `ADMIN_PASSWORD` | ✅ (seed) | Password set for seeded admin user(s) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical site URL (metadata, sitemap, emails) |
| `RESEND_API_KEY` | optional | Without it, emails are logged to the console |
| `EMAIL_FROM` | with Resend | Verified sender address |
| `HOST_CONTACT_EMAIL` | recommended | Shown to guests for questions |
| `BLOB_READ_WRITE_TOKEN` | optional | Enables gallery photo uploads |

---

## ☁️ Deploying to Vercel

1. **Switch the database to Postgres.** In `prisma/schema.prisma` change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   The schema is written to be portable (no native enums or scalar arrays), so no other changes are needed.

2. **Create a Postgres database** (Vercel → Storage → Postgres, or Neon). Copy its connection string.

3. **Push to GitHub and import the repo into Vercel.**

4. **Set Environment Variables** in the Vercel project (Production + Preview): all the variables above. Add **Vercel Blob** storage to auto-provision `BLOB_READ_WRITE_TOKEN`.

5. **Initialise the production database** (once), from your machine with the production `DATABASE_URL`:
   ```bash
   DATABASE_URL="<prod-postgres-url>" npx prisma db push
   DATABASE_URL="<prod-postgres-url>" ADMIN_EMAILS="..." ADMIN_PASSWORD="..." npm run db:seed
   ```
   (Or run these as a one-off in a Vercel deployment shell.)

6. **Deploy.** Vercel runs `npm run build` automatically. Analytics & Speed Insights light up once deployed.

### ✅ Deployment checklist
- [ ] Prisma datasource set to `postgresql`
- [ ] `DATABASE_URL` points at Postgres
- [ ] `AUTH_SECRET` is a fresh random value (not the dev default)
- [ ] `ADMIN_EMAILS` / `ADMIN_PASSWORD` set to real family credentials
- [ ] `NEXT_PUBLIC_SITE_URL` set to the live domain
- [ ] `RESEND_API_KEY` + verified `EMAIL_FROM` (for confirmation emails)
- [ ] `HOST_CONTACT_EMAIL` set
- [ ] Vercel Blob added (for photo uploads)
- [ ] `prisma db push` + seed run against production
- [ ] Test an RSVP end-to-end and confirm the email arrives

---

## 👩‍💼 Admin usage guide

Sign in at **`/admin/login`** with an email listed in `ADMIN_EMAILS` and the password set during seeding.

- **Guests** — Add households then guests, or **Import CSV** (paste or upload). Each household gets a unique, non-sequential invitation code (auto-generated if blank). **Export** the full guest list any time.
- **RSVPs** — See every response, override a status, and resend a confirmation email. Dietary and accessibility needs are highlighted. Export RSVP and meal CSVs.
- **Seating** — Create tables with capacities, assign attending guests from the “Unseated” list (a guest can sit at only one table). Over-capacity tables are flagged. Export the seating chart.
- **Gallery** — Create albums and upload photos (resized and stripped of metadata in your browser before upload — requires Blob). Edit alt text, captions, year and order; mark images “Featured” to surface them on the home page.
- **Story** — Add, edit, reorder (↑/↓) and publish/hide life-story chapters.
- **Tributes** — Approve, reject, feature or delete submitted tributes. Only approved tributes appear publicly.

### CSV import format
Header row (extra columns are ignored; rows are grouped into households by `householdName`):

```
householdName,invitationCode,primaryContactName,primaryEmail,primaryPhone,maxPartySize,firstName,lastName,relationship,ageGroup,notes
```
Leave `invitationCode` blank to auto-generate one. `ageGroup` is `ADULT` or `CHILD`.

---

## 🗂️ Project structure

```
src/
  app/
    (public)/        # public pages: home, story, gallery, tributes, event, rsvp, privacy
    admin/
      login/         # sign-in (no chrome)
      (panel)/       # protected admin pages + CSV export route
    api/auth/        # Auth.js handlers
    opengraph-image.tsx, sitemap.ts, robots.ts
  components/        # UI primitives + public & admin components
  content/honoree.ts # single source of truth for static content (seeds the DB)
  lib/               # prisma, auth, validation (Zod), email, csv, audit, codes
prisma/
  schema.prisma      # data model (SQLite dev / Postgres prod)
  seed.ts            # sample data
```

---

## ♿ Accessibility & performance
- Semantic HTML, labelled forms, keyboard-navigable, alt text on every image, strong contrast.
- `prefers-reduced-motion` and **Lite Mode** disable decorative motion.
- Public pages are statically generated and revalidated; RSVP/admin are dynamic and protected.
- Run a bundle check before shipping: `npm run build` prints the route/runtime split.

---

Made with love, for Maami. 🤍
