import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { type DbBooking, type DbBookingEnriched, mapBooking } from "@/lib/mappers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const BOOKING_BY_ID_QUERY = `
  SELECT
    b.*,
    d.title AS destination_title,
    t.start_date,
    t.end_date,
    t.year
  FROM bookings b
  JOIN destinations d ON b.destination_id = d.id
  JOIN open_trips t ON b.trip_id = t.id
  WHERE b.id = ?
`;

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !["confirmed", "pinged", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const db = getDb();

  const existing = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(id) as DbBooking | undefined;

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, id);

  const updated = db.prepare(BOOKING_BY_ID_QUERY).get(id) as DbBookingEnriched;
  return NextResponse.json(mapBooking(updated));
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const db = getDb();

  const existing = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(id) as DbBooking | undefined;

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const deleteBooking = db.transaction(() => {
    db.prepare("DELETE FROM bookings WHERE id = ?").run(id);

    const trip = db
      .prepare("SELECT booked_slots FROM open_trips WHERE id = ?")
      .get(existing.trip_id) as { booked_slots: number };

    const newBookedSlots = Math.max(0, trip.booked_slots - existing.seats);
    db.prepare("UPDATE open_trips SET booked_slots = ? WHERE id = ?").run(
      newBookedSlots,
      existing.trip_id
    );
  });

  deleteBooking();

  return NextResponse.json({ success: true });
}
