import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { type DbBookingEnriched, mapBooking } from "@/lib/mappers";
import { requireAdmin } from "@/lib/auth";
import { sendBookingWhatsAppNotification } from "@/lib/whatsapp";
import {
  getFallbackBookingById,
  updateFallbackBookingStatus,
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

export async function POST(_request: Request, { params }: RouteParams) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  let bookingDetails: {
    id: string;
    fullName: string;
    destinationTitle: string;
    tripDates: string;
    seats: number;
    vibe: string;
    totalPrice: number;
    whatsapp: string;
    status: string;
  } | null = null;

  try {
    const db = getDb();
    const row = db.prepare(BOOKING_BY_ID_QUERY).get(id) as DbBookingEnriched | undefined;

    if (row) {
      const mapped = mapBooking(row);
      bookingDetails = {
        ...mapped,
        whatsapp: row.whatsapp,
      };

      // Update to pinged
      db.prepare("UPDATE bookings SET status = 'pinged' WHERE id = ?").run(id);
    }
  } catch (err) {
    console.warn(`[API /api/bookings/${id}/ping] DB notice:`, err);
  }

  // Fallback if not found in SQLite
  if (!bookingDetails) {
    const fallback = getFallbackBookingById(id);
    if (fallback) {
      bookingDetails = {
        id: fallback.id,
        fullName: fallback.fullName,
        destinationTitle: fallback.destinationTitle,
        tripDates: fallback.tripDates,
        seats: fallback.seats,
        vibe: fallback.vibe,
        totalPrice: fallback.totalPrice,
        whatsapp: fallback.whatsapp,
        status: "pinged",
      };
      updateFallbackBookingStatus(id, "pinged");
    }
  }

  if (!bookingDetails) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Trigger Fonnte WhatsApp Automation
  const waResult = await sendBookingWhatsAppNotification(bookingDetails);

  return NextResponse.json({
    success: true,
    booking: bookingDetails,
    whatsapp: waResult,
  });
}
