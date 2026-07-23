import { z } from "zod";

export const VIBE_OPTIONS = [
  "Chill Explorer",
  "Adrenaline Junkie",
  "Foodie",
  "Culture Nomad",
  "Sports Fan",
] as const;

export type VibeOption = (typeof VIBE_OPTIONS)[number];

// ─── Booking Creation Schema ───────────────────────────────────────────────────
// Validates the POST /api/bookings request body
export const CreateBookingSchema = z.object({
  tripId: z.string().trim().min(1, "Trip ID is required"),
  destinationId: z.string().trim().min(1, "Destination ID is required"),
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  whatsapp: z
    .string()
    .trim()
    .min(8, "WhatsApp number must be at least 8 characters")
    .max(20, "WhatsApp number must be under 20 characters")
    .regex(
      /^\+?[\d\s-]{8,20}$/,
      "WhatsApp number must contain only digits, spaces, dashes, or a leading +"
    ),
  seats: z
    .number({ error: "Seats must be a number" })
    .int("Seats must be a whole number")
    .min(1, "Must book at least 1 seat")
    .max(10, "Cannot book more than 10 seats at once"),
  vibe: z.enum(VIBE_OPTIONS, { message: "Invalid vibe selection" }).optional(),
  totalPrice: z
    .number({ error: "Total price must be a number" })
    .positive("Total price must be greater than zero"),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

// Alias used in feature docs
export const BookingSchema = CreateBookingSchema;

// ─── Booking Status Update Schema ──────────────────────────────────────────────
// Validates the PATCH /api/bookings/[id] request body
export const UpdateBookingStatusSchema = z.object({
  status: z.enum(["confirmed", "pinged", "cancelled"], {
    message: "Status must be one of: confirmed, pinged, cancelled",
  }),
});

export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;

// Alias used in feature docs
export const StatusUpdateSchema = UpdateBookingStatusSchema;

// ─── Admin Login Schema ────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Helper: Format Zod errors into a readable response ────────────────────────
export function formatZodErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
