import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import { type DbBookingEnriched, type DbOpenTrip, mapBooking } from "@/lib/mappers";
import { CreateBookingSchema, formatZodErrors } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { sendBookingConfirmationEmail } from "@/lib/email";
import {
  getFallbackBookings,
  getFallbackTripById,
  addFallbackBooking,
} from "@/lib/dummy-data";

const BOOKINGS_QUERY = `
  SELECT
    b.*,
    d.title AS destination_title,
    t.start_date,
    t.end_date,
    t.year
  FROM bookings b
  JOIN destinations d ON b.destination_id = d.id
  JOIN open_trips t ON b.trip_id = t.id
  ORDER BY b.booked_at DESC
`;

export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const db = getDb();
    const bookings = db.prepare(BOOKINGS_QUERY).all() as DbBookingEnriched[];
    if (bookings && bookings.length > 0) {
      return NextResponse.json(bookings.map(mapBooking));
    }
    // If empty in DB, return fallback dummy bookings
    return NextResponse.json(getFallbackBookings());
  } catch (err) {
    console.warn("[API /api/bookings] SQLite notice, using fallback bookings:", err);
    return NextResponse.json(getFallbackBookings());
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }

  const { tripId, fullName, email, whatsapp, seats, vibe, totalPrice, destinationId } =
    parsed.data;

  const destCode = destinationId.toUpperCase().slice(0, 4);
  const bookingId = `TKT-${destCode}-${nanoid(4).toUpperCase()}`;

  try {
    const db = getDb();

    const trip = db
      .prepare("SELECT * FROM open_trips WHERE id = ?")
      .get(tripId) as DbOpenTrip | undefined;

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const slotsLeft = trip.total_slots - trip.booked_slots;
    if (slotsLeft < seats) {
      return NextResponse.json(
        { error: `Only ${slotsLeft} slots left` },
        { status: 409 }
      );
    }

    const createBooking = db.transaction(() => {
      db.prepare(`
        INSERT INTO bookings (id, destination_id, trip_id, full_name, email, whatsapp, seats, vibe, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        bookingId,
        destinationId,
        tripId,
        fullName,
        email,
        whatsapp,
        seats,
        vibe ?? null,
        totalPrice
      );

      db.prepare(
        "UPDATE open_trips SET booked_slots = booked_slots + ? WHERE id = ?"
      ).run(seats, tripId);
    });

    createBooking();

    const dest = db.prepare("SELECT title FROM destinations WHERE id = ?").get(destinationId) as { title: string } | undefined;

    sendBookingConfirmationEmail({
      bookingId,
      fullName,
      email,
      destinationTitle: dest?.title || destinationId,
      seats,
      totalPrice,
    });

    return NextResponse.json({ bookingId }, { status: 201 });
  } catch (err) {
    console.warn("[API /api/bookings POST] Database error, saving into fallback store:", err);

    const fallbackTrip = getFallbackTripById(tripId);
    if (!fallbackTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const slotsLeft = fallbackTrip.totalSlots - fallbackTrip.bookedSlots;
    if (slotsLeft < seats) {
      return NextResponse.json(
        { error: `Only ${slotsLeft} slots left` },
        { status: 409 }
      );
    }

    addFallbackBooking({
      id: bookingId,
      destinationId,
      destinationTitle: fallbackTrip.destinationTitle,
      tripId,
      tripDates: `${fallbackTrip.startDate} - ${fallbackTrip.endDate}, ${fallbackTrip.year}`,
      startDate: fallbackTrip.startDate,
      endDate: fallbackTrip.endDate,
      year: fallbackTrip.year,
      fullName,
      email,
      whatsapp,
      seats,
      vibe: vibe ?? "Chill Explorer",
      totalPrice,
      status: "confirmed",
      paymentRef: null,
      bookedAt: new Date().toISOString(),
    });

    sendBookingConfirmationEmail({
      bookingId,
      fullName,
      email,
      destinationTitle: fallbackTrip.destinationTitle,
      seats,
      totalPrice,
    });

    return NextResponse.json({ bookingId }, { status: 201 });
  }
}
