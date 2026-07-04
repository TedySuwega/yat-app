import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import { type DbBookingEnriched, type DbOpenTrip, mapBooking } from "@/lib/mappers";

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
  const db = getDb();
  const bookings = db.prepare(BOOKINGS_QUERY).all() as DbBookingEnriched[];
  return NextResponse.json(bookings.map(mapBooking));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tripId, fullName, email, whatsapp, seats, vibe, totalPrice, destinationId } = body;

  if (!tripId || !fullName || !email || !whatsapp || !seats || !destinationId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

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

  const destCode = destinationId.toUpperCase().slice(0, 4);
  const bookingId = `TKT-${destCode}-${nanoid(4).toUpperCase()}`;

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

  return NextResponse.json({ bookingId }, { status: 201 });
}
