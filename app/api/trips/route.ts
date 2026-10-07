import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  type DbDestination,
  type DbOpenTrip,
  mapDestination,
  mapOpenTrip,
} from "@/lib/mappers";
import { getAllFallbackTrips, getFallbackDestinationById } from "@/lib/dummy-data";

export async function GET() {
  try {
    const db = getDb();

    const trips = db
      .prepare(
        "SELECT * FROM open_trips WHERE is_active = 1 ORDER BY start_date"
      )
      .all() as DbOpenTrip[];

    if (!trips || trips.length === 0) {
      const fallbackTrips = getAllFallbackTrips().map((t) => ({
        id: t.id,
        startDate: t.startDate,
        endDate: t.endDate,
        year: t.year,
        price: t.price,
        totalSlots: t.totalSlots,
        bookedSlots: t.bookedSlots,
        destination: getFallbackDestinationById(t.destinationId),
      }));
      return NextResponse.json(fallbackTrips);
    }

    const destStmt = db.prepare("SELECT * FROM destinations WHERE id = ?");

    const result = trips.map((trip) => {
      const destination = destStmt.get(trip.destination_id) as DbDestination;
      return {
        ...mapOpenTrip(trip),
        destination: destination ? mapDestination(destination, []) : null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.warn("[API /api/trips] DB notice, using fallback trips:", error);
    const fallbackTrips = getAllFallbackTrips().map((t) => ({
      id: t.id,
      startDate: t.startDate,
      endDate: t.endDate,
      year: t.year,
      price: t.price,
      totalSlots: t.totalSlots,
      bookedSlots: t.bookedSlots,
      destination: getFallbackDestinationById(t.destinationId),
    }));
    return NextResponse.json(fallbackTrips);
  }
}
