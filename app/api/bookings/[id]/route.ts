import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { type DbBooking, type DbBookingEnriched, mapBooking } from "@/lib/mappers";
import { UpdateBookingStatusSchema, formatZodErrors } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import {
  getFallbackBookingById,
  updateFallbackBookingStatus,
  deleteFallbackBooking,
} from "@/lib/dummy-data";

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = UpdateBookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }

  const { status } = parsed.data;

  try {
    const db = getDb();

    const existing = db
      .prepare("SELECT * FROM bookings WHERE id = ?")
      .get(id) as DbBooking | undefined;

    if (!existing) {
      const fallbackUpdated = updateFallbackBookingStatus(id, status);
      if (fallbackUpdated) {
        return NextResponse.json(fallbackUpdated);
      }
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, id);

    const updated = db.prepare(BOOKING_BY_ID_QUERY).get(id) as DbBookingEnriched;
    return NextResponse.json(mapBooking(updated));
  } catch (err) {
    console.warn(`[API /api/bookings/${id} PATCH] DB notice, using fallback:`, err);
    const fallbackUpdated = updateFallbackBookingStatus(id, status);
    if (fallbackUpdated) {
      return NextResponse.json(fallbackUpdated);
    }
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    const db = getDb();

    const existing = db
      .prepare("SELECT * FROM bookings WHERE id = ?")
      .get(id) as DbBooking | undefined;

    if (!existing) {
      const deletedFallback = deleteFallbackBooking(id);
      if (deletedFallback) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const deleteBooking = db.transaction(() => {
      db.prepare("DELETE FROM bookings WHERE id = ?").run(id);

      const trip = db
        .prepare("SELECT booked_slots FROM open_trips WHERE id = ?")
        .get(existing.trip_id) as { booked_slots: number } | undefined;

      if (trip) {
        const newBookedSlots = Math.max(0, trip.booked_slots - existing.seats);
        db.prepare("UPDATE open_trips SET booked_slots = ? WHERE id = ?").run(
          newBookedSlots,
          existing.trip_id
        );
      }
    });

    deleteBooking();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.warn(`[API /api/bookings/${id} DELETE] DB notice, using fallback:`, err);
    deleteFallbackBooking(id);
    return NextResponse.json({ success: true });
  }
}
