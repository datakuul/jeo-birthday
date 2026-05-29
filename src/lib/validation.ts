import { z } from "zod";

// Shared enum-like unions (stored as strings for SQLite/Postgres portability)
export const RSVP_STATUS = ["PENDING", "ATTENDING", "DECLINED", "MAYBE"] as const;
export const SUBMISSION_STATUS = [
  "PENDING",
  "ATTENDING",
  "DECLINED",
  "MAYBE",
  "PARTIAL",
] as const;
export const AGE_GROUP = ["ADULT", "CHILD", "INFANT"] as const;
export const MEAL_CHOICE = [
  "STANDARD",
  "VEGETARIAN",
  "VEGAN",
  "HALAL",
  "CHILD",
] as const;
export const TRIBUTE_STATUS = ["PENDING", "APPROVED", "REJECTED"] as const;
export const USER_ROLE = ["ADMIN", "EDITOR"] as const;

const optionalString = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

// --- RSVP lookup --------------------------------------------------------------
export const rsvpLookupSchema = z
  .object({
    invitationCode: optionalString(40),
    surname: optionalString(80),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: optionalString(40),
  })
  .refine(
    (d) => d.invitationCode || d.surname || (d.email && d.email !== "") || d.phone,
    { message: "Enter your invitation code, surname, email, or phone number." },
  );
export type RsvpLookupInput = z.infer<typeof rsvpLookupSchema>;

// --- RSVP submission ----------------------------------------------------------
export const guestRsvpSchema = z.object({
  guestId: z.string().min(1),
  rsvpStatus: z.enum(RSVP_STATUS),
  mealChoice: z.enum(MEAL_CHOICE).optional(),
  allergies: optionalString(280),
  accessibility: optionalString(280),
  notes: optionalString(500),
});

export const rsvpSubmissionSchema = z.object({
  householdId: z.string().min(1),
  invitationCode: z.string().trim().min(1),
  submittedByName: z.string().trim().min(2, "Please enter your name").max(120),
  submittedByEmail: z.string().trim().email("Enter a valid email").max(160),
  submittedByPhone: optionalString(40),
  message: optionalString(800),
  guests: z
    .array(guestRsvpSchema)
    .min(1, "Please respond for at least one guest"),
});
export type RsvpSubmissionInput = z.infer<typeof rsvpSubmissionSchema>;

// --- Household ----------------------------------------------------------------
export const householdSchema = z.object({
  name: z.string().trim().min(2).max(160),
  invitationCode: optionalString(40),
  primaryContactName: optionalString(120),
  primaryEmail: z.string().trim().email().optional().or(z.literal("")),
  primaryPhone: optionalString(40),
  maxPartySize: z.coerce.number().int().min(1).max(20).default(2),
  notes: optionalString(1000),
});
export type HouseholdInput = z.infer<typeof householdSchema>;

// --- Guest --------------------------------------------------------------------
export const guestSchema = z.object({
  householdId: z.string().min(1),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: optionalString(40),
  relationship: optionalString(80),
  ageGroup: z.enum(AGE_GROUP).default("ADULT"),
  rsvpStatus: z.enum(RSVP_STATUS).default("PENDING"),
  mealChoice: z.enum(MEAL_CHOICE).optional(),
  allergies: optionalString(280),
  accessibility: optionalString(280),
  notes: optionalString(500),
});
export type GuestInput = z.infer<typeof guestSchema>;

// --- Table --------------------------------------------------------------------
export const tableSchema = z.object({
  name: z.string().trim().min(1).max(80),
  capacity: z.coerce.number().int().min(1).max(40).default(10),
  notes: optionalString(280),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
export type TableInput = z.infer<typeof tableSchema>;

export const seatAssignmentSchema = z.object({
  guestId: z.string().min(1),
  tableId: z.string().min(1),
  seatNo: z.coerce.number().int().min(0).optional(),
});
export type SeatAssignmentInput = z.infer<typeof seatAssignmentSchema>;

// --- Tribute ------------------------------------------------------------------
export const tributeSchema = z.object({
  author: z.string().trim().min(2, "Please enter your name").max(120),
  relationship: optionalString(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please write a little more")
    .max(1200, "Please keep your tribute under 1200 characters"),
  // simple honeypot — bots fill hidden fields
  website: z.string().max(0).optional(),
});
export type TributeInput = z.infer<typeof tributeSchema>;

export const tributeModerationSchema = z.object({
  id: z.string().min(1),
  status: z.enum(TRIBUTE_STATUS),
  isFeatured: z.coerce.boolean().optional(),
  message: optionalString(1200),
  author: optionalString(120),
  relationship: optionalString(120),
});

// --- Story chapter ------------------------------------------------------------
export const storyChapterSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  years: optionalString(60),
  quote: optionalString(400),
  body: z.string().trim().min(10).max(8000),
  image: optionalString(500),
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(true),
});
export type StoryChapterInput = z.infer<typeof storyChapterSchema>;

// --- Gallery metadata ---------------------------------------------------------
export const galleryImageSchema = z.object({
  id: z.string().min(1),
  alt: z.string().trim().min(2).max(280),
  caption: optionalString(280),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const galleryAlbumSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  description: optionalString(500),
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(true),
});

/** Format a Zod error into a flat { field: message } map for forms. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
